import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { Vector3, BufferGeometry, BufferAttribute } from 'three';

interface ParticleBurstProps {
  position: [number, number, number];
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  duration?: number;
  onComplete?: () => void;
}

export function ParticleBurst({
  position,
  count = 50,
  color = '#FFD700',
  size = 0.1,
  speed = 5,
  duration = 1.5,
  onComplete,
}: ParticleBurstProps) {
  const pointsRef = useRef<any>(null);
  const timeRef = useRef(0);
  const positions = useRef<Float32Array>(new Float32Array(count * 3));
  const velocities = useRef<Float32Array>(new Float32Array(count * 3));
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize particles in a burst pattern
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Start at burst position
      positions.current[i3] = position[0];
      positions.current[i3 + 1] = position[1];
      positions.current[i3 + 2] = position[2];

      // Random direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      velocities.current[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities.current[i3 + 1] = Math.cos(phi) * speed;
      velocities.current[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    initialized.current = true;
  }, [position, count, speed]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !initialized.current) return;

    timeRef.current += delta;

    if (timeRef.current > duration) {
      onComplete?.();
      return;
    }

    // Update particle positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions.current[i3] += velocities.current[i3] * delta;
      positions.current[i3 + 1] += velocities.current[i3 + 1] * delta;
      positions.current[i3 + 2] += velocities.current[i3 + 2] * delta;

      // Apply gravity
      velocities.current[i3 + 1] -= 9.8 * delta;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions.current, 3));
    return geo;
  }, []);

  const opacity = Math.max(0, 1 - timeRef.current / duration);

  return (
    <Points ref={pointsRef} geometry={geometry} limit={count}>
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
