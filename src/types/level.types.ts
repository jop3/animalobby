// ============================================================================
// LEVEL DEFINITION SCHEMA
// ============================================================================
// This file defines the JSON structure for creating levels in Animal Obby.
// Levels can be created by LLMs or humans by following this schema.

export interface LevelTheme {
  skyColor: string; // Hex color for background
  ambientColor?: string; // Ambient light color
  fogColor?: string; // Optional fog
  fogDensity?: number; // Fog density (0-1)
}

export interface LevelPhysics {
  gravity?: number; // Custom gravity (-20 default)
  windForce?: [number, number, number]; // Wind direction/strength
  friction?: number; // Global friction multiplier
}

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type EntityType =
  | 'platform'
  | 'coin'
  | 'checkpoint'
  | 'spike'
  | 'lava'
  | 'rotating_hammer'
  | 'zeus_lightning'
  | 'vine'
  | 'moving_platform'
  | 'end_goal'
  | 'spawn_portal'
  | 'fire_jet'
  | 'pendulum_blade'
  | 'laser_beam'
  | 'crushing_piston'
  | 'spinning_blade'
  | 'moving_wall'
  | 'cannon_turret'
  | 'falling_icicle'
  | 'wind_tunnel'
  | 'rising_lava'
  | 'dart_trap'
  | 'swinging_log'
  | 'power_up'
  | 'switch'
  | 'door'
  | 'pressure_plate'
  | 'climbable_wall'
  | 'low_obstacle'
  | 'boss_encounter'
  | 'animal_part';

// Base entity (all entities extend this)
export interface BaseEntity {
  type: EntityType;
  id?: string; // Optional unique identifier
  position: [number, number, number];
}

// Platform
export interface PlatformEntity extends BaseEntity {
  type: 'platform';
  size: [number, number, number]; // [width, height, depth]
  color: string; // Hex color
  shape?: 'box' | 'cylinder' | 'sphere'; // Platform shape (default 'box')
  bouncy?: boolean; // Makes platform bouncy (default false)
  disappearing?: {
    interval: number; // Time in seconds for disappear/reappear cycle
    visibleTime: number; // How long platform is visible
  };
  moving?: {
    pattern: 'linear' | 'circular' | 'pendulum';
    speed: number;
    range: [number, number, number]; // Movement range/radius
  };
}

// Coin
export interface CoinEntity extends BaseEntity {
  type: 'coin';
  coinType: 'speed' | 'gravity';
}

// Checkpoint
export interface CheckpointEntity extends BaseEntity {
  type: 'checkpoint';
  id: string; // Required for checkpoints
}

// Spike
export interface SpikeEntity extends BaseEntity {
  type: 'spike';
  size?: number; // Scale multiplier (default 1)
}

// Lava
export interface LavaEntity extends BaseEntity {
  type: 'lava';
  size?: [number, number, number]; // [width, height, depth]
}

// Rotating Hammer
export interface RotatingHammerEntity extends BaseEntity {
  type: 'rotating_hammer';
  rotationSpeed?: number; // Rotation speed (default 1)
  hammerLength?: number; // Arm length (default 3)
}

// Zeus Lightning
export interface ZeusLightningEntity extends BaseEntity {
  type: 'zeus_lightning';
  radius?: number; // Strike radius (default 2)
  interval?: number; // Seconds between strikes (default 5)
  warningDuration?: number; // Warning time (default 1)
}

// Vine
export interface VineEntity extends BaseEntity {
  type: 'vine';
  height?: number; // Vine height (default 6)
  swingSpeed?: number; // Speed of the swing (default 1.2)
  swingAngle?: number; // Maximum swing angle in radians (default 0.8)
}

// Moving Platform
export interface MovingPlatformEntity extends BaseEntity {
  type: 'moving_platform';
  size: [number, number, number];
  color: string;
  pattern: 'linear' | 'circular';
  speed: number;
  range: [number, number, number];
}

// End Goal
export interface EndGoalEntity extends BaseEntity {
  type: 'end_goal';
  modelType?: 'dog_head' | 'trophy' | 'portal';
}

// Spawn Portal
export interface SpawnPortalEntity extends BaseEntity {
  type: 'spawn_portal';
}

// Fire Jet - Shoots flames periodically
export interface FireJetEntity extends BaseEntity {
  type: 'fire_jet';
  interval?: number; // Seconds between bursts (default 3)
  duration?: number; // How long fire lasts (default 1)
  height?: number; // Height of flame (default 4)
  direction?: 'up' | 'down' | 'left' | 'right' | 'forward' | 'back'; // Direction of flame
}

