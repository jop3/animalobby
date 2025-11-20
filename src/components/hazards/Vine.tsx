import { useRef, useState, useEffect } from 'react';
import { Group, Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

interface VineProps {
  position: [number, number, number];
  height?: number;
  swingSpeed?: number; // Speed of the swing
  swingAngle?: number; // Maximum swing angle in radians
}

export function Vine({
  position,
  height = 6,
  swingSpeed = 1.2,
  swingAngle = 0.8,
}: VineProps) {
  const groupRef = useRef<Group>(null);
  const segmentRefs = useRef<(Mesh | null)[]>([]);
  const leaves1Ref = useRef<Group>(null);
  const leaves2Ref = useRef<Group>(null);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  const segments = 6; // Reduced from 12 for better performance
  const segmentHeight = height / segments;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Main pendulum swing
    const baseAngle = Math.sin(time * swingSpeed) * swingAngle;
    groupRef.current.rotation.z = baseAngle;

    // Animate individual segments with wave propagation
    segmentRefs.current.forEach((segment, i) => {
      if (!segment) return;

      // Each segment bends more than the previous one (whip effect)
      const delay = i * 0.1;
      const segmentAngle = Math.sin(time * swingSpeed * 1.5 + delay) * (swingAngle * 0.3);

      segment.rotation.z = segmentAngle;

      // Slight twisting motion
      segment.rotation.y = Math.sin(time * swingSpeed * 0.5 + i * 0.2) * 0.1;

      // Scale variation for organic feel (breathing)
      const breathe = 1 + Math.sin(time * 2 + i * 0.5) * 0.05;
      segment.scale.set(1, breathe, 1);
    });

    // Animate leaves
    if (leaves1Ref.current) {
      leaves1Ref.current.rotation.z = Math.sin(time * 3) * 0.3;
      leaves1Ref.current.rotation.y = time * 0.5;
    }
    if (leaves2Ref.current) {
      leaves2Ref.current.rotation.z = Math.sin(time * 3 + 1) * 0.3;
      leaves2Ref.current.rotation.y = time * 0.5 + Math.PI / 2;
    }

    // Check collision with player
    if (playerPosition && groupRef.current) {
      const vineWorldPos = groupRef.current.position;
      const playerPos = playerPosition;

      // Check each segment for collision
      for (let i = Math.floor(segments / 2); i < segments; i++) {
        const segmentWorldY = vineWorldPos.y - (i * segmentHeight);
        const segmentX = vineWorldPos.x + Math.sin(baseAngle + segmentRefs.current[i]?.rotation.z || 0) * (i * segmentHeight);
        const segmentZ = vineWorldPos.z;

        const dx = playerPos[0] - segmentX;
        const dy = playerPos[1] - segmentWorldY;
        const dz = playerPos[2] - segmentZ;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Hit detection on lower half of vine (dangerous part)
        if (distance < 0.8) {
          die();
          break;
        }
      }
    }
  });

  return (
    <group position={position}>
      {/* Main vine group that swings */}
      <group ref={groupRef}>
        {/* Attachment point */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.4]} />
          <meshStandardMaterial
            color="#2D5016"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Vine segments */}
        {Array.from({ length: segments }).map((_, i) => {
          const yPos = -(i * segmentHeight + segmentHeight / 2);
          const thickness = 0.15 - (i / segments) * 0.05; // Taper from top to bottom
          const color = i < segments / 2 ? '#3A6B2E' : '#2D5016'; // Darker at bottom

          return (
            <mesh
              key={i}
              ref={(el) => (segmentRefs.current[i] = el)}
              position={[0, yPos, 0]}
              castShadow
            >
              <cylinderGeometry args={[thickness, thickness * 0.9, segmentHeight, 8]} />
              <meshStandardMaterial
                color={color}
                roughness={0.8}
                metalness={0.1}
                emissive="#1a3010"
                emissiveIntensity={0.1}
              />
            </mesh>
          );
        })}

        {/* Leaves scattered along vine */}
        {Array.from({ length: 3 }).map((_, i) => {
          const yPos = -(i * (height / 6) + 0.5);
          const angle = (i * Math.PI * 2) / 6;

          return (
            <group key={`leaf-${i}`} position={[0, yPos, 0]}>
              {/* Leaf 1 */}
              <mesh
                ref={i === 2 ? leaves1Ref : null}
                position={[
                  Math.cos(angle) * 0.3,
                  0,
                  Math.sin(angle) * 0.3,
                ]}
                rotation={[0, angle, Math.PI / 6]}
              >
                <boxGeometry args={[0.4, 0.05, 0.8]} />
                <meshStandardMaterial
                  color="#4A7C2E"
                  roughness={0.7}
                  metalness={0.1}
                  emissive="#2D5016"
                  emissiveIntensity={0.2}
                  side={2} // DoubleSide
                />
              </mesh>

              {/* Leaf 2 */}
              <mesh
                ref={i === 4 ? leaves2Ref : null}
                position={[
                  Math.cos(angle + Math.PI) * 0.3,
                  0,
                  Math.sin(angle + Math.PI) * 0.3,
                ]}
                rotation={[0, angle + Math.PI, -Math.PI / 6]}
              >
                <boxGeometry args={[0.4, 0.05, 0.8]} />
                <meshStandardMaterial
                  color="#4A7C2E"
                  roughness={0.7}
                  metalness={0.1}
                  emissive="#2D5016"
                  emissiveIntensity={0.2}
                  side={2} // DoubleSide
                />
              </mesh>
            </group>
          );
        })}

        {/* Thorny vines at bottom (danger indicator) */}
        {Array.from({ length: 3 }).map((_, i) => (
          <mesh
            key={`thorn-${i}`}
            position={[
              Math.cos((i * Math.PI * 2) / 5) * 0.15,
              -height + 0.5 - i * 0.2,
              Math.sin((i * Math.PI * 2) / 5) * 0.15,
            ]}
            rotation={[0, 0, Math.PI / 4]}
          >
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshStandardMaterial
              color="#8B4513"
              emissive="#FF4444"
              emissiveIntensity={0.3}
              roughness={0.8}
            />
          </mesh>
        ))}

        {/* Glow at dangerous end */}
        <pointLight
          position={[0, -height + 1, 0]}
          intensity={0.8}
          distance={4}
          color="#4A7C2E"
        />
      </group>

      {/* Ground danger indicator */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial
          color="#4A7C2E"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Animated danger particles around swing area */}
      <VineParticles height={height} swingAngle={swingAngle} />
    </group>
  );
}

