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

// Checkpoint activation burst - green energy rings
export function CheckpointParticles({ position }: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    // Create ring burst pattern
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      newParticles.push({
        id: i,
        position: new Vector3(position[0], position[1], position[2]),
        velocity: new Vector3(
          Math.cos(angle) * 4,
          3 + Math.random() * 2,
          Math.sin(angle) * 4
        ),
        lifetime: 0,
        maxLifetime: 1.2,
        color: ['#2ECC71', '#27AE60', '#F1C40F'][Math.floor(Math.random() * 3)],
        size: 0.2 + Math.random() * 0.2,
      });
    }
    // Add vertical sparkles
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: 16 + i,
        position: new Vector3(
          position[0] + (Math.random() - 0.5) * 2,
          position[1],
          position[2] + (Math.random() - 0.5) * 2
        ),
        velocity: new Vector3(
          (Math.random() - 0.5) * 0.5,
          6 + Math.random() * 4,
          (Math.random() - 0.5) * 0.5
        ),
        lifetime: 0,
        maxLifetime: 1.5,
        color: '#F1C40F',
        size: 0.15,
      });
    }
    setParticles(newParticles);
  }, [position]);

  useFrame((_, delta) => {
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          position: p.position.clone().add(p.velocity.clone().multiplyScalar(delta)),
          velocity: p.velocity.clone().add(new Vector3(0, -6 * delta, 0)),
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

// Animal part collection - magical sparkles
export function AnimalPartParticles({ position, color = '#FFD700' }: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    // Create spiral burst pattern
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      const heightOffset = (i % 10) * 0.15;
      newParticles.push({
        id: i,
        position: new Vector3(position[0], position[1] + heightOffset, position[2]),
        velocity: new Vector3(
          Math.cos(angle) * 2.5,
          4 + Math.random() * 2,
          Math.sin(angle) * 2.5
        ),
        lifetime: 0,
        maxLifetime: 1.0,
        color: i % 2 === 0 ? color : '#FFFFFF',
        size: 0.18 + Math.random() * 0.12,
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
          velocity: p.velocity.clone().add(new Vector3(0, -5 * delta, 0)),
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

// Fire embers - continuous floating particles for lava/fire areas
export function FireEmbers({ position, count = 15 }: ParticleSystemProps) {
  const particlesRef = useRef<Mesh[]>([]);
  const dataRef = useRef<{ offset: number; speed: number; radius: number }[]>([]);

  useEffect(() => {
    dataRef.current = Array.from({ length: count }, () => ({
      offset: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      radius: 1 + Math.random() * 2,
    }));
  }, [count]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    particlesRef.current.forEach((mesh, i) => {
      if (!mesh || !dataRef.current[i]) return;

      const { offset, speed, radius } = dataRef.current[i];
      // Spiral upward motion
      mesh.position.x = position[0] + Math.sin(time * speed + offset) * radius;
      mesh.position.y = position[1] + ((time * speed + offset) % 4);
      mesh.position.z = position[2] + Math.cos(time * speed + offset) * radius;

      // Flicker effect
      const flicker = 0.8 + Math.sin(time * 10 + i) * 0.2;
      mesh.scale.setScalar(0.1 * flicker);
    });
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) particlesRef.current[i] = el;
          }}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#FF6600"
            emissive="#FF4400"
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// Ice crystals - shimmering particles for ice/frost areas
export function IceCrystals({ position, count = 12 }: ParticleSystemProps) {
  const particlesRef = useRef<Mesh[]>([]);
  const dataRef = useRef<{ offset: number; speed: number; radius: number }[]>([]);

  useEffect(() => {
    dataRef.current = Array.from({ length: count }, () => ({
      offset: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
      radius: 1.5 + Math.random() * 2,
    }));
  }, [count]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    particlesRef.current.forEach((mesh, i) => {
      if (!mesh || !dataRef.current[i]) return;

      const { offset, speed, radius } = dataRef.current[i];
      // Gentle floating motion
      mesh.position.x = position[0] + Math.sin(time * speed + offset) * radius;
      mesh.position.y = position[1] + Math.sin(time * speed * 0.5 + offset) * 0.5 + 1;
      mesh.position.z = position[2] + Math.cos(time * speed + offset) * radius;

      // Slow rotation
      mesh.rotation.y += 0.02;
      mesh.rotation.x += 0.01;

      // Shimmer effect
      const shimmer = 0.7 + Math.sin(time * 5 + i * 0.5) * 0.3;
      mesh.scale.setScalar(0.15 * shimmer);
    });
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) particlesRef.current[i] = el;
          }}
        >
          <octahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial
            color="#AAEEFF"
            emissive="#66CCFF"
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

// Manager component to handle spawning particles
export function ParticleManager() {
  // This can be enhanced to manage particle spawning globally
  // For now, particles are spawned directly in components
  return null;
}
