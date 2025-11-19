import { useRef, useState, useEffect } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

interface VineProps {
  position: [number, number, number];
  height?: number;
  attackInterval?: number; // Seconds between attacks
  attackDuration?: number; // How long the attack lasts
}

export function Vine({
  position,
  height = 4,
  attackInterval = 3,
  attackDuration = 0.8,
}: VineProps) {
  const vineRef = useRef<Mesh>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const timerRef = useRef(0);
  const attackTimerRef = useRef(0);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  useEffect(() => {
    timerRef.current = 0;
  }, []);

  useFrame((state, delta) => {
    if (!vineRef.current) return;

    // Cycle timer
    timerRef.current += delta;

    // Start attack phase
    if (timerRef.current >= attackInterval && !isAttacking) {
      setIsAttacking(true);
      attackTimerRef.current = 0;
      timerRef.current = 0;
    }

    // Attack phase
    if (isAttacking) {
      attackTimerRef.current += delta;

      // Growing animation (0 to 1 over first half of attack)
      const growthProgress = Math.min(attackTimerRef.current / (attackDuration * 0.5), 1);
      const scale = growthProgress;

      // Apply scale to vine
      vineRef.current.scale.set(1, scale, 1);

      // Check collision with player during growth
      if (playerPosition && scale > 0.3) {
        const vinePos = position;
        const playerPos = playerPosition;

        // Simple distance check
        const dx = playerPos[0] - vinePos[0];
        const dz = playerPos[2] - vinePos[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Check if player is within vine radius and at appropriate height
        if (
          distance < 0.8 &&
          playerPos[1] >= vinePos[1] &&
          playerPos[1] <= vinePos[1] + height * scale
        ) {
          // Hit the player (causes death/respawn)
          die();
          setIsAttacking(false); // Reset attack
        }
      }

      // Shrink back down after attack duration
      if (attackTimerRef.current >= attackDuration) {
        const shrinkProgress =
          (attackTimerRef.current - attackDuration) / (attackDuration * 0.3);
        const shrinkScale = Math.max(0, 1 - shrinkProgress);
        vineRef.current.scale.set(1, shrinkScale, 1);

        if (shrinkProgress >= 1) {
          setIsAttacking(false);
          attackTimerRef.current = 0;
          timerRef.current = 0;
        }
      }
    } else {
      // Idle state - keep at 0 scale
      vineRef.current.scale.set(1, 0, 1);
    }
  });

  return (
    <group position={position}>
      {/* Visual vine */}
      <mesh ref={vineRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.4, height, 0.4]} />
        <meshStandardMaterial color="#2D5016" flatShading />
      </mesh>

      {/* Ground indicator (always visible) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="#4A7C2E" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
