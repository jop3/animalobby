import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Group, Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface SpikeProps {
  position: [number, number, number];
  size?: number;
  popInterval?: number; // Time between pops
  stayUpDuration?: number; // How long spike stays up
}

export function Spike({
  position,
  size = 1,
  popInterval = 2.5,
  stayUpDuration = 1.5,
}: SpikeProps) {
  const groupRef = useRef<Group>(null);
  const tipRef = useRef<Mesh>(null);
  const warningRef = useRef<Mesh>(null);
  const timerRef = useRef(0);
  const stateRef = useRef<'hidden' | 'warning' | 'rising' | 'up' | 'falling'>('hidden');
  const stateTimerRef = useRef(0);

  const die = useGameStore((state) => state.die);
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((state, delta) => {
    timerRef.current += delta;
    stateTimerRef.current += delta;

    const currentState = stateRef.current;

    // State machine
    switch (currentState) {
      case 'hidden':
        if (timerRef.current >= popInterval) {
          stateRef.current = 'warning';
          stateTimerRef.current = 0;
          timerRef.current = 0;
        }

        // Spike is underground
        if (groupRef.current) {
          groupRef.current.position.y = -size * 0.8;
        }
        break;

      case 'warning':
        // Warning phase - ground rumbles
        if (groupRef.current) {
          groupRef.current.position.y = -size * 0.8 + Math.sin(stateTimerRef.current * 20) * 0.05;
        }

        // Warning indicator pulsing
        if (warningRef.current) {
          const pulse = Math.sin(stateTimerRef.current * 15) * 0.2 + 1;
          warningRef.current.scale.set(pulse, 1, pulse);
        }

        if (stateTimerRef.current >= 0.6) {
          stateRef.current = 'rising';
          stateTimerRef.current = 0;
        }
        break;

      case 'rising':
        // Fast rise
        const riseProgress = Math.min(stateTimerRef.current / 0.15, 1);
        const easeOutBack = (t: number) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };

        if (groupRef.current) {
          groupRef.current.position.y = -size * 0.8 + easeOutBack(riseProgress) * size * 0.8;

          // Squash and stretch
          const squash = 1 - riseProgress * 0.3;
          const stretch = 1 + riseProgress * 0.3;
          groupRef.current.scale.set(squash, stretch, squash);
        }

        // Check collision while rising
        if (playerPosition && riseProgress > 0.3) {
          const dx = playerPosition[0] - position[0];
          const dz = playerPosition[2] - position[2];
          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < size * 0.5 && playerPosition[1] < position[1] + size) {
            die();
          }
        }

        if (riseProgress >= 1) {
          stateRef.current = 'up';
          stateTimerRef.current = 0;
        }
        break;

      case 'up':
        // Stay up, slight bobbing
        if (groupRef.current) {
          groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.05;
          groupRef.current.scale.set(1, 1, 1);
        }

        // Pulsing danger glow
        if (tipRef.current) {
          const pulse = Math.sin(state.clock.elapsedTime * 6) * 0.3 + 0.7;
          (tipRef.current.material as any).emissiveIntensity = pulse;
        }

        // Check collision
        if (playerPosition) {
          const dx = playerPosition[0] - position[0];
          const dz = playerPosition[2] - position[2];
          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < size * 0.5 && playerPosition[1] < position[1] + size) {
            die();
          }
        }

        if (stateTimerRef.current >= stayUpDuration) {
          stateRef.current = 'falling';
          stateTimerRef.current = 0;
        }
        break;

      case 'falling':
        // Quick retract
        const fallProgress = Math.min(stateTimerRef.current / 0.2, 1);

        if (groupRef.current) {
          groupRef.current.position.y = (1 - fallProgress) * 0;
          groupRef.current.position.y -= fallProgress * size * 0.8;
        }

        if (fallProgress >= 1) {
          stateRef.current = 'hidden';
          stateTimerRef.current = 0;
          timerRef.current = 0;
        }
        break;
    }
  });

  const isWarning = stateRef.current === 'warning';
  const isUp = stateRef.current === 'up' || stateRef.current === 'rising';

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      userData={{ hazard: 'spike' }}
    >
      <group>
        {/* Warning circle */}
        {isWarning && (
          <mesh
            ref={warningRef}
            position={[0, 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[size * 0.4, size * 0.6, 16]} />
            <meshBasicMaterial
              color="#FF0000"
              transparent
              opacity={0.6}
            />
          </mesh>
        )}

        {/* Spike group */}
        <group ref={groupRef}>
          {/* Base */}
          <mesh castShadow position={[0, 0.1 * size, 0]}>
            <cylinderGeometry args={[0.5 * size, 0.6 * size, 0.2 * size, 8]} />
            <meshStandardMaterial
              color="#CC0000"
              roughness={0.8}
              metalness={0.2}
              emissive="#8B0000"
              emissiveIntensity={isUp ? 0.3 : 0.1}
            />
          </mesh>

          {/* Middle section */}
          <mesh castShadow position={[0, 0.35 * size, 0]}>
            <cylinderGeometry args={[0.35 * size, 0.5 * size, 0.3 * size, 8]} />
            <meshStandardMaterial
              color="#DD0000"
              roughness={0.7}
              metalness={0.2}
              emissive="#8B0000"
              emissiveIntensity={isUp ? 0.4 : 0.1}
            />
          </mesh>

          {/* Upper spike */}
          <mesh castShadow position={[0, 0.6 * size, 0]}>
            <coneGeometry args={[0.3 * size, 0.4 * size, 8]} />
            <meshStandardMaterial
              color="#EE0000"
              roughness={0.6}
              metalness={0.3}
              emissive="#AA0000"
              emissiveIntensity={isUp ? 0.5 : 0.1}
            />
          </mesh>

          {/* Sharp tip with glow */}
          <mesh ref={tipRef} position={[0, 0.85 * size, 0]}>
            <coneGeometry args={[0.12 * size, 0.3 * size, 6]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={0.9}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>

          {/* Danger particles when up */}
          {isUp && <SpikeParticles size={size} />}

          {/* Point light */}
          <pointLight
            position={[0, 0.85 * size, 0]}
            intensity={isUp ? 2 : 0.5}
            distance={isUp ? 6 : 3}
            color="#FF0000"
          />
        </group>

        {/* Ground crack effects when warning */}
        {isWarning && <GroundCracks size={size} />}
      </group>
    </RigidBody>
  );
}

