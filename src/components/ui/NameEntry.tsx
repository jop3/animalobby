import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';

interface NameEntryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NameEntry({ isOpen, onClose }: NameEntryProps) {
  const playerName = useGameStore((state) => state.playerName);
  const setPlayerName = useGameStore((state) => state.setPlayerName);
  const [inputName, setInputName] = useState(playerName || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmedName = inputName.trim();

    if (!trimmedName) {
      setError('Please enter a name!');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters!');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Name must be 20 characters or less!');
      return;
    }

    setPlayerName(trimmedName);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl shadow-2xl max-w-md w-full border-4 border-blue-500">
        {/* Header */}
        <div className="bg-blue-800 border-b-4 border-blue-700 p-6">
          <h1 className="text-4xl font-game text-white mb-2 text-center">
            ✍️ Enter Your Name
          </h1>
          <p className="text-lg text-blue-200 font-game text-center">
            This will appear on the leaderboards!
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-white font-game text-lg mb-2">
              Player Name:
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-lg bg-purple-900/50 border-2 border-purple-600 text-white font-game text-xl focus:outline-none focus:border-blue-400 transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-400 font-game text-sm mt-2">
                {error}
              </p>
            )}
            <p className="text-purple-300 font-game text-sm mt-2">
              {inputName.length}/20 characters
            </p>
          </div>

          {/* Preview */}
          <div className="bg-purple-800/60 rounded-lg p-4 mb-6 border-2 border-purple-600">
            <p className="text-purple-200 font-game text-sm mb-2">Preview:</p>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-2xl">🏆</span>
              <span className="text-white font-game text-xl">
                {inputName.trim() || 'Your Name Here'}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 rounded-chunky px-6 py-3 text-lg font-game text-white border-4 border-gray-800 transition-all hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-500 hover:bg-green-600 rounded-chunky px-6 py-3 text-lg font-game text-white border-4 border-green-700 transition-all hover:scale-105 active:scale-95"
            >
              Save Name
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-800 border-t-4 border-blue-700 p-4">
          <p className="text-blue-200 font-game text-sm text-center">
            💡 Choose wisely - this name will be saved with your best times!
          </p>
        </div>
      </div>
    </div>
  );
}
