import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { PowerUpType } from '../../types/game.types';

const POWER_UP_INFO: Record<PowerUpType, { emoji: string; name: string; color: string }> = {
  speed_boost: { emoji: '⚡', name: 'Speed Boost', color: '#FFD700' },
  shield: { emoji: '🛡️', name: 'Shield', color: '#00BFFF' },
  double_jump: { emoji: '🦘', name: 'Double Jump', color: '#FF69B4' },
  invincibility: { emoji: '✨', name: 'Invincibility', color: '#9370DB' },
  magnet: { emoji: '🧲', name: 'Coin Magnet', color: '#FF4500' },
};

export function PowerUpDisplay() {
  const activePowerUps = useGameStore((state) => state.activePowerUps);
  const deactivatePowerUp = useGameStore((state) => state.deactivatePowerUp);
  const [, setTick] = useState(0);

  // Force re-render every 100ms to update timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);

      // Check for expired power-ups
      const now = Date.now();
      activePowerUps.forEach((powerUp) => {
        if (powerUp.expiresAt <= now) {
          deactivatePowerUp(powerUp.type);
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activePowerUps, deactivatePowerUp]);

  if (activePowerUps.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 flex flex-col gap-2 pointer-events-none z-40">
      {activePowerUps.map((powerUp) => {
        const info = POWER_UP_INFO[powerUp.type];
        const timeLeft = Math.max(0, powerUp.expiresAt - Date.now());
        const seconds = Math.ceil(timeLeft / 1000);
        const percent = (timeLeft / 10000) * 100; // Assuming 10s default duration

        return (
          <div
            key={powerUp.type}
            className="bg-black/80 rounded-lg px-4 py-3 min-w-[200px] border-2 animate-slideInRight"
            style={{ borderColor: info.color }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{info.emoji}</span>
              <div className="flex-1">
                <div className="text-white font-game text-sm mb-1">
                  {info.name}
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-100"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: info.color,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 font-game">
                  {seconds}s
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(300px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
