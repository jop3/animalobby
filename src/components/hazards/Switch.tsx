import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface SwitchProps {
  position: [number, number, number];
  targetId: string;
  switchType?: 'button' | 'lever' | 'timed';
  duration?: number;
  onActivate?: (targetId: string, activated: boolean) => void;
}

export function Switch({
  position,
  targetId,
  switchType = 'button',
  duration = 5,
  onActivate,
}: SwitchProps) {
  const meshRef = useRef<Mesh>(null);
  const [activated, setActivated] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((state, delta) => {
    if (!playerPosition) return;

    const dist = Math.sqrt(
      Math.pow(playerPosition[0] - position[0], 2) +
      Math.pow(playerPosition[1] - position[1], 2) +
      Math.pow(playerPosition[2] - position[2], 2)
    );

    // Activate switch when player is close enough
    if (dist < 2 && !activated) {
      setActivated(true);
      onActivate?.(targetId, true);

      if (switchType === 'timed') {
        setTimeRemaining(duration);
      }
    }

    // Handle timed switch countdown
    if (switchType === 'timed' && timeRemaining > 0) {
      setTimeRemaining((prev) => {
        const newTime = prev - delta;
        if (newTime <= 0) {
          setActivated(false);
          onActivate?.(targetId, false);
          return 0;
        }
        return newTime;
      });
    }

    // Lever can be toggled
    if (switchType === 'lever' && dist < 2 && activated) {
      // Could add key press detection here for toggling
    }
  });

  const isActive = activated && (switchType !== 'timed' || timeRemaining > 0);

  return (
    <group position={position}>
      {/* Base platform */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.4, 16]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Switch button/lever */}
        {switchType === 'button' && (
          <mesh ref={meshRef} position={[0, isActive ? -0.1 : 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, isActive ? 0.2 : 0.4, 16]} />
            <meshStandardMaterial
              color={isActive ? '#00FF00' : '#FF0000'}
              emissive={isActive ? '#00FF00' : '#FF0000'}
              emissiveIntensity={isActive ? 1 : 0.5}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        )}

        {switchType === 'lever' && (
          <mesh
            ref={meshRef}
            position={[0, 0.3, 0]}
            rotation={[0, 0, isActive ? Math.PI / 4 : -Math.PI / 4]}
          >
            <boxGeometry args={[0.15, 1, 0.15]} />
            <meshStandardMaterial
              color={isActive ? '#00FF00' : '#FF0000'}
              emissive={isActive ? '#00FF00' : '#FF0000'}
              emissiveIntensity={isActive ? 1 : 0.5}
            />
          </mesh>
        )}

        {/* Light indicator */}
        <pointLight
          color={isActive ? '#00FF00' : '#FF0000'}
          intensity={isActive ? 2 : 1}
          distance={5}
          position={[0, 0.5, 0]}
        />

        {/* Timer display for timed switches */}
        {switchType === 'timed' && timeRemaining > 0 && (
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#FFFF00"
              emissive="#FFFF00"
              emissiveIntensity={1}
            />
          </mesh>
        )}
      </RigidBody>
    </group>
  );
}
