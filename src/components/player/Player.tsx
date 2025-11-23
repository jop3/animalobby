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

const DEATH_Y = -30; // Player dies when falling below this Y position

export const Player = forwardRef<any>((props, ref) => {
  const playerRef = useRef<any>(null);
  const isOnGround = useRef(false);
  const jumpCount = useRef(0);
  const wasJumpPressed = useRef(false); // Track if jump was pressed last frame

  // Game feel improvements
  const coyoteTimeRef = useRef(0); // Allow jumping shortly after leaving ground
  const jumpBufferRef = useRef(0); // Queue jump input before landing
  const isJumpingRef = useRef(false); // Track if currently in jump (for variable height)
  const wasOnGroundRef = useRef(false); // Track previous frame's ground state (for landing detection)
  const invincibilityTimeRef = useRef(0); // Invincibility frames after respawn
  const [isInvincible, setIsInvincible] = useState(false);

  const [showDeathParticles, setShowDeathParticles] = useState(false);
  const [deathPosition, setDeathPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [showLandingParticles, setShowLandingParticles] = useState(false);
  const [landingPosition, setLandingPosition] = useState<[number, number, number]>([0, 0, 0]);

  // Game state
  const currentLoadout = useGameStore((state) => state.currentLoadout);
  const checkpointPosition = useGameStore((state) => state.checkpointPosition);
  const isDead = useGameStore((state) => state.isDead);
  const die = useGameStore((state) => state.die);
  const respawn = useGameStore((state) => state.respawn);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setInvincible = useGameStore((state) => state.setInvincible);

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

        // Grant invincibility frames after respawn
        invincibilityTimeRef.current = 2.0; // 2 seconds of invincibility
        setIsInvincible(true);
        setInvincible(true); // Update global store so hazards know
      }, 1000); // Longer delay to show particles
    }
  }, [isDead, checkpointPosition, respawn, setInvincible]);

  // Movement and physics
  useFrame((state, delta) => {
    if (!playerRef.current || isDead) return;

    const body = playerRef.current;
    const { forward, back, left, right, jump, sprint } = getKeys();

    // Get current velocity
    const velocity = body.linvel();
    const position = body.translation();

    // Update global player position for hazards
    setPlayerPosition([position.x, position.y, position.z]);

    // Better ground detection - check y velocity and position
    const previousGroundState = isOnGround.current;
    isOnGround.current = Math.abs(velocity.y) < 0.5 && position.y > DEATH_Y + 1;

    // Landing detection - trigger particles when transitioning from air to ground
    if (!wasOnGroundRef.current && isOnGround.current && velocity.y < -2) {
      setLandingPosition([position.x, position.y - 0.8, position.z]);
      setShowLandingParticles(true);
      setTimeout(() => setShowLandingParticles(false), 300);
    }
    wasOnGroundRef.current = isOnGround.current;

    // Coyote time - allow jumping shortly after leaving platform
    if (isOnGround.current) {
      coyoteTimeRef.current = 0.15; // 9 frames at 60fps
      jumpCount.current = 0;
    } else {
      coyoteTimeRef.current -= delta;
    }

    // Jump buffering - queue jump input if pressed before landing
    const jumpPressed = jump && !wasJumpPressed.current; // Detect rising edge
    if (jumpPressed) {
      jumpBufferRef.current = 0.15; // 9 frames buffer window
    } else {
      jumpBufferRef.current = Math.max(0, jumpBufferRef.current - delta);
    }

    // Invincibility frames countdown
    if (invincibilityTimeRef.current > 0) {
      invincibilityTimeRef.current -= delta;
      if (invincibilityTimeRef.current <= 0) {
        setIsInvincible(false);
        setInvincible(false); // Update global store
      }
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

    // Jumping logic with coyote time and jump buffering
    const canJump = coyoteTimeRef.current > 0 && jumpCount.current === 0;
    const shouldJump = (jumpPressed || jumpBufferRef.current > 0) && canJump;

    if (shouldJump) {
      // First jump (from ground or within coyote time)
      body.setLinvel(
        {
          x: velocity.x,
          y: playerStats.jumpForce,
          z: velocity.z,
        },
        true
      );
      jumpCount.current = 1;
      jumpBufferRef.current = 0; // Consume the buffered input
      coyoteTimeRef.current = 0; // Consume coyote time
      isJumpingRef.current = true; // Start tracking for variable jump height
    } else if (jumpPressed && playerStats.canDoubleJump && jumpCount.current === 1) {
      // Double jump (in air, but only if you have the ability)
      body.setLinvel(
        {
          x: velocity.x,
          y: playerStats.jumpForce * 0.8, // Slightly weaker second jump
          z: velocity.z,
        },
        true
      );
      jumpCount.current = 2;
      isJumpingRef.current = true; // Track for variable height on double jump too
    }

    // Variable jump height - cut upward velocity if jump released early
    if (isJumpingRef.current && !jump && velocity.y > 0) {
      body.setLinvel(
        {
          x: velocity.x,
          y: velocity.y * 0.5, // Cut jump short for responsive feel
          z: velocity.z,
        },
        true
      );
      isJumpingRef.current = false;
    }

    // Reset jumping flag when falling
    if (velocity.y < 0) {
      isJumpingRef.current = false;
    }

    // Update jump button state for next frame
    wasJumpPressed.current = jump;
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
        ccd={true} // Continuous Collision Detection - prevents tunneling through platforms
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

      {/* Landing particles */}
      {showLandingParticles && (
        <LandingParticles position={landingPosition} />
      )}
    </>
  );
});

// Landing particles component - small dust clouds when landing
function LandingParticles({ position }: { position: [number, number, number] }) {
  const particlesRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array;
    const opacity = particlesRef.current.material.opacity;

    // Spread particles outward and fade
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * 0.1; // x spread
      positions[i + 1] += Math.random() * 0.05; // y rise
      positions[i + 2] += (Math.random() - 0.5) * 0.1; // z spread
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.material.opacity = Math.max(0, opacity - delta * 3);
  });

  const particleCount = 8;
  const positions = new Float32Array(particleCount * 3);

  // Create particles in a circle around landing point
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 0.3;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#A0A0A0" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}
