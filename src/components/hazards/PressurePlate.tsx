import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface PressurePlateProps {
  position: [number, number, number];
  targetId: string;
  size?: [number, number, number];
  requiresWeight?: boolean;
  onActivate?: (targetId: string, activated: boolean) => void;
}

export function PressurePlate({
  position,
  targetId,
  size = [2, 0.2, 2],
  requiresWeight = true,
  onActivate,
}: PressurePlateProps) {
  const plateRef = useRef<Mesh>(null);
  const [activated, setActivated] = useState(false);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const wasActivated = useRef(false);

  useFrame(() => {
    if (!playerPosition || !plateRef.current) return;

    // Check if player is standing on the plate (within the bounds)
    const isOnPlate =
      playerPosition[0] > position[0] - size[0] / 2 &&
      playerPosition[0] < position[0] + size[0] / 2 &&
      playerPosition[2] > position[2] - size[2] / 2 &&
      playerPosition[2] < position[2] + size[2] / 2 &&
      Math.abs(playerPosition[1] - (position[1] + size[1] / 2)) < 1;

    const shouldBeActivated = requiresWeight ? isOnPlate : (isOnPlate || activated);

    if (shouldBeActivated !== wasActivated.current) {
      setActivated(shouldBeActivated);
      onActivate?.(targetId, shouldBeActivated);
      wasActivated.current = shouldBeActivated;
    }

    // Animate plate depression
    plateRef.current.position.y = shouldBeActivated ? -0.05 : 0;
  });

  return (
    <group position={position}>
      <RigidBody type="fixed">
        {/* Base */}
        <mesh position={[0, -size[1], 0]}>
          <boxGeometry args={[size[0] + 0.2, size[1], size[2] + 0.2]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Pressure plate (animated) */}
        <mesh ref={plateRef}>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={activated ? '#00FF00' : '#808080'}
            emissive={activated ? '#00FF00' : '#404040'}
            emissiveIntensity={activated ? 0.5 : 0.1}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Corner indicators */}
        {[
          [-size[0] / 2 + 0.2, 0, -size[2] / 2 + 0.2],
          [size[0] / 2 - 0.2, 0, -size[2] / 2 + 0.2],
          [-size[0] / 2 + 0.2, 0, size[2] / 2 - 0.2],
          [size[0] / 2 - 0.2, 0, size[2] / 2 - 0.2],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
            <meshStandardMaterial
              color={activated ? '#00FF00' : '#FF0000'}
              emissive={activated ? '#00FF00' : '#FF0000'}
              emissiveIntensity={1}
            />
          </mesh>
        ))}

        {/* Point lights at corners */}
        {[
          [-size[0] / 2 + 0.2, 0.2, -size[2] / 2 + 0.2],
          [size[0] / 2 - 0.2, 0.2, -size[2] / 2 + 0.2],
          [-size[0] / 2 + 0.2, 0.2, size[2] / 2 - 0.2],
          [size[0] / 2 - 0.2, 0.2, size[2] / 2 - 0.2],
        ].map((pos, i) => (
          <pointLight
            key={i}
            position={pos as [number, number, number]}
            color={activated ? '#00FF00' : '#FF0000'}
            intensity={0.5}
            distance={2}
          />
        ))}

        {/* Collision sensor */}
        <CuboidCollider
          args={[size[0] / 2, size[1] / 2, size[2] / 2]}
          sensor
        />
      </RigidBody>
    </group>
  );
}
