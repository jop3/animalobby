import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, CoinType, PartType } from '../types/game.types';
import { audioManager } from '../utils/audioManager';

const INITIAL_STATE = {
  coins: {
    speed: 0,
    gravity: 0,
  },
  unlockedParts: [
    // Default parts
    'default_head', 'default_body', 'default_legs',
    // Heads - unlocked by default for fun
    'eagle_head', 'fox_head', 'owl_head', 'wolf_head', 'rabbit_head',
    // Bodies - unlocked by default for variety
    'turtle_body', 'gorilla_body', 'bear_body', 'cheetah_body', 'monkey_body',
    // Legs - unlocked by default for experimentation
    'cheetah_legs', 'frog_legs', 'kangaroo_legs', 'ostrich_legs', 'grasshopper_legs', 'spider_legs', 'horse_legs',
  ],
  currentLoadout: {
    head: 'default_head',
    body: 'default_body',
    legs: 'default_legs',
  },
  characterBase: 'human' as const,
  prestigeLevel: 0,
  currentBiome: 'green_fields',
  currentLevelId: null as string | null,
  checkpointPosition: [0, 2, 0] as [number, number, number],
  lastCheckpointId: null,
  checkpointJustSaved: false,
  playerPosition: null,
  isInvincible: false,
  isDead: false,
  isPaused: false,
  hasWon: false,
  quality: 'low' as const, // Default to low for better performance
  difficulty: 'normal' as const, // Default to normal difficulty
  soundEnabled: true,
  musicEnabled: true,
  completedLevels: [] as string[],
  levelStats: {} as Record<string, any>,
  playerName: 'Player',
  currentRunStats: {
    startTime: null,
    deaths: 0,
    coinsCollected: 0,
  },
  activePowerUps: [],
  isWallClimbing: false,
  isSliding: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // Coin collection
      collectCoin: (type: CoinType) => {
        set((state) => ({
          coins: {
            ...state.coins,
            [type]: state.coins[type] + 1,
          },
          currentRunStats: {
            ...state.currentRunStats,
            coinsCollected: state.currentRunStats.coinsCollected + 1,
          },
        }));
      },

      // Part unlocking
      unlockPart: (partId: string) => {
        set((state) => {
          if (state.unlockedParts.includes(partId)) {
            return state;
          }
          return {
            unlockedParts: [...state.unlockedParts, partId],
          };
        });
      },

      // Part equipping
      equipPart: (partId: string, slot: PartType) => {
        const { unlockedParts } = get();

        // Can only equip unlocked parts
        if (!unlockedParts.includes(partId)) {
          console.warn(`Cannot equip locked part: ${partId}`);
          return;
        }

        set((state) => ({
          currentLoadout: {
            ...state.currentLoadout,
            [slot]: partId,
          },
        }));
      },

      // Character base selection
      setCharacterBase: (base) => {
        set({ characterBase: base });
      },

      // Checkpoint system
      setCheckpoint: (position: [number, number, number], checkpointId: string) => {
        set({
          checkpointPosition: position,
          lastCheckpointId: checkpointId,
          checkpointJustSaved: true,
        });

        // Clear notification after 2 seconds
        setTimeout(() => {
          set({ checkpointJustSaved: false });
        }, 2000);
      },

      // Player position tracking (for hazards)
      setPlayerPosition: (position: [number, number, number]) => {
        set({ playerPosition: position });
      },

      // Invincibility frames
      setInvincible: (invincible: boolean) => {
        set({ isInvincible: invincible });
      },

      // Death and respawn
      die: () => {
        const { isInvincible, isDead } = get();
        // Don't die if invincible or already dead
        if (isInvincible || isDead) return;

        // Play death sound centrally so all death sources trigger it
        audioManager.playDeath();

        set((state) => ({
          isDead: true,
          currentRunStats: {
            ...state.currentRunStats,
            deaths: state.currentRunStats.deaths + 1,
          },
        }));
      },

      respawn: () => {
        set({ isDead: false, isInvincible: true });
        // Position is handled by the PlayerController component
      },

      // Win condition
      winGame: () => {
        set({ hasWon: true });
      },

      // Level management
      loadLevel: (levelId: string) => {
        set({
          currentLevelId: levelId,
          isDead: false,
          hasWon: false,
          isPaused: false,
          playerPosition: null,
          checkpointPosition: [0, 2, 0], // Will be overwritten by level's spawn point
          lastCheckpointId: null,
          currentRunStats: {
            startTime: Date.now(),
            deaths: 0,
            coinsCollected: 0,
          },
        });
      },

      resetLevel: () => {
        set({
          isDead: false,
          hasWon: false,
          isPaused: false,
          playerPosition: null,
          checkpointPosition: [0, 2, 0], // Will be overwritten by level's spawn point
          lastCheckpointId: null,
        });
      },

      // Prestige system
      prestigeReset: () => {
        const { prestigeLevel } = get();

        set({
          ...INITIAL_STATE,
          prestigeLevel: prestigeLevel + 1,
          // Keep unlocked parts based on prestige
          unlockedParts: prestigeLevel >= 0
            ? [...INITIAL_STATE.unlockedParts, 'double_jump_ability']
            : INITIAL_STATE.unlockedParts,
        });
      },

      // Settings
      setQuality: (quality: 'low' | 'medium' | 'high') => {
        set({ quality });
      },

      setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => {
        set({ difficulty });
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      toggleMusic: () => {
        set((state) => ({ musicEnabled: !state.musicEnabled }));
      },

      setPaused: (paused: boolean) => {
        set({ isPaused: paused });
      },

      // Level completion
      completeLevel: (levelId: string) => {
        set((state) => {
          if (state.completedLevels.includes(levelId)) {
            return state;
          }
          return {
            completedLevels: [...state.completedLevels, levelId],
          };
        });
      },

      // Player name
      setPlayerName: (name: string) => {
        set({ playerName: name });
      },

      // Level timer
      startLevelTimer: () => {
        set((state) => ({
          currentRunStats: {
            ...state.currentRunStats,
            startTime: Date.now(),
          },
        }));
      },

      // Track deaths
      recordDeath: () => {
        set((state) => ({
          currentRunStats: {
            ...state.currentRunStats,
            deaths: state.currentRunStats.deaths + 1,
          },
        }));
      },

      // Track coin collection
      recordCoinCollection: () => {
        set((state) => ({
          currentRunStats: {
            ...state.currentRunStats,
            coinsCollected: state.currentRunStats.coinsCollected + 1,
          },
        }));
      },

      // Save level stats
      saveLevelStats: (levelId: string, time: number) => {
        const { currentRunStats, playerName, levelStats } = get();
        const existingStats = levelStats[levelId];

        // Only save if it's a new best time or first completion
        if (!existingStats || time < existingStats.bestTime) {
          set((state) => ({
            levelStats: {
              ...state.levelStats,
              [levelId]: {
                bestTime: time,
                totalDeaths: currentRunStats.deaths,
                coinsCollected: currentRunStats.coinsCollected,
                playerName,
                completedAt: Date.now(),
              },
            },
          }));
        }
      },

      // Power-up management
      activatePowerUp: (type: any, duration: number) => {
        set((state) => ({
          activePowerUps: [
            ...state.activePowerUps.filter((p) => p.type !== type),
            { type, expiresAt: Date.now() + duration },
          ],
        }));
      },

      deactivatePowerUp: (type: any) => {
        set((state) => ({
          activePowerUps: state.activePowerUps.filter((p) => p.type !== type),
        }));
      },

      // Movement states
      setWallClimbing: (climbing: boolean) => {
        set({ isWallClimbing: climbing });
      },

      setSliding: (sliding: boolean) => {
        set({ isSliding: sliding });
      },

      // Full reset (for debugging)
      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: 'animal-obby-save', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        coins: state.coins,
        unlockedParts: state.unlockedParts,
        currentLoadout: state.currentLoadout,
        characterBase: state.characterBase,
        prestigeLevel: state.prestigeLevel,
        quality: state.quality,
        difficulty: state.difficulty,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        completedLevels: state.completedLevels,
        levelStats: state.levelStats,
        playerName: state.playerName,
      }),
    }
  )
);
