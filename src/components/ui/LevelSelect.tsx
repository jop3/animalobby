import { LEVEL_REGISTRY } from '../../data/levelRegistry';
import { useState } from 'react';

interface LevelSelectProps {
  onSelectLevel: (levelId: string) => void;
  currentLevelId?: string;
}

export function LevelSelect({ onSelectLevel, currentLevelId }: LevelSelectProps) {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return 'from-green-400 to-green-600';
    if (difficulty === 2) return 'from-blue-400 to-blue-600';
    if (difficulty === 3) return 'from-yellow-400 to-yellow-600';
    if (difficulty === 4) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  const getThemeEmoji = (levelId: string) => {
    const emojiMap: Record<string, string> = {
      green_fields: '🌿',
      unicorn_castle: '🦄',
      sky_islands: '☁️',
      desert_ruins: '🏜️',
      jungle_challenge: '🌴',
      ice_cavern: '❄️',
      mushroom_forest: '🍄',
      lava_volcano: '🌋',
      neon_city: '🌆',
      underwater_temple: '🌊',
      space_station: '🚀',
    };
    return emojiMap[levelId] || '🎮';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 overflow-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl w-full mx-4 p-8">
        {/* Header with enhanced styling */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="mb-6">
            <h1
              className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-4 drop-shadow-2xl animate-float"
              style={{
                textShadow: '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,105,180,0.3)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.05em'
              }}
            >
              🎮 Animal Obby 🎮
            </h1>
            <div className="h-2 w-64 mx-auto bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full animate-pulse" />
          </div>

          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
            Choose Your Adventure!
          </p>

          <p className="text-lg text-blue-200/80 max-w-2xl mx-auto">
            Master parkour challenges, collect coins, and customize your character!
          </p>
        </div>

        {/* Level Grid with enhanced cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {LEVEL_REGISTRY.map((meta, index) => {
            const level = meta.level;
            const isSelected = level.id === currentLevelId;
            const isLocked = !meta.unlocked;
            const isHovered = hoveredLevel === level.id;

            return (
              <button
                key={level.id}
                onClick={() => !isLocked && onSelectLevel(level.id)}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                disabled={isLocked}
                className={`
                  group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90
                  backdrop-blur-sm rounded-2xl p-6 shadow-2xl
                  transition-all duration-300 transform border-4
                  ${isLocked
                    ? 'opacity-50 cursor-not-allowed border-gray-700'
                    : 'hover:scale-105 hover:shadow-pink-500/50 cursor-pointer border-purple-600 hover:border-pink-500'
                  }
                  ${isSelected ? 'ring-4 ring-yellow-400 scale-105 border-yellow-400' : ''}
                  ${isHovered && !isLocked ? 'bg-gradient-to-br from-purple-900/90 to-pink-900/90' : ''}
                `}
              >
                {/* Glow effect on hover */}
                {isHovered && !isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                )}

                {/* Level Number Badge */}
                <div className="relative flex items-center justify-between mb-4">
                  <div className={`
                    flex items-center justify-center w-16 h-16 rounded-xl
                    bg-gradient-to-br ${getDifficultyColor(level.difficulty)}
                    font-black text-3xl text-white shadow-lg
                    transform transition-transform group-hover:rotate-12
                  `}>
                    {index + 1}
                  </div>

                  <div className="text-5xl transform transition-transform group-hover:scale-125 group-hover:rotate-12">
                    {getThemeEmoji(level.id)}
                  </div>

                  {isLocked && <span className="text-4xl">🔒</span>}
                  {isSelected && (
                    <div className="bg-yellow-400 text-yellow-900 rounded-full p-2 animate-bounce">
                      <span className="text-2xl">✓</span>
                    </div>
                  )}
                </div>

                {/* Level Name */}
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">
                  {level.name}
                </h2>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 h-16 line-clamp-3">
                  {level.description || 'Complete the obstacle course!'}
                </p>

                {/* Difficulty Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    bg-gradient-to-r ${getDifficultyColor(level.difficulty)}
                    text-white text-xs font-bold px-3 py-1.5 rounded-full
                    shadow-lg
                  `}>
                    Level {level.difficulty}
                  </div>
                  <span className="text-2xl">
                    {getDifficultyStars(level.difficulty)}
                  </span>
                </div>

                {/* Stats Bar */}
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                      <span className="text-xl">🪙</span>
                      <span className="font-bold text-yellow-300">
                        {level.entities.filter(e => e.type === 'coin').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-red-500/20 px-3 py-1.5 rounded-lg">
                      <span className="text-xl">☠️</span>
                      <span className="font-bold text-red-300">
                        {level.entities.filter(e =>
                          ['spike', 'lava', 'rotating_hammer', 'zeus_lightning', 'vine'].includes(e.type)
                        ).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Shine Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer with enhanced controls info */}
        <div className="text-center space-y-4">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 max-w-3xl mx-auto border-2 border-purple-500/30">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">🎮 Controls</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-purple-900/40 rounded-lg p-3 border border-purple-500/30">
                <div className="text-purple-300 font-bold mb-1">MOVE</div>
                <div className="text-white text-lg">WASD / ↑←↓→</div>
              </div>
              <div className="bg-purple-900/40 rounded-lg p-3 border border-purple-500/30">
                <div className="text-blue-300 font-bold mb-1">JUMP</div>
                <div className="text-white text-lg">SPACE</div>
              </div>
              <div className="bg-purple-900/40 rounded-lg p-3 border border-purple-500/30">
                <div className="text-yellow-300 font-bold mb-1">SPRINT</div>
                <div className="text-white text-lg">SHIFT</div>
              </div>
              <div className="bg-purple-900/40 rounded-lg p-3 border border-purple-500/30">
                <div className="text-green-300 font-bold mb-1">PAUSE</div>
                <div className="text-white text-lg">ESC</div>
              </div>
            </div>
          </div>

          <p className="text-purple-300 text-sm animate-pulse">
            ✨ Select a level to begin your adventure! ✨
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
