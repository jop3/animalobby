import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface MovingWallProps {
  position: [number, number, number];
  size: [number, number, number];
  pattern: 'linear';
  speed: number;
  range: [number, number, number];
}

export function MovingWall({
  position,
  size,
  pattern,
  speed,
  range,
}: MovingWallProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  useFrame((_, delta) => {
    if (isDead) return;

    timeRef.current += delta;

    // Move the wall
    if (rigidBodyRef.current) {
      const basePos = position;
      const offset = Math.sin(timeRef.current * speed) * 0.5;
      const newPos = [
        basePos[0] + range[0] * offset,
        basePos[1] + range[1] * offset,
        basePos[2] + range[2] * offset,
      ] as [number, number, number];

      rigidBodyRef.current.setTranslation(
        { x: newPos[0], y: newPos[1], z: newPos[2] },
        true
      );
    }

    // Check collision
    if (meshRef.current && playerPosition) {
      const wallWorldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(wallWorldPos);

      const wallBox = new THREE.Box3().setFromCenterAndSize(
        wallWorldPos,
        new THREE.Vector3(...size)
      );

      const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(...playerPosition),
        new THREE.Vector3(1, 2, 1)
      );

      if (wallBox.intersectsBox(playerBox)) {
        die();
      }
    }
  });

  // Warning when moving fast
  const isMovingFast = Math.abs(Math.cos(timeRef.current * speed)) > 0.7;

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      position={position}
      colliders="cuboid"
    >
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={isMovingFast ? "#8B0000" : "#4a4a4a"}
          emissive={isMovingFast ? "#FF0000" : "#000000"}
          emissiveIntensity={isMovingFast ? 0.3 : 0}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Hazard stripes */}
      <mesh position={[0, 0, size[2] / 2 + 0.01]}>
        <boxGeometry args={[size[0], size[1], 0.01]} />
        <meshStandardMaterial
          color="#FFFF00"
          emissive="#FFFF00"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Warning lights on corners */}
      {isMovingFast && (
        <>
          <mesh position={[size[0] / 2 - 0.2, size[1] / 2 - 0.2, size[2] / 2]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={3}
            />
          </mesh>
          <mesh position={[-size[0] / 2 + 0.2, size[1] / 2 - 0.2, size[2] / 2]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={3}
            />
          </mesh>
        </>
      )}
    </RigidBody>
  );
}
