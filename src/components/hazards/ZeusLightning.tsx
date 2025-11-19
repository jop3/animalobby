import { useRef, useState, useEffect } from 'react';
import { Mesh, Vector3 } from 'three';
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
  const warningRef = useRef<Mesh>(null);
  const boltRef = useRef<Mesh>(null);
  const [isWarning, setIsWarning] = useState(false);
  const [isStriking, setIsStriking] = useState(false);
  const timerRef = useRef(0);
  const strikeTimerRef = useRef(0);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const takeDamage = useGameStore((state) => state.die);

  useEffect(() => {
    // Start the cycle
    timerRef.current = 0;
  }, []);

  useFrame((state, delta) => {
    // Cycle timer
    timerRef.current += delta;

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
        const pulse = Math.sin(strikeTimerRef.current * 10) * 0.1 + 0.9;
        warningRef.current.scale.setScalar(pulse);
      }

      // Strike after warning duration
      if (strikeTimerRef.current >= warningDuration) {
        setIsWarning(false);
        setIsStriking(true);
        strikeTimerRef.current = 0;

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
            // Player is hit!
            takeDamage();
          }
        }
      }
    }

    // Strike phase (quick visual)
    if (isStriking) {
      strikeTimerRef.current += delta;

      // Fade out bolt
      if (boltRef.current) {
        const opacity = Math.max(0, 1 - strikeTimerRef.current / 0.3);
        (boltRef.current.material as any).opacity = opacity;
      }

      // End strike
      if (strikeTimerRef.current >= 0.3) {
        setIsStriking(false);
        strikeTimerRef.current = 0;
        timerRef.current = 0;
      }
    }
  });

  return (
    <group position={position}>
      {/* Warning circle on ground */}
      {isWarning && (
        <mesh
          ref={warningRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
        >
          <ringGeometry args={[radius * 0.8, radius, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Lightning bolt */}
      {isStriking && (
        <mesh ref={boltRef} position={[0, 10, 0]}>
          <boxGeometry args={[0.3, 20, 0.3]} />
          <meshBasicMaterial color="#FFFF00" transparent />
        </mesh>
      )}

      {/* Cloud indicator (always visible) */}
      <mesh position={[0, 12, 0]}>
        <boxGeometry args={[1.5, 0.8, 1]} />
        <meshStandardMaterial
          color="#4A4A4A"
          flatShading
          emissive="#888888"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}
