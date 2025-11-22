import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface LaserBeamProps {
  position: [number, number, number];
  length?: number;
  orientation?: 'horizontal' | 'vertical';
  sweeping?: boolean;
  speed?: number;
}

export function LaserBeam({
  position,
  length = 10,
  orientation = 'horizontal',
  sweeping = false,
  speed = 1,
}: LaserBeamProps) {
  const groupRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  useFrame((_, delta) => {
    if (isDead) return;

    timeRef.current += delta;

    // Rotate if sweeping
    if (sweeping && groupRef.current) {
      groupRef.current.rotation.y = timeRef.current * speed;
    }

    // Check collision
    if (beamRef.current && playerPosition) {
      const beamWorldPos = new THREE.Vector3();
      beamRef.current.getWorldPosition(beamWorldPos);

      // Get beam bounding box in world space
      const beamBox = new THREE.Box3();
      beamRef.current.geometry.computeBoundingBox();
      const localBox = beamRef.current.geometry.boundingBox!;

      beamBox.copy(localBox);
      beamBox.applyMatrix4(beamRef.current.matrixWorld);

      const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(...playerPosition),
        new THREE.Vector3(1, 2, 1)
      );

      if (beamBox.intersectsBox(playerBox)) {
        die();
      }
    }
  });

  const getBeamGeometry = () => {
    if (orientation === 'vertical') {
      return <boxGeometry args={[0.1, length, 0.1]} />;
    } else {
      return <boxGeometry args={[length, 0.1, 0.1]} />;
    }
  };

  const getBeamRotation = (): [number, number, number] => {
    if (orientation === 'vertical') {
      return [0, 0, 0];
    }
    return [0, 0, Math.PI / 2];
  };

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Emitter base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.6, 16]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Warning light */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={2}
          />
        </mesh>

        {/* Laser beam */}
        <mesh
          ref={beamRef}
          position={orientation === 'vertical' ? [0, length / 2, 0] : [length / 2, 0, 0]}
          rotation={getBeamRotation()}
        >
          {getBeamGeometry()}
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={3}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Laser glow */}
        <mesh
          position={orientation === 'vertical' ? [0, length / 2, 0] : [length / 2, 0, 0]}
          rotation={getBeamRotation()}
        >
          {orientation === 'vertical' ? (
            <boxGeometry args={[0.3, length, 0.3]} />
          ) : (
            <boxGeometry args={[length, 0.3, 0.3]} />
          )}
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={1}
            transparent
            opacity={0.2}
          />
        </mesh>

        {/* Point light at beam end */}
        <pointLight
          position={orientation === 'vertical' ? [0, length, 0] : [length, 0, 0]}
          color="#FF0000"
          intensity={2}
          distance={3}
        />
      </group>
    </group>
  );
}
