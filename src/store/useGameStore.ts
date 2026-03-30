import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, CoinType, PartType, AchievementProgress, BossDefeatRecord, LevelStats } from '../types/game.types';
import { audioManager } from '../utils/audioManager';
import {
  ACHIEVEMENTS,
  ALL_BOSS_TYPES,
  ALL_LEVEL_IDS,
  ALL_SECRET_IDS,
  getAchievementById,
} from '../data/achievements';

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
  quality: 'low' as const,
  difficulty: 'normal' as const,
  soundEnabled: true,
  musicEnabled: true,
  completedLevels: [] as string[],
  levelStats: {} as Record<string, LevelStats>,
  playerName: 'Player',

  // Achievement system
  unlockedAchievements: {} as Record<string, AchievementProgress>,
  foundSecrets: [] as string[],
  defeatedBosses: {} as Record<string, BossDefeatRecord>,
  totalDeaths: 0,
  totalCompletions: 0,
  pendingAchievementToast: null as string | null,

  currentRunStats: {
    startTime: null,
    deaths: 0,
    coinsCollected: 0,
    secretsFoundThisRun: [] as string[],
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
        // Check coin-related achievements
        setTimeout(() => get().checkAchievements(), 0);
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
        // Check part-related achievements
        setTimeout(() => get().checkAchievements(), 0);
      },

      // Part equipping
      equipPart: (partId: string, slot: PartType) => {
        const { unlockedParts } = get();

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
        if (isInvincible || isDead) return;

        audioManager.playDeath();

        set((state) => ({
          isDead: true,
          totalDeaths: state.totalDeaths + 1,
          currentRunStats: {
            ...state.currentRunStats,
            deaths: state.currentRunStats.deaths + 1,
          },
        }));

        // Check death-related achievements
        setTimeout(() => get().checkAchievements(), 0);
      },

      respawn: () => {
        set({ isDead: false, isInvincible: true });
      },

      // Win condition
      winGame: () => {
        set({ hasWon: true });
      },

      // Level management
      loadLevel: (levelId: string) => {
        set((state) => {
          // Increment attempts for this level
          const existingStats = state.levelStats[levelId];
          const newAttempts = existingStats ? existingStats.attempts + 1 : 1;

          return {
            currentLevelId: levelId,
            isDead: false,
            hasWon: false,
            isPaused: false,
            playerPosition: null,
            checkpointPosition: [0, 2, 0],
            lastCheckpointId: null,
            currentRunStats: {
              startTime: Date.now(),
              deaths: 0,
              coinsCollected: 0,
              secretsFoundThisRun: [],
            },
            levelStats: {
              ...state.levelStats,
              [levelId]: existingStats
                ? { ...existingStats, attempts: newAttempts }
                : {
                    bestTime: Infinity,
                    totalDeaths: 0,
                    coinsCollected: 0,
                    playerName: state.playerName,
                    completedAt: 0,
                    attempts: newAttempts,
                    secretsFound: [],
                    allCoinsCollected: false,
                  },
            },
          };
        });
      },

      resetLevel: () => {
        set({
          isDead: false,
          hasWon: false,
          isPaused: false,
          playerPosition: null,
          checkpointPosition: [0, 2, 0],
          lastCheckpointId: null,
        });
      },

      // Prestige system
      prestigeReset: () => {
        const { prestigeLevel, unlockedAchievements, foundSecrets, defeatedBosses, totalDeaths, totalCompletions } = get();

        set({
          ...INITIAL_STATE,
          prestigeLevel: prestigeLevel + 1,
          // Preserve achievement-related progress
          unlockedAchievements,
          foundSecrets,
          defeatedBosses,
          totalDeaths,
          totalCompletions,
          unlockedParts: prestigeLevel >= 0
            ? [...INITIAL_STATE.unlockedParts, 'double_jump_ability']
            : INITIAL_STATE.unlockedParts,
        });

        // Check prestige achievements
        setTimeout(() => get().checkAchievements(), 0);
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
          const newCompletedLevels = state.completedLevels.includes(levelId)
            ? state.completedLevels
            : [...state.completedLevels, levelId];

          return {
            completedLevels: newCompletedLevels,
            totalCompletions: state.totalCompletions + 1,
          };
        });

        // Check completion achievements
        setTimeout(() => get().checkAchievements(), 0);
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
        const { currentRunStats, playerName, levelStats, defeatedBosses } = get();
        const existingStats = levelStats[levelId];

        const newStats: LevelStats = {
          bestTime: existingStats && existingStats.bestTime < time ? existingStats.bestTime : time,
          totalDeaths: currentRunStats.deaths,
          coinsCollected: currentRunStats.coinsCollected,
          playerName,
          completedAt: Date.now(),
          attempts: existingStats?.attempts || 1,
          secretsFound: existingStats?.secretsFound || currentRunStats.secretsFoundThisRun,
          bossDefeated: !!Object.values(defeatedBosses).find((b) => b.levelId === levelId),
          allCoinsCollected: existingStats?.allCoinsCollected || false, // Will be updated by level logic
        };

        // Merge secrets found this run with previously found secrets
        const allSecretsFound = [
          ...(existingStats?.secretsFound || []),
          ...currentRunStats.secretsFoundThisRun,
        ];
        newStats.secretsFound = [...new Set(allSecretsFound)];

        set((state) => ({
          levelStats: {
            ...state.levelStats,
            [levelId]: newStats,
          },
        }));

        // Check level completion achievements
        setTimeout(() => get().checkAchievements(), 0);
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

      // ========================================================================
      // ACHIEVEMENT SYSTEM ACTIONS
      // ========================================================================

      unlockAchievement: (achievementId: string) => {
        const { unlockedAchievements } = get();

        // Don't unlock if already unlocked
        if (unlockedAchievements[achievementId]) return;

        const achievement = getAchievementById(achievementId);
        if (!achievement) return;

        set((state) => ({
          unlockedAchievements: {
            ...state.unlockedAchievements,
            [achievementId]: {
              unlockedAt: Date.now(),
              rewardClaimed: false,
            },
          },
          pendingAchievementToast: achievementId,
        }));

        // Play achievement sound
        audioManager.playCoin();
      },

      claimAchievementReward: (achievementId: string) => {
        const { unlockedAchievements } = get();
        const progress = unlockedAchievements[achievementId];

        if (!progress || progress.rewardClaimed) return;

        const achievement = getAchievementById(achievementId);
        if (!achievement?.reward) return;

        set((state) => {
          const newState: Partial<GameState> = {
            unlockedAchievements: {
              ...state.unlockedAchievements,
              [achievementId]: {
                ...progress,
                rewardClaimed: true,
              },
            },
          };

          // Apply reward
          if (achievement.reward!.type === 'coins' && achievement.reward!.amount) {
            newState.coins = {
              speed: state.coins.speed + Math.floor(achievement.reward!.amount / 2),
              gravity: state.coins.gravity + Math.ceil(achievement.reward!.amount / 2),
            };
          } else if (achievement.reward!.type === 'part' && achievement.reward!.partId) {
            if (!state.unlockedParts.includes(achievement.reward!.partId)) {
              newState.unlockedParts = [...state.unlockedParts, achievement.reward!.partId];
            }
          }

          return newState as GameState;
        });
      },

      clearAchievementToast: () => {
        set({ pendingAchievementToast: null });
      },

      discoverSecret: (secretId: string) => {
        const { foundSecrets, currentRunStats } = get();

        if (foundSecrets.includes(secretId)) return;

        set((state) => ({
          foundSecrets: [...state.foundSecrets, secretId],
          currentRunStats: {
            ...state.currentRunStats,
            secretsFoundThisRun: [...currentRunStats.secretsFoundThisRun, secretId],
          },
        }));

        // Check secret-related achievements
        setTimeout(() => get().checkAchievements(), 0);
      },

      defeatBoss: (bossType: string, levelId: string, deaths: number) => {
        set((state) => ({
          defeatedBosses: {
            ...state.defeatedBosses,
            [bossType]: {
              bossType,
              defeatedAt: Date.now(),
              deaths,
              levelId,
            },
          },
        }));

        // Check boss-related achievements
        setTimeout(() => get().checkAchievements(), 0);
      },

      checkAchievements: () => {
        const state = get();
        const { unlockedAchievements, unlockAchievement } = state;

        for (const achievement of ACHIEVEMENTS) {
          // Skip if already unlocked
          if (unlockedAchievements[achievement.id]) continue;

          const isUnlocked = checkAchievementCondition(achievement.condition, state);
          if (isUnlocked) {
            unlockAchievement(achievement.id);
          }
        }
      },
    }),
    {
      name: 'animal-obby-save',
      partialize: (state) => ({
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
        // Persist achievement data
        unlockedAchievements: state.unlockedAchievements,
        foundSecrets: state.foundSecrets,
        defeatedBosses: state.defeatedBosses,
        totalDeaths: state.totalDeaths,
        totalCompletions: state.totalCompletions,
      }),
    }
  )
);

