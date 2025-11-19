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
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-gray-600">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">PAUSED</h1>
          <p className="text-gray-400">Press ESC to resume</p>
        </div>

        {/* Settings */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h2 className="text-white font-semibold mb-3">Settings</h2>

          {/* Quality */}
          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-2">Graphics Quality</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-2 px-3 rounded capitalize transition-colors ${
                    quality === q
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 text-sm">Sound Effects</label>
            <button
              onClick={toggleSound}
              className={`py-2 px-4 rounded transition-colors ${
                soundEnabled
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleResume}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
          >
            Resume
          </button>
          {onRestart && (
            <button
              onClick={handleRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
              Restart Level
            </button>
          )}
          {onMainMenu && (
            <button
              onClick={handleMainMenu}
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
