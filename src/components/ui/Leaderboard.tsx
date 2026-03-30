import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { LEVEL_REGISTRY } from '../../data/levelRegistry';
import { ACHIEVEMENTS, getAchievementsByCategory } from '../../data/achievements';
import { formatTime, getTimeTier, getRankBadge, calculateScore } from '../../services/leaderboardService';
import { LevelStats } from '../../types/game.types';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  levelId?: string;
}

type SortMode = 'time' | 'deaths' | 'coins' | 'score';
type ViewMode = 'stats' | 'history' | 'achievements';

export function Leaderboard({ isOpen, onClose, levelId }: LeaderboardProps) {
  const [selectedLevel, setSelectedLevel] = useState(levelId || 'green_fields');
  const [sortMode, setSortMode] = useState<SortMode>('time');
  const [viewMode, setViewMode] = useState<ViewMode>('stats');

  const levelStats = useGameStore((state) => state.levelStats);
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);
  const completedLevels = useGameStore((state) => state.completedLevels);
  const foundSecrets = useGameStore((state) => state.foundSecrets);
  const defeatedBosses = useGameStore((state) => state.defeatedBosses);
  const totalCompletions = useGameStore((state) => state.totalCompletions);
  const totalDeaths = useGameStore((state) => state.totalDeaths);

  if (!isOpen) return null;

  const currentLevelStats = levelStats[selectedLevel];
  const levelMeta = LEVEL_REGISTRY.find((meta) => meta.level.id === selectedLevel);
  const levelData = levelMeta?.level;

  // Calculate personal best rankings across all levels
  const personalBests = useMemo(() => {
    return Object.entries(levelStats)
      .filter(([_, stats]) => stats && stats.bestTime < Infinity)
      .map(([id, stats]) => ({
        levelId: id,
        levelName: LEVEL_REGISTRY.find((m) => m.level.id === id)?.level.name || id,
        stats: stats as LevelStats,
        score: calculateScore(stats as LevelStats),
      }))
      .sort((a, b) => {
        switch (sortMode) {
          case 'time':
            return a.stats.bestTime - b.stats.bestTime;
          case 'deaths':
            return a.stats.totalDeaths - b.stats.totalDeaths;
          case 'coins':
            return b.stats.coinsCollected - a.stats.coinsCollected;
          case 'score':
            return a.score - b.score;
          default:
            return 0;
        }
      });
  }, [levelStats, sortMode]);

  // Count achievements
  const achievementCount = Object.keys(unlockedAchievements).length;
  const totalAchievements = ACHIEVEMENTS.length;

  // Get time tier for current level
  const timeTier = currentLevelStats && levelData
    ? getTimeTier(currentLevelStats.bestTime, levelData.difficulty)
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-4 border-purple-500">
        {/* Header */}
        <div className="bg-purple-800 border-b-4 border-purple-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-game text-white mb-2">
                Leaderboard
              </h1>
              <p className="text-lg text-purple-200 font-game">
                Your best times and records!
              </p>
            </div>

            {/* View mode tabs */}
            <div className="flex gap-2 mr-4">
              {(['stats', 'history', 'achievements'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    px-4 py-2 rounded-lg font-game text-sm transition-all
                    ${viewMode === mode
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-900/50 text-purple-300 hover:bg-purple-700'
                    }
                  `}
                >
                  {mode === 'stats' && 'Stats'}
                  {mode === 'history' && 'History'}
                  {mode === 'achievements' && 'Badges'}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 rounded-chunky px-6 py-3 text-2xl font-game text-white border-4 border-red-700 transition-all hover:scale-105 active:scale-95"
            >
              X
            </button>
          </div>

          {/* Global Stats Bar */}
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-purple-200">
                {completedLevels.length}/{LEVEL_REGISTRY.length} Levels
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎖️</span>
              <span className="text-purple-200">
                {achievementCount}/{totalAchievements} Achievements
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <span className="text-purple-200">
                {foundSecrets.length} Secrets Found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👑</span>
              <span className="text-purple-200">
                {Object.keys(defeatedBosses).length}/4 Bosses Defeated
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-180px)]">
          {/* Level Selector */}
          <div className="lg:w-1/3 bg-indigo-950 border-r-4 border-purple-700 p-4 overflow-y-auto">
            <h3 className="text-xl font-game text-white mb-4">Select Level</h3>
            <div className="space-y-2">
              {LEVEL_REGISTRY.map((meta) => {
                const stats = levelStats[meta.level.id];
                const hasStats = stats && stats.bestTime < Infinity;
                const tier = hasStats ? getTimeTier(stats.bestTime, meta.level.difficulty) : null;

                return (
                  <button
                    key={meta.level.id}
                    onClick={() => setSelectedLevel(meta.level.id)}
                    className={`
                      w-full text-left p-4 rounded-lg font-game transition-all
                      ${selectedLevel === meta.level.id
                        ? 'bg-purple-600 text-white scale-105'
                        : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/60'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{meta.level.name}</span>
                          {tier && (
                            <span className="text-lg">
                              {tier === 'gold' && '🥇'}
                              {tier === 'silver' && '🥈'}
                              {tier === 'bronze' && '🥉'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-60">
                          Difficulty: {'★'.repeat(meta.level.difficulty)}
                        </div>
                      </div>
                      <div className="text-right">
                        {hasStats ? (
                          <span className="text-yellow-400 text-sm">
                            {formatTime(stats.bestTime)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Not played</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            {viewMode === 'stats' && (
              <>
                <h2 className="text-3xl font-game text-white mb-6">
                  {levelData?.name || 'Select a Level'}
                </h2>

                {currentLevelStats && currentLevelStats.bestTime < Infinity ? (
                  <div className="space-y-6">
                    {/* Best Time with Medal */}
                    <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border-2 border-yellow-500">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-game text-yellow-400 flex items-center gap-2">
                          {timeTier && (
                            <span className="text-4xl">
                              {timeTier === 'gold' && '🥇'}
                              {timeTier === 'silver' && '🥈'}
                              {timeTier === 'bronze' && '🥉'}
                            </span>
                          )}
                          Best Time
                        </h3>
                        <div className="text-4xl font-game text-yellow-300">
                          {formatTime(currentLevelStats.bestTime)}
                        </div>
                      </div>
                      <div className="text-white font-game">
                        By: <span className="text-yellow-300">{currentLevelStats.playerName}</span>
                      </div>
                      <div className="text-sm text-yellow-200 mt-2">
                        Completed: {new Date(currentLevelStats.completedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-red-500/20 rounded-xl p-4 border-2 border-red-500">
                        <div className="text-4xl mb-1">💀</div>
                        <div className="text-2xl font-game text-red-300">
                          {currentLevelStats.totalDeaths}
                        </div>
                        <div className="text-red-200 font-game text-sm">Deaths</div>
                      </div>

                      <div className="bg-yellow-500/20 rounded-xl p-4 border-2 border-yellow-500">
                        <div className="text-4xl mb-1">🪙</div>
                        <div className="text-2xl font-game text-yellow-300">
                          {currentLevelStats.coinsCollected}
                        </div>
                        <div className="text-yellow-200 font-game text-sm">Coins</div>
                      </div>

                      <div className="bg-blue-500/20 rounded-xl p-4 border-2 border-blue-500">
                        <div className="text-4xl mb-1">🎮</div>
                        <div className="text-2xl font-game text-blue-300">
                          {currentLevelStats.attempts || 1}
                        </div>
                        <div className="text-blue-200 font-game text-sm">Attempts</div>
                      </div>

                      <div className="bg-purple-500/20 rounded-xl p-4 border-2 border-purple-500">
                        <div className="text-4xl mb-1">🔮</div>
                        <div className="text-2xl font-game text-purple-300">
                          {currentLevelStats.secretsFound?.length || 0}
                        </div>
                        <div className="text-purple-200 font-game text-sm">Secrets</div>
                      </div>
                    </div>

                    {/* Boss Status (if applicable) */}
                    {currentLevelStats.bossDefeated !== undefined && (
                      <div className={`rounded-xl p-4 border-2 ${
                        currentLevelStats.bossDefeated
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-gray-500/20 border-gray-500'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">
                            {currentLevelStats.bossDefeated ? '👑' : '💤'}
                          </span>
                          <div>
                            <div className={`font-game ${
                              currentLevelStats.bossDefeated ? 'text-green-300' : 'text-gray-400'
                            }`}>
                              {currentLevelStats.bossDefeated ? 'Boss Defeated!' : 'Boss Undefeated'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎮</div>
                    <div className="text-2xl font-game text-purple-300 mb-2">
                      No records yet!
                    </div>
                    <p className="text-purple-400">
                      Complete this level to see your stats here.
                    </p>
                  </div>
                )}
              </>
            )}

            {viewMode === 'history' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-game text-white">Personal Bests</h2>
                  <div className="flex gap-2">
                    {(['time', 'deaths', 'coins', 'score'] as SortMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSortMode(mode)}
                        className={`
                          px-3 py-1 rounded font-game text-sm transition-all
                          ${sortMode === mode
                            ? 'bg-yellow-500 text-black'
                            : 'bg-purple-800 text-purple-300 hover:bg-purple-700'
                          }
                        `}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {personalBests.length > 0 ? (
                    personalBests.slice(0, 10).map((entry, index) => (
                      <div
                        key={entry.levelId}
                        className="bg-purple-800/30 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-game text-yellow-400 w-12">
                            {getRankBadge(index + 1)}
                          </div>
                          <div>
                            <div className="font-game text-white">{entry.levelName}</div>
                            <div className="text-sm text-purple-400">
                              {entry.stats.totalDeaths} deaths · {entry.stats.coinsCollected} coins
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-game text-yellow-300">
                            {formatTime(entry.stats.bestTime)}
                          </div>
                          <div className="text-xs text-purple-400">
                            {new Date(entry.stats.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📊</div>
                      <div className="text-xl font-game text-purple-300">
                        No records yet. Complete some levels!
                      </div>
                    </div>
                  )}
                </div>

                {/* Overall Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-game text-purple-300">{totalCompletions}</div>
                    <div className="text-sm text-purple-400">Total Completions</div>
                  </div>
                  <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-game text-red-300">{totalDeaths}</div>
                    <div className="text-sm text-purple-400">Total Deaths</div>
                  </div>
                </div>
              </>
            )}

            {viewMode === 'achievements' && (
              <>
                <h2 className="text-3xl font-game text-white mb-6">
                  Recent Achievements
                </h2>

                <div className="space-y-3">
                  {Object.entries(unlockedAchievements)
                    .sort((a, b) => b[1].unlockedAt - a[1].unlockedAt)
                    .slice(0, 8)
                    .map(([id, progress]) => {
                      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
                      if (!achievement) return null;

                      return (
                        <div
                          key={id}
                          className="bg-green-600/20 rounded-lg p-4 border border-green-500 flex items-center gap-4"
                        >
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="font-game text-green-300">{achievement.name}</div>
                            <div className="text-sm text-green-400">{achievement.description}</div>
                          </div>
                          <div className="text-xs text-green-500">
                            {new Date(progress.unlockedAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}

                  {Object.keys(unlockedAchievements).length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎖️</div>
                      <div className="text-xl font-game text-purple-300">
                        No achievements yet. Keep playing!
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
