import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InstancedCubesProps {
  count: number;
  positions: Float32Array;
  colors?: Float32Array;
  size?: number;
  animate?: 'float' | 'twinkle' | 'rise';
}

/**
 * InstancedCubes - Renders many cubes efficiently using InstancedMesh
 * Use for decorative elements like floating debris, particles, etc.
 */
export function InstancedCubes({
  count,
  positions,
  colors,
  size = 0.2,
  animate,
}: InstancedCubesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const originalPositions = useRef<Float32Array | null>(null);

  useEffect(() => {
    originalPositions.current = positions.slice();
  }, [positions]);

  // Set up initial positions and colors
  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      if (colors) {
        meshRef.current.setColorAt(
          i,
          new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])
        );
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (colors && meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, positions, colors, dummy]);

  // Animation
  useFrame((state) => {
    if (!meshRef.current || !animate || !originalPositions.current) return;

    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const baseX = originalPositions.current[i * 3];
      const baseY = originalPositions.current[i * 3 + 1];
      const baseZ = originalPositions.current[i * 3 + 2];

      if (animate === 'float') {
        dummy.position.set(
          baseX + Math.sin(time + i * 0.5) * 0.3,
          baseY + Math.sin(time * 0.8 + i * 0.3) * 0.5,
          baseZ + Math.cos(time + i * 0.4) * 0.3
        );
        const scale = 0.8 + Math.sin(time * 2 + i) * 0.2;
        dummy.scale.setScalar(scale);
      } else if (animate === 'twinkle') {
        dummy.position.set(baseX, baseY, baseZ);
        const scale = 0.5 + Math.sin(time * 3 + i * 0.7) * 0.5;
        dummy.scale.setScalar(scale);
      } else if (animate === 'rise') {
        const riseOffset = ((time * 0.5 + i * 0.3) % 5) - 2.5;
        dummy.position.set(
          baseX + Math.sin(time + i) * 0.5,
          baseY + riseOffset * 2,
          baseZ + Math.cos(time + i) * 0.5
        );
        const opacity = 1 - Math.abs(riseOffset) / 2.5;
        dummy.scale.setScalar(opacity);
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        vertexColors={!!colors}
        color={colors ? undefined : '#FFFFFF'}
        roughness={0.5}
        metalness={0.3}
      />
    </instancedMesh>
  );
}

interface InstancedSpheresProps {
  count: number;
  positions: Float32Array;
  color?: string;
  size?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

/**
 * InstancedSpheres - Renders many spheres efficiently using InstancedMesh
 * Use for bubbles, orbs, glowing particles, etc.
 */
export function InstancedSpheres({
  count,
  positions,
  color = '#FFFFFF',
  size = 0.3,
  emissive,
  emissiveIntensity = 0,
  transparent = false,
  opacity = 1,
}: InstancedSpheresProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, positions, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissiveIntensity}
        transparent={transparent}
        opacity={opacity}
        roughness={0.4}
      />
    </instancedMesh>
  );
}

interface InstancedConesProps {
  count: number;
  positions: Float32Array;
  sizes: Float32Array; // [radius, height] for each cone
  color?: string;
  transparent?: boolean;
  opacity?: number;
}

/**
 * InstancedCones - Renders many cones efficiently using InstancedMesh
 * Use for stalactites, stalagmites, spikes, trees, etc.
 */
export function InstancedCones({
  count,
  positions,
  sizes,
  color = '#AAAAAA',
  transparent = false,
  opacity = 1,
}: InstancedConesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      // Scale based on size data (radius in x/z, height in y)
      const radius = sizes[i * 2];
      const height = sizes[i * 2 + 1];
      dummy.scale.set(radius, height, radius);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, positions, sizes, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[1, 1, 6]} />
      <meshBasicMaterial color={color} transparent={transparent} opacity={opacity} />
    </instancedMesh>
  );
}

/**
 * Helper to generate random positions within a volume
 */
export function generateRandomPositions(
  count: number,
  bounds: { x: [number, number]; y: [number, number]; z: [number, number] }
): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = bounds.x[0] + Math.random() * (bounds.x[1] - bounds.x[0]);
    positions[i * 3 + 1] = bounds.y[0] + Math.random() * (bounds.y[1] - bounds.y[0]);
    positions[i * 3 + 2] = bounds.z[0] + Math.random() * (bounds.z[1] - bounds.z[0]);
  }
  return positions;
}

/**
 * Helper to generate random colors
 */
export function generateRandomColors(
  count: number,
  palette: string[]
): Float32Array {
  const colors = new Float32Array(count * 3);
  const threeColors = palette.map((c) => new THREE.Color(c));

  for (let i = 0; i < count; i++) {
    const color = threeColors[Math.floor(Math.random() * threeColors.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  return colors;
}
