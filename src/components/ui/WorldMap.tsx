import { useState, useRef, useMemo } from 'react';
import { LEVEL_REGISTRY } from '../../data/levelRegistry';
import { useGameStore } from '../../store/useGameStore';

// Pre-generate star positions to avoid re-randomizing on every render
function generateStarPositions(count: number) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    // Use deterministic seed based on index
    const seed = (i * 9301 + 49297) % 233280;
    const rand1 = seed / 233280;
    const seed2 = (seed * 9301 + 49297) % 233280;
    const rand2 = seed2 / 233280;
    const seed3 = (seed2 * 9301 + 49297) % 233280;
    const rand3 = seed3 / 233280;
    const seed4 = (seed3 * 9301 + 49297) % 233280;
    const rand4 = seed4 / 233280;

    stars.push({
      left: rand1 * 100,
      top: rand2 * 100,
      delay: rand3 * 3,
      opacity: rand4 * 0.7 + 0.3,
    });
  }
  return stars;
}

interface WorldMapProps {
  onSelectLevel: (levelId: string) => void;
  currentLevelId?: string;
}

// Define the path coordinates for each level on the map
const LEVEL_POSITIONS = [
  { x: 15, y: 80 },   // Green Fields - bottom left
  { x: 25, y: 65 },   // Unicorn Castle - up and right
  { x: 40, y: 55 },   // Sky Islands - higher up
  { x: 55, y: 50 },   // Desert Ruins - middle right
  { x: 65, y: 38 },   // Jungle Challenge - up right
  { x: 70, y: 25 },   // Ice Cavern - top right
  { x: 60, y: 15 },   // Mushroom Forest - top middle
  { x: 45, y: 12 },   // Lava Volcano - peak
  { x: 30, y: 18 },   // Neon City - top left
  { x: 20, y: 30 },   // Underwater Temple - left side
  { x: 15, y: 45 },   // Space Station - back to left
];

// Pre-generated star positions (50 stars)
const STAR_POSITIONS = generateStarPositions(50);

