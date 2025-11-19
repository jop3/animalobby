import { LevelEntity } from '../../types/level.types';
import { Platform } from '../environment/Platform';
import { Coin } from '../collectibles/Coin';
import { Checkpoint } from '../collectibles/Checkpoint';
import { Spike } from '../hazards/Spike';
import { Lava } from '../hazards/Lava';
import { RotatingHammer } from '../hazards/RotatingHammer';

/**
 * EntityFactory - Maps JSON entity definitions to React components
 * This is the core of the level loading system
 */

interface EntityFactoryProps {
  entity: LevelEntity;
  index: number;
}

export function EntityFactory({ entity, index }: EntityFactoryProps) {
  const key = entity.id || `${entity.type}_${index}`;

  switch (entity.type) {
    case 'platform':
      return (
        <Platform
          key={key}
          position={entity.position}
          size={entity.size}
          color={entity.color}
        />
      );

    case 'coin':
      return (
        <Coin
          key={key}
          id={entity.id || key}
          position={entity.position}
          type={entity.coinType}
        />
      );

    case 'checkpoint':
      return (
        <Checkpoint
          key={key}
          id={entity.id}
          position={entity.position}
        />
      );

    case 'spike':
      return (
        <Spike
          key={key}
          position={entity.position}
          size={entity.size}
        />
      );

    case 'lava':
      return (
        <Lava
          key={key}
          position={entity.position}
          size={entity.size}
        />
      );

    case 'rotating_hammer':
      return (
        <RotatingHammer
          key={key}
          position={entity.position}
          rotationSpeed={entity.rotationSpeed}
          hammerLength={entity.hammerLength}
        />
      );

    case 'moving_platform':
      // TODO: Implement MovingPlatform component
      console.warn('Moving platform not yet implemented');
      return (
        <Platform
          key={key}
          position={entity.position}
          size={entity.size}
          color={entity.color}
        />
      );

    case 'end_goal':
      // TODO: Implement EndGoal component
      console.warn('End goal not yet implemented');
      return (
        <Platform
          key={key}
          position={entity.position}
          size={[4, 0.5, 4]}
          color="#FFD700"
        />
      );

    default:
      console.error('Unknown entity type:', entity);
      return null;
  }
}