// Danger particles around spike when up
function SpikeParticles({ size }: { size: number }) {
  const particleRefs = useRef<(Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    particleRefs.current.forEach((particle, i) => {
      if (!particle) return;

      const particleTime = time * 3 + i * 0.5;
      const angle = (i / 6) * Math.PI * 2 + particleTime;
      const radius = (Math.sin(particleTime) * 0.5 + 0.5) * size * 0.6;

      particle.position.x = Math.cos(angle) * radius;
      particle.position.y = 0.5 * size + Math.sin(particleTime * 2) * 0.2;
      particle.position.z = Math.sin(angle) * radius;

      const opacity = (Math.sin(particleTime * 2) * 0.5 + 0.5) * 0.6;
      (particle.material as any).opacity = opacity;
    });
  });

  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} ref={(el) => (particleRefs.current[i] = el)}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial
            color="#FF0000"
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

// Ground crack effects
function GroundCracks({ size }: { size: number }) {
  const crackRefs = useRef<(Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    crackRefs.current.forEach((crack, i) => {
      if (!crack) return;

      const scale = (Math.sin(time * 10 + i) * 0.5 + 0.5) * 0.5 + 0.5;
      crack.scale.set(scale, 1, 1);

      const opacity = (Math.sin(time * 10 + i) * 0.5 + 0.5) * 0.4;
      (crack.material as any).opacity = opacity;
    });
  });

  return (
    <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            ref={(el) => (crackRefs.current[i] = el)}
            position={[Math.cos(angle) * size * 0.3, Math.sin(angle) * size * 0.3, 0]}
            rotation={[0, 0, angle]}
          >
            <planeGeometry args={[0.1, size * 0.5]} />
            <meshBasicMaterial
              color="#8B0000"
              transparent
            />
          </mesh>
        );
      })}
    </group>
  );
}
