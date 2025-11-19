import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

interface EndGoalProps {
  position: [number, number, number];
  modelType?: 'dog_head' | 'trophy' | 'portal';
}

export function EndGoal({ position, modelType = 'trophy' }: EndGoalProps) {
  const trophyRef = useRef<Mesh>(null);
  const baseRef = useRef<Mesh>(null);
  const portalRef = useRef<Mesh>(null);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const hasWon = useGameStore((state) => state.hasWon);
  const winGame = useGameStore((state) => state.winGame);

  useFrame((state) => {
    // Rotate trophy/portal for visual interest
    if (trophyRef.current) {
      trophyRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    if (portalRef.current) {
      portalRef.current.rotation.y = state.clock.elapsedTime * 2;
      portalRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }

    // Bob up and down
    if (baseRef.current) {
      baseRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }

    // Check if player has reached the goal
    if (playerPosition && !hasWon) {
      const dx = playerPosition[0] - position[0];
      const dy = playerPosition[1] - position[1];
      const dz = playerPosition[2] - position[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Trigger win if player is close enough
      if (distance < 2) {
        winGame();
      }
    }
  });

  return (
    <group position={position}>
      {/* Platform base */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.5, 4]} />
        <meshStandardMaterial color="#FFD700" flatShading emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>

      {/* Visual indicator based on type */}
      <group ref={baseRef}>
        {modelType === 'trophy' && (
          <mesh ref={trophyRef} position={[0, 1.5, 0]}>
            <group>
              {/* Trophy cup */}
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.4, 0.3, 0.8, 6]} />
                <meshStandardMaterial
                  color="#FFD700"
                  flatShading
                  emissive="#FFD700"
                  emissiveIntensity={0.5}
                />
              </mesh>
              {/* Trophy handles */}
              <mesh position={[-0.5, 0.5, 0]}>
                <boxGeometry args={[0.15, 0.5, 0.15]} />
                <meshStandardMaterial color="#FFD700" flatShading />
              </mesh>
              <mesh position={[0.5, 0.5, 0]}>
                <boxGeometry args={[0.15, 0.5, 0.15]} />
                <meshStandardMaterial color="#FFD700" flatShading />
              </mesh>
              {/* Trophy base */}
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.6, 0.3, 0.6]} />
                <meshStandardMaterial color="#FFA500" flatShading />
              </mesh>
            </group>
          </mesh>
        )}

        {modelType === 'portal' && (
          <mesh ref={portalRef} position={[0, 2, 0]}>
            <torusGeometry args={[1, 0.3, 8, 8]} />
            <meshStandardMaterial
              color="#00FFFF"
              flatShading
              emissive="#00FFFF"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        )}

        {modelType === 'dog_head' && (
          <mesh ref={trophyRef} position={[0, 1.5, 0]}>
            <group>
              {/* Dog head cube */}
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial
                  color="#D4A574"
                  flatShading
                  emissive="#FFA500"
                  emissiveIntensity={0.3}
                />
              </mesh>
              {/* Ears */}
              <mesh position={[-0.5, 0.8, 0]}>
                <boxGeometry args={[0.3, 0.5, 0.2]} />
                <meshStandardMaterial color="#D4A574" flatShading />
              </mesh>
              <mesh position={[0.5, 0.8, 0]}>
                <boxGeometry args={[0.3, 0.5, 0.2]} />
                <meshStandardMaterial color="#D4A574" flatShading />
              </mesh>
              {/* Snout */}
              <mesh position={[0, 0.3, 0.5]}>
                <boxGeometry args={[0.4, 0.3, 0.4]} />
                <meshStandardMaterial color="#C4945F" flatShading />
              </mesh>
            </group>
          </mesh>
        )}
      </group>

      {/* Glow ring on ground */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
