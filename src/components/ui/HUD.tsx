import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { AnimalLab } from './AnimalLab';

export function HUD() {
  const [isLabOpen, setIsLabOpen] = useState(false);

  const coins = useGameStore((state) => state.coins);
  const currentLoadout = useGameStore((state) => state.currentLoadout);
  const prestigeLevel = useGameStore((state) => state.prestigeLevel);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top Bar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
        {/* Coin Counters */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-chunky px-6 py-3 shadow-lg border-4 border-yellow-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-300 rounded-lg border-2 border-yellow-800" />
            <span className="text-2xl font-game text-stroke text-white">
              {coins.speed}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-chunky px-6 py-3 shadow-lg border-4 border-purple-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-300 rounded-lg border-2 border-purple-900" />
            <span className="text-2xl font-game text-stroke text-white">
              {coins.gravity}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Left - Controls Hint */}
      <div className="absolute bottom-4 left-4 bg-black/60 rounded-chunky px-4 py-3 text-white font-game text-sm">
        <div className="space-y-1">
          <div><span className="text-yellow-400">WASD/Arrows</span> - Move</div>
          <div><span className="text-yellow-400">Space</span> - Jump</div>
          <div><span className="text-yellow-400">Shift</span> - Sprint</div>
        </div>
      </div>

      {/* Top Left - Animal Lab Button */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <button
          className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 rounded-chunky px-6 py-3 shadow-lg border-4 border-green-800 transition-all hover:scale-105 active:scale-95"
          onClick={() => setIsLabOpen(true)}
        >
          <span className="text-xl font-game text-stroke text-white">
            🧪 Animal Lab
          </span>
        </button>

        {/* Prestige Badge */}
        {prestigeLevel > 0 && (
          <div className="absolute -top-2 -right-2 bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center border-2 border-purple-900 shadow-lg">
            <span className="text-white font-game text-sm">{prestigeLevel}</span>
          </div>
        )}
      </div>

      {/* Center - Death/Respawn Message */}
      <DeathMessage />

      {/* Center - Checkpoint Saved Message */}
      <CheckpointMessage />

      {/* Animal Lab Modal */}
      <AnimalLab isOpen={isLabOpen} onClose={() => setIsLabOpen(false)} />
    </div>
  );
}

function DeathMessage() {
  const isDead = useGameStore((state) => state.isDead);

  if (!isDead) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-red-600/90 rounded-chunky px-12 py-8 shadow-2xl border-4 border-red-900 animate-pulse">
        <h2 className="text-5xl font-game text-stroke text-white mb-2">
          WASTED!
        </h2>
        <p className="text-xl font-game text-white text-center">
          Respawning...
        </p>
      </div>
    </div>
  );
}

function CheckpointMessage() {
  const checkpointJustSaved = useGameStore((state) => state.checkpointJustSaved);

  if (!checkpointJustSaved) return null;

  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
      <div className="bg-green-500/90 rounded-chunky px-8 py-4 shadow-2xl border-4 border-green-700">
        <div className="flex items-center gap-3">
          <span className="text-4xl">✅</span>
          <h2 className="text-3xl font-game text-stroke text-white">
            Checkpoint Saved!
          </h2>
        </div>
      </div>
    </div>
  );
}
