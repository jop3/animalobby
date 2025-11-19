import { LevelEntity } from '../../types/level.types';
import { Platform } from '../environment/Platform';
import { Coin } from '../collectibles/Coin';
import { Checkpoint } from '../collectibles/Checkpoint';
import { EndGoal } from '../collectibles/EndGoal';
import { Spike } from '../hazards/Spike';
import { Lava } from '../hazards/Lava';
import { RotatingHammer } from '../hazards/RotatingHammer';
import { ZeusLightning } from '../hazards/ZeusLightning';
import { Vine } from '../hazards/Vine';

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

    case 'zeus_lightning':
      return (
        <ZeusLightning
          key={key}
          position={entity.position}
          radius={entity.radius}
          interval={entity.interval}
          warningDuration={entity.warningDuration}
        />
      );

    case 'vine':
      return (
        <Vine
          key={key}
          position={entity.position}
          height={entity.height}
          attackInterval={entity.attackInterval}
          attackDuration={entity.attackDuration}
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
      return (
        <EndGoal
          key={key}
          position={entity.position}
          modelType={entity.modelType}
        />
      );

    default:
      console.error('Unknown entity type:', entity);
      return null;
  }
}
