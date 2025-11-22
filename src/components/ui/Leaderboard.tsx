import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { LEVEL_REGISTRY } from '../../data/levelRegistry';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  levelId?: string;
}

export function Leaderboard({ isOpen, onClose, levelId }: LeaderboardProps) {
  const [selectedLevel, setSelectedLevel] = useState(levelId || 'green_fields');
  const levelStats = useGameStore((state) => state.levelStats);

  if (!isOpen) return null;

  const currentLevelStats = levelStats[selectedLevel];
  const levelData = LEVEL_REGISTRY.find(meta => meta.level.id === selectedLevel)?.level;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-purple-500">
        {/* Header */}
        <div className="bg-purple-800 border-b-4 border-purple-700 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-game text-white mb-2">
              🏆 Leaderboard
            </h1>
            <p className="text-lg text-purple-200 font-game">
              Your best times and records!
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 rounded-chunky px-6 py-3 text-2xl font-game text-white border-4 border-red-700 transition-all hover:scale-105 active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Level Selector */}
          <div className="lg:w-1/3 bg-indigo-950 border-r-4 border-purple-700 p-4 overflow-y-auto">
            <h3 className="text-xl font-game text-white mb-4">Select Level</h3>
            <div className="space-y-2">
              {LEVEL_REGISTRY.map((meta) => (
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
                    <span>{meta.level.name}</span>
                    {levelStats[meta.level.id] && (
                      <span className="text-yellow-400">⭐</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Display */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            <h2 className="text-3xl font-game text-white mb-6">
              {levelData?.name || 'Select a Level'}
            </h2>

            {currentLevelStats ? (
              <div className="space-y-6">
                {/* Best Time */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border-2 border-yellow-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-game text-yellow-400">🏆 Best Time</h3>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-500/20 rounded-xl p-6 border-2 border-red-500">
                    <div className="text-6xl mb-2">💀</div>
                    <div className="text-3xl font-game text-red-300">
                      {currentLevelStats.totalDeaths}
                    </div>
                    <div className="text-red-200 font-game">Deaths</div>
                  </div>

                  <div className="bg-yellow-500/20 rounded-xl p-6 border-2 border-yellow-500">
                    <div className="text-6xl mb-2">🪙</div>
                    <div className="text-3xl font-game text-yellow-300">
                      {currentLevelStats.coinsCollected}
                    </div>
                    <div className="text-yellow-200 font-game">Coins</div>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="bg-purple-800/40 rounded-xl p-6 border-2 border-purple-600">
                  <h3 className="text-xl font-game text-purple-300 mb-4">🎖️ Achievements</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {currentLevelStats.totalDeaths === 0 && (
                      <div className="bg-green-600/20 rounded-lg p-3 border border-green-500">
                        <div className="text-2xl mb-1">🛡️</div>
                        <div className="text-sm font-game text-green-300">Flawless Victory</div>
                      </div>
                    )}
                    {currentLevelStats.bestTime < 60000 && (
                      <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-500">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-sm font-game text-blue-300">Speed Demon</div>
                      </div>
                    )}
                    {currentLevelStats.totalDeaths <= 3 && (
                      <div className="bg-yellow-600/20 rounded-lg p-3 border border-yellow-500">
                        <div className="text-2xl mb-1">🥇</div>
                        <div className="text-sm font-game text-yellow-300">Almost Perfect</div>
                      </div>
                    )}
                    {currentLevelStats.bestTime < 120000 && currentLevelStats.totalDeaths === 0 && (
                      <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-500">
                        <div className="text-2xl mb-1">👑</div>
                        <div className="text-sm font-game text-purple-300">Master</div>
                      </div>
                    )}
                  </div>
                </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
