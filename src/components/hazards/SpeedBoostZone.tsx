import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface SpeedBoostZoneProps {
  position: [number, number, number];
  size?: [number, number, number];
  speedMultiplier?: number;
  duration?: number;
}

export function SpeedBoostZone({
  position,
  size = [3, 0.5, 6],
  speedMultiplier = 2,
  duration = 3,
}: SpeedBoostZoneProps) {
  const zoneRef = useRef<Mesh>(null);
  const stripesRef = useRef<Mesh[]>([]);
  const particlesRef = useRef<(Mesh | null)[]>([]);

  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animated rainbow/speed stripes
    stripesRef.current.forEach((stripe, i) => {
      if (!stripe) return;

      // Moving stripes effect
      const offset = (time * 5 + i * 0.5) % 1;
      stripe.position.z = -size[2] * 0.5 + size[2] * offset;

      // Color cycling
      const hue = ((time * 100 + i * 30) % 360) / 360;
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      (stripe.material as any).color = color;
      (stripe.material as any).emissive = color;
    });

    // Flowing particles
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      const particleTime = time * 3 + i * 0.2;
      const angle = (i / 20) * Math.PI * 2;
      const radius = (Math.sin(particleTime) * 0.5 + 0.5) * size[0] * 0.4;

      particle.position.x = Math.cos(angle) * radius;
      particle.position.y = 0.3 + Math.sin(particleTime * 2) * 0.2;
      particle.position.z = -size[2] * 0.5 + ((particleTime * 2) % size[2]);

      // Rainbow color
      const hue = ((time * 100 + i * 18) % 360) / 360;
      (particle.material as any).color.setHSL(hue, 1, 0.7);
    });

    // Glow pulsing
    if (zoneRef.current) {
      const pulse = Math.sin(time * 4) * 0.3 + 0.7;
      (zoneRef.current.material as any).emissiveIntensity = pulse;
    }
  });

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      userData={{
        speedBoost: true,
        speedMultiplier,
        duration
      }}
    >
      <group>
        {/* Main zone platform */}
        <mesh ref={zoneRef} receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FF6B00"
            emissiveIntensity={0.7}
            roughness={0.3}
            metalness={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Speed stripes */}
        <group position={[0, size[1] * 0.51, 0]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              ref={(el) => {
                if (el) stripesRef.current[i] = el;
              }}
            >
              <boxGeometry args={[size[0] * 0.8, 0.05, size[2] * 0.1]} />
              <meshBasicMaterial color="#FF0000" />
            </mesh>
          ))}
        </group>

        {/* Speed particles */}
        <group>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={i}
              ref={(el) => (particlesRef.current[i] = el)}
            >
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshBasicMaterial />
            </mesh>
          ))}
        </group>

        {/* Border glow */}
        <lineSegments position={[0, size[1] * 0.5, 0]}>
          <edgesGeometry
            args={[new THREE.BoxGeometry(size[0], 0.02, size[2])]}
          />
          <lineBasicMaterial color="#FFD700" linewidth={2} />
        </lineSegments>

        {/* Point lights for glow effect */}
        <pointLight
          position={[0, 1, size[2] * 0.4]}
          intensity={2}
          distance={6}
          color="#FFD700"
        />
        <pointLight
          position={[0, 1, -size[2] * 0.4]}
          intensity={2}
          distance={6}
          color="#FF6B00"
        />
      </group>
    </RigidBody>
  );
}
