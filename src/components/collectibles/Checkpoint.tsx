import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface CheckpointProps {
  id: string;
  position: [number, number, number];
}

export function Checkpoint({ id, position }: CheckpointProps) {
  const meshRef = useRef<Mesh>(null);
  const [activated, setActivated] = useState(false);
  const setCheckpoint = useGameStore((state) => state.setCheckpoint);
  const lastCheckpointId = useGameStore((state) => state.lastCheckpointId);

  const isActive = lastCheckpointId === id;

  // Pulse animation when active
  useFrame((state) => {
    if (meshRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.set(1, scale, 1);
    }
  });

  const handleActivate = () => {
    if (isActive) return;

    setActivated(true);
    setCheckpoint(position, id);

    // TODO: Play checkpoint sound
    // TODO: Show "Checkpoint Saved!" message
    console.log(`Checkpoint ${id} activated!`);
  };

  return (
    <group position={position}>
      {/* Base platform - much more prominent */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[3, 0.5, 3]} />
          <meshStandardMaterial
            color={isActive ? '#2ECC71' : '#95A5A6'}
            roughness={0.8}
            metalness={0.1}
            emissive={isActive ? '#2ECC71' : '#555555'}
            emissiveIntensity={isActive ? 0.3 : 0.1}
            flatShading
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
          roughness={0.3}
          metalness={0.7}
          emissive={isActive ? '#F1C40F' : '#666666'}
          emissiveIntensity={isActive ? 1.0 : 0.3}
          flatShading
        />
      </mesh>

      {/* Point light for extra visibility */}
      <pointLight
        position={[0, 4.5, 0]}
        intensity={isActive ? 2 : 0.5}
        distance={15}
        color={isActive ? '#F1C40F' : '#AAAAAA'}
      />

      {/* Activation sensor */}
      <RigidBody
        type="fixed"
        sensor
        position={[0, 0, 0]}
        onIntersectionEnter={handleActivate}
      >
        <mesh visible={false}>
          <boxGeometry args={[3, 6, 3]} />
        </mesh>
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
