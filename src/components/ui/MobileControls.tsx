import { useEffect, useRef, useState } from 'react';
import nipplejs, { JoystickManager } from 'nipplejs';
import { useMobile } from '../../hooks/useMobile';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onJump: () => void;
  onSprint: (active: boolean) => void;
}

export function MobileControls({ onMove, onJump, onSprint }: MobileControlsProps) {
  const isMobile = useMobile();
  const joystickZoneRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef<JoystickManager | null>(null);
  const [isSprintActive, setIsSprintActive] = useState(false);

  useEffect(() => {
    if (!isMobile || !joystickZoneRef.current) return;

    // Create the joystick
    const manager = nipplejs.create({
      zone: joystickZoneRef.current,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'rgba(255, 255, 255, 0.5)',
      size: 120,
    });

    joystickRef.current = manager;

    // Handle joystick movement
    manager.on('move', (evt, data) => {
      if (data.vector) {
        // Convert to game coordinates (forward/back, left/right)
        const x = data.vector.x; // -1 to 1
        const y = -data.vector.y; // -1 to 1 (inverted)
        onMove(x, y);
      }
    });

    manager.on('end', () => {
      onMove(0, 0);
    });

    return () => {
      manager.destroy();
    };
  }, [isMobile, onMove]);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Left Joystick */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickZoneRef}
          className="w-32 h-32 rounded-full bg-black/30 border-4 border-white/20"
        />
      </div>

      {/* Right Buttons */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-4 pointer-events-auto">
        {/* Jump Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="w-20 h-20 rounded-full bg-green-500/80 border-4 border-green-700 shadow-lg active:bg-green-600 flex items-center justify-center"
        >
          <span className="text-3xl font-game text-white">↑</span>
        </button>

        {/* Sprint Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            setIsSprintActive(true);
            onSprint(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setIsSprintActive(false);
            onSprint(false);
          }}
          className={`w-20 h-20 rounded-full border-4 shadow-lg flex items-center justify-center transition-all ${
            isSprintActive
              ? 'bg-yellow-600/80 border-yellow-800'
              : 'bg-yellow-500/80 border-yellow-700'
          }`}
        >
          <span className="text-2xl font-game text-white">⚡</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-2 rounded-chunky pointer-events-none">
        <p className="text-white font-game text-sm text-center">
          🕹️ Move | ↑ Jump | ⚡ Sprint
        </p>
      </div>
    </div>
  );
}
