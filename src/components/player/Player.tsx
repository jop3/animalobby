import { useRef, useEffect, useMemo, forwardRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { Controls } from '../../App';
import { useGameStore } from '../../store/useGameStore';
import { getPart } from '../../data/animalParts';
import { PlayerModel } from './PlayerModel';
import { DeathParticles } from '../effects/DeathParticles';

const DEATH_Y = -10;

export const Player = forwardRef<any>((props, ref) => {
  const playerRef = useRef<any>(null);
  const isOnGround = useRef(false);
  const jumpCount = useRef(0);
  const [showDeathParticles, setShowDeathParticles] = useState(false);
  const [deathPosition, setDeathPosition] = useState<[number, number, number]>([0, 0, 0]);

  // Game state
  const currentLoadout = useGameStore((state) => state.currentLoadout);
  const checkpointPosition = useGameStore((state) => state.checkpointPosition);
  const isDead = useGameStore((state) => state.isDead);
  const die = useGameStore((state) => state.die);
  const respawn = useGameStore((state) => state.respawn);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  // Keyboard controls
  const [, getKeys] = useKeyboardControls<string>();

  // Calculate stats based on equipped parts
  const playerStats = useMemo(() => {
    const BASE_SPEED = 5;
    const BASE_JUMP = 10;

    let speedMod = 0;
    let jumpMod = 0;
    let defense = 0;
    let canDoubleJump = false;

    // Apply stat modifiers from equipped parts
    Object.values(currentLoadout).forEach((partId) => {
      if (!partId) return;
      const part = getPart(partId);
      if (!part) return;

      const { statModifier, ability } = part;

      speedMod += statModifier.speed || 0;
      jumpMod += statModifier.jumpForce || 0;
      defense += statModifier.defense || 0;

      if (ability === 'double_jump') {
        canDoubleJump = true;
      }
    });

    return {
      speed: BASE_SPEED * (1 + speedMod),
      jumpForce: BASE_JUMP * (1 + jumpMod),
      defense,
      canDoubleJump,
    };
  }, [currentLoadout]);

  // Death particles logic
  useEffect(() => {
    if (isDead && playerRef.current) {
      // Capture death position and show particles
      const pos = playerRef.current.translation();
      setDeathPosition([pos.x, pos.y, pos.z]);
      setShowDeathParticles(true);
    } else {
      setShowDeathParticles(false);
    }
  }, [isDead]);

  // Respawn logic
  useEffect(() => {
    if (isDead && playerRef.current) {
      // Reset to checkpoint after delay
      setTimeout(() => {
        playerRef.current?.setTranslation(
          { x: checkpointPosition[0], y: checkpointPosition[1], z: checkpointPosition[2] },
          true
        );
        playerRef.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
        playerRef.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
        respawn();
      }, 1000); // Longer delay to show particles
    }
  }, [isDead, checkpointPosition, respawn]);

  // Movement and physics
  useFrame(() => {
    if (!playerRef.current || isDead) return;

    const body = playerRef.current;
    const { forward, back, left, right, jump, sprint } = getKeys();

    // Get current velocity
    const velocity = body.linvel();
    const position = body.translation();

    // Update global player position for hazards
    setPlayerPosition([position.x, position.y, position.z]);

    // Check if on ground (simplified - check y velocity)
    isOnGround.current = Math.abs(velocity.y) < 0.5 && position.y > DEATH_Y + 1;

    if (isOnGround.current) {
      jumpCount.current = 0;
    }

    // Death check
    if (position.y < DEATH_Y) {
      die();
      return;
    }

    // Calculate movement direction
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (back ? 1 : 0) - (forward ? 1 : 0);

    const direction = new Vector3(moveX, 0, moveZ).normalize();

    // Apply speed stat
    const currentSpeed = sprint ? playerStats.speed * 1.5 : playerStats.speed;

    // Set horizontal velocity
    body.setLinvel(
      {
        x: direction.x * currentSpeed,
        y: velocity.y, // Preserve vertical velocity
        z: direction.z * currentSpeed,
      },
      true
    );

    // Jumping logic
    if (jump && isOnGround.current) {
      body.setLinvel(
        {
          x: velocity.x,
          y: playerStats.jumpForce,
          z: velocity.z,
        },
        true
      );
      jumpCount.current = 1;
    } else if (jump && playerStats.canDoubleJump && jumpCount.current === 1) {
      // Double jump
      body.setLinvel(
        {
          x: velocity.x,
          y: playerStats.jumpForce * 0.8, // Slightly weaker second jump
          z: velocity.z,
        },
        true
      );
      jumpCount.current = 2;
    }
  });

  return (
    <>
      <RigidBody
        ref={(r) => {
          playerRef.current = r;
          if (typeof ref === 'function') {
            ref(r);
          } else if (ref) {
            ref.current = r;
          }
        }}
        colliders={false}
        mass={1}
        type="dynamic"
        position={checkpointPosition}
        enabledRotations={[false, false, false]} // Lock rotation
        linearDamping={0.5}
        angularDamping={1}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
        {!isDead && <PlayerModel loadout={currentLoadout} />}
      </RigidBody>

      {/* Death particles */}
      {showDeathParticles && (
        <DeathParticles
          position={deathPosition}
          onComplete={() => setShowDeathParticles(false)}
        />
      )}
    </>
  );
});
