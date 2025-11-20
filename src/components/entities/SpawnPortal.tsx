import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpawnPortalProps {
  position: [number, number, number];
}

export function SpawnPortal({ position }: SpawnPortalProps) {
  const portalRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Animated portal effect
  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -state.clock.elapsedTime * 2;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = state.clock.elapsedTime * 1.5;
    }

    // Animate portal particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const angle = (i / 3) * 0.1 + state.clock.elapsedTime;
        const radius = 1 + Math.sin(state.clock.elapsedTime + i * 0.1) * 0.3;

        positions[i] = Math.cos(angle) * radius;
        positions[i + 1] = Math.sin(angle * 2) * 0.5;
        positions[i + 2] = Math.sin(angle) * radius;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Create swirling particles
  const particleCount = 50;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 1 + Math.random() * 0.5;

    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  return (
    <group position={position}>
      {/* Portal glow base */}
      <pointLight color="#00FFFF" intensity={3} distance={10} />

      {/* Rotating portal group */}
      <group ref={portalRef}>
        {/* Outer ring */}
        <mesh ref={outerRingRef}>
          <torusGeometry args={[2, 0.15, 8, 32]} />
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00FFFF"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Inner ring */}
        <mesh ref={innerRingRef}>
          <torusGeometry args={[1.5, 0.1, 6, 24]} />
          <meshStandardMaterial
            color="#0088FF"
            emissive="#0088FF"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Portal center  */}
        <mesh>
          <circleGeometry args={[1.3, 32]} />
          <meshStandardMaterial
            color="#001133"
            emissive="#0044FF"
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Swirling particles */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={particlePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color="#00FFFF"
            transparent
            opacity={0.8}
            sizeAttenuation
          />
        </points>

        {/* Vertical beams */}
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00FFFF"
            emissiveIntensity={1.5}
            transparent
            opacity={0.4}
          />
        </mesh>

        <mesh position={[0, -3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00FFFF"
            emissiveIntensity={1.5}
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

      {/* Base platform */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.3, 32]} />
        <meshStandardMaterial
          color="#2C3E50"
          roughness={0.8}
          metalness={0.3}
          emissive="#00FFFF"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Ground glow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 4, 32]} />
        <meshBasicMaterial
          color="#00FFFF"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
