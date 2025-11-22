import { useState, useEffect, ReactNode } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getLevelById, getNextLevel } from '../data/levelRegistry';
import { LevelDefinition } from '../types/level.types';
import { LevelSelect } from './ui/LevelSelect';
import { WorldMap } from './ui/WorldMap';
import { WinScreen } from './ui/WinScreen';
import { PauseMenu } from './ui/PauseMenu';

interface GameManagerProps {
  children: (level: LevelDefinition | null) => ReactNode;
}

/**
 * GameManager - Orchestrates game flow and level management
 * Provides current level to children (3D scene) and renders UI overlays
 */
export function GameManager({ children }: GameManagerProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition | null>(null);

  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const hasWon = useGameStore((state) => state.hasWon);
  const loadLevel = useGameStore((state) => state.loadLevel);
  const resetLevel = useGameStore((state) => state.resetLevel);
  const completeLevel = useGameStore((state) => state.completeLevel);

  // Load level when levelId changes
  useEffect(() => {
    if (currentLevelId) {
      const level = getLevelById(currentLevelId);
      if (level) {
        setCurrentLevel(level);
        setGameState('playing');
      }
    }
  }, [currentLevelId]);

  // Mark level complete when player wins
  useEffect(() => {
    if (hasWon && currentLevelId) {
      completeLevel(currentLevelId);
    }
  }, [hasWon, currentLevelId, completeLevel]);

  const handleSelectLevel = (levelId: string) => {
    loadLevel(levelId);
  };

  const handleRestartLevel = () => {
    if (currentLevelId) {
      resetLevel();
      // Force re-render by reloading the level
      const level = getLevelById(currentLevelId);
      setCurrentLevel(null);
      setTimeout(() => setCurrentLevel(level), 0);
    }
  };

  const handleNextLevel = () => {
    if (currentLevelId) {
      const nextLevel = getNextLevel(currentLevelId);
      if (nextLevel) {
        loadLevel(nextLevel.id);
      } else {
        // No more levels, go back to menu
        handleMainMenu();
      }
    }
  };

  const handleMainMenu = () => {
    setGameState('menu');
    setCurrentLevel(null);
  };

  return (
    <>
      {/* Level Selection Menu */}
      {gameState === 'menu' && (
        <>
          {/* View toggle buttons */}
          <div className="absolute top-8 left-8 z-[60] flex gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`
                px-6 py-3 rounded-lg font-game font-bold transition-all transform hover:scale-105
                ${viewMode === 'map'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              🗺️ Map View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`
                px-6 py-3 rounded-lg font-game font-bold transition-all transform hover:scale-105
                ${viewMode === 'grid'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              📋 Grid View
            </button>
          </div>

          {/* Show map or grid based on view mode */}
          {viewMode === 'map' ? (
            <WorldMap
              onSelectLevel={handleSelectLevel}
              currentLevelId={currentLevelId || undefined}
            />
          ) : (
            <LevelSelect
              onSelectLevel={handleSelectLevel}
              currentLevelId={currentLevelId || undefined}
            />
          )}
        </>
      )}

      {/* 3D Scene Content */}
      {gameState === 'playing' && children(currentLevel)}

      {/* Pause Menu (overlay) */}
      {gameState === 'playing' && (
        <PauseMenu
          onRestart={handleRestartLevel}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Win Screen (overlay) */}
      {gameState === 'playing' && hasWon && (
        <WinScreen
          onNextLevel={
            currentLevelId && getNextLevel(currentLevelId)
              ? handleNextLevel
              : undefined
          }
          onRestart={handleRestartLevel}
          onMainMenu={handleMainMenu}
        />
      )}
    </>
  );
}
