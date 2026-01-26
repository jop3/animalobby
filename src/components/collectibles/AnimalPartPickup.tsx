import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { getPart } from '../../data/animalParts';

interface AnimalPartPickupProps {
  id: string;
  partId: string; // ID of the animal part from animalParts.ts
  position: [number, number, number];
}

export function AnimalPartPickup({ id, partId, position }: AnimalPartPickupProps) {
  const meshRef = useRef<Mesh>(null);
  const [collected, setCollected] = useState(false);
  const unlockPart = useGameStore((state) => state.unlockPart);

  const part = getPart(partId);

  // Animated floating and rotation
  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  const handleCollision = () => {
    if (collected || !part) return;

    setCollected(true);
    unlockPart(partId);

    // Particle burst effect handled by component unmount
  };

  if (collected || !part) return null;

  // Render based on part type
  const getColor = () => {
    switch (part.type) {
      case 'head':
        return '#FFD700'; // Gold for head parts
      case 'body':
        return '#FF6B6B'; // Red for body parts
      case 'legs':
        return '#4ECDC4'; // Cyan for leg parts
      default:
        return '#FFFFFF';
    }
  };

  const getEmoji = () => {
    switch (part.type) {
      case 'head':
        return '🦁'; // Lion head
      case 'body':
        return '🐆'; // Leopard body
      case 'legs':
        return '🦘'; // Kangaroo legs
      default:
        return '⭐';
    }
  };

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      onIntersectionEnter={handleCollision}
    >
      <group>
        {/* Outer glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[0.8, 1.2, 32]} />
          <meshBasicMaterial
            color={getColor()}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Inner rotating star - bright glow core */}
        <mesh ref={meshRef}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Glow sphere for bloom effect */}
        <mesh>
          <sphereGeometry args={[0.7, 8, 8]} />
          <meshBasicMaterial
            color={getColor()}
            transparent
            opacity={0.25}
          />
        </mesh>

        {/* Orbiting particles */}
        <OrbitingParticles color={getColor()} />

        {/* Glow light */}
        <pointLight
          position={[0, 0, 0]}
          intensity={2}
          distance={5}
          color={getColor()}
        />

        {/* Label showing part type */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.01, 0.01, 0.01]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </RigidBody>
  );
}

// Orbiting particles around the pickup
function OrbitingParticles({ color }: { color: string }) {
  const particlesRef = useRef<Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      const angle = (i / 3) * Math.PI * 2 + time * 2;
      const radius = 0.8;

      particle.position.x = Math.cos(angle) * radius;
      particle.position.z = Math.sin(angle) * radius;
      particle.position.y = Math.sin(time * 3 + i) * 0.3;
    });
  });

  return (
    <group>
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) particlesRef.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
