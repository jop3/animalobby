import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';

interface SpikeProps {
  position: [number, number, number];
  size?: number;
}

export function Spike({ position, size = 1 }: SpikeProps) {
  const die = useGameStore((state) => state.die);

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
        <mesh position={[0, 0.85 * size, 0]}>
          <boxGeometry args={[0.15 * size, 0.15 * size, 0.15 * size]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={0.5}
            flatShading
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
