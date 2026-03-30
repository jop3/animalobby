import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import {
  ACHIEVEMENTS,
  AchievementCategory,
  getAchievementsByCategory,
  getAchievementById,
} from '../../data/achievements';

interface AchievementsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_INFO: Record<AchievementCategory, { label: string; icon: string; color: string }> = {
  combat: { label: 'Combat', icon: '🗡️', color: 'red' },
  speed: { label: 'Speed', icon: '⚡', color: 'yellow' },
  exploration: { label: 'Exploration', icon: '🗺️', color: 'green' },
  collection: { label: 'Collection', icon: '💰', color: 'amber' },
  mastery: { label: 'Mastery', icon: '👑', color: 'purple' },
};

export function Achievements({ isOpen, onClose }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('combat');
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);
  const claimAchievementReward = useGameStore((state) => state.claimAchievementReward);

  if (!isOpen) return null;

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = Object.keys(unlockedAchievements).length;
  const progress = Math.round((unlockedCount / totalAchievements) * 100);

  const categoryAchievements = getAchievementsByCategory(selectedCategory);
  const categoryInfo = CATEGORY_INFO[selectedCategory];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-4 border-indigo-500">
        {/* Header */}
        <div className="bg-indigo-800 border-b-4 border-indigo-700 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-game text-white mb-2">
              🏆 Achievements
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-lg text-indigo-200 font-game">
                {unlockedCount} / {totalAchievements} Unlocked
              </p>
              <div className="flex-1 max-w-xs h-3 bg-indigo-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-yellow-400 font-game">{progress}%</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 rounded-chunky px-6 py-3 text-2xl font-game text-white border-4 border-red-700 transition-all hover:scale-105 active:scale-95"
          >
            X
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)]">
          {/* Category Selector */}
          <div className="lg:w-1/4 bg-indigo-950 border-r-4 border-indigo-700 p-4 overflow-y-auto">
            <h3 className="text-xl font-game text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {(Object.keys(CATEGORY_INFO) as AchievementCategory[]).map((category) => {
                const info = CATEGORY_INFO[category];
                const categoryAchievements = getAchievementsByCategory(category);
                const categoryUnlocked = categoryAchievements.filter(
                  (a) => unlockedAchievements[a.id]
                ).length;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      w-full text-left p-4 rounded-lg font-game transition-all
                      ${selectedCategory === category
                        ? `bg-${info.color}-600 text-white scale-105`
                        : `bg-${info.color}-900/40 text-${info.color}-300 hover:bg-${info.color}-800/60`
                      }
                    `}
                    style={{
                      backgroundColor: selectedCategory === category ? `var(--color-${info.color})` : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{info.icon}</span>
                        <span>{info.label}</span>
                      </span>
                      <span className="text-sm opacity-75">
                        {categoryUnlocked}/{categoryAchievements.length}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Achievement List */}
          <div className="lg:w-3/4 p-6 overflow-y-auto">
            <h2 className="text-3xl font-game text-white mb-6 flex items-center gap-3">
              <span className="text-4xl">{categoryInfo.icon}</span>
              {categoryInfo.label} Achievements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryAchievements.map((achievement) => {
                const isUnlocked = !!unlockedAchievements[achievement.id];
                const progress = unlockedAchievements[achievement.id];
                const canClaimReward = isUnlocked && achievement.reward && !progress?.rewardClaimed;

                // For hidden achievements, show ??? if not unlocked
                const displayName = achievement.hidden && !isUnlocked ? '???' : achievement.name;
                const displayDescription = achievement.hidden && !isUnlocked
                  ? 'This achievement is hidden. Keep playing to discover it!'
                  : achievement.description;
                const displayIcon = achievement.hidden && !isUnlocked ? '❓' : achievement.icon;

                return (
                  <div
                    key={achievement.id}
                    className={`
                      rounded-xl p-5 border-2 transition-all
                      ${isUnlocked
                        ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-green-500'
                        : 'bg-gray-800/50 border-gray-600 opacity-60'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`
                          text-5xl w-16 h-16 flex items-center justify-center rounded-lg
                          ${isUnlocked ? 'bg-green-600/30' : 'bg-gray-700/50'}
                        `}
                      >
                        {displayIcon}
                      </div>

                      <div className="flex-1">
                        <h3 className={`text-xl font-game ${isUnlocked ? 'text-green-300' : 'text-gray-400'}`}>
                          {displayName}
                        </h3>
                        <p className={`text-sm mt-1 ${isUnlocked ? 'text-green-200' : 'text-gray-500'}`}>
                          {displayDescription}
                        </p>

                        {/* Reward */}
                        {achievement.reward && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-yellow-400 text-sm font-game">
                              Reward: {achievement.reward.type === 'coins'
                                ? `${achievement.reward.amount} coins`
                                : `Unlock ${achievement.reward.partId}`
                              }
                            </span>

                            {canClaimReward && (
                              <button
                                onClick={() => claimAchievementReward(achievement.id)}
                                className="ml-2 bg-yellow-500 hover:bg-yellow-400 text-black font-game text-sm px-3 py-1 rounded-lg transition-all hover:scale-105"
                              >
                                Claim!
                              </button>
                            )}

                            {progress?.rewardClaimed && (
                              <span className="text-green-400 text-sm">Claimed</span>
                            )}
                          </div>
                        )}

                        {/* Unlock date */}
                        {isUnlocked && progress && (
                          <p className="text-xs text-gray-400 mt-2">
                            Unlocked: {new Date(progress.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Unlocked checkmark */}
                      {isUnlocked && (
                        <div className="text-3xl text-green-400">
                          {/* checkmark */}
                          <span>{'✓'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
