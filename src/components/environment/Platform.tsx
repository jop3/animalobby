import { RigidBody } from '@react-three/rapier';

interface PlatformProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}

export function Platform({
  position,
  size = [4, 0.5, 4],
  color = '#7FBF7F',
}: PlatformProps) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.1}
          flatShading
        />
      </mesh>
    </RigidBody>
  );
}
