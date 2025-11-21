import { LevelEntity } from '../../types/level.types';
import { Platform } from '../environment/Platform';
import { MovingPlatform } from '../environment/MovingPlatform';
import { GrindRail } from '../environment/GrindRail';
import { Coin } from '../collectibles/Coin';
import { Checkpoint } from '../collectibles/Checkpoint';
import { EndGoal } from '../collectibles/EndGoal';
import { Star } from '../collectibles/Star';
import { Spike } from '../hazards/Spike';
import { Lava } from '../hazards/Lava';
import { RotatingHammer } from '../hazards/RotatingHammer';
import { ZeusLightning } from '../hazards/ZeusLightning';
import { Vine } from '../hazards/Vine';
import { BouncePad } from '../hazards/BouncePad';
import { SpeedBoostZone } from '../hazards/SpeedBoostZone';
import { WindZone } from '../hazards/WindZone';
import { Pendulum } from '../hazards/Pendulum';
import { SpawnPortal } from '../entities/SpawnPortal';

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
          swingSpeed={entity.swingSpeed}
          swingAngle={entity.swingAngle}
        />
      );

    case 'moving_platform':
      return (
        <MovingPlatform
          key={key}
          position={entity.position}
          size={entity.size}
          color={entity.color}
          pattern={entity.pattern}
          speed={entity.speed}
          range={entity.range}
        />
      );

    case 'bounce_pad':
      return (
        <BouncePad
          key={key}
          position={entity.position}
          bounceForce={entity.bounceForce}
          size={entity.size}
        />
      );

    case 'speed_boost':
      return (
        <SpeedBoostZone
          key={key}
          position={entity.position}
          size={entity.size}
          speedMultiplier={entity.speedMultiplier}
          duration={entity.duration}
        />
      );

    case 'grind_rail':
      return (
        <GrindRail
          key={key}
          points={entity.points}
          speed={entity.speed}
          radius={entity.radius}
        />
      );

    case 'wind_zone':
      return (
        <WindZone
          key={key}
          position={entity.position}
          size={entity.size}
          force={entity.force}
          visualize={entity.visualize}
        />
      );

    case 'pendulum':
      return (
        <Pendulum
          key={key}
          position={entity.position}
          length={entity.length}
          swingAngle={entity.swingAngle}
          swingSpeed={entity.swingSpeed}
          hammerSize={entity.hammerSize}
        />
      );

    case 'star':
      return (
        <Star
          key={key}
          id={entity.id}
          position={entity.position}
          difficulty={entity.difficulty}
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

    case 'spawn_portal':
      return (
        <SpawnPortal
          key={key}
          position={entity.position}
        />
      );

    default:
      console.error('Unknown entity type:', entity);
      return null;
  }
}
