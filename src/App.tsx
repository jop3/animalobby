import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { Scene } from './components/environment/Scene';
import { HUD } from './components/ui/HUD';
import { PostProcessing } from './components/effects/PostProcessing';
import { WebGLFallback } from './components/ui/WebGLFallback';
import { detectWebGL } from './utils/webglDetect';
import { GameManager } from './components/GameManager';

// Keyboard controls map
export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
  jump: 'jump',
  sprint: 'sprint',
} as const;

function App() {
  const isPaused = useGameStore((state) => state.isPaused);
  const quality = useGameStore((state) => state.quality);
  const [webglStatus, setWebglStatus] = useState<{ available: boolean; error?: string } | null>(null);

  useEffect(() => {
    setWebglStatus(detectWebGL());
  }, []);

  // Show fallback if WebGL is not available
  if (webglStatus && !webglStatus.available) {
    return <WebGLFallback error={webglStatus.error || 'WebGL is not available'} />;
  }

  return (
    <GameManager>
      {(level) => (
        <div className="w-full h-full">
          <KeyboardControls
            map={[
              { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
              { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
              { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
              { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
              { name: Controls.jump, keys: ['Space'] },
              { name: Controls.sprint, keys: ['ShiftLeft', 'ShiftRight'] },
            ]}
          >
            <Canvas
              shadows={quality !== 'low'}
              camera={{ position: [0, 5, 10], fov: 60 }}
              gl={{
                antialias: quality === 'high',
                powerPreference: 'high-performance',
              }}
            >
              <Suspense fallback={null}>
                <color attach="background" args={['#87CEEB']} />

                {/* Lighting */}
                <ambientLight intensity={0.6} color="#B3D9FF" />
                <directionalLight
                  position={[10, 20, 10]}
                  intensity={0.8}
                  castShadow={quality !== 'low'}
                  shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
                  shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
                  shadow-camera-far={50}
                  shadow-camera-left={-20}
                  shadow-camera-right={20}
                  shadow-camera-top={20}
                  shadow-camera-bottom={-20}
                />

                <Physics paused={isPaused} gravity={[0, -20, 0]}>
                  <Scene level={level} />
                </Physics>

                {/* Post-processing effects */}
                <PostProcessing />
              </Suspense>
            </Canvas>
          </KeyboardControls>

          {/* UI Overlays */}
          <HUD />
          {/* <AnimalLab /> */}
        </div>
      )}
    </GameManager>
  );
}

export default App;
