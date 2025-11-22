import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';

interface SpinningBladeProps {
  position: [number, number, number];
  size?: number;
  speed?: number;
  moving?: {
    pattern: 'linear' | 'circular';
    speed: number;
    range: [number, number, number];
  };
}

export function SpinningBlade({
  position,
  size = 1.5,
  speed = 2,
  moving,
}: SpinningBladeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bladeRef = useRef<THREE.Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const timeRef = useRef(0);

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  useFrame((_, delta) => {
    if (isDead) return;

    timeRef.current += delta;

    // Rotate blade
    if (bladeRef.current) {
      bladeRef.current.rotation.z += delta * speed * 2;
    }

    // Handle movement
    if (moving && rigidBodyRef.current) {
      const basePos = position;

      if (moving.pattern === 'linear') {
        const offset = Math.sin(timeRef.current * moving.speed) * 0.5;
        const newPos = [
          basePos[0] + moving.range[0] * offset,
          basePos[1] + moving.range[1] * offset,
          basePos[2] + moving.range[2] * offset,
        ] as [number, number, number];
        rigidBodyRef.current.setTranslation(
          { x: newPos[0], y: newPos[1], z: newPos[2] },
          true
        );
      } else if (moving.pattern === 'circular') {
        const angle = timeRef.current * moving.speed;
        const newPos = [
          basePos[0] + Math.cos(angle) * moving.range[0],
          basePos[1] + moving.range[1] * Math.sin(timeRef.current * moving.speed * 0.5),
          basePos[2] + Math.sin(angle) * moving.range[2],
        ] as [number, number, number];
        rigidBodyRef.current.setTranslation(
          { x: newPos[0], y: newPos[1], z: newPos[2] },
          true
        );
      }
    }

    // Check collision
    if (bladeRef.current && playerPosition) {
      const bladeWorldPos = new THREE.Vector3();
      bladeRef.current.getWorldPosition(bladeWorldPos);

      const distance = Math.sqrt(
        Math.pow(bladeWorldPos.x - playerPosition[0], 2) +
        Math.pow(bladeWorldPos.y - playerPosition[1], 2) +
        Math.pow(bladeWorldPos.z - playerPosition[2], 2)
      );

      if (distance < size + 0.5) {
        die();
      }
    }
  });

  const bladeContent = (
    <group ref={groupRef}>
      {/* Central hub */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Spinning blade */}
      <mesh ref={bladeRef} rotation={[0, Math.PI / 2, 0]}>
        {/* Create saw blade teeth pattern */}
        <group>
          {/* Blade disc */}
          <mesh>
            <cylinderGeometry args={[size, size, 0.2, 32]} />
            <meshStandardMaterial
              color="#808080"
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>

          {/* Teeth */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * size * 0.9,
                  0,
                  Math.sin(angle) * size * 0.9,
                ]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.3, 0.3, 0.2]} />
                <meshStandardMaterial
                  color="#C0C0C0"
                  metalness={1}
                  roughness={0}
                  emissive="#ff0000"
                  emissiveIntensity={0.3}
                />
              </mesh>
            );
          })}

          {/* Edge highlight */}
          <mesh>
            <torusGeometry args={[size, 0.05, 8, 32]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#FFFFFF"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      </mesh>
    </group>
  );

  if (moving) {
    return (
      <RigidBody
        ref={rigidBodyRef}
        type="kinematicPosition"
        position={position}
        colliders={false}
      >
        {bladeContent}
      </RigidBody>
    );
  }

  return <group position={position}>{bladeContent}</group>;
}
