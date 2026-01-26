import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { CoinType } from '../../types/game.types';
import { useGameStore } from '../../store/useGameStore';
import { CoinParticles } from '../effects/ParticleSystem';
import { audioManager } from '../../utils/audioManager';

interface CoinProps {
  id: string;
  position: [number, number, number];
  type: CoinType;
}

export function Coin({ id, position, type }: CoinProps) {
  const meshRef = useRef<Mesh>(null);
  const [collected, setCollected] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const collectCoin = useGameStore((state) => state.collectCoin);
  const quality = useGameStore((state) => state.quality);

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
    setShowParticles(true);
    collectCoin(type);
    audioManager.playCoin();
  };

  if (collected) {
    // Show particles briefly after collection
    return showParticles ? <CoinParticles position={position} color={color} /> : null;
  }

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      onIntersectionEnter={handleCollect}
      colliders={false}
    >
      <CuboidCollider args={[0.4, 0.4, 0.2]} />
      {/* Main coin body */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.15]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.7}
          emissive={glowColor}
          emissiveIntensity={0.8}
          flatShading
        />
      </mesh>

      {/* Center detail - bright glow core */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.35, 0.35, 0.05]} />
        <meshStandardMaterial
          color={glowColor}
          roughness={0.1}
          metalness={0.9}
          emissive={glowColor}
          emissiveIntensity={1.5}
          flatShading
        />
      </mesh>

      {/* Glow halo - adds extra bloom visibility */}
      {quality !== 'low' && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}

      {/* Collision sensor (invisible) */}
      <mesh visible={false}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
      </mesh>
    </RigidBody>
  );
}
