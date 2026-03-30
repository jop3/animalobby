import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { LevelEntity } from '../../types/level.types';
import { EntityFactory } from '../level/EntityFactory';

interface SecretAreaProps {
  id: string;
  position: [number, number, number];
  triggerZone: {
    size: [number, number, number];
  };
  revealedEntities: LevelEntity[];
  secretMessage?: string;
}

export function SecretArea({
  id,
  position,
  triggerZone,
  revealedEntities,
  secretMessage = 'Secret Found!',
}: SecretAreaProps) {
  const triggerRef = useRef<Mesh>(null);
  const [isDiscovered, setIsDiscovered] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const foundSecrets = useGameStore((state) => state.foundSecrets);
  const discoverSecret = useGameStore((state) => state.discoverSecret);

  // Check if already discovered from previous session
  useEffect(() => {
    if (foundSecrets.includes(id)) {
      setIsDiscovered(true);
      setRevealProgress(1);
    }
  }, [id, foundSecrets]);

  useFrame((state, delta) => {
    if (!playerPosition || isDiscovered) return;

    // Check if player is inside trigger zone
    const dx = Math.abs(playerPosition[0] - position[0]);
    const dy = Math.abs(playerPosition[1] - position[1]);
    const dz = Math.abs(playerPosition[2] - position[2]);

    const halfSize = triggerZone.size.map((s) => s / 2);

    if (dx < halfSize[0] && dy < halfSize[1] && dz < halfSize[2]) {
      // Player is inside trigger zone - discover secret!
      setIsDiscovered(true);
      discoverSecret(id);
      setShowMessage(true);

      // Hide message after 3 seconds
      setTimeout(() => setShowMessage(false), 3000);
    }
  });

  // Animate reveal progress
  useFrame((state, delta) => {
    if (isDiscovered && revealProgress < 1) {
      setRevealProgress((prev) => Math.min(1, prev + delta * 2));
    }
  });

  return (
    <group position={position}>
      {/* Trigger zone visualization (only visible before discovery) */}
      {!isDiscovered && (
        <mesh ref={triggerRef}>
          <boxGeometry args={triggerZone.size} />
          <meshStandardMaterial
            color="#FFD700"
            transparent
            opacity={0.05}
            wireframe
          />
        </mesh>
      )}

      {/* Discovery effect particles */}
      {isDiscovered && revealProgress < 1 && (
        <group>
          {[...Array(20)].map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 2 + revealProgress * 3;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle * 2) * 2 + 1,
                  Math.sin(angle) * radius,
                ]}
                scale={[0.2, 0.2, 0.2]}
              >
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial
                  color="#FFD700"
                  emissive="#FFD700"
                  emissiveIntensity={2}
                  transparent
                  opacity={1 - revealProgress}
                />
              </mesh>
            );
          })}
          <pointLight
            color="#FFD700"
            intensity={10 * (1 - revealProgress)}
            distance={10}
          />
        </group>
      )}

      {/* Secret message floating text */}
      {showMessage && (
        <group position={[0, triggerZone.size[1] / 2 + 2, 0]}>
          {/* Background panel */}
          <mesh>
            <planeGeometry args={[6, 1.2]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Glow effect */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[6.4, 1.6]} />
            <meshBasicMaterial
              color="#FFD700"
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      )}

      {/* Revealed entities (fade in with progress) */}
      {isDiscovered && revealProgress > 0 && (
        <group>
          {revealedEntities.map((entity, index) => (
            <group
              key={entity.id || `revealed_${index}`}
              scale={[revealProgress, revealProgress, revealProgress]}
            >
              <EntityFactory
                entity={entity}
                index={index + 1000} // Offset to avoid key conflicts
              />
            </group>
          ))}
        </group>
      )}
    </group>
  );
}
