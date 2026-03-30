import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface WindTunnelProps {
  position: [number, number, number];
  size: [number, number, number];
  direction: [number, number, number];
  strength?: number;
  particleCount?: number;
  color?: string;
}

interface WindParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export function WindTunnel({
  position,
  size,
  direction,
  strength = 10,
  particleCount = 30,
  color = '#FFFFFF',
}: WindTunnelProps) {
  const particlesRef = useRef<WindParticle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const quality = useGameStore((state) => state.quality);

  // Normalize direction
  const normalizedDir = useMemo(() => {
    const len = Math.sqrt(
      direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2
    );
    return len > 0
      ? [direction[0] / len, direction[1] / len, direction[2] / len]
      : [0, 1, 0];
  }, [direction]);

  // Initialize particles
  useMemo(() => {
    const actualCount = quality === 'low' ? Math.floor(particleCount / 2) : particleCount;
    particlesRef.current = Array.from({ length: actualCount }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * size[0],
        (Math.random() - 0.5) * size[1],
        (Math.random() - 0.5) * size[2]
      ),
      velocity: new THREE.Vector3(
        normalizedDir[0] * strength * (0.8 + Math.random() * 0.4),
        normalizedDir[1] * strength * (0.8 + Math.random() * 0.4),
        normalizedDir[2] * strength * (0.8 + Math.random() * 0.4)
      ),
      life: Math.random(),
      maxLife: 1 + Math.random() * 0.5,
    }));
  }, [size, normalizedDir, strength, particleCount, quality]);

  // Dummy object for instanced mesh updates
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Update particles
    particlesRef.current.forEach((particle, i) => {
      particle.life += delta;

      // Move particle
      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      );

      // Reset if out of bounds or life expired
      const halfSize = [size[0] / 2, size[1] / 2, size[2] / 2];
      if (
        particle.life > particle.maxLife ||
        Math.abs(particle.position.x) > halfSize[0] ||
        Math.abs(particle.position.y) > halfSize[1] ||
        Math.abs(particle.position.z) > halfSize[2]
      ) {
        // Reset at opposite end
        particle.position.set(
          -normalizedDir[0] * halfSize[0] * 0.9 + (Math.random() - 0.5) * size[0] * 0.2,
          -normalizedDir[1] * halfSize[1] * 0.9 + (Math.random() - 0.5) * size[1] * 0.2,
          -normalizedDir[2] * halfSize[2] * 0.9 + (Math.random() - 0.5) * size[2] * 0.2
        );
        particle.life = 0;
        particle.maxLife = 1 + Math.random() * 0.5;
      }

      // Update instanced mesh
      if (meshRef.current) {
        dummy.position.copy(particle.position);
        const scale = 0.1 + (1 - particle.life / particle.maxLife) * 0.2;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    });

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Check if player is in wind zone - this would need to be hooked into player physics
  // For now, we expose the wind data via userData for the player to read
  const isPlayerInZone = useMemo(() => {
    if (!playerPosition) return false;

    const relX = playerPosition[0] - position[0];
    const relY = playerPosition[1] - position[1];
    const relZ = playerPosition[2] - position[2];

    return (
      Math.abs(relX) < size[0] / 2 &&
      Math.abs(relY) < size[1] / 2 &&
      Math.abs(relZ) < size[2] / 2
    );
  }, [playerPosition, position, size]);

  const actualParticleCount = quality === 'low' ? Math.floor(particleCount / 2) : particleCount;

  return (
    <group position={position} userData={{
      windZone: true,
      windDirection: normalizedDir,
      windStrength: strength,
      isPlayerInZone,
    }}>
      {/* Invisible collision zone - visual boundary */}
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          wireframe={false}
        />
      </mesh>

      {/* Wind boundary wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </lineSegments>

      {/* Wind particles */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, actualParticleCount]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
        />
      </instancedMesh>

      {/* Directional arrow indicator */}
      <group
        position={[
          normalizedDir[0] * size[0] * 0.3,
          normalizedDir[1] * size[1] * 0.3,
          normalizedDir[2] * size[2] * 0.3,
        ]}
        rotation={[
          normalizedDir[1] > 0.9 ? 0 : normalizedDir[1] < -0.9 ? Math.PI : Math.acos(normalizedDir[1]),
          Math.atan2(normalizedDir[0], normalizedDir[2]),
          0,
        ]}
      >
        <mesh>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Ambient glow */}
      <pointLight
        position={[0, 0, 0]}
        color={color}
        intensity={0.5}
        distance={Math.max(...size)}
      />
    </group>
  );
}

// Helper hook for player to check wind zones
export function useWindEffect(
  playerPosition: [number, number, number] | null,
  windZones: Array<{
    position: [number, number, number];
    size: [number, number, number];
    direction: [number, number, number];
    strength: number;
  }>
): [number, number, number] {
  return useMemo(() => {
    if (!playerPosition) return [0, 0, 0];

    let totalForce: [number, number, number] = [0, 0, 0];

    for (const zone of windZones) {
      const relX = playerPosition[0] - zone.position[0];
      const relY = playerPosition[1] - zone.position[1];
      const relZ = playerPosition[2] - zone.position[2];

      const inZone =
        Math.abs(relX) < zone.size[0] / 2 &&
        Math.abs(relY) < zone.size[1] / 2 &&
        Math.abs(relZ) < zone.size[2] / 2;

      if (inZone) {
        const len = Math.sqrt(
          zone.direction[0] ** 2 +
          zone.direction[1] ** 2 +
          zone.direction[2] ** 2
        );
        if (len > 0) {
          totalForce[0] += (zone.direction[0] / len) * zone.strength;
          totalForce[1] += (zone.direction[1] / len) * zone.strength;
          totalForce[2] += (zone.direction[2] / len) * zone.strength;
        }
      }
    }

    return totalForce;
  }, [playerPosition, windZones]);
}
