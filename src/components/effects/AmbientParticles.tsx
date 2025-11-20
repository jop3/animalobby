import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AmbientParticlesProps {
  levelId: string;
}

export function AmbientParticles({ levelId }: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particles based on level
  const { positions, colors, sizes, count, speed, range } = useMemo(() => {
    let particleCount = 500;
    let particleSpeed = 0.5;
    let particleRange = 100;
    let particleColor = new THREE.Color('#FFFFFF');
    let particleColors: Float32Array | null = null;

    switch (levelId) {
      case 'space_station':
        // Floating stars and space dust
        particleCount = 800;
        particleSpeed = 0.3;
        particleRange = 150;
        particleColors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          const color = new THREE.Color();
          // Mix of white, blue, and purple
          const rand = Math.random();
          if (rand < 0.33) {
            color.setHex(0xFFFFFF);
          } else if (rand < 0.66) {
            color.setHex(0x4A00E0);
          } else {
            color.setHex(0x00D9FF);
          }
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }
        break;

      case 'mushroom_forest':
        // Glowing spores
        particleCount = 600;
        particleSpeed = 0.2;
        particleRange = 80;
        particleColors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          const color = new THREE.Color();
          // Purple and green glowing spores
          if (Math.random() < 0.7) {
            color.setHex(0xA855F7);
          } else {
            color.setHex(0x4ADE80);
          }
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }
        break;

      case 'neon_city':
        // Neon lights and cyber dust
        particleCount = 700;
        particleSpeed = 1.0;
        particleRange = 100;
        particleColors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          const color = new THREE.Color();
          // Neon pink, purple, cyan
          const rand = Math.random();
          if (rand < 0.33) {
            color.setHex(0xFF006E);
          } else if (rand < 0.66) {
            color.setHex(0x8B00FF);
          } else {
            color.setHex(0x00D9FF);
          }
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }
        break;

      case 'underwater_temple':
        // Bubbles and underwater particles
        particleCount = 400;
        particleSpeed = 0.4;
        particleRange = 80;
        particleColor.setHex(0x87CEEB);
        break;

      case 'lava_volcano':
        // Embers and ash
        particleCount = 500;
        particleSpeed = 0.6;
        particleRange = 70;
        particleColors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          const color = new THREE.Color();
          // Orange and red embers
          if (Math.random() < 0.6) {
            color.setHex(0xFF4500);
          } else {
            color.setHex(0xFF8C00);
          }
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }
        break;

      case 'ice_cavern':
        // Snowflakes and ice crystals
        particleCount = 450;
        particleSpeed = 0.3;
        particleRange = 80;
        particleColor.setHex(0xE0FFFF);
        break;

      case 'desert_ruins':
        // Sand dust
        particleCount = 300;
        particleSpeed = 0.4;
        particleRange = 60;
        particleColor.setHex(0xDEB887);
        break;

      default:
        // Generic sparkles
        particleCount = 300;
        particleSpeed = 0.5;
        particleRange = 60;
        break;
    }

    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random position in 3D space
      positions[i * 3] = (Math.random() - 0.5) * particleRange;
      positions[i * 3 + 1] = Math.random() * particleRange * 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * particleRange;

      // Random sizes
      sizes[i] = Math.random() * 2 + 0.5;
    }

    return {
      positions,
      colors: particleColors,
      sizes,
      count: particleCount,
      speed: particleSpeed,
      range: particleRange,
    };
  }, [levelId]);

  // Animate particles
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Move particles
      positions[i * 3 + 1] += speed * delta * 5;

      // Wrap around when they go too high
      if (positions[i * 3 + 1] > range * 0.8) {
        positions[i * 3 + 1] = 0;
      }

      // Slight horizontal drift
      positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i) * 0.01;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        vertexColors={colors !== null}
        size={2}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
        color={colors ? undefined : '#FFFFFF'}
      />
    </Points>
  );
}
