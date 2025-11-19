import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

interface Particle {
  id: number;
  position: Vector3;
  velocity: Vector3;
  lifetime: number;
  maxLifetime: number;
  color: string;
  size: number;
}

interface ParticleSystemProps {
  position: [number, number, number];
  count?: number;
  color?: string;
  spread?: number;
  lifetime?: number;
}

export function DeathParticles({ position, count = 20 }: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create explosion particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;

      newParticles.push({
        id: i,
        position: new Vector3(position[0], position[1], position[2]),
        velocity: new Vector3(
          Math.cos(angle) * speed,
          2 + Math.random() * 3,
          Math.sin(angle) * speed
        ),
        lifetime: 0,
        maxLifetime: 1 + Math.random() * 0.5,
        color: ['#FF4444', '#FF6666', '#CC0000'][Math.floor(Math.random() * 3)],
        size: 0.2 + Math.random() * 0.3,
      });
    }
    setParticles(newParticles);
  }, [position, count]);

  useFrame((_, delta) => {
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          position: p.position.clone().add(p.velocity.clone().multiplyScalar(delta)),
          velocity: p.velocity.clone().add(new Vector3(0, -10 * delta, 0)), // Gravity
          lifetime: p.lifetime + delta,
        }))
        .filter((p) => p.lifetime < p.maxLifetime)
    );
  });

  return (
    <>
      {particles.map((particle) => (
        <ParticleCube key={particle.id} particle={particle} />
      ))}
    </>
  );
}

export function CoinParticles({ position, color = '#F1C40F' }: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create sparkle particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: i,
        position: new Vector3(position[0], position[1], position[2]),
        velocity: new Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 4 + 2,
          (Math.random() - 0.5) * 3
        ),
        lifetime: 0,
        maxLifetime: 0.8,
        color,
        size: 0.15 + Math.random() * 0.15,
      });
    }
    setParticles(newParticles);
  }, [position, color]);

  useFrame((_, delta) => {
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          position: p.position.clone().add(p.velocity.clone().multiplyScalar(delta)),
          velocity: p.velocity.clone().add(new Vector3(0, -8 * delta, 0)),
          lifetime: p.lifetime + delta,
        }))
        .filter((p) => p.lifetime < p.maxLifetime)
    );
  });

  return (
    <>
      {particles.map((particle) => (
        <ParticleCube key={particle.id} particle={particle} />
      ))}
    </>
  );
}

function ParticleCube({ particle }: { particle: Particle }) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Fade out based on lifetime
      const alpha = 1 - particle.lifetime / particle.maxLifetime;
      meshRef.current.scale.setScalar(particle.size * alpha);

      // Rotate for visual interest
      meshRef.current.rotation.x += 0.1;
      meshRef.current.rotation.y += 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={particle.position}>
      <boxGeometry args={[particle.size, particle.size, particle.size]} />
      <meshStandardMaterial
        color={particle.color}
        emissive={particle.color}
        emissiveIntensity={0.5}
        transparent
        opacity={1 - particle.lifetime / particle.maxLifetime}
        flatShading
      />
    </mesh>
  );
}

// Manager component to handle spawning particles
export function ParticleManager() {
  // This can be enhanced to manage particle spawning globally
  // For now, particles are spawned directly in components
  return null;
}