// Pendulum Blade - Giant swinging blade
export interface PendulumBladeEntity extends BaseEntity {
  type: 'pendulum_blade';
  length?: number; // Chain/arm length (default 4)
  speed?: number; // Swing speed (default 1)
  swingAngle?: number; // Maximum swing angle in radians (default Math.PI / 3)
}

// Laser Beam - Sweeping or static laser
export interface LaserBeamEntity extends BaseEntity {
  type: 'laser_beam';
  length?: number; // Laser length (default 10)
  orientation?: 'horizontal' | 'vertical'; // Laser orientation
  sweeping?: boolean; // Whether laser rotates (default false)
  speed?: number; // Rotation speed if sweeping (default 1)
}

// Crushing Piston - Smashes down from above
export interface CrushingPistonEntity extends BaseEntity {
  type: 'crushing_piston';
  height?: number; // Distance piston travels (default 5)
  interval?: number; // Seconds between crushes (default 4)
  crushDuration?: number; // How long crush takes (default 1.5)
}

// Spinning Blade - Circular saw that rotates
export interface SpinningBladeEntity extends BaseEntity {
  type: 'spinning_blade';
  size?: number; // Blade radius (default 1.5)
  speed?: number; // Rotation speed (default 2)
  moving?: {
    pattern: 'linear' | 'circular';
    speed: number;
    range: [number, number, number];
  };
}

// Moving Wall - Wall that slides to block paths
export interface MovingWallEntity extends BaseEntity {
  type: 'moving_wall';
  size: [number, number, number]; // Wall dimensions
  pattern: 'linear'; // Movement pattern
  speed: number;
  range: [number, number, number]; // Movement range
}

// Cannon Turret - Fires projectiles
export interface CannonTurretEntity extends BaseEntity {
  type: 'cannon_turret';
  interval?: number; // Seconds between shots (default 3)
  projectileSpeed?: number; // How fast projectiles fly (default 10)
  direction?: [number, number, number]; // Firing direction
}

// Falling Icicle - Falls when player gets close
export interface FallingIcicleEntity extends BaseEntity {
  type: 'falling_icicle';
  triggerRadius?: number; // How close player must be (default 3)
  fallSpeed?: number; // How fast it falls (default 8)
  respawnTime?: number; // Seconds to respawn (default 5)
}

// Wind Tunnel - Pushes player
export interface WindTunnelEntity extends BaseEntity {
  type: 'wind_tunnel';
  size: [number, number, number]; // Zone dimensions
  force: [number, number, number]; // Wind force vector
}

// Rising Lava - Lava that rises and falls
export interface RisingLavaEntity extends BaseEntity {
  type: 'rising_lava';
  size: [number, number, number];
  riseHeight?: number; // How high it rises (default 5)
  interval?: number; // Cycle time (default 8)
  riseDuration?: number; // How long rise takes (default 3)
}

// Dart Trap - Shoots darts from walls
export interface DartTrapEntity extends BaseEntity {
  type: 'dart_trap';
  interval?: number; // Seconds between shots (default 2)
  direction?: [number, number, number]; // Dart direction
  dartSpeed?: number; // How fast darts fly (default 15)
}

// Swinging Log - Like a wrecking ball
export interface SwingingLogEntity extends BaseEntity {
  type: 'swinging_log';
  length?: number; // Chain length (default 5)
  speed?: number; // Swing speed (default 1.2)
  swingAngle?: number; // Maximum swing angle (default Math.PI / 2)
  logSize?: number; // Log radius (default 0.8)
}

// Power-up - Temporary buff for player
export interface PowerUpEntity extends BaseEntity {
  type: 'power_up';
  powerUpType: 'speed_boost' | 'shield' | 'double_jump' | 'invincibility' | 'magnet';
  duration?: number; // Duration in seconds (default 10)
}

// Animal Part - Collectible to unlock parts in Animal Lab
export interface AnimalPartEntity extends BaseEntity {
  type: 'animal_part';
  partId: string; // ID of the part from animalParts.ts (e.g., 'bunny_legs', 'lion_head')
}

// Switch - Activates doors or platforms
export interface SwitchEntity extends BaseEntity {
  type: 'switch';
  targetId: string; // ID of door/platform to control
  switchType?: 'button' | 'lever' | 'timed'; // Switch style (default 'button')
  duration?: number; // For timed switches (default 5 seconds)
}

// Door - Blocks path until opened
export interface DoorEntity extends BaseEntity {
  type: 'door';
  id: string; // Required to be targeted by switches
  size: [number, number, number]; // Door dimensions
  color?: string; // Door color (default '#8B4513')
  startsOpen?: boolean; // Whether door starts open (default false)
}

