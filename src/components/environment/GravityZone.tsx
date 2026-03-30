import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface GravityZoneProps {
  position: [number, number, number];
  size: [number, number, number];
  gravityMultiplier?: number;  // 0.3 = low gravity, -1 = reversed, 0 = zero-g
  color?: string;
  particleCount?: number;
}

interface FloatingParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number;
}

export function GravityZone({
  position,
  size,
  gravityMultiplier = 0.3,
  color = '#9B59B6',
  particleCount = 20,
}: GravityZoneProps) {
  const particlesRef = useRef<FloatingParticle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const boundaryRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const quality = useGameStore((state) => state.quality);

  // Initialize floating particles
  useMemo(() => {
    const actualCount = quality === 'low' ? Math.floor(particleCount / 2) : particleCount;
    particlesRef.current = Array.from({ length: actualCount }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * size[0],
        (Math.random() - 0.5) * size[1],
        (Math.random() - 0.5) * size[2]
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        gravityMultiplier < 0 ? Math.random() * 0.5 : -Math.random() * 0.3,
        (Math.random() - 0.5) * 0.5
      ),
      phase: Math.random() * Math.PI * 2,
    }));
  }, [size, gravityMultiplier, particleCount, quality]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Check if player is inside zone
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

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Update particles with affected gravity
    particlesRef.current.forEach((particle, i) => {
      // Apply modified gravity to particle
      const gravityEffect = gravityMultiplier < 0
        ? 0.5  // Upward drift for reversed gravity
        : gravityMultiplier === 0
          ? 0  // No drift for zero-g
          : -0.3 * gravityMultiplier;  // Reduced fall for low gravity

      particle.velocity.y += gravityEffect * delta;

      // Wobble effect for zero-g
      if (Math.abs(gravityMultiplier) < 0.1) {
        particle.position.x += Math.sin(timeRef.current + particle.phase) * 0.02;
        particle.position.z += Math.cos(timeRef.current * 0.7 + particle.phase) * 0.02;
      }

      // Move particle
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));

      // Bounce off boundaries
      const halfSize = [size[0] / 2, size[1] / 2, size[2] / 2];
      if (Math.abs(particle.position.x) > halfSize[0]) {
        particle.velocity.x *= -0.8;
        particle.position.x = Math.sign(particle.position.x) * halfSize[0];
      }
      if (Math.abs(particle.position.y) > halfSize[1]) {
        particle.velocity.y *= -0.5;
        particle.position.y = Math.sign(particle.position.y) * halfSize[1];
      }
      if (Math.abs(particle.position.z) > halfSize[2]) {
        particle.velocity.z *= -0.8;
        particle.position.z = Math.sign(particle.position.z) * halfSize[2];
      }

      // Update instanced mesh
      if (meshRef.current) {
        dummy.position.copy(particle.position);
        const scale = 0.1 + Math.sin(timeRef.current * 2 + particle.phase) * 0.03;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    });

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate boundary
    if (boundaryRef.current) {
      const material = boundaryRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.sin(timeRef.current * 2) * 0.05;
      if (isPlayerInZone) {
        material.opacity += 0.1;
      }
    }
  });

  const actualParticleCount = quality === 'low' ? Math.floor(particleCount / 2) : particleCount;

  // Determine zone visual based on gravity type
  const zoneLabel = gravityMultiplier < 0
    ? 'REVERSED'
    : gravityMultiplier === 0
      ? 'ZERO-G'
      : gravityMultiplier < 0.5
        ? 'LOW-G'
        : 'MODIFIED';

  const zoneColor = gravityMultiplier < 0
    ? '#E74C3C'  // Red for reversed
    : gravityMultiplier === 0
      ? '#3498DB'  // Blue for zero-g
      : '#9B59B6';  // Purple for low-g

  return (
    <group
      position={position}
      userData={{
        gravityZone: true,
        gravityMultiplier,
        isPlayerInZone,
      }}
    >
      {/* Zone boundary - semi-transparent box */}
      <mesh ref={boundaryRef}>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color={zoneColor}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe boundary */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial
          color={zoneColor}
          transparent
          opacity={isPlayerInZone ? 0.8 : 0.4}
        />
      </lineSegments>

      {/* Corner markers */}
      {[
        [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
        [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1],
      ].map((corner, i) => (
        <mesh
          key={i}
          position={[
            corner[0] * size[0] / 2,
            corner[1] * size[1] / 2,
            corner[2] * size[2] / 2,
          ]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color={zoneColor}
            emissive={zoneColor}
            emissiveIntensity={isPlayerInZone ? 0.8 : 0.3}
          />
        </mesh>
      ))}

      {/* Floating particles */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, actualParticleCount]}
        frustumCulled={false}
      >
        <dodecahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial
          color={zoneColor}
          emissive={zoneColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

      {/* Direction indicator arrows */}
      {gravityMultiplier !== 0 && (
        <group>
          {[-1, 0, 1].map((x) =>
            [-1, 0, 1].map((z) => (
              <group
                key={`${x}_${z}`}
                position={[x * size[0] * 0.3, 0, z * size[2] * 0.3]}
                rotation={[gravityMultiplier < 0 ? Math.PI : 0, 0, 0]}
              >
                <mesh position={[0, 0, 0]}>
                  <coneGeometry args={[0.15, 0.4, 6]} />
                  <meshBasicMaterial
                    color={zoneColor}
                    transparent
                    opacity={0.4}
                  />
                </mesh>
              </group>
            ))
          )}
        </group>
      )}

      {/* Zero-G rotation indicator */}
      {gravityMultiplier === 0 && (
        <mesh rotation={[timeRef.current * 0.5, timeRef.current * 0.3, 0]}>
          <torusGeometry args={[Math.min(...size) * 0.3, 0.05, 8, 32]} />
          <meshBasicMaterial
            color={zoneColor}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Ambient glow */}
      <pointLight
        position={[0, 0, 0]}
        color={zoneColor}
        intensity={isPlayerInZone ? 1.5 : 0.5}
        distance={Math.max(...size) * 1.5}
      />

      {/* Distortion edge effect - subtle glow at boundaries */}
      <mesh scale={[1.02, 1.02, 1.02]}>
        <boxGeometry args={size} />
        <meshBasicMaterial
          color={zoneColor}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Helper hook for player physics to use gravity zones
export function useGravityZoneEffect(
  playerPosition: [number, number, number] | null,
  gravityZones: Array<{
    position: [number, number, number];
    size: [number, number, number];
    gravityMultiplier: number;
  }>,
  baseGravity: number = -20
): number {
  return useMemo(() => {
    if (!playerPosition) return baseGravity;

    for (const zone of gravityZones) {
      const relX = playerPosition[0] - zone.position[0];
      const relY = playerPosition[1] - zone.position[1];
      const relZ = playerPosition[2] - zone.position[2];

      const inZone =
        Math.abs(relX) < zone.size[0] / 2 &&
        Math.abs(relY) < zone.size[1] / 2 &&
        Math.abs(relZ) < zone.size[2] / 2;

      if (inZone) {
        return baseGravity * zone.gravityMultiplier;
      }
    }

    return baseGravity;
  }, [playerPosition, gravityZones, baseGravity]);
}
