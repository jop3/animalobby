import { useRef, useState, useEffect, useMemo } from 'react';
import { Group, Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

interface ZeusLightningProps {
  position: [number, number, number];
  radius?: number;
  interval?: number; // Time between strikes in seconds
  warningDuration?: number; // How long the warning shows before strike
}

export function ZeusLightning({
  position,
  radius = 2,
  interval = 5,
  warningDuration = 1,
}: ZeusLightningProps) {
  const cloudRef = useRef<Group>(null);
  const warningRef = useRef<Mesh>(null);
  const [isWarning, setIsWarning] = useState(false);
  const [isStriking, setIsStriking] = useState(false);
  const [boltPoints, setBoltPoints] = useState<Vector3[]>([]);
  const timerRef = useRef(0);
  const strikeTimerRef = useRef(0);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const takeDamage = useGameStore((state) => state.die);

  // Generate zigzag lightning bolt points
  const generateBolt = () => {
    const points: Vector3[] = [];
    const segments = 15;
    const height = 20;

    let x = 0;
    let y = height;
    let z = 0;

    points.push(new Vector3(x, y, z));

    for (let i = 0; i < segments; i++) {
      y -= height / segments;

      // Random zigzag
      x += (Math.random() - 0.5) * 1.5;
      z = (Math.random() - 0.5) * 1.5;

      points.push(new Vector3(x, y, z));
    }

    // Ensure last point hits ground
    points.push(new Vector3(x, 0, z));

    return points;
  };

  useEffect(() => {
    timerRef.current = 0;
  }, []);

  useFrame((state, delta) => {
    // Cycle timer
    timerRef.current += delta;

    // Animate cloud bobbing
    if (cloudRef.current) {
      cloudRef.current.position.y = 12 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      cloudRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }

    // Start warning phase
    if (timerRef.current >= interval && !isWarning && !isStriking) {
      setIsWarning(true);
      strikeTimerRef.current = 0;
      timerRef.current = 0;
    }

    // Warning phase animations
    if (isWarning) {
      strikeTimerRef.current += delta;

      // Pulse warning circle
      if (warningRef.current) {
        const pulse = Math.sin(strikeTimerRef.current * 12) * 0.15 + 1;
        warningRef.current.scale.set(pulse, 1, pulse);
      }

      // Flash cloud
      if (cloudRef.current && Math.random() > 0.7) {
        (cloudRef.current.children[0] as any).material.emissiveIntensity =
          Math.random() * 0.8 + 0.2;
      }

      // Strike after warning duration
      if (strikeTimerRef.current >= warningDuration) {
        setIsWarning(false);
        setIsStriking(true);
        strikeTimerRef.current = 0;

        // Generate new bolt
        setBoltPoints(generateBolt());

        // Check if player is in strike zone
        if (playerPosition) {
          const strikePos = new Vector3(...position);
          const playerPos = new Vector3(
            playerPosition[0],
            playerPosition[1],
            playerPosition[2]
          );
          const distance = strikePos.distanceTo(playerPos);

          if (distance <= radius) {
            takeDamage();
          }
        }
      }
    }

    // Strike phase
    if (isStriking) {
      strikeTimerRef.current += delta;

      // End strike
      if (strikeTimerRef.current >= 0.4) {
        setIsStriking(false);
        strikeTimerRef.current = 0;
        timerRef.current = 0;
        setBoltPoints([]);
      }
    }
  });

  return (
    <group position={position}>
      {/* Storm cloud */}
      <group ref={cloudRef}>
        {/* Main cloud body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 1, 2]} />
          <meshStandardMaterial
            color="#2C3E50"
            roughness={0.9}
            emissive={isWarning ? '#FFEB3B' : isStriking ? '#FFFF00' : '#4A4A4A'}
            emissiveIntensity={isWarning ? 0.4 : isStriking ? 1 : 0.2}
          />
        </mesh>

        {/* Cloud puffs */}
        {[-0.8, 0, 0.8].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 0.3, 0]}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial
              color="#34495E"
              roughness={0.9}
              emissive={isWarning ? '#FFEB3B' : isStriking ? '#FFFF00' : '#5A5A5A'}
              emissiveIntensity={isWarning ? 0.3 : isStriking ? 0.8 : 0.1}
            />
          </mesh>
        ))}

        {/* Lightning glow from cloud */}
        {(isWarning || isStriking) && (
          <pointLight
            position={[0, -0.5, 0]}
            intensity={isStriking ? 5 : 2}
            distance={isStriking ? 25 : 12}
            color={isStriking ? '#FFFFFF' : '#FFEB3B'}
          />
        )}
      </group>

      {/* Warning circle on ground */}
      {isWarning && (
        <mesh
          ref={warningRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <ringGeometry args={[radius * 0.7, radius, 32]} />
          <meshBasicMaterial color="#FFEB3B" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Ground electricity when warning */}
      {isWarning && <GroundElectricity radius={radius} />}

      {/* Lightning bolt */}
      {isStriking && boltPoints.length > 0 && (
        <>
          <LightningBolt points={boltPoints} />

          {/* Ground impact flash */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[radius * 1.2, 16, 16]} />
            <meshBasicMaterial
              color="#FFFF00"
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Impact sparks */}
          <ImpactSparks />

          {/* Bright flash */}
          <pointLight
            position={[0, 5, 0]}
            intensity={15}
            distance={30}
            color="#FFFFFF"
          />

          {/* Ground impact light */}
          <pointLight
            position={[0, 0.5, 0]}
            intensity={10}
            distance={radius * 3}
            color="#FFFF00"
          />
        </>
      )}

      {/* Ambient cloud light */}
      <pointLight
        position={[0, 12, 0]}
        intensity={isWarning ? 1.5 : 0.5}
        distance={10}
        color="#7F8C8D"
      />
    </group>
  );
}

