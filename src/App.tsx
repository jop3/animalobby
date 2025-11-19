import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls } from '@react-three/drei';
import { Suspense } from 'react';
import { useGameStore } from './store/useGameStore';
import { Scene } from './components/environment/Scene';

// Components (will be created)
// import { HUD } from './components/ui/HUD';
// import { AnimalLab } from './components/ui/AnimalLab';

// Keyboard controls map
export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  sprint = 'sprint',
}

function App() {
  const isPaused = useGameStore((state) => state.isPaused);
  const quality = useGameStore((state) => state.quality);

  return (
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
              <Scene />
            </Physics>

            {/* Post-processing will go here */}
          </Suspense>
        </Canvas>
      </KeyboardControls>

      {/* UI Overlays */}
      {/* <HUD /> */}
      {/* <AnimalLab /> */}

      {/* Dev info */}
      <div className="absolute top-4 left-4 text-white font-game text-sm bg-black/50 p-2 rounded">
        Animal Obby - MVP
        <br />
        Quality: {quality}
      </div>
    </div>
  );
}

export default App;
