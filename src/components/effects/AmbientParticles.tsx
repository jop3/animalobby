import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { BufferGeometry, BufferAttribute } from 'three';

interface AmbientParticlesProps {
  count?: number;
  area?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
  type?: 'snow' | 'fireflies' | 'dust' | 'sparkles';
}

export function AmbientParticles({
  count = 500,
  area = [50, 30, 50],
  color = '#FFFFFF',
  size = 0.1,
  speed = 0.5,
  type = 'dust',
}: AmbientParticlesProps) {
  const pointsRef = useRef<any>(null);
  const positions = useRef<Float32Array>(new Float32Array(count * 3));
  const velocities = useRef<Float32Array>(new Float32Array(count * 3));

  useMemo(() => {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions.current[i3] = (Math.random() - 0.5) * area[0];
      positions.current[i3 + 1] = Math.random() * area[1];
      positions.current[i3 + 2] = (Math.random() - 0.5) * area[2];

      switch (type) {
        case 'snow':
          velocities.current[i3] = (Math.random() - 0.5) * 0.2;
          velocities.current[i3 + 1] = -Math.random() * speed;
          velocities.current[i3 + 2] = (Math.random() - 0.5) * 0.2;
          break;
        case 'fireflies':
          velocities.current[i3] = (Math.random() - 0.5) * speed;
          velocities.current[i3 + 1] = (Math.random() - 0.5) * speed * 0.5;
          velocities.current[i3 + 2] = (Math.random() - 0.5) * speed;
          break;
        case 'sparkles':
          velocities.current[i3] = 0;
          velocities.current[i3 + 1] = (Math.random() - 0.5) * speed * 0.3;
          velocities.current[i3 + 2] = 0;
          break;
        default:
          velocities.current[i3] = (Math.random() - 0.5) * speed * 0.5;
          velocities.current[i3 + 1] = (Math.random() - 0.5) * speed * 0.3;
          velocities.current[i3 + 2] = (Math.random() - 0.5) * speed * 0.5;
      }
    }
  }, [count, area, speed, type]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions.current[i3] += velocities.current[i3] * delta;
      positions.current[i3 + 1] += velocities.current[i3 + 1] * delta;
      positions.current[i3 + 2] += velocities.current[i3 + 2] * delta;

      if (positions.current[i3] > area[0] / 2) positions.current[i3] = -area[0] / 2;
      if (positions.current[i3] < -area[0] / 2) positions.current[i3] = area[0] / 2;
      if (positions.current[i3 + 1] > area[1]) positions.current[i3 + 1] = 0;
      if (positions.current[i3 + 1] < 0) positions.current[i3 + 1] = area[1];
      if (positions.current[i3 + 2] > area[2] / 2) positions.current[i3 + 2] = -area[2] / 2;
      if (positions.current[i3 + 2] < -area[2] / 2) positions.current[i3 + 2] = area[2] / 2;

      if (type === 'fireflies') {
        velocities.current[i3] += (Math.random() - 0.5) * 0.1;
        velocities.current[i3 + 1] += (Math.random() - 0.5) * 0.1;
        velocities.current[i3 + 2] += (Math.random() - 0.5) * 0.1;

        const maxVel = speed * 2;
        velocities.current[i3] = Math.max(-maxVel, Math.min(maxVel, velocities.current[i3]));
        velocities.current[i3 + 1] = Math.max(-maxVel, Math.min(maxVel, velocities.current[i3 + 1]));
        velocities.current[i3 + 2] = Math.max(-maxVel, Math.min(maxVel, velocities.current[i3 + 2]));
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions.current, 3));
    return geo;
  }, []);

  return (
    <Points ref={pointsRef} geometry={geometry} limit={count}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        opacity={type === 'fireflies' ? 0.8 : 0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}
