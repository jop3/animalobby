// Achievement system definitions
// Categories: Combat, Speed, Exploration, Collection, Mastery

export type AchievementCategory = 'combat' | 'speed' | 'exploration' | 'collection' | 'mastery';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  hidden?: boolean; // Hidden achievements show ??? until unlocked
  reward?: {
    type: 'coins' | 'part';
    amount?: number;
    partId?: string;
  };
  // Conditions for unlocking (checked by the system)
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: 'defeat_boss'; bossType: string }
  | { type: 'defeat_boss_flawless'; bossType: string } // 0 deaths
  | { type: 'defeat_all_bosses' }
  | { type: 'complete_level'; levelId: string }
  | { type: 'complete_level_time'; levelId: string; maxTime: number } // time in ms
  | { type: 'complete_level_flawless'; levelId: string } // 0 deaths
  | { type: 'complete_level_perfect'; levelId: string } // all coins + 0 deaths
  | { type: 'complete_all_levels' }
  | { type: 'find_secret'; secretId: string }
  | { type: 'find_all_secrets_in_level'; levelId: string }
  | { type: 'find_all_secrets' }
  | { type: 'collect_total_coins'; amount: number }
  | { type: 'collect_all_coins_in_level'; levelId: string }
  | { type: 'unlock_all_parts' }
  | { type: 'total_deaths'; count: number }
  | { type: 'total_completions'; count: number }
  | { type: 'prestige_level'; level: number };

