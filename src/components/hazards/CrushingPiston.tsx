import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface CrushingPistonProps {
  position: [number, number, number];
  height?: number;
  interval?: number;
  crushDuration?: number;
}

export function CrushingPiston({
  position,
  height = 5,
  interval = 4,
  crushDuration = 1.5,
}: CrushingPistonProps) {
  const pistonRef = useRef<THREE.Mesh>(null);
  const [pistonOffset, setPistonOffset] = useState(0);
  const timeRef = useRef(0);

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  useFrame((_, delta) => {
    if (isDead) return;

    timeRef.current += delta;
    const cycleTime = timeRef.current % interval;

    // Calculate piston position
    let offset = 0;
    if (cycleTime < crushDuration) {
      // Crushing down
      const progress = cycleTime / crushDuration;
      offset = -height * Math.pow(progress, 2); // Accelerating down
    } else if (cycleTime < crushDuration + 0.5) {
      // Rising back up
      const progress = (cycleTime - crushDuration) / 0.5;
      offset = -height + height * progress;
    }

    setPistonOffset(offset);

    // Check collision
    if (pistonRef.current && playerPosition) {
      const pistonWorldPos = new THREE.Vector3();
      pistonRef.current.getWorldPosition(pistonWorldPos);

      const pistonBox = new THREE.Box3().setFromCenterAndSize(
        pistonWorldPos,
        new THREE.Vector3(2, 1, 2)
      );

      const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(...playerPosition),
        new THREE.Vector3(1, 2, 1)
      );

      if (pistonBox.intersectsBox(playerBox)) {
        die();
      }
    }
  });

  const isWarning = (timeRef.current % interval) > (interval - 0.8) && (timeRef.current % interval) < interval;

  return (
    <group position={position}>
      {/* Support structure */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.4, height, 0.4]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Top mounting */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[2.5, 0.5, 2.5]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Moving piston */}
      <mesh ref={pistonRef} position={[0, pistonOffset, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial
          color={isWarning ? "#FF6600" : "#4a4a4a"}
          emissive={isWarning ? "#FF0000" : "#000000"}
          emissiveIntensity={isWarning ? 0.5 : 0}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Piston spikes */}
      <group position={[0, pistonOffset - 0.5, 0]}>
        {[-0.7, 0, 0.7].map((x, i) =>
          [-0.7, 0, 0.7].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, 0, z]}>
              <coneGeometry args={[0.15, 0.6, 4]} />
              <meshStandardMaterial
                color="#808080"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Warning lights */}
      {isWarning && (
        <>
          <pointLight
            position={[0, pistonOffset, 0]}
            color="#FF0000"
            intensity={2}
            distance={5}
          />
          <mesh position={[-1, pistonOffset, 1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={3}
            />
          </mesh>
          <mesh position={[1, pistonOffset, 1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={3}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
