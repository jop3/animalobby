/**
 * Leaderboard Service
 *
 * This is a placeholder for future global leaderboard functionality.
 * Currently uses localStorage for personal bests, but the interface
 * is designed to easily swap in a backend API later.
 */

import { LevelStats, LeaderboardEntry } from '../types/game.types';

// Configuration for future API integration
const API_CONFIG = {
  baseUrl: '', // Will be set when backend is available
  enabled: false, // Enable when backend is ready
};

export interface GlobalLeaderboardEntry extends LeaderboardEntry {
  rank: number;
  levelId: string;
}

export interface LeaderboardResponse {
  entries: GlobalLeaderboardEntry[];
  totalEntries: number;
  playerRank?: number;
}

/**
 * Submit a new score to the leaderboard
 * Currently a no-op placeholder for future API integration
 */
export async function submitScore(
  levelId: string,
  entry: LeaderboardEntry
): Promise<boolean> {
  if (!API_CONFIG.enabled) {
    console.log('[Leaderboard] Score submission disabled (no backend)');
    return true;
  }

  try {
    // Future API call:
    // const response = await fetch(`${API_CONFIG.baseUrl}/leaderboard/${levelId}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // });
    // return response.ok;
    return true;
  } catch (error) {
    console.error('[Leaderboard] Failed to submit score:', error);
    return false;
  }
}

/**
 * Get the global leaderboard for a level
 * Currently returns empty result - placeholder for future API
 */
export async function getGlobalLeaderboard(
  levelId: string,
  limit: number = 10,
  offset: number = 0
): Promise<LeaderboardResponse> {
  if (!API_CONFIG.enabled) {
    return {
      entries: [],
      totalEntries: 0,
    };
  }

  try {
    // Future API call:
    // const response = await fetch(
    //   `${API_CONFIG.baseUrl}/leaderboard/${levelId}?limit=${limit}&offset=${offset}`
    // );
    // return await response.json();
    return { entries: [], totalEntries: 0 };
  } catch (error) {
    console.error('[Leaderboard] Failed to fetch leaderboard:', error);
    return { entries: [], totalEntries: 0 };
  }
}

/**
 * Get a player's rank on a specific level's leaderboard
 */
export async function getPlayerRank(
  levelId: string,
  playerName: string
): Promise<number | null> {
  if (!API_CONFIG.enabled) {
    return null;
  }

  try {
    // Future API call
    return null;
  } catch (error) {
    console.error('[Leaderboard] Failed to get player rank:', error);
    return null;
  }
}

/**
 * Calculate achievement tier based on time
 */
export function getTimeTier(
  time: number,
  levelDifficulty: number
): 'gold' | 'silver' | 'bronze' | null {
  // Base thresholds (in milliseconds) scaled by difficulty
  const baseGold = 30000; // 30 seconds
  const baseSilver = 60000; // 60 seconds
  const baseBronze = 120000; // 120 seconds

  const difficultyMultiplier = 1 + (levelDifficulty - 1) * 0.5;

  const goldThreshold = baseGold * difficultyMultiplier;
  const silverThreshold = baseSilver * difficultyMultiplier;
  const bronzeThreshold = baseBronze * difficultyMultiplier;

  if (time <= goldThreshold) return 'gold';
  if (time <= silverThreshold) return 'silver';
  if (time <= bronzeThreshold) return 'bronze';
  return null;
}

/**
 * Format time for display (MM:SS.ms)
 */
export function formatTime(ms: number): string {
  if (!ms || ms === Infinity) return '--:--.--';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

/**
 * Get rank badge emoji based on position
 */
export function getRankBadge(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `#${rank}`;
  }
}

/**
 * Calculate a score value for sorting (lower is better)
 * Combines time, deaths, and coins collected
 */
export function calculateScore(stats: LevelStats): number {
  const timeScore = stats.bestTime;
  const deathPenalty = stats.totalDeaths * 10000; // 10 seconds per death
  const coinBonus = stats.coinsCollected * -500; // Subtract 0.5 seconds per coin

  return Math.max(0, timeScore + deathPenalty + coinBonus);
}
