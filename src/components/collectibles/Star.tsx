import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh, Group } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface StarProps {
  id: string;
  position: [number, number, number];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function Star({
  id,
  position,
  difficulty = 'medium',
}: StarProps) {
  const starRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const rayRefs = useRef<Mesh[]>([]);
  const particlesRef = useRef<(Mesh | null)[]>([]);
  const groupRef = useRef<Group>(null);

  const collectedStars = useGameStore((state) => state.collectedStars || []);
  const collectStar = useGameStore((state) => state.collectStar);
  const isCollected = collectedStars.includes(id);

  // Color based on difficulty
  const colorMap = {
    easy: { main: '#FFD700', glow: '#FFA500' }, // Gold
    medium: { main: '#00FFFF', glow: '#0080FF' }, // Cyan
    hard: { main: '#FF00FF', glow: '#8000FF' }, // Magenta
  };
  const colors = colorMap[difficulty];

  useFrame((state, delta) => {
    if (isCollected || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Floating animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 2) * 0.3;
    }

    // Star rotation
    if (starRef.current) {
      starRef.current.rotation.y = time * 1.5;
      starRef.current.rotation.z = Math.sin(time * 3) * 0.1;
    }

    // Pulsing glow
    if (glowRef.current) {
      const pulse = Math.sin(time * 4) * 0.3 + 1;
      glowRef.current.scale.setScalar(pulse);
      (glowRef.current.material as any).opacity = (Math.sin(time * 4) * 0.2 + 0.4);
    }

    // Rotating rays
    rayRefs.current.forEach((ray, i) => {
      if (!ray) return;
      ray.rotation.z = time * 2 + (i * Math.PI * 2) / 4;
      const pulse = Math.sin(time * 3 + i) * 0.2 + 0.8;
      ray.scale.setScalar(pulse);
    });

    // Orbiting particles
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      const angle = time * 2 + (i / 8) * Math.PI * 2;
      const radius = 1.5 + Math.sin(time * 3 + i) * 0.3;

      particle.position.x = Math.cos(angle) * radius;
      particle.position.y = Math.sin(time * 2 + i * 0.5) * 0.5;
      particle.position.z = Math.sin(angle) * radius;
    });
  });

  if (isCollected) return null;

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject?.userData?.player) {
          collectStar?.(id);
          // Spawn collection particles here if we have a particle system
        }
      }}
      userData={{ collectible: 'star', id }}
    >
      <group ref={groupRef}>
        {/* Main star shape */}
        <mesh ref={starRef} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={colors.main}
            emissive={colors.main}
            emissiveIntensity={1}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Star points */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0]}
              rotation={[0, 0, angle]}
              castShadow
            >
              <coneGeometry args={[0.25, 0.6, 4]} />
              <meshStandardMaterial
                color={colors.main}
                emissive={colors.glow}
                emissiveIntensity={0.8}
              />
            </mesh>
          );
        })}

        {/* Glow sphere */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial
            color={colors.glow}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Light rays */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) rayRefs.current[i] = el;
            }}
            rotation={[0, 0, (i * Math.PI) / 4]}
          >
            <planeGeometry args={[0.1, 3]} />
            <meshBasicMaterial
              color={colors.main}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}

        {/* Orbiting particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => (particlesRef.current[i] = el)}
          >
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshBasicMaterial
              color={colors.main}
            />
          </mesh>
        ))}

        {/* Point light */}
        <pointLight
          position={[0, 0, 0]}
          intensity={4}
          distance={8}
          color={colors.glow}
        />

        {/* Difficulty indicator - rings */}
        {Array.from({ length: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3 }).map((_, i) => (
          <mesh
            key={i}
            position={[0, -1.5 - i * 0.3, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.4, 0.5, 16]} />
            <meshBasicMaterial
              color={colors.main}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}
