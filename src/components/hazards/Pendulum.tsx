import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Group, Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface PendulumProps {
  position: [number, number, number];
  length?: number;
  swingAngle?: number;
  swingSpeed?: number;
  hammerSize?: number;
}

export function Pendulum({
  position,
  length = 4,
  swingAngle = Math.PI / 3,
  swingSpeed = 1.5,
  hammerSize = 1.2,
}: PendulumProps) {
  const pivotRef = useRef<Group>(null);
  const hammerRef = useRef<Mesh>(null);
  const chainRefs = useRef<Mesh[]>([]);

  const die = useGameStore((state) => state.die);
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Pendulum swing
    const angle = Math.sin(time * swingSpeed) * swingAngle;

    if (pivotRef.current) {
      pivotRef.current.rotation.z = angle;
    }

    // Chain segment animation (slight wobble)
    chainRefs.current.forEach((chain, i) => {
      if (!chain) return;
      const wobble = Math.sin(time * 3 + i * 0.5) * 0.02;
      chain.rotation.x = wobble;
    });

    // Hammer glow based on speed
    if (hammerRef.current) {
      const speed = Math.abs(Math.cos(time * swingSpeed) * swingSpeed);
      (hammerRef.current.material as any).emissiveIntensity = speed * 0.5 + 0.2;
    }

    // Collision detection with player
    if (playerPosition && pivotRef.current) {
      const hammerWorldPos = hammerRef.current?.getWorldPosition(new THREE.Vector3());
      if (hammerWorldPos) {
        const dx = playerPosition[0] - hammerWorldPos.x;
        const dy = playerPosition[1] - hammerWorldPos.y;
        const dz = playerPosition[2] - hammerWorldPos.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < hammerSize) {
          die();
        }
      }
    }
  });

  const numChainLinks = Math.floor(length / 0.4);

  return (
    <group position={position}>
      {/* Ceiling mount */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
        <meshStandardMaterial
          color="#333333"
          roughness={0.4}
          metalness={0.9}
        />
      </mesh>

      {/* Pivot point */}
      <group ref={pivotRef}>
        {/* Chain links */}
        {Array.from({ length: numChainLinks }).map((_, i) => {
          const yPos = -i * (length / numChainLinks);
          return (
            <mesh
              key={i}
              ref={(el) => {
                if (el) chainRefs.current[i] = el;
              }}
              position={[0, yPos, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.12, 0.12, length / numChainLinks, 8]} />
              <meshStandardMaterial
                color="#555555"
                roughness={0.6}
                metalness={0.8}
              />
            </mesh>
          );
        })}

        {/* Hammer head */}
        <RigidBody
          type="fixed"
          sensor
          position={[0, -length, 0]}
          userData={{ hazard: 'pendulum' }}
        >
          <group>
            {/* Main hammer body */}
            <mesh ref={hammerRef} position={[0, 0, 0]} castShadow>
              <boxGeometry args={[hammerSize * 1.5, hammerSize, hammerSize * 1.5]} />
              <meshStandardMaterial
                color="#CC0000"
                emissive="#AA0000"
                emissiveIntensity={0.3}
                roughness={0.5}
                metalness={0.7}
              />
            </mesh>

            {/* Hammer spikes */}
            {Array.from({ length: 4 }).map((_, i) => {
              const angle = (i / 4) * Math.PI * 2;
              const x = Math.cos(angle) * hammerSize * 0.7;
              const z = Math.sin(angle) * hammerSize * 0.7;
              return (
                <mesh
                  key={i}
                  position={[x, 0, z]}
                  rotation={[0, angle, Math.PI / 2]}
                  castShadow
                >
                  <coneGeometry args={[0.2, 0.6, 6]} />
                  <meshStandardMaterial
                    color="#DD0000"
                    emissive="#CC0000"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              );
            })}

            {/* Danger glow */}
            <pointLight
              position={[0, 0, 0]}
              intensity={2}
              distance={5}
              color="#FF0000"
            />

            {/* Trail effect */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[hammerSize * 1.2, 16, 16]} />
              <meshBasicMaterial
                color="#FF0000"
                transparent
                opacity={0.1}
              />
            </mesh>
          </group>
        </RigidBody>
      </group>

      {/* Warning zone indicator on ground */}
      <mesh
        position={[0, -length - hammerSize * 1.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[length * Math.sin(swingAngle) - 0.5, length * Math.sin(swingAngle) + 0.5, 32]} />
        <meshBasicMaterial
          color="#FF0000"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}
