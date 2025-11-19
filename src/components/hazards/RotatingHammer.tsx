import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';

interface RotatingHammerProps {
  position: [number, number, number];
  rotationSpeed?: number;
  hammerLength?: number;
}

export function RotatingHammer({
  position,
  rotationSpeed = 1,
  hammerLength = 3,
}: RotatingHammerProps) {
  const hammerRef = useRef<any>(null);
  const die = useGameStore((state) => state.die);

  useFrame((state) => {
    if (hammerRef.current) {
      const angle = state.clock.elapsedTime * rotationSpeed;
      const x = position[0];
      const y = position[1];
      const z = position[2];

      // Rotate the hammer around the pivot point
      hammerRef.current.setRotation(
        { x: 0, y: 0, z: angle, w: 1 },
        true
      );
    }
  });

  const handleCollision = () => {
    die();
  };

  return (
    <group position={position}>
      {/* Center pivot */}
      <RigidBody type="fixed">
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial
            color="#2C3E50"
            roughness={0.3}
            metalness={0.7}
            flatShading
          />
        </mesh>
      </RigidBody>

      {/* Rotating hammer arm */}
      <RigidBody
        ref={hammerRef}
        type="kinematicPosition"
        sensor
        onIntersectionEnter={handleCollision}
        userData={{ hazard: 'hammer' }}
      >
        {/* Arm */}
        <mesh castShadow position={[hammerLength / 2, 0, 0]}>
          <boxGeometry args={[hammerLength, 0.3, 0.3]} />
          <meshStandardMaterial
            color="#7F8C8D"
            roughness={0.6}
            metalness={0.4}
            flatShading
          />
        </mesh>

        {/* Hammer head */}
        <mesh castShadow position={[hammerLength, 0, 0]}>
          <boxGeometry args={[0.8, 1, 1]} />
          <meshStandardMaterial
            color="#E74C3C"
            roughness={0.8}
            metalness={0.2}
            emissive="#C0392B"
            emissiveIntensity={0.2}
            flatShading
          />
        </mesh>

        {/* Danger stripes on hammer */}
        <mesh castShadow position={[hammerLength, 0, 0]}>
          <boxGeometry args={[0.82, 0.3, 1.02]} />
          <meshStandardMaterial
            color="#F1C40F"
            roughness={0.8}
            metalness={0.1}
            flatShading
          />
        </mesh>
      </RigidBody>
    </group>
  );
}
