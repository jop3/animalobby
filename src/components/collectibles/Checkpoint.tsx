import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { audioManager } from '../../utils/audioManager';
import { CheckpointParticles } from '../effects/ParticleSystem';

interface CheckpointProps {
  id: string;
  position: [number, number, number];
}

export function Checkpoint({ id, position }: CheckpointProps) {
  const meshRef = useRef<Mesh>(null);
  const [showParticles, setShowParticles] = useState(false);
  const setCheckpoint = useGameStore((state) => state.setCheckpoint);
  const lastCheckpointId = useGameStore((state) => state.lastCheckpointId);
  const quality = useGameStore((state) => state.quality);

  const isActive = lastCheckpointId === id;

  // Pulse animation when active
  useFrame((state) => {
    if (meshRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.set(1, scale, 1);
    }
  });

  // Hide particles after animation
  useEffect(() => {
    if (showParticles) {
      const timer = setTimeout(() => setShowParticles(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showParticles]);

  const handleActivate = () => {
    if (isActive) return;

    setShowParticles(true);
    setCheckpoint(position, id);
    audioManager.playCheckpoint();
  };

  return (
    <group position={position}>
      {/* Platform Base - solid surface for player to stand on */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 1, 4]} />
          <meshStandardMaterial
            color={isActive ? '#27AE60' : '#95A5A6'}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      </RigidBody>

      {/* Checkpoint pillar - MUCH taller and thicker */}
      <mesh ref={meshRef} castShadow position={[0, 2, 0]}>
        <boxGeometry args={[0.8, 4, 0.8]} />
        <meshStandardMaterial
          color={isActive ? '#2ECC71' : '#BDC3C7'}
          roughness={0.8}
          metalness={0.2}
          emissive={isActive ? '#2ECC71' : '#999999'}
          emissiveIntensity={isActive ? 0.6 : 0.2}
          flatShading
        />
      </mesh>

      {/* Top crystal/beacon - larger and more prominent */}
      <mesh castShadow position={[0, 4.5, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial
          color={isActive ? '#F1C40F' : '#7F8C8D'}
          roughness={0.2}
          metalness={0.8}
          emissive={isActive ? '#FFFF00' : '#666666'}
          emissiveIntensity={isActive ? 2.0 : 0.3}
          flatShading
        />
      </mesh>

      {/* Beacon glow sphere - creates strong bloom when active */}
      {isActive && quality !== 'low' && (
        <mesh position={[0, 4.5, 0]}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshBasicMaterial
            color="#FFFF00"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Point light for extra visibility - disabled on low quality */}
      {quality !== 'low' && (
        <pointLight
          position={[0, 4.5, 0]}
          intensity={isActive ? 2 : 0.5}
          distance={15}
          color={isActive ? '#F1C40F' : '#AAAAAA'}
        />
      )}

      {/* Activation sensor */}
      <RigidBody
        type="fixed"
        sensor
        position={[0, 0, 0]}
        onIntersectionEnter={handleActivate}
        colliders={false}
      >
        <CuboidCollider args={[1.5, 3, 1.5]} />
      </RigidBody>

      {/* Floating rings - always visible, more prominent when active */}
      <FloatingRing yOffset={1} isActive={isActive} />
      <FloatingRing yOffset={2.5} isActive={isActive} />
      <FloatingRing yOffset={4} isActive={isActive} />

      {/* Ground glow ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 3, 32]} />
        <meshBasicMaterial
          color={isActive ? '#2ECC71' : '#AAAAAA'}
          transparent
          opacity={isActive ? 0.5 : 0.2}
        />
      </mesh>

      {/* Activation particle burst */}
      {showParticles && quality !== 'low' && (
        <CheckpointParticles position={[0, 1, 0]} />
      )}
    </group>
  );
}

function FloatingRing({ yOffset, isActive }: { yOffset: number; isActive: boolean }) {
  const ringRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += isActive ? 0.03 : 0.01;
      ringRef.current.position.y = yOffset + Math.sin(state.clock.elapsedTime * 2 + yOffset) * (isActive ? 0.2 : 0.1);
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[1.5, 0.1, 6, 12]} />
      <meshStandardMaterial
        color={isActive ? '#2ECC71' : '#CCCCCC'}
        emissive={isActive ? '#2ECC71' : '#888888'}
        emissiveIntensity={isActive ? 0.8 : 0.3}
        transparent
        opacity={isActive ? 0.7 : 0.4}
        flatShading
      />
    </mesh>
  );
}
