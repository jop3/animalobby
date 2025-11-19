import { useState, useEffect, ReactNode } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getLevelById, getNextLevel } from '../data/levelRegistry';
import { LevelDefinition } from '../types/level.types';
import { LevelSelect } from './ui/LevelSelect';
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
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition | null>(null);

  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const hasWon = useGameStore((state) => state.hasWon);
  const loadLevel = useGameStore((state) => state.loadLevel);
  const resetLevel = useGameStore((state) => state.resetLevel);

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
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          currentLevelId={currentLevelId || undefined}
        />
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
