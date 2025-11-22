import { RigidBody } from '@react-three/rapier';

interface ClimbableWallProps {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  climbSpeed?: number;
}

export function ClimbableWall({
  position,
  size,
  color = '#654321',
  climbSpeed = 5,
}: ClimbableWallProps) {
  return (
    <RigidBody type="fixed" position={position} userData={{ climbable: true, climbSpeed }}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Add visual indicators (grips/vines) */}
      {Array.from({ length: Math.floor(size[1] / 2) }).map((_, i) => (
        <group key={i} position={[0, -size[1] / 2 + i * 2 + 1, size[2] / 2 + 0.05]}>
          {/* Left grip */}
          <mesh position={[-size[0] / 3, 0, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.1]} />
            <meshStandardMaterial color="#2F4F2F" roughness={0.8} />
          </mesh>
          {/* Right grip */}
          <mesh position={[size[0] / 3, 0, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.1]} />
            <meshStandardMaterial color="#2F4F2F" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Indicator light at top */}
      <mesh position={[0, size[1] / 2 + 0.3, size[2] / 2 + 0.1]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#00FF00"
          emissive="#00FF00"
          emissiveIntensity={1}
        />
      </mesh>
      <pointLight
        position={[0, size[1] / 2 + 0.3, size[2] / 2 + 0.5]}
        color="#00FF00"
        intensity={1}
        distance={3}
      />
    </RigidBody>
  );
}
