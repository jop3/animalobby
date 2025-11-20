import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Group, Mesh } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface RotatingHammerProps {
  position: [number, number, number];
  rotationSpeed?: number;
  hammerLength?: number;
  radius?: number; // Radius of rotation circle
}

export function RotatingHammer({
  position,
  rotationSpeed = 1.5,
  hammerLength = 3,
  radius = 3,
}: RotatingHammerProps) {
  const groupRef = useRef<Group>(null);
  const hammerHeadRef = useRef<Mesh>(null);
  const armRef = useRef<Mesh>(null);
  const trailRefs = useRef<(Mesh | null)[]>([]);

  const die = useGameStore((state) => state.die);
  const quality = useGameStore((state) => state.quality);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const angle = time * rotationSpeed;

    // Rotate entire hammer group
    groupRef.current.rotation.z = angle;

    // Squash and stretch effect based on rotation speed
    if (hammerHeadRef.current) {
      // Calculate velocity for squash/stretch
      const velocity = Math.abs(Math.cos(angle)) * rotationSpeed;

      // Stretch in direction of motion, compress perpendicular
      const stretchX = 1 + velocity * 0.15;
      const squashY = 1 / stretchX; // Preserve volume

      hammerHeadRef.current.scale.set(stretchX, squashY, squashY);

      // Pulsing glow based on speed
      const glowIntensity = 0.3 + velocity * 0.4;
      (hammerHeadRef.current.material as any).emissiveIntensity = glowIntensity;
    }

    // Slight bend in arm for whip effect
    if (armRef.current) {
      const bend = Math.sin(angle * 2) * 0.05;
      armRef.current.rotation.z = bend;
    }

    // Motion trails
    trailRefs.current.forEach((trail, i) => {
      if (!trail) return;

      // Position trails behind the hammer
      const trailAngle = angle - (i + 1) * 0.15;
      const trailRadius = radius + hammerLength;

      trail.position.x = Math.cos(trailAngle) * trailRadius;
      trail.position.y = Math.sin(trailAngle) * trailRadius;

      // Fade out older trails
      const opacity = 0.6 - i * 0.15;
      (trail.material as any).opacity = Math.max(0, opacity);

      // Scale down older trails
      const scale = 1 - i * 0.2;
      trail.scale.setScalar(Math.max(0.3, scale));
    });
  });

  const handleCollision = () => {
    die();
  };

  return (
    <group position={position}>
      {/* Center pivot - larger and more visible */}
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.6, 12]} />
        <meshStandardMaterial
          color="#34495E"
          roughness={0.3}
          metalness={0.8}
          emissive="#5D6D7E"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Rotating hammer group */}
      <group ref={groupRef}>
        {/* Chain links for more realistic look */}
        {Array.from({ length: 5 }).map((_, i) => {
          const linkPos = (i / 5) * radius;
          return (
            <mesh key={`link-${i}`} position={[linkPos, 0, 0]} castShadow>
              <torusGeometry args={[0.12, 0.05, 8, 12]} />
              <meshStandardMaterial
                color="#7F8C8D"
                roughness={0.4}
                metalness={0.6}
              />
            </mesh>
          );
        })}

        {/* Arm */}
        <mesh
          ref={armRef}
          castShadow
          position={[radius / 2 + 0.3, 0, 0]}
        >
          <boxGeometry args={[hammerLength, 0.25, 0.25]} />
          <meshStandardMaterial
            color="#95A5A6"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>

        {/* Hammer head - with collision sensor */}
        <RigidBody
          type="kinematicPosition"
          sensor
          onIntersectionEnter={handleCollision}
          position={[radius + hammerLength - 0.4, 0, 0]}
          userData={{ hazard: 'hammer' }}
          colliders={false}
        >
          <CuboidCollider args={[0.4, 0.6, 0.6]} />
          <group>
            {/* Main hammer head */}
            <mesh ref={hammerHeadRef} castShadow>
              <boxGeometry args={[0.8, 1.2, 1.2]} />
              <meshStandardMaterial
                color="#E74C3C"
                roughness={0.7}
                metalness={0.3}
                emissive="#C0392B"
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Warning stripes */}
            <mesh castShadow position={[0, 0, 0.61]}>
              <boxGeometry args={[0.82, 0.3, 0.02]} />
              <meshStandardMaterial
                color="#F1C40F"
                emissive="#F39C12"
                emissiveIntensity={0.6}
              />
            </mesh>

            <mesh castShadow position={[0, 0, -0.61]}>
              <boxGeometry args={[0.82, 0.3, 0.02]} />
              <meshStandardMaterial
                color="#F1C40F"
                emissive="#F39C12"
                emissiveIntensity={0.6}
              />
            </mesh>

            {/* Metal caps on sides */}
            <mesh castShadow position={[0.45, 0, 0]}>
              <boxGeometry args={[0.1, 1.3, 1.3]} />
              <meshStandardMaterial
                color="#95A5A6"
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>

            <mesh castShadow position={[-0.45, 0, 0]}>
              <boxGeometry args={[0.1, 1.3, 1.3]} />
              <meshStandardMaterial
                color="#95A5A6"
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>

            {/* Danger light - disabled on low quality */}
            {quality !== 'low' && (
              <pointLight
                position={[0, 0, 0]}
                intensity={2}
                distance={8}
                color="#E74C3C"
              />
            )}

            {/* Impact sparks at edges */}
            <ImpactSparks />
          </group>
        </RigidBody>

        {/* Motion trails */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh
            key={`trail-${i}`}
            ref={(el) => (trailRefs.current[i] = el)}
          >
            <boxGeometry args={[0.6, 1, 1]} />
            <meshBasicMaterial
              color="#E74C3C"
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Danger zone indicator on ground */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius + hammerLength - 0.5, radius + hammerLength + 0.5, 64]} />
        <meshBasicMaterial
          color="#E74C3C"
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Rotation center glow - disabled on low quality */}
      {quality !== 'low' && (
        <pointLight
          position={[0, 0, 0]}
          intensity={1}
          distance={6}
          color="#5D6D7E"
        />
      )}
    </group>
  );
}

// Impact sparks that fly off the hammer
function ImpactSparks() {
  const sparkRefs = useRef<(Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    sparkRefs.current.forEach((spark, i) => {
      if (!spark) return;

      const sparkTime = time * 3 + i * 0.5;
      const angle = (i / 6) * Math.PI * 2 + sparkTime;

      // Sparks fly outward
      const radius = (Math.sin(sparkTime) * 0.5 + 0.5) * 0.8;
      spark.position.x = Math.cos(angle) * radius;
      spark.position.y = Math.sin(angle) * radius;

      // Fade and scale
      const life = (Math.sin(sparkTime) * 0.5 + 0.5);
      (spark.material as any).opacity = life * 0.8;
      spark.scale.setScalar(life * 0.5 + 0.2);
    });
  });

  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} ref={(el) => (sparkRefs.current[i] = el)}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial
            color="#FFC300"
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
