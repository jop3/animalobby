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
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 z-50 overflow-y-auto overflow-x-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative max-w-7xl w-full mx-auto px-6 py-12">
        {/* Header with enhanced styling */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="mb-8">
            <h1
              className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 mb-6 drop-shadow-2xl animate-float"
              style={{
                textShadow: '0 0 60px rgba(255,255,255,0.8), 0 0 100px rgba(255,105,180,0.5), 0 0 140px rgba(168,85,247,0.4)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.05em'
              }}
            >
              🎮 Animal Obby 🎮
            </h1>
            <div className="h-3 w-80 mx-auto bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full animate-pulse shadow-lg shadow-pink-500/50" />
          </div>

          <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 mb-6 animate-pulse">
            Choose Your Adventure!
          </p>

          <p className="text-xl text-blue-100/90 max-w-3xl mx-auto font-medium tracking-wide">
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
                  group relative overflow-hidden
                  backdrop-blur-xl rounded-3xl p-7 shadow-2xl
                  transition-all duration-500 transform border-4
                  ${isLocked
                    ? 'opacity-60 cursor-not-allowed border-gray-600/50 bg-gradient-to-br from-gray-900/70 to-gray-800/70'
                    : 'hover:scale-110 hover:shadow-pink-500/60 hover:shadow-2xl cursor-pointer border-purple-500/60 hover:border-pink-400 bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-pink-900/80'
                  }
                  ${isSelected ? 'ring-8 ring-yellow-400/80 scale-110 border-yellow-400 shadow-yellow-400/50' : ''}
                  ${isHovered && !isLocked ? 'bg-gradient-to-br from-pink-800/90 via-purple-800/90 to-indigo-800/90' : ''}
                `}
              >
                {/* Enhanced Glow effect on hover */}
                {isHovered && !isLocked && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-blue-500/40 rounded-3xl blur-2xl animate-pulse" />
                )}

                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none" />

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
        <div className="text-center space-y-6 mt-12">
          <div className="bg-gradient-to-br from-black/60 via-purple-900/40 to-black/60 backdrop-blur-xl rounded-3xl p-8 max-w-4xl mx-auto border-4 border-purple-400/40 shadow-2xl shadow-purple-500/30">
            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 mb-6">🎮 Controls</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
              <div className="bg-gradient-to-br from-purple-800/60 to-purple-900/60 rounded-2xl p-4 border-2 border-purple-400/40 backdrop-blur-sm transform transition-transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50">
                <div className="text-purple-200 font-black mb-2 text-base">MOVE</div>
                <div className="text-white text-xl font-bold">WASD / ↑←↓→</div>
              </div>
              <div className="bg-gradient-to-br from-blue-800/60 to-blue-900/60 rounded-2xl p-4 border-2 border-blue-400/40 backdrop-blur-sm transform transition-transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50">
                <div className="text-blue-200 font-black mb-2 text-base">JUMP</div>
                <div className="text-white text-xl font-bold">SPACE</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-800/60 to-yellow-900/60 rounded-2xl p-4 border-2 border-yellow-400/40 backdrop-blur-sm transform transition-transform hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/50">
                <div className="text-yellow-200 font-black mb-2 text-base">SPRINT</div>
                <div className="text-white text-xl font-bold">SHIFT</div>
              </div>
              <div className="bg-gradient-to-br from-green-800/60 to-green-900/60 rounded-2xl p-4 border-2 border-green-400/40 backdrop-blur-sm transform transition-transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/50">
                <div className="text-green-200 font-black mb-2 text-base">PAUSE</div>
                <div className="text-white text-xl font-bold">ESC</div>
              </div>
            </div>
          </div>

          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 animate-pulse">
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
