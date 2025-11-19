import { LEVEL_REGISTRY } from '../../data/levelRegistry';

interface LevelSelectProps {
  onSelectLevel: (levelId: string) => void;
  currentLevelId?: string;
}

export function LevelSelect({ onSelectLevel, currentLevelId }: LevelSelectProps) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return 'bg-green-500';
    if (difficulty === 2) return 'bg-blue-500';
    if (difficulty === 3) return 'bg-yellow-500';
    if (difficulty === 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-sky-600 to-sky-800 z-50">
      <div className="max-w-4xl w-full mx-4 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}>
            Animal Obby
          </h1>
          <p className="text-2xl text-sky-200">Choose Your Challenge</p>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVEL_REGISTRY.map((meta, index) => {
            const level = meta.level;
            const isSelected = level.id === currentLevelId;
            const isLocked = !meta.unlocked;

            return (
              <button
                key={level.id}
                onClick={() => !isLocked && onSelectLevel(level.id)}
                disabled={isLocked}
                className={`
                  bg-white rounded-xl p-6 shadow-xl transition-all transform
                  ${isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-2xl cursor-pointer'
                  }
                  ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                `}
              >
                {/* Level Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-bold text-gray-700">
                    {index + 1}
                  </span>
                  {isLocked && <span className="text-3xl">🔒</span>}
                  {isSelected && <span className="text-3xl">✓</span>}
                </div>

                {/* Level Name */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {level.name}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 h-12">
                  {level.description || 'Complete the obstacle course!'}
                </p>

                {/* Difficulty */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`${getDifficultyColor(level.difficulty)} text-white text-xs font-bold px-2 py-1 rounded`}>
                      Level {level.difficulty}
                    </span>
                  </div>
                  <span className="text-xl">
                    {getDifficultyStars(level.difficulty)}
                  </span>
                </div>

                {/* Entity Count */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>🎯 {level.entities.filter(e => e.type === 'coin').length} Coins</span>
                    <span>☠️ {level.entities.filter(e => ['spike', 'lava', 'rotating_hammer', 'zeus_lightning', 'vine'].includes(e.type)).length} Hazards</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sky-200 text-sm">
            Use WASD to move • Space to jump • Shift to sprint • ESC to pause
          </p>
        </div>
      </div>
    </div>
  );
}
