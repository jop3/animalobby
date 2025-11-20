import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface SpikeProps {
  position: [number, number, number];
  size?: number;
}

export function Spike({ position, size = 1 }: SpikeProps) {
  const tipRef = useRef<Mesh>(null);
  const die = useGameStore((state) => state.die);

  // Pulsing animation for danger visibility
  useFrame((state) => {
    if (tipRef.current) {
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      (tipRef.current.material as any).emissiveIntensity = pulse;
    }
  });

  const handleCollision = () => {
    die();
  };

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      onIntersectionEnter={handleCollision}
      userData={{ hazard: 'spike' }}
    >
      <group>
        {/* Base */}
        <mesh castShadow position={[0, 0.1 * size, 0]}>
          <boxGeometry args={[0.6 * size, 0.2 * size, 0.6 * size]} />
          <meshStandardMaterial
            color="#FF4444"
            roughness={0.8}
            metalness={0.1}
            flatShading
          />
        </mesh>

        {/* Middle section */}
        <mesh castShadow position={[0, 0.35 * size, 0]}>
          <boxGeometry args={[0.4 * size, 0.3 * size, 0.4 * size]} />
          <meshStandardMaterial
            color="#FF4444"
            roughness={0.8}
            metalness={0.1}
            flatShading
          />
        </mesh>

        {/* Tip */}
        <mesh castShadow position={[0, 0.65 * size, 0]}>
          <boxGeometry args={[0.2 * size, 0.4 * size, 0.2 * size]} />
          <meshStandardMaterial
            color="#CC0000"
            roughness={0.8}
            metalness={0.1}
            flatShading
          />
        </mesh>

        {/* Danger glow at tip */}
        <mesh ref={tipRef} position={[0, 0.85 * size, 0]}>
          <boxGeometry args={[0.15 * size, 0.15 * size, 0.15 * size]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={0.8}
            flatShading
          />
        </mesh>

        {/* Point light for danger visibility */}
        <pointLight position={[0, 0.85 * size, 0]} intensity={1} distance={5} color="#FF0000" />
      </group>
    </RigidBody>
  );
}
