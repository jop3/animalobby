import { useEffect } from 'react';
import { LevelDefinition } from '../../types/level.types';
import { EntityFactory } from './EntityFactory';
import { useGameStore } from '../../store/useGameStore';
import { AmbientParticles } from '../effects/AmbientParticles';
import { LevelBackground } from '../effects/LevelBackground';

interface LevelLoaderProps {
  level: LevelDefinition;
}

/**
 * LevelLoader - Loads and renders a level from JSON definition
 * This component:
 * 1. Sets the spawn point as the checkpoint
 * 2. Applies theme settings (sky color, etc.)
 * 3. Spawns all entities from the level definition
 */
export function LevelLoader({ level }: LevelLoaderProps) {
  const setCheckpoint = useGameStore((state) => state.setCheckpoint);

  // Set initial checkpoint to spawn point
  useEffect(() => {
    setCheckpoint(level.spawnPoint, `spawn_${level.id}`);
  }, [level, setCheckpoint]);

  return (
    <>
      {/* Theme-appropriate background */}
      <LevelBackground levelId={level.id} skyColor={level.theme.skyColor} />

      {/* Fog for atmosphere - different density based on difficulty */}
      <fog attach="fog" args={[level.theme.skyColor, 20, 100]} />

      {/* Optional custom lighting based on theme */}
      {level.theme.ambientColor && (
        <ambientLight intensity={0.6} color={level.theme.ambientColor} />
      )}

      {/* Directional light with theme-based color */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        color={level.theme.ambientColor || '#ffffff'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Ambient particles for atmosphere */}
      <AmbientParticles type="dust" count={300} area={[100, 40, 100]} />

      {/* Spawn portal at level start */}
      <EntityFactory
        entity={{
          type: 'spawn_portal',
          position: [level.spawnPoint[0], level.spawnPoint[1], level.spawnPoint[2]],
        }}
        index={-2}
      />

      {/* Render all entities */}
      {level.entities.map((entity, index) => (
        <EntityFactory key={entity.id || `entity_${index}`} entity={entity} index={index} />
      ))}

      {/* Death detection handled by Player.tsx at y < -10 */}
    </>
  );
}
