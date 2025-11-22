import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface FireJetProps {
  position: [number, number, number];
  interval?: number;
  duration?: number;
  height?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'forward' | 'back';
}

export function FireJet({
  position,
  interval = 3,
  duration = 1,
  height = 4,
  direction = 'up',
}: FireJetProps) {
  const [isActive, setIsActive] = useState(false);
  const timeRef = useRef(0);
  const meshRef = useRef<THREE.Mesh>(null);

  const isDead = useGameStore((state) => state.isDead);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const die = useGameStore((state) => state.die);

  useFrame((_, delta) => {
    if (isDead) return;

    timeRef.current += delta;
    const cycleTime = timeRef.current % interval;
    const shouldBeActive = cycleTime < duration;

    if (shouldBeActive !== isActive) {
      setIsActive(shouldBeActive);
    }

    // Check collision when active
    if (shouldBeActive && playerPosition) {
      const flameBox = new THREE.Box3();
      const directionVector = getDirectionVector();

      flameBox.setFromCenterAndSize(
        new THREE.Vector3(
          position[0] + directionVector[0] * height / 2,
          position[1] + directionVector[1] * height / 2,
          position[2] + directionVector[2] * height / 2
        ),
        new THREE.Vector3(
          Math.abs(directionVector[0]) > 0 ? height : 1,
          Math.abs(directionVector[1]) > 0 ? height : 1,
          Math.abs(directionVector[2]) > 0 ? height : 1
        )
      );

      const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(...playerPosition),
        new THREE.Vector3(1, 2, 1)
      );

      if (flameBox.intersectsBox(playerBox)) {
        die();
      }
    }

    // Animate flame
    if (meshRef.current && shouldBeActive) {
      const pulseScale = 1 + Math.sin(timeRef.current * 10) * 0.1;
      const directionVector = getDirectionVector();
      meshRef.current.scale.set(
        Math.abs(directionVector[0]) > 0 ? pulseScale : 0.8,
        Math.abs(directionVector[1]) > 0 ? pulseScale : 0.8,
        Math.abs(directionVector[2]) > 0 ? pulseScale : 0.8
      );
    }
  });

  const getDirectionVector = (): [number, number, number] => {
    switch (direction) {
      case 'up': return [0, 1, 0];
      case 'down': return [0, -1, 0];
      case 'left': return [-1, 0, 0];
      case 'right': return [1, 0, 0];
      case 'forward': return [0, 0, 1];
      case 'back': return [0, 0, -1];
      default: return [0, 1, 0];
    }
  };

  const getGeometry = () => {
    const dirVec = getDirectionVector();
    if (Math.abs(dirVec[1]) > 0) {
      // Vertical
      return <cylinderGeometry args={[0.4, 0.6, height, 8]} />;
    } else {
      // Horizontal
      return <boxGeometry args={[
        Math.abs(dirVec[0]) > 0 ? height : 0.8,
        0.8,
        Math.abs(dirVec[2]) > 0 ? height : 0.8
      ]} />;
    }
  };

  const getFlamePosition = (): [number, number, number] => {
    const dirVec = getDirectionVector();
    return [
      position[0] + dirVec[0] * height / 2,
      position[1] + dirVec[1] * height / 2,
      position[2] + dirVec[2] * height / 2,
    ];
  };

  return (
    <group position={position}>
      {/* Base emitter */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Warning light when about to activate */}
      {!isActive && (interval - (timeRef.current % interval)) < 0.5 && (
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color="#FF0000"
            emissive="#FF0000"
            emissiveIntensity={2}
          />
        </mesh>
      )}

      {/* Flame effect */}
      {isActive && (
        <mesh ref={meshRef} position={getFlamePosition()}>
          {getGeometry()}
          <meshStandardMaterial
            color="#FF4500"
            emissive="#FF6600"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Glow effect */}
      {isActive && (
        <pointLight
          position={getFlamePosition()}
          color="#FF4500"
          intensity={3}
          distance={height * 1.5}
        />
      )}
    </group>
  );
}
