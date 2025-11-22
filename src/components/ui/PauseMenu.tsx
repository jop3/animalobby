import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

interface PauseMenuProps {
  onResume?: () => void;
  onRestart?: () => void;
  onMainMenu?: () => void;
}

export function PauseMenu({ onResume, onRestart, onMainMenu }: PauseMenuProps) {
  const isPaused = useGameStore((state) => state.isPaused);
  const setPaused = useGameStore((state) => state.setPaused);
  const quality = useGameStore((state) => state.quality);
  const setQuality = useGameStore((state) => state.setQuality);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPaused(!isPaused);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, setPaused]);

  const handleResume = () => {
    setPaused(false);
    onResume?.();
  };

  const handleRestart = () => {
    setPaused(false);
    onRestart?.();
  };

  const handleMainMenu = () => {
    setPaused(false);
    onMainMenu?.();
  };

  if (!isPaused) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 pointer-events-auto animate-fadeIn">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-purple-500 animate-scaleIn">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <div className="text-6xl mb-4 animate-pulse">⏸️</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-3">
            PAUSED
          </h1>
          <p className="text-gray-300 text-sm">Press ESC to resume</p>
        </div>

        {/* Settings Section */}
        <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-purple-500/30">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <span>⚙️</span>
            Settings
          </h2>

          {/* Graphics Quality */}
          <div className="mb-6">
            <label className="text-purple-300 text-sm font-semibold block mb-3">
              Graphics Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`
                    py-3 px-4 rounded-xl font-bold capitalize transition-all transform
                    ${quality === q
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg shadow-purple-500/50'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105'
                    }
                  `}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{soundEnabled ? '🔊' : '🔇'}</span>
              <label className="text-purple-300 font-semibold">Sound Effects</label>
            </div>
            <button
              onClick={toggleSound}
              className={`
                relative w-16 h-8 rounded-full transition-all transform hover:scale-110
                ${soundEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-600'}
              `}
            >
              <div className={`
                absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all
                ${soundEnabled ? 'left-9' : 'left-1'}
              `} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative space-y-3">
          <button
            onClick={handleResume}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/50 text-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <span>▶️</span>
              Resume Game
            </span>
          </button>

          {onRestart && (
            <button
              onClick={handleRestart}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-black py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/50"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔄</span>
                Restart Level
              </span>
            </button>
          )}

          {onMainMenu && (
            <button
              onClick={handleMainMenu}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🏠</span>
                Main Menu
              </span>
            </button>
          )}
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-purple-400 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-purple-400 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-purple-400 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-purple-400 rounded-br-lg" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