// Danger particles that follow the vine swing
function VineParticles({ height, swingAngle }: { height: number; swingAngle: number }) {
  const particlesRef = useRef<Group>(null);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.elapsedTime;
    particlesRef.current.rotation.z = Math.sin(time * 1.2) * swingAngle;
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 4 }).map((_, i) => (
        <LeafParticle
          key={i}
          yOffset={-height * 0.6 - (i / 8) * height * 0.4}
          delay={i * 0.3}
        />
      ))}
    </group>
  );
}

function LeafParticle({ yOffset, delay }: { yOffset: number; delay: number }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime + delay;

    // Floating animation
    meshRef.current.position.x = Math.sin(time * 2) * 0.5;
    meshRef.current.position.y = yOffset + Math.sin(time * 1.5) * 0.3;
    meshRef.current.position.z = Math.cos(time * 2) * 0.5;

    // Rotation
    meshRef.current.rotation.x = time * 2;
    meshRef.current.rotation.y = time * 1.5;

    // Fade in/out
    const opacity = (Math.sin(time * 1.5) * 0.5 + 0.5) * 0.4;
    (meshRef.current.material as any).opacity = opacity;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.15, 0.02, 0.25]} />
      <meshStandardMaterial
        color="#4A7C2E"
        transparent
        emissive="#2D5016"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}