// Helper function to check if an achievement condition is met
function checkAchievementCondition(
  condition: any,
  state: GameState
): boolean {
  switch (condition.type) {
    case 'defeat_boss':
      return !!state.defeatedBosses[condition.bossType];

    case 'defeat_boss_flawless':
      const bossRecord = state.defeatedBosses[condition.bossType];
      return bossRecord ? bossRecord.deaths === 0 : false;

    case 'defeat_all_bosses':
      return ALL_BOSS_TYPES.every((boss) => !!state.defeatedBosses[boss]);

    case 'complete_level':
      return state.completedLevels.includes(condition.levelId);

    case 'complete_level_time':
      const levelStats = state.levelStats[condition.levelId];
      return levelStats ? levelStats.bestTime <= condition.maxTime : false;

    case 'complete_level_flawless':
      const flawlessStats = state.levelStats[condition.levelId];
      return flawlessStats ? flawlessStats.totalDeaths === 0 : false;

    case 'complete_level_perfect':
      const perfectStats = state.levelStats[condition.levelId];
      return perfectStats
        ? perfectStats.totalDeaths === 0 && perfectStats.allCoinsCollected
        : false;

    case 'complete_all_levels':
      return ALL_LEVEL_IDS.every((level) => state.completedLevels.includes(level));

    case 'find_secret':
      return state.foundSecrets.includes(condition.secretId);

    case 'find_all_secrets_in_level':
      const levelSecrets = ALL_SECRET_IDS.filter((s) => s.startsWith(condition.levelId));
      return levelSecrets.every((s) => state.foundSecrets.includes(s));

    case 'find_all_secrets':
      return ALL_SECRET_IDS.every((s) => state.foundSecrets.includes(s));

    case 'collect_total_coins':
      return state.coins.speed + state.coins.gravity >= condition.amount;

    case 'collect_all_coins_in_level':
      const coinStats = state.levelStats[condition.levelId];
      return coinStats ? coinStats.allCoinsCollected : false;

    case 'unlock_all_parts':
      // This would need the full list of parts to check against
      return state.unlockedParts.length >= 30; // Approximate threshold

    case 'total_deaths':
      return state.totalDeaths >= condition.count;

    case 'total_completions':
      return state.totalCompletions >= condition.count;

    case 'prestige_level':
      return state.prestigeLevel >= condition.level;

    default:
      return false;
  }
}
