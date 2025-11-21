import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh, CatmullRomCurve3, Vector3, TubeGeometry } from 'three';

interface GrindRailProps {
  points: [number, number, number][];
  speed?: number;
  radius?: number;
}

export function GrindRail({
  points,
  speed = 8,
  radius = 0.1,
}: GrindRailProps) {
  const railRef = useRef<Mesh>(null);
  const supportRefs = useRef<Mesh[]>([]);
  const glowRef = useRef<Mesh>(null);

  // Create curve from points
  const curve = new CatmullRomCurve3(
    points.map(p => new Vector3(p[0], p[1], p[2]))
  );

  // Create tube geometry for the rail
  const tubeGeometry = new TubeGeometry(curve, 64, radius, 8, false);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Pulsing glow effect
    if (glowRef.current) {
      const pulse = Math.sin(time * 3) * 0.3 + 0.7;
      (glowRef.current.material as any).emissiveIntensity = pulse;
    }

    // Subtle support animation
    supportRefs.current.forEach((support, i) => {
      if (!support) return;
      const offset = i * 0.3;
      const sway = Math.sin(time * 2 + offset) * 0.02;
      support.rotation.z = sway;
    });
  });

  // Generate support poles
  const supports: React.ReactNode[] = [];
  const numSupports = Math.floor(points.length / 2);
  for (let i = 0; i < numSupports; i++) {
    const t = (i + 1) / (numSupports + 1);
    const point = curve.getPoint(t);

    supports.push(
      <mesh
        key={i}
        ref={(el) => {
          if (el) supportRefs.current[i] = el;
        }}
        position={[point.x, point.y - point.y, point.z]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.1, point.y, 8]} />
        <meshStandardMaterial
          color="#666666"
          roughness={0.6}
          metalness={0.7}
        />
      </mesh>
    );
  }

  return (
    <RigidBody
      type="fixed"
      sensor
      position={[0, 0, 0]}
      userData={{
        grindRail: true,
        speed,
        curve: curve,
        points: points
      }}
    >
      <group>
        {/* Main rail */}
        <mesh
          ref={railRef}
          geometry={tubeGeometry}
          castShadow
        >
          <meshStandardMaterial
            color="#AAAAAA"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Glow tube */}
        <mesh
          ref={glowRef}
          geometry={new TubeGeometry(curve, 64, radius * 1.3, 8, false)}
        >
          <meshStandardMaterial
            color="#00FFAA"
            emissive="#00FFAA"
            emissiveIntensity={0.7}
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>

        {/* Support poles */}
        {supports}

        {/* Start indicator */}
        <mesh position={[points[0][0], points[0][1] + 0.5, points[0][2]]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshBasicMaterial
            color="#00FFAA"
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* End indicator */}
        <mesh position={[points[points.length - 1][0], points[points.length - 1][1] + 0.5, points[points.length - 1][2]]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshBasicMaterial
            color="#FF6B00"
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
