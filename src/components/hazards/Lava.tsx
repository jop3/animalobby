import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface LavaProps {
  position: [number, number, number];
  size?: [number, number, number];
}

export function Lava({ position, size = [4, 0.2, 4] }: LavaProps) {
  const meshRef = useRef<Mesh>(null);
  const die = useGameStore((state) => state.die);

  // Animated lava surface
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle wave effect by modifying position
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const handleCollision = () => {
    die();
  };

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      onIntersectionEnter={handleCollision}
      userData={{ hazard: 'lava' }}
    >
      {/* Main lava surface */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color="#FF4500"
          roughness={0.4}
          metalness={0.3}
          emissive="#FF6600"
          emissiveIntensity={0.6}
          flatShading
        />
      </mesh>

      {/* Glowing bubbles */}
      <LavaBubble offset={[0.5, 0.15, 0.3]} delay={0} />
      <LavaBubble offset={[-0.4, 0.15, -0.5]} delay={1} />
      <LavaBubble offset={[0.2, 0.15, -0.4]} delay={2} />

      {/* Point light for lava glow */}
      <pointLight position={[0, size[1] + 0.2, 0]} intensity={2} distance={10} color="#FF6600" />
    </RigidBody>
  );
}

function LavaBubble({ offset, delay }: { offset: [number, number, number]; delay: number }) {
  const bubbleRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (bubbleRef.current) {
      const time = state.clock.elapsedTime + delay;
      const scale = 0.8 + Math.sin(time * 3) * 0.4;
      bubbleRef.current.scale.set(scale, scale, scale);
      bubbleRef.current.position.y = offset[1] + Math.abs(Math.sin(time * 2)) * 0.1;
    }
  });

  return (
    <mesh ref={bubbleRef} position={offset}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FF8C00"
        emissiveIntensity={0.9}
        transparent
        opacity={0.8}
        flatShading
      />
    </mesh>
  );
}
