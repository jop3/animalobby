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
  | 'moving_platform'
  | 'end_goal';

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

// Union of all entity types
export type LevelEntity =
  | PlatformEntity
  | CoinEntity
  | CheckpointEntity
  | SpikeEntity
  | LavaEntity
  | RotatingHammerEntity
  | MovingPlatformEntity
  | EndGoalEntity;

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
