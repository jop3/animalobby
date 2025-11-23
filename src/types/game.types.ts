import { Vector3 } from 'three';

// Animal Part Types
export type PartType = 'head' | 'body' | 'legs';

export interface StatModifier {
  speed?: number;
  jumpForce?: number;
  defense?: number;
}

export interface AnimalPart {
  id: string;
  name: string;
  type: PartType;
  statModifier: StatModifier;
  ability?: AbilityType;
  unlocked: boolean;
  description: string;
  color: string; // Primary color for voxel model
}

export type AbilityType =
  | 'double_jump'
  | 'glide'
  | 'dash'
  | 'shield'
  | 'fly';

// Power-up Types
export type PowerUpType = 'speed_boost' | 'shield' | 'double_jump' | 'invincibility' | 'magnet';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: [number, number, number];
  collected: boolean;
  duration?: number; // Duration in milliseconds
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number; // Timestamp when power-up expires
}

// Player State
export interface PlayerStats {
  baseSpeed: number;
  baseJumpForce: number;
  currentSpeed: number;
  currentJumpForce: number;
  defense: number;
  hasDoubleJump: boolean;
  canFly: boolean;
  canWallClimb: boolean;
  canSlide: boolean;
}

export interface Loadout {
  head: string | null;
  body: string | null;
  legs: string | null;
}

// Coin Types
export type CoinType = 'speed' | 'gravity';

export interface Coin {
  id: string;
  type: CoinType;
  position: [number, number, number];
  collected: boolean;
}

// Checkpoint
export interface Checkpoint {
  id: string;
  position: [number, number, number];
  activated: boolean;
  biomeId: string;
}

// Biome Data
export interface BiomeData {
  id: string;
  name: string;
  difficulty: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    sky: string;
  };
  physics?: {
    gravity?: number;
    friction?: number;
    windForce?: [number, number, number];
  };
  hazards: HazardType[];
  platforms: PlatformData[];
  coins: Coin[];
  checkpoints: Checkpoint[];
}

export type HazardType =
  | 'spike'
  | 'lava'
  | 'rotating_hammer'
  | 'zeus_lightning'
  | 'vine'
  | 'falling_rock';

export interface PlatformData {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  type: 'static' | 'moving' | 'rotating' | 'bouncy' | 'hologram';
  moveSpeed?: number;
  moveRange?: [number, number, number];
  restitution?: number;
}

// Character Base Types
export type CharacterBase =
  | 'human' | 'robot' | 'slime' | 'blocky' | 'smooth'
  | 'princess' | 'prince' | 'elf' | 'mermaid'
  | 'kitty' | 'bunny' | 'panda' | 'fox' | 'bear'
  | 'fairy' | 'unicorn' | 'dragon' | 'wizard'
  | 'knight' | 'ninja' | 'pirate' | 'vampire'
  | 'alien' | 'ghost';

// Game State (for Zustand Store)
export interface GameState {
  // Player progression
  coins: {
    speed: number;
    gravity: number;
  };
  unlockedParts: string[];
  currentLoadout: Loadout;
  characterBase: CharacterBase;
  prestigeLevel: number;

  // Current session
  currentBiome: string;
  currentLevelId: string | null;
  checkpointPosition: [number, number, number];
  lastCheckpointId: string | null;
  checkpointJustSaved: boolean;
  playerPosition: [number, number, number] | null;
  isInvincible: boolean;
  isDead: boolean;
  isPaused: boolean;
  hasWon: boolean;

  // Settings
  quality: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'normal' | 'hard';
  soundEnabled: boolean;
  musicEnabled: boolean;

  // Progress tracking
  completedLevels: string[];
  levelStats: Record<string, LevelStats>;
  playerName: string;

  // Current run tracking
  currentRunStats: {
    startTime: number | null;
    deaths: number;
    coinsCollected: number;
  };

  // Power-ups and movement
  activePowerUps: ActivePowerUp[];
  isWallClimbing: boolean;
  isSliding: boolean;

  // Actions
  collectCoin: (type: CoinType) => void;
  unlockPart: (partId: string) => void;
  equipPart: (partId: string, slot: PartType) => void;
  setCharacterBase: (base: CharacterBase) => void;
  setCheckpoint: (position: [number, number, number], checkpointId: string) => void;
  setPlayerPosition: (position: [number, number, number]) => void;
  setInvincible: (invincible: boolean) => void;
  die: () => void;
  respawn: () => void;
  winGame: () => void;
  loadLevel: (levelId: string) => void;
  resetLevel: () => void;
  prestigeReset: () => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  setPaused: (paused: boolean) => void;
  completeLevel: (levelId: string) => void;
  setPlayerName: (name: string) => void;
  startLevelTimer: () => void;
  recordDeath: () => void;
  recordCoinCollection: () => void;
  saveLevelStats: (levelId: string, time: number) => void;
  activatePowerUp: (type: PowerUpType, duration: number) => void;
  deactivatePowerUp: (type: PowerUpType) => void;
  setWallClimbing: (climbing: boolean) => void;
  setSliding: (sliding: boolean) => void;
  reset: () => void;
}

// Level Statistics
export interface LevelStats {
  bestTime: number;
  totalDeaths: number;
  coinsCollected: number;
  playerName: string;
  completedAt: number; // timestamp
}

// Leaderboard Entry
export interface LeaderboardEntry {
  playerName: string;
  time: number;
  deaths: number;
  coins: number;
  date: number;
}

// Control State
export interface ControlState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
}

// Mobile Joystick
export interface JoystickData {
  angle: number;
  distance: number;
  x: number;
  y: number;
}

// VFX Particle
export interface Particle {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  lifetime: number;
  color: string;
  size: number;
}