// Lightning bolt with zigzag pattern
function LightningBolt({ points }: { points: Vector3[] }) {
  const boltSegments = useMemo(() => {
    const segments: { start: Vector3; end: Vector3 }[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      segments.push({
        start: points[i],
        end: points[i + 1],
      });
    }

    return segments;
  }, [points]);

  return (
    <group>
      {/* Main bolt */}
      {boltSegments.map((segment, i) => {
        const midpoint = new Vector3()
          .addVectors(segment.start, segment.end)
          .multiplyScalar(0.5);
        const direction = new Vector3()
          .subVectors(segment.end, segment.start);
        const length = direction.length();

        // Calculate rotation to align with segment
        const axis = new Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(
          axis.normalize(),
          direction.normalize()
        );

        return (
          <group key={i}>
            {/* Core bolt */}
            <mesh position={midpoint} quaternion={quaternion}>
              <cylinderGeometry args={[0.15, 0.15, length, 6]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>

            {/* Glow */}
            <mesh position={midpoint} quaternion={quaternion}>
              <cylinderGeometry args={[0.3, 0.3, length, 6]} />
              <meshBasicMaterial
                color="#FFFF00"
                transparent
                opacity={0.5}
              />
            </mesh>

            {/* Outer glow */}
            <mesh position={midpoint} quaternion={quaternion}>
              <cylinderGeometry args={[0.5, 0.5, length, 6]} />
              <meshBasicMaterial
                color="#FFD700"
                transparent
                opacity={0.2}
              />
            </mesh>

            {/* Segment lights */}
            <pointLight
              position={midpoint}
              intensity={3}
              distance={4}
              color="#FFFF00"
            />
          </group>
        );
      })}

      {/* Branch bolts */}
      {boltSegments.slice(3, 8).map((segment, i) => (
        <BranchBolt key={`branch-${i}`} start={segment.start} />
      ))}
    </group>
  );
}

// Branching lightning bolts
function BranchBolt({ start }: { start: Vector3 }) {
  const branchPoints = useMemo(() => {
    const points: Vector3[] = [start.clone()];
    const segments = 4;

    let x = start.x;
    let y = start.y;
    let z = start.z;

    const direction = Math.random() > 0.5 ? 1 : -1;

    for (let i = 0; i < segments; i++) {
      x += direction * (Math.random() * 0.8 + 0.3);
      y -= Math.random() * 0.5 + 0.2;
      z += (Math.random() - 0.5) * 0.5;

      points.push(new Vector3(x, y, z));
    }

    return points;
  }, [start]);

  return (
    <group>
      {branchPoints.slice(0, -1).map((point, i) => {
        const nextPoint = branchPoints[i + 1];
        const midpoint = new Vector3()
          .addVectors(point, nextPoint)
          .multiplyScalar(0.5);
        const direction = new Vector3().subVectors(nextPoint, point);
        const length = direction.length();

        const axis = new Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(
          axis.normalize(),
          direction.normalize()
        );

        return (
          <mesh key={i} position={midpoint} quaternion={quaternion}>
            <cylinderGeometry args={[0.08, 0.08, length, 4]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.8 - i * 0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Ground electricity arcs during warning
function GroundElectricity({ radius }: { radius: number }) {
  const arcRefs = useRef<(Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    arcRefs.current.forEach((arc, i) => {
      if (!arc) return;

      const arcTime = time * 5 + i;
      const angle = (i / 6) * Math.PI * 2 + arcTime;

      arc.position.x = Math.cos(angle) * radius * 0.8;
      arc.position.z = Math.sin(angle) * radius * 0.8;

      const opacity = (Math.sin(arcTime * 3) * 0.5 + 0.5) * 0.6;
      (arc.material as any).opacity = opacity;
    });
  });

  return (
    <group position={[0, 0.1, 0]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} ref={(el) => (arcRefs.current[i] = el)}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 4]} />
          <meshBasicMaterial color="#FFEB3B" transparent />
        </mesh>
      ))}
    </group>
  );
}

// Impact sparks when lightning hits
function ImpactSparks() {
  const sparkRefs = useRef<(Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    sparkRefs.current.forEach((spark, i) => {
      if (!spark) return;

      const sparkTime = time * 8 + i * 0.3;
      const angle = (i / 12) * Math.PI * 2;
      const radius = (sparkTime % 1) * 3;

      spark.position.x = Math.cos(angle) * radius;
      spark.position.y = 0.2 + (sparkTime % 1) * 0.5;
      spark.position.z = Math.sin(angle) * radius;

      const life = 1 - (sparkTime % 1);
      (spark.material as any).opacity = life;
      spark.scale.setScalar(life * 0.3 + 0.1);
    });
  });

  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} ref={(el) => (sparkRefs.current[i] = el)}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshBasicMaterial color="#FFD700" transparent />
        </mesh>
      ))}
    </group>
  );
}

// THREE is needed for Quaternion
import * as THREE from 'three';
