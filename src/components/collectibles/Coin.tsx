import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh } from 'three';
import { CoinType } from '../../types/game.types';
import { useGameStore } from '../../store/useGameStore';

interface CoinProps {
  id: string;
  position: [number, number, number];
  type: CoinType;
}

export function Coin({ id, position, type }: CoinProps) {
  const meshRef = useRef<Mesh>(null);
  const [collected, setCollected] = useState(false);
  const collectCoin = useGameStore((state) => state.collectCoin);

  // Colors based on type
  const color = type === 'speed' ? '#F1C40F' : '#9B59B6';
  const glowColor = type === 'speed' ? '#FFD700' : '#C39BD3';

  // Rotation animation
  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.05;
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  const handleCollect = () => {
    if (collected) return;

    setCollected(true);
    collectCoin(type);

    // TODO: Play sound effect
    // TODO: Spawn particle effect
  };

  if (collected) return null;

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      onIntersectionEnter={handleCollect}
    >
      {/* Main coin body */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.15]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          emissive={glowColor}
          emissiveIntensity={0.3}
          flatShading
        />
      </mesh>

      {/* Center detail */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.35, 0.35, 0.05]} />
        <meshStandardMaterial
          color={glowColor}
          roughness={0.2}
          metalness={0.8}
          emissive={glowColor}
          emissiveIntensity={0.5}
          flatShading
        />
      </mesh>

      {/* Collision sensor (invisible) */}
      <mesh visible={false}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
      </mesh>
    </RigidBody>
  );
}
