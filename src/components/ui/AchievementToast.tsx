import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getAchievementById } from '../../data/achievements';

export function AchievementToast() {
  const pendingAchievementToast = useGameStore((state) => state.pendingAchievementToast);
  const clearAchievementToast = useGameStore((state) => state.clearAchievementToast);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (pendingAchievementToast) {
      setIsVisible(true);
      setIsExiting(false);

      // Start exit animation after 4 seconds
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 4000);

      // Clear toast after exit animation
      const clearTimer = setTimeout(() => {
        setIsVisible(false);
        clearAchievementToast();
      }, 4500);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [pendingAchievementToast, clearAchievementToast]);

  if (!isVisible || !pendingAchievementToast) return null;

  const achievement = getAchievementById(pendingAchievementToast);
  if (!achievement) return null;

  return (
    <div
      className={`
        fixed top-20 left-1/2 transform -translate-x-1/2 z-[100]
        transition-all duration-500 ease-out
        ${isExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}
      `}
      style={{
        animation: isExiting ? undefined : 'slideInFromTop 0.5s ease-out',
      }}
    >
      <div className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 rounded-2xl shadow-2xl p-1">
        <div className="bg-gradient-to-r from-amber-900 to-yellow-900 rounded-xl px-6 py-4 flex items-center gap-4">
          {/* Achievement icon with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative text-5xl bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
              {achievement.icon}
            </div>
          </div>

          {/* Achievement info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-300 font-game text-sm uppercase tracking-wider">
                Achievement Unlocked!
              </span>
              <span className="text-2xl animate-bounce">🏆</span>
            </div>
            <h3 className="text-xl font-game text-white">
              {achievement.name}
            </h3>
            <p className="text-sm text-yellow-200 opacity-80">
              {achievement.description}
            </p>

            {/* Reward preview */}
            {achievement.reward && (
              <div className="mt-2 text-sm text-green-300 font-game">
                +{achievement.reward.type === 'coins'
                  ? `${achievement.reward.amount} coins`
                  : `New part: ${achievement.reward.partId}`
                }
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => {
                setIsVisible(false);
                clearAchievementToast();
              }, 300);
            }}
            className="text-yellow-400 hover:text-white text-2xl font-bold transition-colors"
          >
            X
          </button>
        </div>
      </div>

      {/* Confetti-like particles */}
      <div className="absolute -inset-4 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              backgroundColor: ['#FFD700', '#FFA500', '#FFFF00', '#FFE4B5'][i % 4],
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