export const ACHIEVEMENTS: Achievement[] = [
  // ============================================================================
  // COMBAT ACHIEVEMENTS
  // ============================================================================
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    description: 'Defeat the Fire Drake in Lava Volcano',
    icon: '🐉',
    category: 'combat',
    condition: { type: 'defeat_boss', bossType: 'dragon' },
    reward: { type: 'coins', amount: 50 },
  },
  {
    id: 'golem_crusher',
    name: 'Golem Crusher',
    description: 'Defeat the Stone Golem in Desert Ruins',
    icon: '🗿',
    category: 'combat',
    condition: { type: 'defeat_boss', bossType: 'golem' },
    reward: { type: 'coins', amount: 50 },
  },
  {
    id: 'wizard_vanquisher',
    name: 'Wizard Vanquisher',
    description: 'Defeat the Dark Wizard in Mushroom Forest',
    icon: '🧙',
    category: 'combat',
    condition: { type: 'defeat_boss', bossType: 'wizard' },
    reward: { type: 'coins', amount: 50 },
  },
  {
    id: 'kraken_conqueror',
    name: 'Kraken Conqueror',
    description: 'Defeat the Kraken in Underwater Temple',
    icon: '🐙',
    category: 'combat',
    condition: { type: 'defeat_boss', bossType: 'kraken' },
    reward: { type: 'coins', amount: 50 },
  },
  {
    id: 'boss_crusher',
    name: 'Boss Crusher',
    description: 'Defeat all 4 bosses',
    icon: '👑',
    category: 'combat',
    condition: { type: 'defeat_all_bosses' },
    reward: { type: 'coins', amount: 200 },
  },
  {
    id: 'untouchable_dragon',
    name: 'Untouchable (Dragon)',
    description: 'Defeat the Fire Drake without dying',
    icon: '🔥',
    category: 'combat',
    hidden: true,
    condition: { type: 'defeat_boss_flawless', bossType: 'dragon' },
    reward: { type: 'coins', amount: 100 },
  },
  {
    id: 'untouchable_golem',
    name: 'Untouchable (Golem)',
    description: 'Defeat the Stone Golem without dying',
    icon: '🪨',
    category: 'combat',
    hidden: true,
    condition: { type: 'defeat_boss_flawless', bossType: 'golem' },
    reward: { type: 'coins', amount: 100 },
  },

  // ============================================================================
  // SPEED ACHIEVEMENTS
  // ============================================================================
  {
    id: 'speed_demon_green',
    name: 'Speed Demon (Green Fields)',
    description: 'Complete Green Fields in under 60 seconds',
    icon: '⚡',
    category: 'speed',
    condition: { type: 'complete_level_time', levelId: 'green_fields', maxTime: 60000 },
    reward: { type: 'coins', amount: 25 },
  },
  {
    id: 'speed_demon_desert',
    name: 'Speed Demon (Desert Ruins)',
    description: 'Complete Desert Ruins in under 90 seconds',
    icon: '🏃',
    category: 'speed',
    condition: { type: 'complete_level_time', levelId: 'desert_ruins', maxTime: 90000 },
    reward: { type: 'coins', amount: 30 },
  },
  {
    id: 'speed_demon_lava',
    name: 'Speed Demon (Lava Volcano)',
    description: 'Complete Lava Volcano in under 120 seconds',
    icon: '🌋',
    category: 'speed',
    condition: { type: 'complete_level_time', levelId: 'lava_volcano', maxTime: 120000 },
    reward: { type: 'coins', amount: 35 },
  },
  {
    id: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'Complete any level in under 30 seconds',
    icon: '🌩️',
    category: 'speed',
    hidden: true,
    condition: { type: 'complete_level_time', levelId: 'green_fields', maxTime: 30000 },
    reward: { type: 'coins', amount: 100 },
  },

  // ============================================================================
  // EXPLORATION ACHIEVEMENTS
  // ============================================================================
  {
    id: 'secret_seeker_green',
    name: 'Secret Seeker (Green Fields)',
    description: 'Find the hidden flower garden in Green Fields',
    icon: '🌸',
    category: 'exploration',
    condition: { type: 'find_secret', secretId: 'green_fields_flower_garden' },
    reward: { type: 'coins', amount: 20 },
  },
  {
    id: 'secret_seeker_castle',
    name: 'Secret Seeker (Unicorn Castle)',
    description: 'Find the unicorn stable secret area',
    icon: '🦄',
    category: 'exploration',
    condition: { type: 'find_secret', secretId: 'unicorn_castle_stable' },
    reward: { type: 'coins', amount: 20 },
  },
  {
    id: 'secret_seeker_sky',
    name: 'Secret Seeker (Sky Islands)',
    description: 'Find the cloud temple secret area',
    icon: '☁️',
    category: 'exploration',
    condition: { type: 'find_secret', secretId: 'sky_islands_temple' },
    reward: { type: 'coins', amount: 20 },
  },
  {
    id: 'secret_seeker_jungle',
    name: 'Secret Seeker (Jungle)',
    description: 'Find the hidden treehouse',
    icon: '🌴',
    category: 'exploration',
    condition: { type: 'find_secret', secretId: 'jungle_treehouse' },
    reward: { type: 'coins', amount: 20 },
  },
  {
    id: 'secret_seeker_ice',
    name: 'Secret Seeker (Ice Cavern)',
    description: 'Find the ice crystal cave',
    icon: '💎',
    category: 'exploration',
    condition: { type: 'find_secret', secretId: 'ice_cavern_crystal' },
    reward: { type: 'coins', amount: 20 },
  },
  {
    id: 'world_explorer',
    name: 'World Explorer',
    description: 'Complete all 12 levels',
    icon: '🗺️',
    category: 'exploration',
    condition: { type: 'complete_all_levels' },
    reward: { type: 'coins', amount: 150 },
  },
  {
    id: 'secret_master',
    name: 'Secret Master',
    description: 'Find all secret areas in the game',
    icon: '🔮',
    category: 'exploration',
    hidden: true,
    condition: { type: 'find_all_secrets' },
    reward: { type: 'coins', amount: 300 },
  },

  // ============================================================================
  // COLLECTION ACHIEVEMENTS
  // ============================================================================
  {
    id: 'coin_collector_50',
    name: 'Coin Collector',
    description: 'Collect 50 total coins',
    icon: '🪙',
    category: 'collection',
    condition: { type: 'collect_total_coins', amount: 50 },
  },
  {
    id: 'coin_collector_100',
    name: 'Coin Hoarder',
    description: 'Collect 100 total coins',
    icon: '💰',
    category: 'collection',
    condition: { type: 'collect_total_coins', amount: 100 },
    reward: { type: 'coins', amount: 25 },
  },
  {
    id: 'coin_collector_500',
    name: 'Coin Tycoon',
    description: 'Collect 500 total coins',
    icon: '🤑',
    category: 'collection',
    condition: { type: 'collect_total_coins', amount: 500 },
    reward: { type: 'coins', amount: 100 },
  },
  {
    id: 'part_hoarder',
    name: 'Part Hoarder',
    description: 'Unlock all animal parts',
    icon: '🧬',
    category: 'collection',
    condition: { type: 'unlock_all_parts' },
    reward: { type: 'coins', amount: 200 },
  },

  // ============================================================================
  // MASTERY ACHIEVEMENTS
  // ============================================================================
  {
    id: 'flawless_green',
    name: 'Flawless Victory (Green Fields)',
    description: 'Complete Green Fields without dying',
    icon: '🛡️',
    category: 'mastery',
    condition: { type: 'complete_level_flawless', levelId: 'green_fields' },
    reward: { type: 'coins', amount: 30 },
  },
  {
    id: 'flawless_desert',
    name: 'Flawless Victory (Desert Ruins)',
    description: 'Complete Desert Ruins without dying',
    icon: '🏜️',
    category: 'mastery',
    condition: { type: 'complete_level_flawless', levelId: 'desert_ruins' },
    reward: { type: 'coins', amount: 40 },
  },
  {
    id: 'flawless_lava',
    name: 'Flawless Victory (Lava Volcano)',
    description: 'Complete Lava Volcano without dying',
    icon: '🔥',
    category: 'mastery',
    condition: { type: 'complete_level_flawless', levelId: 'lava_volcano' },
    reward: { type: 'coins', amount: 50 },
  },
  {
    id: 'perfectionist_green',
    name: 'Perfectionist (Green Fields)',
    description: 'Collect all coins and complete Green Fields without dying',
    icon: '⭐',
    category: 'mastery',
    hidden: true,
    condition: { type: 'complete_level_perfect', levelId: 'green_fields' },
    reward: { type: 'coins', amount: 75 },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Complete 10 levels total',
    icon: '🎖️',
    category: 'mastery',
    condition: { type: 'total_completions', count: 10 },
    reward: { type: 'coins', amount: 50 },
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 50 levels total',
    icon: '🏅',
    category: 'mastery',
    condition: { type: 'total_completions', count: 50 },
    reward: { type: 'coins', amount: 150 },
  },
  {
    id: 'prestige_1',
    name: 'Prestige I',
    description: 'Reach Prestige Level 1',
    icon: '🌟',
    category: 'mastery',
    condition: { type: 'prestige_level', level: 1 },
    reward: { type: 'coins', amount: 100 },
  },
  {
    id: 'die_hard',
    name: 'Die Hard',
    description: 'Die 100 times (it happens to the best of us)',
    icon: '💀',
    category: 'mastery',
    hidden: true,
    condition: { type: 'total_deaths', count: 100 },
    reward: { type: 'coins', amount: 50 },
  },
];

// Helper to get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

// All boss types for checking defeat_all_bosses
export const ALL_BOSS_TYPES = ['dragon', 'golem', 'wizard', 'kraken'];

// All level IDs for checking complete_all_levels
export const ALL_LEVEL_IDS = [
  'green_fields',
  'unicorn_castle',
  'sky_islands',
  'jungle_challenge',
  'ice_cavern',
  'mushroom_forest',
  'parkour_challenge',
  'underwater_temple',
  'desert_ruins',
  'lava_volcano',
  'neon_city',
  'space_station',
];

// All secret IDs for checking find_all_secrets
export const ALL_SECRET_IDS = [
  'green_fields_flower_garden',
  'unicorn_castle_stable',
  'sky_islands_temple',
  'jungle_treehouse',
  'ice_cavern_crystal',
  'mushroom_forest_garden',
  'parkour_shortcut',
  'underwater_treasure',
  'desert_ruins_tomb',
  'lava_volcano_forge',
  'neon_city_arcade',
  'space_station_control',
];
