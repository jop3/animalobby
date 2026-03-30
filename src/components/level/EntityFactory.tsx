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
import { SpawnPortal } from '../entities/SpawnPortal';
import { FireJet } from '../hazards/FireJet';
import { PendulumBlade } from '../hazards/PendulumBlade';
import { LaserBeam } from '../hazards/LaserBeam';
import { CrushingPiston } from '../hazards/CrushingPiston';
import { SpinningBlade } from '../hazards/SpinningBlade';
import { MovingWall } from '../hazards/MovingWall';
import { SwingingLog } from '../hazards/SwingingLog';
import { PowerUp } from '../environment/PowerUp';
import { AnimalPartPickup } from '../collectibles/AnimalPartPickup';
import { ClimbableWall } from '../environment/ClimbableWall';
import { LowObstacle } from '../environment/LowObstacle';
import { Switch } from '../hazards/Switch';
import { Door } from '../hazards/Door';
import { PressurePlate } from '../hazards/PressurePlate';
import { BossEncounter } from '../bosses/BossEncounter';
import { FallingIcicle } from '../hazards/FallingIcicle';
import { LaserGrid } from '../hazards/LaserGrid';
import { RisingLava } from '../hazards/RisingLava';
import { WindTunnel } from '../environment/WindTunnel';
import { CrumblingPlatform } from '../environment/CrumblingPlatform';
import { BouncePad } from '../environment/BouncePad';
import { GravityZone } from '../environment/GravityZone';
import { SecretArea } from '../environment/SecretArea';
import { FakeWall } from '../environment/FakeWall';

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
          shape={entity.shape}
          bouncy={entity.bouncy}
          disappearing={entity.disappearing}
          moving={entity.moving}
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
        <Platform
          key={key}
          position={entity.position}
          size={entity.size}
          color={entity.color}
          moving={{
            pattern: entity.pattern,
            speed: entity.speed,
            range: entity.range,
          }}
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

    case 'fire_jet':
      return (
        <FireJet
          key={key}
          position={entity.position}
          interval={entity.interval}
          duration={entity.duration}
          height={entity.height}
          direction={entity.direction}
        />
      );

    case 'pendulum_blade':
      return (
        <PendulumBlade
          key={key}
          position={entity.position}
          length={entity.length}
          speed={entity.speed}
          swingAngle={entity.swingAngle}
        />
      );

    case 'laser_beam':
      return (
        <LaserBeam
          key={key}
          position={entity.position}
          length={entity.length}
          orientation={entity.orientation}
          sweeping={entity.sweeping}
          speed={entity.speed}
        />
      );

    case 'crushing_piston':
      return (
        <CrushingPiston
          key={key}
          position={entity.position}
          height={entity.height}
          interval={entity.interval}
          crushDuration={entity.crushDuration}
        />
      );

    case 'spinning_blade':
      return (
        <SpinningBlade
          key={key}
          position={entity.position}
          size={entity.size}
          speed={entity.speed}
          moving={entity.moving}
        />
      );

    case 'moving_wall':
      return (
        <MovingWall
          key={key}
          position={entity.position}
          size={entity.size}
          pattern={entity.pattern}
          speed={entity.speed}
          range={entity.range}
        />
      );

    case 'swinging_log':
      return (
        <SwingingLog
          key={key}
          position={entity.position}
          length={entity.length}
          speed={entity.speed}
          swingAngle={entity.swingAngle}
          logSize={entity.logSize}
        />
      );

    case 'power_up':
      return (
        <PowerUp
          key={key}
          id={entity.id || key}
          position={entity.position}
          powerUpType={entity.powerUpType}
          duration={entity.duration}
        />
      );

    case 'animal_part':
      return (
        <AnimalPartPickup
          key={key}
          id={entity.id || key}
          position={entity.position}
          partId={entity.partId}
        />
      );

    case 'climbable_wall':
      return (
        <ClimbableWall
          key={key}
          position={entity.position}
          size={entity.size}
          color={entity.color}
          climbSpeed={entity.climbSpeed}
        />
      );

    case 'low_obstacle':
      return (
        <LowObstacle
          key={key}
          position={entity.position}
          size={entity.size}
          color={entity.color}
        />
      );

    case 'switch':
      return (
        <Switch
          key={key}
          position={entity.position}
          targetId={entity.targetId}
          switchType={entity.switchType}
          duration={entity.duration}
        />
      );

    case 'door':
      return (
        <Door
          key={key}
          id={entity.id}
          position={entity.position}
          size={entity.size}
          color={entity.color}
          startsOpen={entity.startsOpen}
        />
      );

    case 'pressure_plate':
      return (
        <PressurePlate
          key={key}
          position={entity.position}
          targetId={entity.targetId}
          size={entity.size}
          requiresWeight={entity.requiresWeight}
        />
      );

    case 'boss_encounter':
      return (
        <BossEncounter
          key={key}
          id={entity.id}
          position={entity.position}
          bossType={entity.bossType}
          arenaSize={entity.arenaSize}
        />
      );

    case 'falling_icicle':
      return (
        <FallingIcicle
          key={key}
          position={entity.position}
          triggerRadius={entity.triggerRadius}
          respawnTime={entity.respawnTime}
        />
      );

    case 'laser_grid':
      return (
        <LaserGrid
          key={key}
          position={entity.position}
          rows={entity.rows}
          cols={entity.cols}
          spacing={entity.spacing}
          pattern={entity.pattern}
          beatDuration={entity.beatDuration}
          laserColor={entity.laserColor}
          orientation={entity.orientation}
        />
      );

    case 'rising_lava':
      return (
        <RisingLava
          key={key}
          position={entity.position}
          size={entity.size}
          startY={0}
          endY={entity.riseHeight || 10}
          riseSpeed={entity.riseDuration ? entity.riseHeight! / entity.riseDuration : 2}
        />
      );

    case 'wind_tunnel':
      return (
        <WindTunnel
          key={key}
          position={entity.position}
          size={entity.size}
          direction={entity.force}
        />
      );

    case 'crumbling_platform':
      return (
        <CrumblingPlatform
          key={key}
          position={entity.position}
          size={entity.size}
          color={entity.color}
          crumbleDelay={entity.crumbleDelay}
          respawnTime={entity.respawnTime}
        />
      );

    case 'bounce_pad':
      return (
        <BouncePad
          key={key}
          position={entity.position}
          launchDirection={entity.launchDirection}
          launchPower={entity.launchPower}
          size={entity.size}
          color={entity.color}
        />
      );

    case 'gravity_zone':
      return (
        <GravityZone
          key={key}
          position={entity.position}
          size={entity.size}
          gravityMultiplier={entity.gravityMultiplier}
          color={entity.color}
        />
      );

    case 'secret_area':
      return (
        <SecretArea
          key={key}
          id={entity.id}
          position={entity.position}
          triggerZone={entity.triggerZone}
          revealedEntities={entity.revealedEntities}
          secretMessage={entity.secretMessage}
        />
      );

    case 'fake_wall':
      return (
        <FakeWall
          key={key}
          position={entity.position}
          size={entity.size}
          color={entity.color}
          revealRadius={entity.revealRadius}
          linkedSecretId={entity.linkedSecretId}
        />
      );

    default:
      console.error('Unknown entity type:', entity);
      return null;
  }
}
