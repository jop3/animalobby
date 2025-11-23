import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { Vector3, BufferGeometry, BufferAttribute } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface ParticleTrailProps {
  count?: number;
  size?: number;
  color?: string;
  opacity?: number;
}

export function ParticleTrail({
  count = 200,
  size = 0.05,
  color = '#00BFFF',
  opacity = 0.6,
}: ParticleTrailProps) {
  const pointsRef = useRef<any>(null);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const positions = useRef<Float32Array>(new Float32Array(count * 3));
  const velocities = useRef<Float32Array>(new Float32Array(count * 3));
  const lifetimes = useRef<Float32Array>(new Float32Array(count));
  const particleIndex = useRef(0);

  useFrame((state, delta) => {
    if (!pointsRef.current || !playerPosition) return;

    // Update existing particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Decrease lifetime
      lifetimes.current[i] -= delta;

      if (lifetimes.current[i] > 0) {
        // Update position based on velocity
        positions.current[i3] += velocities.current[i3] * delta;
        positions.current[i3 + 1] += velocities.current[i3 + 1] * delta;
        positions.current[i3 + 2] += velocities.current[i3 + 2] * delta;

        // Add gravity
        velocities.current[i3 + 1] -= 2 * delta;

        // Fade out
        const life = lifetimes.current[i];
        const opacity = Math.min(1, life / 0.5);
      }
    }

    // Spawn new particles from player position
    const spawnRate = 10; // particles per second
    const particlesToSpawn = Math.floor(spawnRate * delta);

    for (let i = 0; i < particlesToSpawn; i++) {
      const idx = particleIndex.current % count;
      const i3 = idx * 3;

      // Set position to player position with slight randomness
      positions.current[i3] = playerPosition[0] + (Math.random() - 0.5) * 0.5;
      positions.current[i3 + 1] = playerPosition[1] + Math.random() * 0.5;
      positions.current[i3 + 2] = playerPosition[2] + (Math.random() - 0.5) * 0.5;

      // Set random velocity
      velocities.current[i3] = (Math.random() - 0.5) * 2;
      velocities.current[i3 + 1] = Math.random() * 2;
      velocities.current[i3 + 2] = (Math.random() - 0.5) * 2;

      // Set lifetime
      lifetimes.current[idx] = 1 + Math.random() * 0.5;

      particleIndex.current++;
    }

    // Update geometry
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions.current, 3));
    return geo;
  }, []);

  return (
    <Points
      ref={pointsRef}
      geometry={geometry}
      limit={count}
    >
      <PointMaterial
        transparent
        color={color}
        size={size}
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}
