import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Group, Mesh } from 'three';

interface BouncePadProps {
  position: [number, number, number];
  bounceForce?: number;
  size?: number;
}

export function BouncePad({
  position,
  bounceForce = 25,
  size = 2,
}: BouncePadProps) {
  const groupRef = useRef<Group>(null);
  const padRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const bounceTimerRef = useRef(0);
  const particlesRef = useRef<(Mesh | null)[]>([]);
  const lastBounceTimeRef = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Idle animation - gentle pulsing
    if (padRef.current) {
      const pulse = Math.sin(time * 3) * 0.05 + 1;
      padRef.current.scale.y = pulse;
    }

    // Glow pulsing
    if (glowRef.current) {
      const glowPulse = Math.sin(time * 3) * 0.2 + 0.8;
      (glowRef.current.material as any).opacity = glowPulse * 0.6;
    }

    // Bounce animation timer
    if (bounceTimerRef.current > 0) {
      bounceTimerRef.current -= delta;

      // Squash and stretch when bouncing
      const bounceProgress = 1 - bounceTimerRef.current / 0.3;
      if (padRef.current && bounceProgress <= 1) {
        const squash = 1 - Math.sin(bounceProgress * Math.PI) * 0.4;
        padRef.current.scale.y = squash;
      }
    }

    // Bounce particles animation
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      const particleAge = time - lastBounceTimeRef.current;
      if (particleAge > 0 && particleAge < 1) {
        const progress = particleAge;
        const angle = (i / 12) * Math.PI * 2;
        const radius = progress * size * 1.5;

        particle.position.x = Math.cos(angle) * radius;
        particle.position.y = progress * 3;
        particle.position.z = Math.sin(angle) * radius;

        particle.scale.setScalar((1 - progress) * 0.3);
        (particle.material as any).opacity = (1 - progress) * 0.8;
      } else if (particleAge >= 1) {
        particle.scale.setScalar(0);
      }
    });
  });

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      userData={{ bouncePad: true, bounceForce }}
    >
      <group ref={groupRef}>
        {/* Base platform */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <cylinderGeometry args={[size * 0.95, size, 0.2, 16]} />
          <meshStandardMaterial
            color="#444444"
            roughness={0.8}
            metalness={0.3}
          />
        </mesh>

        {/* Bounce pad surface */}
        <mesh ref={padRef} castShadow receiveShadow>
          <cylinderGeometry args={[size * 0.9, size * 0.9, 0.4, 16]} />
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00AAAA"
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>

        {/* Glow ring */}
        <mesh
          ref={glowRef}
          position={[0, 0.21, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[size * 0.7, size * 0.95, 32]} />
          <meshBasicMaterial
            color="#00FFFF"
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Arrow indicators */}
        {Array.from({ length: 3 }).map((_, i) => {
          const yOffset = 0.5 + i * 0.4;
          const scale = 1 - i * 0.2;
          return (
            <mesh
              key={i}
              position={[0, yOffset, 0]}
              rotation={[0, 0, 0]}
            >
              <coneGeometry args={[0.3 * scale, 0.5 * scale, 4]} />
              <meshBasicMaterial
                color="#00FFFF"
                transparent
                opacity={0.7 - i * 0.2}
              />
            </mesh>
          );
        })}

        {/* Bounce particles */}
        <group>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh
              key={i}
              ref={(el) => (particlesRef.current[i] = el)}
              scale={0}
            >
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshBasicMaterial
                color="#00FFFF"
                transparent
              />
            </mesh>
          ))}
        </group>

        {/* Point light */}
        <pointLight
          position={[0, 0.5, 0]}
          intensity={3}
          distance={8}
          color="#00FFFF"
        />
      </group>
    </RigidBody>
  );
}
