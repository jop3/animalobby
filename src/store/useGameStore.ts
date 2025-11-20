import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, CoinType, PartType } from '../types/game.types';

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
  playerPosition: null,
  isInvincible: false,
  isDead: false,
  isPaused: false,
  hasWon: false,
  quality: 'medium' as const,
  soundEnabled: true,
  musicEnabled: true,
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
        });
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
        const { isInvincible } = get();
        // Don't die if invincible
        if (isInvincible) return;

        set({ isDead: true });
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

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      toggleMusic: () => {
        set((state) => ({ musicEnabled: !state.musicEnabled }));
      },

      setPaused: (paused: boolean) => {
        set({ isPaused: paused });
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
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
      }),
    }
  )
);
