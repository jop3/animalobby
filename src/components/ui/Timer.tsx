import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';

export function Timer() {
  const difficulty = useGameStore((state) => state.difficulty);
  const currentRunStats = useGameStore((state) => state.currentRunStats);
  const isPaused = useGameStore((state) => state.isPaused);
  const isDead = useGameStore((state) => state.isDead);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Don't show timer in Easy mode
  if (difficulty === 'easy') return null;

  useEffect(() => {
    if (!currentRunStats.startTime || isPaused || isDead) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - currentRunStats.startTime!;
      setElapsedTime(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [currentRunStats.startTime, isPaused, isDead]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const seconds = elapsedTime / 1000;
    if (difficulty === 'hard') {
      if (seconds > 180) return 'from-red-500 to-red-700'; // Over 3 minutes
      if (seconds > 120) return 'from-orange-500 to-orange-700'; // Over 2 minutes
      return 'from-green-500 to-green-700';
    }
    return 'from-blue-500 to-blue-700';
  };

  return (
    <div className="absolute top-24 right-8 pointer-events-none z-10">
      <div className={`bg-gradient-to-r ${getTimerColor()} rounded-chunky px-8 py-4 shadow-lg border-4 border-white/30`}>
        <div className="text-center">
          <div className="text-sm font-game text-white/80 mb-1">
            {difficulty === 'hard' ? '⏱️ TIME ATTACK' : '⏱️ TIME'}
          </div>
          <div className="text-4xl font-game text-white font-black">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-xs font-game text-white/60 mt-1">
            💀 {currentRunStats.deaths} deaths
          </div>
        </div>
      </div>
    </div>
  );
}
