import { RigidBody } from '@react-three/rapier';

interface LowObstacleProps {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}

export function LowObstacle({
  position,
  size,
  color = '#DC143C',
}: LowObstacleProps) {
  return (
    <RigidBody type="fixed" position={position} userData={{ requiresSlide: true }}>
      {/* Main obstacle body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Warning stripes */}
      {Array.from({ length: Math.floor(size[0] / 0.5) }).map((_, i) => (
        <mesh
          key={i}
          position={[-size[0] / 2 + i * 0.5 + 0.25, 0, size[2] / 2 + 0.01]}
        >
          <boxGeometry args={[0.2, size[1], 0.02]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#FFFF00' : '#000000'}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Warning lights on top */}
      <mesh position={[-size[0] / 3, size[1] / 2 + 0.1, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#FF0000"
          emissive="#FF0000"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[size[0] / 3, size[1] / 2 + 0.1, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#FF0000"
          emissive="#FF0000"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Point lights */}
      <pointLight
        position={[-size[0] / 3, size[1] / 2 + 0.1, 0]}
        color="#FF0000"
        intensity={1}
        distance={2}
      />
      <pointLight
        position={[size[0] / 3, size[1] / 2 + 0.1, 0]}
        color="#FF0000"
        intensity={1}
        distance={2}
      />
    </RigidBody>
  );
}
