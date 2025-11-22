import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface PendulumBladeProps {
  position: [number, number, number];
  length?: number;
  speed?: number;
  swingAngle?: number;
}

export function PendulumBlade({
  position,
  length = 4,
  speed = 1,
  swingAngle = Math.PI / 3,
}: PendulumBladeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bladeRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  useFrame((_, delta) => {
    if (isDead) return;

    timeRef.current += delta * speed;
    const angle = Math.sin(timeRef.current) * swingAngle;

    if (groupRef.current) {
      groupRef.current.rotation.z = angle;
    }

    // Check collision with blade
    if (bladeRef.current && playerPosition) {
      const bladeWorldPos = new THREE.Vector3();
      bladeRef.current.getWorldPosition(bladeWorldPos);

      const bladeBox = new THREE.Box3().setFromCenterAndSize(
        bladeWorldPos,
        new THREE.Vector3(0.3, 2, 0.1)
      );

      const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(...playerPosition),
        new THREE.Vector3(1, 2, 1)
      );

      if (bladeBox.intersectsBox(playerBox)) {
        die();
      }
    }
  });

  return (
    <group position={position}>
      {/* Anchor point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Swinging arm */}
      <group ref={groupRef}>
        {/* Chain/rod */}
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, length, 8]} />
          <meshStandardMaterial
            color="#444444"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Blade */}
        <mesh ref={bladeRef} position={[0, -length, 0]}>
          <boxGeometry args={[0.3, 2, 0.1]} />
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.95}
            roughness={0.05}
            emissive="#ff0000"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Blade edge highlight */}
        <mesh position={[0, -length, 0.06]}>
          <boxGeometry args={[0.05, 2, 0.02]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
}
