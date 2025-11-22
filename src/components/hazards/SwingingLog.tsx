import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface SwingingLogProps {
  position: [number, number, number];
  length?: number;
  speed?: number;
  swingAngle?: number;
  logSize?: number;
}

export function SwingingLog({
  position,
  length = 5,
  speed = 1.2,
  swingAngle = Math.PI / 2,
  logSize = 0.8,
}: SwingingLogProps) {
  const groupRef = useRef<THREE.Group>(null);
  const logRef = useRef<THREE.Mesh>(null);
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

    // Check collision with log
    if (logRef.current && playerPosition) {
      const logWorldPos = new THREE.Vector3();
      logRef.current.getWorldPosition(logWorldPos);

      const distance = Math.sqrt(
        Math.pow(logWorldPos.x - playerPosition[0], 2) +
        Math.pow(logWorldPos.y - playerPosition[1], 2) +
        Math.pow(logWorldPos.z - playerPosition[2], 2)
      );

      if (distance < logSize + 1) {
        die();
      }
    }
  });

  return (
    <group position={position}>
      {/* Anchor point */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.6]} />
        <meshStandardMaterial
          color="#3a2817"
          roughness={0.8}
        />
      </mesh>

      {/* Swinging group */}
      <group ref={groupRef}>
        {/* Chains */}
        {[-0.3, 0.3].map((offset, i) => (
          <mesh key={i} position={[offset, -length / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, length, 8]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Log */}
        <mesh ref={logRef} position={[0, -length, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[logSize, logSize, 2.5, 12]} />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.9}
          />
        </mesh>

        {/* Log ends */}
        {[-1.25, 1.25].map((offset, i) => (
          <mesh key={i} position={[offset, -length, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[logSize, logSize, 0.1, 12]} />
            <meshStandardMaterial
              color="#654321"
              roughness={0.8}
            />
          </mesh>
        ))}

        {/* Damage indicator (spikes on log) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                0,
                -length,
                0,
              ]}
              rotation={[0, angle, Math.PI / 2]}
            >
              <mesh position={[0, logSize, 0]}>
                <coneGeometry args={[0.2, 0.4, 4]} />
                <meshStandardMaterial
                  color="#2a2a2a"
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
