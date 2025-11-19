import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { getPartsByType, getPart, ANIMAL_PARTS } from '../../data/animalParts';
import { AnimalPart, PartType } from '../../types/game.types';
import { PlayerModel } from '../player/PlayerModel';

interface AnimalLabProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnimalLab({ isOpen, onClose }: AnimalLabProps) {
  const [selectedTab, setSelectedTab] = useState<PartType>('head');

  const currentLoadout = useGameStore((state) => state.currentLoadout);
  const unlockedParts = useGameStore((state) => state.unlockedParts);
  const equipPart = useGameStore((state) => state.equipPart);
  const coins = useGameStore((state) => state.coins);

  if (!isOpen) return null;

  // Calculate current stats
  const calculateStats = () => {
    let speedBonus = 0;
    let jumpBonus = 0;
    let defense = 0;

    Object.values(currentLoadout).forEach((partId) => {
      if (!partId) return;
      const part = getPart(partId);
      if (!part) return;

      speedBonus += (part.statModifier.speed || 0) * 100;
      jumpBonus += (part.statModifier.jumpForce || 0) * 100;
      defense += part.statModifier.defense || 0;
    });

    return {
      speed: speedBonus.toFixed(0),
      jump: jumpBonus.toFixed(0),
      defense,
    };
  };

  const stats = calculateStats();

  const handleEquip = (partId: string, slot: PartType) => {
    equipPart(partId, slot);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-chunky border-4 border-purple-700 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-purple-800 border-b-4 border-purple-700 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-game text-stroke text-white mb-2">
              🧪 Animal Lab
            </h1>
            <p className="text-lg text-purple-200 font-game">
              Customize your character!
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 rounded-chunky px-6 py-3 text-2xl font-game text-white border-4 border-red-700 transition-all hover:scale-105 active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Left: 3D Preview */}
          <div className="lg:w-1/3 bg-indigo-950 border-r-4 border-purple-700 p-6">
            <div className="bg-black/40 rounded-chunky border-2 border-purple-600 h-full">
              <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
                <color attach="background" args={['#1a1a2e']} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <PlayerModel loadout={currentLoadout} />
                <OrbitControls
                  enableZoom={false}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 2}
                />
              </Canvas>
            </div>

            {/* Stats Panel */}
            <div className="mt-4 space-y-2">
              <h3 className="text-xl font-game text-white mb-2">📊 Stats</h3>

              <StatBar
                label="Speed"
                value={stats.speed}
                color="from-yellow-400 to-orange-500"
                icon="⚡"
              />
              <StatBar
                label="Jump"
                value={stats.jump}
                color="from-blue-400 to-cyan-500"
                icon="🦘"
              />
              <StatBar
                label="Defense"
                value={stats.defense.toString()}
                color="from-green-400 to-emerald-500"
                icon="🛡️"
              />
            </div>
          </div>

          {/* Right: Part Selection */}
          <div className="lg:w-2/3 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b-4 border-purple-700 bg-purple-800">
              <TabButton
                active={selectedTab === 'head'}
                onClick={() => setSelectedTab('head')}
                label="🦅 Heads"
              />
              <TabButton
                active={selectedTab === 'body'}
                onClick={() => setSelectedTab('body')}
                label="🐢 Bodies"
              />
              <TabButton
                active={selectedTab === 'legs'}
                onClick={() => setSelectedTab('legs')}
                label="🐆 Legs"
              />
            </div>

            {/* Parts Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getPartsByType(selectedTab).map((part) => (
                  <PartCard
                    key={part.id}
                    part={part}
                    isUnlocked={unlockedParts.includes(part.id)}
                    isEquipped={currentLoadout[selectedTab] === part.id}
                    onEquip={() => handleEquip(part.id, selectedTab)}
                    coins={coins}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 text-xl font-game transition-all border-r-2 border-purple-700 last:border-r-0 ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-purple-800 text-purple-300 hover:bg-purple-700'
      }`}
    >
      {label}
    </button>
  );
}

interface StatBarProps {
  label: string;
  value: string;
  color: string;
  icon: string;
}

function StatBar({ label, value, color, icon }: StatBarProps) {
  const numValue = parseFloat(value);
  const percentage = Math.min(Math.max(numValue, 0), 100);

  return (
    <div className="bg-black/40 rounded-lg p-3 border-2 border-purple-600">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-game flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        <span className="text-yellow-400 font-game">
          {numValue > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface PartCardProps {
  part: AnimalPart;
  isUnlocked: boolean;
  isEquipped: boolean;
  onEquip: () => void;
  coins: { speed: number; gravity: number };
}

function PartCard({ part, isUnlocked, isEquipped, onEquip, coins }: PartCardProps) {
  // Calculate if player can afford this part (placeholder - you'd set actual costs)
  const canAfford = true; // For now, all unlocked parts are free

  return (
    <div
      className={`relative rounded-chunky border-4 p-4 transition-all ${
        isEquipped
          ? 'border-green-400 bg-green-900/40'
          : isUnlocked
          ? 'border-purple-500 bg-purple-900/40 hover:border-purple-400 cursor-pointer hover:scale-105'
          : 'border-gray-600 bg-gray-900/60 opacity-60'
      }`}
      onClick={isUnlocked && !isEquipped ? onEquip : undefined}
    >
      {/* Part Icon/Color */}
      <div
        className="w-full h-20 rounded-lg mb-3 border-2 border-white/20"
        style={{ backgroundColor: part.color }}
      />

      {/* Part Name */}
      <h4 className="text-white font-game text-sm mb-2">{part.name}</h4>

      {/* Description */}
      <p className="text-gray-300 text-xs mb-3">{part.description}</p>

      {/* Stats */}
      <div className="space-y-1 text-xs">
        {part.statModifier.speed && (
          <div className="text-yellow-400">
            ⚡ Speed: +{(part.statModifier.speed * 100).toFixed(0)}%
          </div>
        )}
        {part.statModifier.jumpForce && (
          <div className="text-blue-400">
            🦘 Jump: +{(part.statModifier.jumpForce * 100).toFixed(0)}%
          </div>
        )}
        {part.statModifier.defense && (
          <div className="text-green-400">
            🛡️ Defense: +{part.statModifier.defense}
          </div>
        )}
        {part.ability && (
          <div className="text-purple-400">
            ✨ {part.ability.replace('_', ' ').toUpperCase()}
          </div>
        )}
      </div>

      {/* Status Badge */}
      {isEquipped && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-game">
          ✓ EQUIPPED
        </div>
      )}

      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-chunky">
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-white font-game text-sm">LOCKED</div>
          </div>
        </div>
      )}
    </div>
  );
}
