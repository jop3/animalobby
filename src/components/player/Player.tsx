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
  const wasJumpPressed = useRef(false); // Track if jump was pressed last frame

  // Game feel improvements
  const coyoteTimeRef = useRef(0); // Allow jumping shortly after leaving ground
  const jumpBufferRef = useRef(0); // Queue jump input before landing
  const isJumpingRef = useRef(false); // Track if currently in jump (for variable height)
  const wasOnGroundRef = useRef(false); // Track previous frame's ground state (for landing detection)
  const invincibilityTimeRef = useRef(0); // Invincibility frames after respawn
  const [isInvincible, setIsInvincible] = useState(false);

  // New parkour mechanics
  const wallJumpTimeRef = useRef(0); // Time window for wall jump
  const lastWallNormalRef = useRef<Vector3 | null>(null); // Direction away from wall
  const speedBoostTimeRef = useRef(0); // Speed boost duration remaining
  const speedBoostMultiplierRef = useRef(1); // Current speed multiplier
  const isOnRailRef = useRef(false); // On grind rail
  const railDataRef = useRef<any>(null); // Rail curve and progress
  const windForceRef = useRef<Vector3>(new Vector3(0, 0, 0)); // Accumulated wind forces

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
      }, 1000); // Longer delay to show particles
    }
  }, [isDead, checkpointPosition, respawn]);

  // Collision handlers for parkour mechanics
  const handleIntersectionEnter = (event: any) => {
    const userData = event.other.rigidBodyObject?.userData;
    if (!userData) return;

    // Bounce pad collision
    if (userData.bouncePad && playerRef.current) {
      const bounceForce = userData.bounceForce || 25;
      const velocity = playerRef.current.linvel();
      playerRef.current.setLinvel({
        x: velocity.x,
        y: bounceForce,
        z: velocity.z
      }, true);
      jumpCount.current = 0; // Reset jump count
    }

    // Speed boost collision
    if (userData.speedBoost) {
      speedBoostMultiplierRef.current = userData.speedMultiplier || 2;
      speedBoostTimeRef.current = userData.duration || 3;
    }

    // Wind zone collision
    if (userData.windZone && userData.force) {
      const force = userData.force;
      windForceRef.current.set(force[0], force[1], force[2]);
    }

    // Grind rail collision
    if (userData.grindRail) {
      isOnRailRef.current = true;
      railDataRef.current = {
        curve: userData.curve,
        points: userData.points,
        speed: userData.speed || 8,
        progress: 0
      };
      jumpCount.current = 0; // Reset jump count when on rail
    }
  };

  const handleIntersectionExit = (event: any) => {
    const userData = event.other.rigidBodyObject?.userData;
    if (!userData) return;

    // Exit wind zone
    if (userData.windZone) {
      windForceRef.current.set(0, 0, 0);
    }

    // Exit grind rail
    if (userData.grindRail) {
      isOnRailRef.current = false;
      railDataRef.current = null;
    }
  };

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
      }
    }

    // Speed boost timer
    if (speedBoostTimeRef.current > 0) {
      speedBoostTimeRef.current -= delta;
      if (speedBoostTimeRef.current <= 0) {
        speedBoostMultiplierRef.current = 1;
      }
    }

    // Wall jump timer
    if (wallJumpTimeRef.current > 0) {
      wallJumpTimeRef.current -= delta;
    }

    // Death check
    if (position.y < DEATH_Y) {
      die();
      return;
    }

    // Grind rail movement
    if (isOnRailRef.current && railDataRef.current) {
      const railData = railDataRef.current;
      railData.progress += delta * railData.speed * 0.1;

      // If we have a curve, follow it
      if (railData.curve) {
        const t = Math.min(railData.progress, 1);
        const point = railData.curve.getPoint(t);
        body.setTranslation({ x: point.x, y: point.y, z: point.z }, true);

        // End of rail
        if (t >= 1) {
          isOnRailRef.current = false;
          railDataRef.current = null;
        }
      } else if (railData.points && railData.points.length > 1) {
        // Fallback: linear interpolation between points
        const totalPoints = railData.points.length;
        const segmentProgress = railData.progress * (totalPoints - 1);
        const currentSegment = Math.floor(segmentProgress);

        if (currentSegment < totalPoints - 1) {
          const t = segmentProgress - currentSegment;
          const p1 = railData.points[currentSegment];
          const p2 = railData.points[currentSegment + 1];

          const x = p1[0] + (p2[0] - p1[0]) * t;
          const y = p1[1] + (p2[1] - p1[1]) * t;
          const z = p1[2] + (p2[2] - p1[2]) * t;

          body.setTranslation({ x, y, z }, true);
        } else {
          isOnRailRef.current = false;
          railDataRef.current = null;
        }
      }

      // Can jump off rail
      if (jumpPressed) {
        isOnRailRef.current = false;
        railDataRef.current = null;
      }

      return; // Skip normal movement when on rail
    }

    // Calculate movement direction
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (back ? 1 : 0) - (forward ? 1 : 0);

    const direction = new Vector3(moveX, 0, moveZ).normalize();

    // Apply speed stat with boost multiplier
    let currentSpeed = sprint ? playerStats.speed * 1.5 : playerStats.speed;
    currentSpeed *= speedBoostMultiplierRef.current;

    // Apply wind force
    const windContribution = windForceRef.current.clone().multiplyScalar(delta * 10);

    // Set horizontal velocity with wind
    body.setLinvel(
      {
        x: direction.x * currentSpeed + windContribution.x,
        y: velocity.y + windContribution.y, // Preserve vertical velocity, add wind
        z: direction.z * currentSpeed + windContribution.z,
      },
      true
    );

    // Wall detection - simple raycasting in movement directions
    // Check if player is near a wall (for wall jump)
    if (!isOnGround.current && jumpCount.current > 0 && jumpCount.current < 2) {
      // Simple wall detection: check if horizontal velocity is low despite input
      const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
      const isMoving = Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1;

      if (isMoving && horizontalSpeed < 1 && velocity.y < 0) {
        // Likely touching a wall
        wallJumpTimeRef.current = 0.2; // 200ms window
        // Store wall normal (opposite of movement direction)
        lastWallNormalRef.current = new Vector3(-moveX, 0, -moveZ).normalize();
      }
    }

    // Jumping logic with coyote time and jump buffering
    const canJump = coyoteTimeRef.current > 0 && jumpCount.current === 0;
    const shouldJump = (jumpPressed || jumpBufferRef.current > 0) && canJump;
    const canWallJump = wallJumpTimeRef.current > 0 && jumpPressed && jumpCount.current > 0;

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
    } else if (canWallJump && lastWallNormalRef.current) {
      // Wall jump - push away from wall
      const wallNormal = lastWallNormalRef.current;
      body.setLinvel(
        {
          x: wallNormal.x * playerStats.speed * 1.2,
          y: playerStats.jumpForce * 0.9,
          z: wallNormal.z * playerStats.speed * 1.2,
        },
        true
      );
      jumpCount.current = 1; // Reset to allow another wall jump or double jump
      wallJumpTimeRef.current = 0; // Consume wall jump
      isJumpingRef.current = true;
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
        onIntersectionEnter={handleIntersectionEnter}
        onIntersectionExit={handleIntersectionExit}
        userData={{ player: true }}
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
