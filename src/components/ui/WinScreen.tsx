import { useGameStore } from '../../store/useGameStore';

interface WinScreenProps {
  onNextLevel?: () => void;
  onRestart?: () => void;
  onMainMenu?: () => void;
}

export function WinScreen({ onNextLevel, onRestart, onMainMenu }: WinScreenProps) {
  const hasWon = useGameStore((state) => state.hasWon);
  const coins = useGameStore((state) => state.coins);

  if (!hasWon) return null;

  const totalCoins = coins.speed + coins.gravity;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-gradient-to-b from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-yellow-600">
        {/* Trophy Icon */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4 animate-bounce">🏆</div>
          <h1 className="text-5xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            LEVEL COMPLETE!
          </h1>
          <p className="text-xl text-yellow-100">Congratulations!</p>
        </div>

        {/* Stats */}
        <div className="bg-white/20 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold">Total Coins:</span>
            <span className="text-yellow-200 font-bold text-xl">{totalCoins}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold flex items-center gap-2">
              <span className="text-blue-300">⚡</span> Speed Coins:
            </span>
            <span className="text-yellow-200 font-bold">{coins.speed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold flex items-center gap-2">
              <span className="text-purple-300">🌀</span> Gravity Coins:
            </span>
            <span className="text-yellow-200 font-bold">{coins.gravity}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {onNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
              Next Level →
            </button>
          )}
          {onRestart && (
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
              Restart Level ↻
            </button>
          )}
          {onMainMenu && (
            <button
              onClick={onMainMenu}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
              Main Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