export function WorldMap({ onSelectLevel, currentLevelId }: WorldMapProps) {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  // Get completed levels from store
  const completedLevels = useGameStore((state) => state.completedLevels || []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(2, prev * delta)));
  };

  const getLevelStatus = (index: number) => {
    const level = LEVEL_REGISTRY[index];
    const isCompleted = completedLevels.includes(level.level.id);
    const isCurrent = level.level.id === currentLevelId;

    // Unlock levels progressively
    const previousCompleted = index === 0 || completedLevels.includes(LEVEL_REGISTRY[index - 1].level.id);
    const isUnlocked = index === 0 || previousCompleted;

    return { isCompleted, isUnlocked, isCurrent };
  };

  const getThemeColor = (levelId: string) => {
    const colorMap: Record<string, string> = {
      green_fields: '#7FBF7F',
      unicorn_castle: '#FFB6C1',
      sky_islands: '#87CEEB',
      desert_ruins: '#D2691E',
      jungle_challenge: '#228B22',
      ice_cavern: '#4DABF7',
      mushroom_forest: '#A855F7',
      lava_volcano: '#FF4500',
      neon_city: '#00D9FF',
      underwater_temple: '#1E5A7A',
      space_station: '#4A5568',
    };
    return colorMap[levelId] || '#888888';
  };

  const getThemeEmoji = (levelId: string) => {
    const emojiMap: Record<string, string> = {
      green_fields: '🌿',
      unicorn_castle: '🦄',
      sky_islands: '☁️',
      desert_ruins: '🏜️',
      jungle_challenge: '🌴',
      ice_cavern: '❄️',
      mushroom_forest: '🍄',
      lava_volcano: '🌋',
      neon_city: '🌆',
      underwater_temple: '🌊',
      space_station: '🚀',
    };
    return emojiMap[levelId] || '🎮';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden z-50">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STAR_POSITIONS.map((star, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 drop-shadow-2xl animate-float">
          🗺️ Adventure Map 🗺️
        </h1>
        <p className="text-center text-purple-200 mt-2 text-lg">
          Choose your path through the Animal Obby!
        </p>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-8 right-8 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          className="bg-purple-600 hover:bg-purple-700 text-white w-12 h-12 rounded-lg font-bold text-xl border-2 border-purple-400 shadow-lg"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
          className="bg-purple-600 hover:bg-purple-700 text-white w-12 h-12 rounded-lg font-bold text-xl border-2 border-purple-400 shadow-lg"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
          className="bg-purple-600 hover:bg-purple-700 text-white w-12 h-12 rounded-lg font-bold text-sm border-2 border-purple-400 shadow-lg"
        >
          ↺
        </button>
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {/* SVG Path connecting levels */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FF69B4" />
                <stop offset="100%" stopColor="#9B59B6" />
              </linearGradient>
            </defs>

            {/* Draw paths between levels */}
            {LEVEL_POSITIONS.map((pos, index) => {
              if (index === LEVEL_POSITIONS.length - 1) return null;
              const nextPos = LEVEL_POSITIONS[index + 1];
              const status = getLevelStatus(index);

              return (
                <g key={`path-${index}`}>
                  {/* Glow effect */}
                  <line
                    x1={`${pos.x}%`}
                    y1={`${pos.y}%`}
                    x2={`${nextPos.x}%`}
                    y2={`${nextPos.y}%`}
                    stroke="url(#pathGradient)"
                    strokeWidth="8"
                    opacity={status.isCompleted ? "0.6" : "0.3"}
                    strokeLinecap="round"
                    filter="blur(4px)"
                  />
                  {/* Main path */}
                  <line
                    x1={`${pos.x}%`}
                    y1={`${pos.y}%`}
                    x2={`${nextPos.x}%`}
                    y2={`${nextPos.y}%`}
                    stroke={status.isCompleted ? "#FFD700" : "#666666"}
                    strokeWidth="4"
                    strokeDasharray={status.isCompleted ? "0" : "10,5"}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>

          {/* Level nodes */}
          {LEVEL_REGISTRY.map((meta, index) => {
            const level = meta.level;
            const pos = LEVEL_POSITIONS[index];
            const status = getLevelStatus(index);
            const isHovered = hoveredLevel === level.id;
            const themeColor = getThemeColor(level.id);

            return (
              <div
                key={level.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
              >
                {/* Node container */}
                <button
                  disabled={!status.isUnlocked}
                  onClick={() => {
                    if (status.isUnlocked) {
                      onSelectLevel(level.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredLevel(level.id)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  className={`
                    relative group pointer-events-auto
                    transition-all duration-300
                    ${status.isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                    ${isHovered && status.isUnlocked ? 'scale-125 z-30' : 'scale-100 z-10'}
                    ${status.isCurrent ? 'z-20' : ''}
                  `}
                >
                  {/* Glow effect */}
                  {(status.isCompleted || status.isCurrent || isHovered) && (
                    <div
                      className="absolute inset-0 rounded-full blur-xl animate-pulse"
                      style={{
                        width: '120%',
                        height: '120%',
                        left: '-10%',
                        top: '-10%',
                        backgroundColor: themeColor,
                        opacity: 0.4,
                      }}
                    />
                  )}

                  {/* Main node circle */}
                  <div
                    className={`
                      relative w-20 h-20 rounded-full border-4 flex items-center justify-center
                      transition-all duration-300
                      ${status.isUnlocked
                        ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                        : 'border-gray-600 opacity-50'
                      }
                      ${status.isCompleted ? 'bg-gradient-to-br from-yellow-300 to-yellow-600' : ''}
                      ${status.isCurrent ? 'animate-bounce' : ''}
                    `}
                    style={{
                      backgroundColor: status.isCompleted ? undefined : status.isUnlocked ? themeColor : '#333333',
                    }}
                  >
                    {/* Level emoji */}
                    <span className="text-4xl">{getThemeEmoji(level.id)}</span>

                    {/* Locked overlay */}
                    {!status.isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🔒</span>
                      </div>
                    )}

                    {/* Completed star */}
                    {status.isCompleted && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 border-2 border-yellow-600">
                        <span className="text-xl">⭐</span>
                      </div>
                    )}

                    {/* Current player indicator */}
                    {status.isCurrent && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <div className="bg-green-500 rounded-full p-1 border-2 border-green-700 animate-bounce">
                          <span className="text-sm">👤</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Level name tooltip */}
                  {(isHovered || status.isCurrent) && (
                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg px-4 py-2 border-2 border-purple-500 shadow-xl">
                        <p className="text-white font-game font-bold text-lg">
                          {level.name}
                        </p>
                        <p className="text-purple-300 text-sm">
                          Difficulty: {'⭐'.repeat(level.difficulty)}
                        </p>
                        {!status.isUnlocked && (
                          <p className="text-red-400 text-sm">🔒 Complete previous level</p>
                        )}
                        {status.isCompleted && (
                          <p className="text-yellow-400 text-sm">✓ Completed!</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Number badge */}
                  <div className="absolute -top-3 -left-3 bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center border-2 border-purple-400 text-white font-bold">
                    {index + 1}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-6 py-3 border-2 border-purple-500">
          <p className="text-purple-200 text-sm">
            🖱️ Drag to pan • 🔍 Scroll to zoom • Click a level to start!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
