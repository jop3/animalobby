import { useEffect } from 'react';
import { LevelDefinition } from '../../types/level.types';
import { EntityFactory } from './EntityFactory';
import { useGameStore } from '../../store/useGameStore';

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
      {/* Background color */}
      <color attach="background" args={[level.theme.skyColor]} />

      {/* Optional custom lighting based on theme */}
      {level.theme.ambientColor && (
        <ambientLight intensity={0.6} color={level.theme.ambientColor} />
      )}

      {/* Render all entities */}
      {level.entities.map((entity, index) => (
        <EntityFactory key={entity.id || `entity_${index}`} entity={entity} index={index} />
      ))}

      {/* Death plane (large platform far below) */}
      <EntityFactory
        entity={{
          type: 'platform',
          position: [0, -20, 0],
          size: [500, 1, 500],
          color: '#34495E',
        }}
        index={-1}
      />
    </>
  );
}
