import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface FallingIcicleProps {
  position: [number, number, number];
  triggerRadius?: number;
  fallDelay?: number;
  respawnTime?: number;
  size?: number;
}

type IcicleState = 'hanging' | 'shaking' | 'falling' | 'respawning';

export function FallingIcicle({
  position,
  triggerRadius = 3,
  fallDelay = 1,
  respawnTime = 5,
  size = 1,
}: FallingIcicleProps) {
  const [state, setState] = useState<IcicleState>('hanging');
  const [currentY, setCurrentY] = useState(0);
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const shakeTimeRef = useRef(0);
  const fallStartY = useRef(0);

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  useFrame((_, delta) => {
    if (isDead) return;

    switch (state) {
      case 'hanging':
        // Check if player is within trigger radius
        if (playerPosition) {
          const dx = playerPosition[0] - position[0];
          const dz = playerPosition[2] - position[2];
          const horizontalDistance = Math.sqrt(dx * dx + dz * dz);

          // Only trigger if player is below and within horizontal radius
          if (horizontalDistance < triggerRadius && playerPosition[1] < position[1]) {
            setState('shaking');
            shakeTimeRef.current = 0;
          }
        }
        break;

      case 'shaking':
        shakeTimeRef.current += delta;

        // Shake animation
        if (meshRef.current) {
          const shakeIntensity = Math.min(shakeTimeRef.current / fallDelay, 1) * 0.1;
          meshRef.current.position.x = Math.sin(shakeTimeRef.current * 50) * shakeIntensity;
          meshRef.current.position.z = Math.cos(shakeTimeRef.current * 40) * shakeIntensity * 0.5;
        }

        // After delay, start falling
        if (shakeTimeRef.current >= fallDelay) {
          setState('falling');
          fallStartY.current = 0;
          if (meshRef.current) {
            meshRef.current.position.x = 0;
            meshRef.current.position.z = 0;
          }
        }
        break;

      case 'falling':
        // Fall with acceleration
        const fallSpeed = 15;
        const newY = currentY - fallSpeed * delta;
        setCurrentY(newY);

        // Check collision with player
        if (playerPosition) {
          const icicleWorldY = position[1] + newY;
          const dx = playerPosition[0] - position[0];
          const dz = playerPosition[2] - position[2];
          const horizontalDistance = Math.sqrt(dx * dx + dz * dz);

          // Collision check
          if (
            horizontalDistance < 0.8 * size &&
            Math.abs(playerPosition[1] - icicleWorldY) < 1.5 * size
          ) {
            die();
          }
        }

        // Check if fallen far enough (below death plane)
        if (newY < -30) {
          setState('respawning');
          timeRef.current = 0;
        }
        break;

      case 'respawning':
        timeRef.current += delta;
        if (timeRef.current >= respawnTime) {
          setState('hanging');
          setCurrentY(0);
          if (meshRef.current) {
            meshRef.current.position.x = 0;
            meshRef.current.position.z = 0;
          }
        }
        break;
    }
  });

  if (state === 'respawning') {
    return null;
  }

  const icicleHeight = 2 * size;
  const icicleRadius = 0.3 * size;

  return (
    <group position={position}>
      {/* Icicle mesh */}
      <mesh
        ref={meshRef}
        position={[0, currentY - icicleHeight / 2, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[icicleRadius, icicleHeight, 6]} />
        <meshStandardMaterial
          color={state === 'shaking' ? '#FFE4E4' : '#A5D8FF'}
          emissive={state === 'shaking' ? '#FF6666' : '#4DA8DA'}
          emissiveIntensity={state === 'shaking' ? 0.5 : 0.2}
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Ice crystals on top */}
      <mesh position={[0, currentY + 0.1, 0]}>
        <boxGeometry args={[0.6 * size, 0.2 * size, 0.6 * size]} />
        <meshStandardMaterial
          color="#E3F2FD"
          transparent
          opacity={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Warning glow when shaking */}
      {state === 'shaking' && (
        <pointLight
          position={[0, currentY, 0]}
          color="#FF4444"
          intensity={2 + Math.sin(shakeTimeRef.current * 20) * 1}
          distance={5}
        />
      )}

      {/* Ambient ice glow */}
      {state === 'hanging' && (
        <pointLight
          position={[0, currentY - icicleHeight / 2, 0]}
          color="#4DA8DA"
          intensity={0.5}
          distance={3}
        />
      )}
    </group>
  );
}
