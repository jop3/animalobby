import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { CharacterBase } from '../../types/game.types';

interface CharacterPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHARACTER_INFO: Record<CharacterBase, { emoji: string; name: string; description: string; color: string }> = {
  human: {
    emoji: '🧑',
    name: 'Human',
    description: 'Balanced and versatile adventurer',
    color: 'from-orange-400 to-orange-600'
  },
  robot: {
    emoji: '🤖',
    name: 'Robot',
    description: 'Mechanical precision and power',
    color: 'from-gray-400 to-gray-600'
  },
  slime: {
    emoji: '🟢',
    name: 'Slime',
    description: 'Bouncy and flexible blob',
    color: 'from-green-400 to-green-600'
  },
  blocky: {
    emoji: '🧱',
    name: 'Blocky',
    description: 'Solid and sturdy cube hero',
    color: 'from-red-400 to-red-600'
  },
  smooth: {
    emoji: '⚪',
    name: 'Smooth',
    description: 'Sleek and aerodynamic',
    color: 'from-blue-400 to-blue-600'
  },
  princess: {
    emoji: '👸',
    name: 'Princess',
    description: 'Royal and graceful',
    color: 'from-pink-400 to-pink-600'
  },
  kitty: {
    emoji: '🐱',
    name: 'Kitty',
    description: 'Agile feline explorer',
    color: 'from-yellow-400 to-yellow-600'
  },
  bunny: {
    emoji: '🐰',
    name: 'Bunny',
    description: 'Super jumper with cute ears',
    color: 'from-purple-400 to-purple-600'
  },
  fairy: {
    emoji: '🧚',
    name: 'Fairy',
    description: 'Magical and light',
    color: 'from-teal-400 to-teal-600'
  },
  unicorn: {
    emoji: '🦄',
    name: 'Unicorn',
    description: 'Mythical and majestic',
    color: 'from-indigo-400 to-indigo-600'
  },
};

export function CharacterPicker({ isOpen, onClose }: CharacterPickerProps) {
  const characterBase = useGameStore((state) => state.characterBase);
  const setCharacterBase = useGameStore((state) => state.setCharacterBase);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterBase>(characterBase);

  if (!isOpen) return null;

  const handleSelect = (character: CharacterBase) => {
    setSelectedCharacter(character);
    setCharacterBase(character);
  };

  const characters: CharacterBase[] = [
    'human', 'robot', 'slime', 'blocky', 'smooth',
    'princess', 'kitty', 'bunny', 'fairy', 'unicorn'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-4 border-purple-500">
        {/* Header */}
        <div className="bg-purple-800 border-b-4 border-purple-700 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-game text-white mb-2">
              🎭 Choose Your Character
            </h1>
            <p className="text-lg text-purple-200 font-game">
              Pick your adventure companion!
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 rounded-chunky px-6 py-3 text-2xl font-game text-white border-4 border-red-700 transition-all hover:scale-105 active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Character Grid */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {characters.map((character) => {
              const info = CHARACTER_INFO[character];
              const isSelected = selectedCharacter === character;

              return (
                <button
                  key={character}
                  onClick={() => handleSelect(character)}
                  className={`
                    relative p-6 rounded-xl transition-all duration-300 transform
                    ${isSelected
                      ? 'bg-gradient-to-br ' + info.color + ' scale-110 shadow-2xl border-4 border-yellow-400'
                      : 'bg-purple-900/40 hover:bg-purple-800/60 hover:scale-105 border-2 border-purple-700'
                    }
                  `}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 border-2 border-yellow-600 shadow-lg animate-bounce">
                      <span className="text-xl">✓</span>
                    </div>
                  )}

                  {/* Character Emoji */}
                  <div className="text-7xl mb-3 animate-float">
                    {info.emoji}
                  </div>

                  {/* Character Name */}
                  <h3 className={`text-xl font-game font-bold mb-2 ${isSelected ? 'text-white' : 'text-purple-200'}`}>
                    {info.name}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm font-game ${isSelected ? 'text-white/90' : 'text-purple-300'}`}>
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Current Selection Info */}
          <div className="mt-8 bg-purple-800/60 rounded-xl p-6 border-2 border-purple-600">
            <div className="flex items-center gap-4">
              <div className="text-6xl">
                {CHARACTER_INFO[selectedCharacter].emoji}
              </div>
              <div>
                <h3 className="text-2xl font-game text-white mb-1">
                  {CHARACTER_INFO[selectedCharacter].name} Selected!
                </h3>
                <p className="text-purple-200 font-game">
                  {CHARACTER_INFO[selectedCharacter].description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-purple-800 border-t-4 border-purple-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-green-500 hover:bg-green-600 rounded-chunky px-8 py-3 text-xl font-game text-white border-4 border-green-700 transition-all hover:scale-105 active:scale-95"
          >
            Continue with {CHARACTER_INFO[selectedCharacter].name}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
