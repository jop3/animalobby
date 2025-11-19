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
      {/* Base platform */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[2, 0.3, 2]} />
          <meshStandardMaterial
            color={isActive ? '#2ECC71' : '#95A5A6'}
            roughness={0.8}
            metalness={0.1}
            flatShading
          />
        </mesh>
      </RigidBody>

      {/* Checkpoint pillar */}
      <mesh ref={meshRef} castShadow position={[0, 1, 0]}>
        <boxGeometry args={[0.4, 2, 0.4]} />
        <meshStandardMaterial
          color={isActive ? '#2ECC71' : '#BDC3C7'}
          roughness={0.8}
          metalness={0.2}
          emissive={isActive ? '#2ECC71' : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
          flatShading
        />
      </mesh>

      {/* Top crystal/beacon */}
      <mesh castShadow position={[0, 2.3, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={isActive ? '#F1C40F' : '#7F8C8D'}
          roughness={0.3}
          metalness={0.7}
          emissive={isActive ? '#F1C40F' : '#000000'}
          emissiveIntensity={isActive ? 0.8 : 0}
          flatShading
        />
      </mesh>

      {/* Activation sensor */}
      <RigidBody
        type="fixed"
        sensor
        position={[0, 0, 0]}
        onIntersectionEnter={handleActivate}
      >
        <mesh visible={false}>
          <boxGeometry args={[2.5, 4, 2.5]} />
        </mesh>
      </RigidBody>

      {/* Floating rings when active */}
      {isActive && (
        <>
          <FloatingRing yOffset={0.5} />
          <FloatingRing yOffset={1.5} />
        </>
      )}
    </group>
  );
}

function FloatingRing({ yOffset }: { yOffset: number }) {
  const ringRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.02;
      ringRef.current.position.y = yOffset + Math.sin(state.clock.elapsedTime * 2 + yOffset) * 0.15;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[1, 0.05, 4, 8]} />
      <meshStandardMaterial
        color="#2ECC71"
        emissive="#2ECC71"
        emissiveIntensity={0.6}
        transparent
        opacity={0.6}
        flatShading
      />
    </mesh>
  );
}