// Pressure Plate - Activates when stepped on
export interface PressurePlateEntity extends BaseEntity {
  type: 'pressure_plate';
  targetId: string; // ID of door/platform to control
  size?: [number, number, number]; // Plate dimensions
  requiresWeight?: boolean; // Stay pressed only while player is on it
}

// Climbable Wall - Wall player can climb
export interface ClimbableWallEntity extends BaseEntity {
  type: 'climbable_wall';
  size: [number, number, number]; // Wall dimensions
  color?: string; // Wall color (default '#654321')
  climbSpeed?: number; // How fast player climbs (default 5)
}

// Low Obstacle - Obstacle player must slide under
export interface LowObstacleEntity extends BaseEntity {
  type: 'low_obstacle';
  size: [number, number, number]; // Obstacle dimensions
  color?: string; // Color (default '#DC143C')
}

// Boss Encounter - Epic boss fight
export interface BossEncounterEntity extends BaseEntity {
  type: 'boss_encounter';
  id: string; // Required for boss tracking
  bossType: 'dragon' | 'golem' | 'wizard' | 'kraken'; // Boss variant
  arenaSize?: [number, number, number]; // Arena dimensions (default [30, 20, 30])
}

// Union of all entity types
export type LevelEntity =
  | PlatformEntity
  | CoinEntity
  | CheckpointEntity
  | SpikeEntity
  | LavaEntity
  | RotatingHammerEntity
  | ZeusLightningEntity
  | VineEntity
  | MovingPlatformEntity
  | EndGoalEntity
  | SpawnPortalEntity
  | FireJetEntity
  | PendulumBladeEntity
  | LaserBeamEntity
  | CrushingPistonEntity
  | SpinningBladeEntity
  | MovingWallEntity
  | CannonTurretEntity
  | FallingIcicleEntity
  | WindTunnelEntity
  | RisingLavaEntity
  | DartTrapEntity
  | SwingingLogEntity
  | PowerUpEntity
  | AnimalPartEntity
  | SwitchEntity
  | DoorEntity
  | PressurePlateEntity
  | ClimbableWallEntity
  | LowObstacleEntity
  | BossEncounterEntity;

// ============================================================================
// LEVEL DEFINITION
// ============================================================================

export interface LevelDefinition {
  // Metadata
  id: string; // Unique level ID (e.g., "green_fields")
  name: string; // Display name (e.g., "Green Fields")
  description?: string; // Optional description
  difficulty: 1 | 2 | 3 | 4 | 5; // Difficulty rating

  // Visual theme
  theme: LevelTheme;

  // Physics (optional overrides)
  physics?: LevelPhysics;

  // Spawn point
  spawnPoint: [number, number, number];

  // All entities in the level
  entities: LevelEntity[];

  // Optional: Biome-specific effects
  effects?: {
    particles?: string[]; // Particle effect names
    sounds?: string[]; // Ambient sound names
  };
}

// ============================================================================
// EXAMPLE LEVEL (for reference)
// ============================================================================

export const EXAMPLE_LEVEL: LevelDefinition = {
  id: 'example_level',
  name: 'Example Level',
  description: 'A simple example showing the level format',
  difficulty: 1,

  theme: {
    skyColor: '#87CEEB',
    ambientColor: '#B3D9FF',
  },

  spawnPoint: [0, 2, 0],

  entities: [
    // Starting platform
    {
      type: 'platform',
      position: [0, 0, 0],
      size: [10, 0.5, 10],
      color: '#7FBF7F',
    },

    // Checkpoint
    {
      type: 'checkpoint',
      id: 'checkpoint_1',
      position: [0, 1, 0],
    },

    // Some coins
    {
      type: 'coin',
      id: 'coin_1',
      position: [3, 1.5, 0],
      coinType: 'speed',
    },
    {
      type: 'coin',
      id: 'coin_2',
      position: [-3, 1.5, 0],
      coinType: 'gravity',
    },

    // Platform with spike
    {
      type: 'platform',
      position: [12, 1, 0],
      size: [6, 0.5, 4],
      color: '#D4A574',
    },
    {
      type: 'spike',
      position: [12, 1.5, 0],
      size: 0.8,
    },

    // Lava pit
    {
      type: 'lava',
      position: [20, 1, 0],
      size: [6, 0.3, 8],
    },

    // End goal
    {
      type: 'end_goal',
      position: [30, 3, 0],
    },
  ],
};
