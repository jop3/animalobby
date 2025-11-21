import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Mesh, Vector3 } from 'three';

interface WindZoneProps {
  position: [number, number, number];
  size: [number, number, number];
  force: [number, number, number];
  visualize?: boolean;
}

export function WindZone({
  position,
  size,
  force,
  visualize = true,
}: WindZoneProps) {
  const particlesRef = useRef<(Mesh | null)[]>([]);
  const arrowRefs = useRef<(Mesh | null)[]>([]);
  const zoneRef = useRef<Mesh>(null);

  const windDirection = new Vector3(...force).normalize();
  const windStrength = new Vector3(...force).length();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate wind particles
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      const speed = 2 + (i % 3) * 0.5;
      const offset = (time * speed + i * 0.3) % 1;

      // Flow in the direction of wind
      particle.position.set(
        windDirection.x * size[0] * (offset - 0.5),
        windDirection.y * size[1] * (offset - 0.5) + Math.sin(time * 2 + i) * 0.3,
        windDirection.z * size[2] * (offset - 0.5)
      );

      // Fade in/out at boundaries
      const fade = Math.sin(offset * Math.PI);
      (particle.material as any).opacity = fade * 0.6;

      // Size variation
      const scale = 0.1 + Math.sin(time * 3 + i) * 0.05;
      particle.scale.setScalar(scale);
    });

    // Animated direction arrows
    arrowRefs.current.forEach((arrow, i) => {
      if (!arrow) return;

      const pulse = Math.sin(time * 3 - i * 0.5) * 0.5 + 0.5;
      (arrow.material as any).opacity = pulse * 0.8;
    });

    // Zone pulsing
    if (zoneRef.current && visualize) {
      const pulse = Math.sin(time * 2) * 0.1 + 0.3;
      (zoneRef.current.material as any).opacity = pulse;
    }
  });

  // Calculate arrow rotation to point in wind direction
  const arrowRotation = new Vector3(0, 1, 0).angleTo(windDirection);
  const arrowAxis = new Vector3(0, 1, 0).cross(windDirection).normalize();

  return (
    <RigidBody
      type="fixed"
      sensor
      position={position}
      userData={{
        windZone: true,
        force: force
      }}
    >
      <group>
        {/* Visualization box */}
        {visualize && (
          <mesh ref={zoneRef}>
            <boxGeometry args={size} />
            <meshStandardMaterial
              color="#87CEEB"
              transparent
              opacity={0.3}
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
        )}

        {/* Wind particles */}
        <group>
          {Array.from({ length: 30 }).map((_, i) => (
            <mesh
              key={i}
              ref={(el) => (particlesRef.current[i] = el)}
            >
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshBasicMaterial
                color="#FFFFFF"
                transparent
              />
            </mesh>
          ))}
        </group>

        {/* Direction arrows */}
        <group>
          {Array.from({ length: 5 }).map((_, i) => {
            const offset = (i - 2) * 1.5;
            return (
              <mesh
                key={i}
                ref={(el) => (arrowRefs.current[i] = el)}
                position={[
                  windDirection.x * offset,
                  windDirection.y * offset,
                  windDirection.z * offset
                ]}
                rotation={[
                  arrowAxis.x * arrowRotation,
                  arrowAxis.y * arrowRotation,
                  arrowAxis.z * arrowRotation
                ]}
              >
                <coneGeometry args={[0.3, 1, 8]} />
                <meshBasicMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.8}
                />
              </mesh>
            );
          })}
        </group>

        {/* Wind strength indicator - rings */}
        <group>
          {Array.from({ length: 3 }).map((_, i) => {
            if (i >= windStrength / 5) return null; // Show rings based on strength
            return (
              <mesh
                key={i}
                position={[0, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <torusGeometry args={[size[0] * 0.3 + i * 0.3, 0.05, 8, 16]} />
                <meshBasicMaterial
                  color="#87CEEB"
                  transparent
                  opacity={0.4 - i * 0.1}
                />
              </mesh>
            );
          })}
        </group>

        {/* Border lines */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
          <lineBasicMaterial
            color="#87CEEB"
            opacity={0.5}
            transparent
          />
        </lineSegments>
      </group>
    </RigidBody>
  );
}
