import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';

interface Particle {
  position: [number, number, number];
  velocity: [number, number, number];
  lifetime: number;
  maxLifetime: number;
  color: string;
}

interface DeathParticlesProps {
  position: [number, number, number];
  count?: number;
  onComplete?: () => void;
}

const tempObject = new Object3D();
const tempColor = new Color();

export function DeathParticles({
  position,
  count = 20,
  onComplete,
}: DeathParticlesProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const particles = useRef<Particle[]>([]);
  const hasCompleted = useRef(false);

  // Initialize particles
  useEffect(() => {
    particles.current = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 5 + Math.random() * 5;
      const upwardSpeed = 3 + Math.random() * 5;

      particles.current.push({
        position: [...position],
        velocity: [
          Math.cos(angle) * speed,
          upwardSpeed,
          Math.sin(angle) * speed,
        ],
        lifetime: 0,
        maxLifetime: 1 + Math.random() * 0.5,
        color: ['#FF6B6B', '#FFD93D', '#6BCF7F'][Math.floor(Math.random() * 3)],
      });
    }
  }, [position, count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    let allDead = true;

    particles.current.forEach((particle, i) => {
      particle.lifetime += delta;

      if (particle.lifetime < particle.maxLifetime) {
        allDead = false;

        // Update position with velocity
        particle.position[0] += particle.velocity[0] * delta;
        particle.position[1] += particle.velocity[1] * delta;
        particle.position[2] += particle.velocity[2] * delta;

        // Apply gravity
        particle.velocity[1] -= 20 * delta;

        // Update instance transform
        tempObject.position.set(
          particle.position[0],
          particle.position[1],
          particle.position[2]
        );

        // Rotate for visual interest
        tempObject.rotation.set(
          particle.lifetime * 5,
          particle.lifetime * 3,
          particle.lifetime * 4
        );

        // Fade out
        const alpha = 1 - particle.lifetime / particle.maxLifetime;
        tempObject.scale.setScalar(alpha * 0.3);

        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);

        // Set color
        tempColor.set(particle.color);
        meshRef.current.setColorAt(i, tempColor);
      } else {
        // Hide dead particles
        tempObject.position.set(0, -1000, 0);
        tempObject.scale.setScalar(0);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Call onComplete when all particles are dead
    if (allDead && !hasCompleted.current) {
      hasCompleted.current = true;
      onComplete?.();
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial flatShading />
    </instancedMesh>
  );
}
