import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface LaserGridProps {
  position: [number, number, number];
  rows?: number;
  cols?: number;
  spacing?: number;
  pattern?: number[][];  // 2D array: each sub-array is active lasers at that beat
  beatDuration?: number;
  laserColor?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function LaserGrid({
  position,
  rows = 3,
  cols = 3,
  spacing = 2,
  pattern = [[0, 2, 4, 6, 8], [1, 3, 5, 7], [0, 2, 4, 6, 8]],  // Default alternating pattern
  beatDuration = 1,
  laserColor = '#FF0000',
  orientation = 'horizontal',
}: LaserGridProps) {
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatProgress, setBeatProgress] = useState(0);
  const timeRef = useRef(0);
  const laserRefs = useRef<Map<number, THREE.Mesh>>(new Map());

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  // Calculate total lasers and their positions
  const lasers = useMemo(() => {
    const laserList: { id: number; pos: [number, number, number]; row: number; col: number }[] = [];
    let id = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = orientation === 'horizontal'
          ? (col - (cols - 1) / 2) * spacing
          : 0;
        const y = (row - (rows - 1) / 2) * spacing;
        const z = orientation === 'horizontal'
          ? 0
          : (col - (cols - 1) / 2) * spacing;

        laserList.push({ id, pos: [x, y, z], row, col });
        id++;
      }
    }

    return laserList;
  }, [rows, cols, spacing, orientation]);

  // Get active laser IDs for current beat
  const activeLaserIds = useMemo(() => {
    if (pattern.length === 0) return new Set<number>();
    const currentPattern = pattern[currentBeat % pattern.length];
    return new Set(currentPattern);
  }, [pattern, currentBeat]);

  useFrame((_, delta) => {
    if (isDead) return;

    timeRef.current += delta;
    const newProgress = (timeRef.current % beatDuration) / beatDuration;
    setBeatProgress(newProgress);

    // Check for beat change
    const newBeat = Math.floor(timeRef.current / beatDuration);
    if (newBeat !== currentBeat) {
      setCurrentBeat(newBeat);
    }

    // Collision detection for active lasers
    if (playerPosition) {
      for (const laser of lasers) {
        if (!activeLaserIds.has(laser.id)) continue;

        const laserWorldPos = [
          position[0] + laser.pos[0],
          position[1] + laser.pos[1],
          position[2] + laser.pos[2],
        ];

        // Laser beam collision box
        const laserLength = 8;
        const laserRadius = 0.2;

        if (orientation === 'horizontal') {
          // Horizontal laser (extends in Z direction)
          const playerInX = Math.abs(playerPosition[0] - laserWorldPos[0]) < laserRadius + 0.5;
          const playerInY = Math.abs(playerPosition[1] - laserWorldPos[1]) < laserRadius + 1;
          const playerInZ = Math.abs(playerPosition[2] - laserWorldPos[2]) < laserLength / 2;

          if (playerInX && playerInY && playerInZ) {
            die();
            return;
          }
        } else {
          // Vertical laser (extends in X direction)
          const playerInX = Math.abs(playerPosition[0] - laserWorldPos[0]) < laserLength / 2;
          const playerInY = Math.abs(playerPosition[1] - laserWorldPos[1]) < laserRadius + 1;
          const playerInZ = Math.abs(playerPosition[2] - laserWorldPos[2]) < laserRadius + 0.5;

          if (playerInX && playerInY && playerInZ) {
            die();
            return;
          }
        }
      }
    }

    // Animate laser beams
    laserRefs.current.forEach((mesh, id) => {
      if (activeLaserIds.has(id)) {
        // Pulsing active laser
        const pulse = 1 + Math.sin(timeRef.current * 15) * 0.1;
        mesh.scale.set(pulse, 1, pulse);
      }
    });
  });

  // Warning indicator - time until next pattern change
  const warningIntensity = beatProgress > 0.7 ? (beatProgress - 0.7) / 0.3 : 0;

  return (
    <group position={position}>
      {/* Grid frame */}
      <mesh>
        <boxGeometry args={[
          cols * spacing + 1,
          rows * spacing + 1,
          orientation === 'horizontal' ? 0.2 : cols * spacing + 1,
        ]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Emitter nodes */}
      {lasers.map((laser) => {
        const isActive = activeLaserIds.has(laser.id);
        const willBeActive = pattern[(currentBeat + 1) % pattern.length]?.includes(laser.id);
        const isWarning = !isActive && willBeActive && warningIntensity > 0;

        return (
          <group key={laser.id} position={laser.pos}>
            {/* Emitter node */}
            <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial
                color={isActive ? laserColor : isWarning ? '#FFFF00' : '#333333'}
                emissive={isActive ? laserColor : isWarning ? '#FFFF00' : '#000000'}
                emissiveIntensity={isActive ? 1 : isWarning ? warningIntensity : 0}
              />
            </mesh>

            {/* Laser beam */}
            {isActive && (
              <mesh
                ref={(ref) => {
                  if (ref) laserRefs.current.set(laser.id, ref);
                }}
                rotation={orientation === 'horizontal' ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.08, 0.08, 8, 8]} />
                <meshStandardMaterial
                  color={laserColor}
                  emissive={laserColor}
                  emissiveIntensity={2}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            )}

            {/* Laser glow */}
            {isActive && (
              <pointLight
                color={laserColor}
                intensity={1}
                distance={3}
              />
            )}

            {/* Warning pulse */}
            {isWarning && (
              <mesh scale={[1 + warningIntensity * 0.5, 1 + warningIntensity * 0.5, 1 + warningIntensity * 0.5]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial
                  color="#FFFF00"
                  transparent
                  opacity={warningIntensity * 0.5}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Beat indicator */}
      <group position={[0, -rows * spacing / 2 - 1, 0]}>
        {pattern.map((_, i) => {
          const isCurrent = i === currentBeat % pattern.length;
          const x = (i - (pattern.length - 1) / 2) * 0.5;

          return (
            <mesh key={i} position={[x, 0, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial
                color={isCurrent ? '#00FF00' : '#444444'}
                emissive={isCurrent ? '#00FF00' : '#000000'}
                emissiveIntensity={isCurrent ? 1 : 0}
              />
            </mesh>
          );
        })}
      </group>

      {/* Progress bar */}
      <group position={[0, rows * spacing / 2 + 0.5, 0]}>
        <mesh position={[(-cols * spacing / 2) * (1 - beatProgress) / 2, 0, 0]}>
          <boxGeometry args={[cols * spacing * beatProgress, 0.1, 0.1]} />
          <meshBasicMaterial
            color={warningIntensity > 0 ? '#FFFF00' : '#00FF00'}
          />
        </mesh>
      </group>
    </group>
  );
}
