import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../../store/useGameStore';

interface FakeWallProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  revealRadius?: number;
  linkedSecretId?: string;
}

export function FakeWall({
  position,
  size,
  color,
  revealRadius = 3,
  linkedSecretId,
}: FakeWallProps) {
  const meshRef = useRef<Mesh>(null);
  const [opacity, setOpacity] = useState(1);
  const [isRevealed, setIsRevealed] = useState(false);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const foundSecrets = useGameStore((state) => state.foundSecrets);

  // Check if linked secret is discovered
  const secretDiscovered = linkedSecretId
    ? foundSecrets.includes(linkedSecretId)
    : false;

  // Calculate center position for distance check
  const wallCenter = useMemo(
    () => new Vector3(position[0], position[1] + size[1] / 2, position[2]),
    [position, size]
  );

  useFrame((state, delta) => {
    if (!playerPosition) return;

    const playerVec = new Vector3(...playerPosition);
    const distance = playerVec.distanceTo(wallCenter);

    // Calculate opacity based on distance
    if (distance < revealRadius) {
      // Fade out as player gets closer
      const fadeProgress = 1 - distance / revealRadius;
      const targetOpacity = Math.max(0.1, 1 - fadeProgress * 0.9);
      setOpacity(targetOpacity);

      // Mark as revealed when very close
      if (distance < revealRadius * 0.3) {
        setIsRevealed(true);
      }
    } else {
      // Fade back in when player moves away (unless secret is discovered)
      if (!secretDiscovered) {
        setOpacity((prev) => Math.min(1, prev + delta * 2));
      }
    }

    // If secret is discovered, stay invisible
    if (secretDiscovered) {
      setOpacity(0.1);
    }
  });

  // Hide completely if revealed or secret discovered
  if (secretDiscovered && isRevealed) {
    return null;
  }

  return (
    <group position={position}>
      {/* Main wall mesh (visual only - no collision) */}
      <mesh
        ref={meshRef}
        position={[0, size[1] / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Subtle hint glow when player is nearby */}
      {opacity < 0.8 && (
        <mesh position={[0, size[1] / 2, 0]}>
          <boxGeometry args={[size[0] + 0.1, size[1] + 0.1, size[2] + 0.1]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={(1 - opacity) * 0.15}
            wireframe
          />
        </mesh>
      )}

      {/* Edge glow effect */}
      {opacity < 0.5 && (
        <pointLight
          position={[0, size[1] / 2, size[2] / 2 + 0.5]}
          color="#FFD700"
          intensity={(1 - opacity) * 2}
          distance={3}
        />
      )}
    </group>
  );
}
