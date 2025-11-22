import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { PowerUpType } from '../../types/game.types';

interface PowerUpProps {
  id: string;
  position: [number, number, number];
  powerUpType: PowerUpType;
  duration?: number;
}

const POWER_UP_COLORS: Record<PowerUpType, string> = {
  speed_boost: '#FFD700', // Gold
  shield: '#00BFFF', // Blue
  double_jump: '#FF69B4', // Pink
  invincibility: '#9370DB', // Purple
  magnet: '#FF4500', // Orange-red
};

const POWER_UP_EMOJIS: Record<PowerUpType, string> = {
  speed_boost: '⚡',
  shield: '🛡️',
  double_jump: '🦘',
  invincibility: '✨',
  magnet: '🧲',
};

export function PowerUp({ id, position, powerUpType, duration = 10 }: PowerUpProps) {
  const meshRef = useRef<Mesh>(null);
  const [collected, setCollected] = useState(false);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const activatePowerUp = useGameStore((state) => state.activatePowerUp);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || collected) return;

    // Rotate and bob animation
    timeRef.current += delta;
    meshRef.current.rotation.y += delta * 2;
    meshRef.current.position.y = position[1] + Math.sin(timeRef.current * 3) * 0.2;

    // Check collision with player
    if (playerPosition) {
      const dist = Math.sqrt(
        Math.pow(playerPosition[0] - position[0], 2) +
        Math.pow(playerPosition[1] - position[1], 2) +
        Math.pow(playerPosition[2] - position[2], 2)
      );

      if (dist < 1.5 && !collected) {
        setCollected(true);
        activatePowerUp(powerUpType, duration * 1000); // Convert to milliseconds
      }
    }
  });

  if (collected) return null;

  const color = POWER_UP_COLORS[powerUpType];

  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh>
        <torusGeometry args={[0.8, 0.1, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Main power-up sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight
        color={color}
        intensity={2}
        distance={5}
        decay={2}
      />
    </group>
  );
}
