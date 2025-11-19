import { useRef } from 'react';
import { RigidBodyApi } from '@react-three/rapier';
import { Player } from '../player/Player';
import { CameraRig } from './CameraRig';
import { Platform } from './Platform';
import { Coin } from '../collectibles/Coin';
import { Checkpoint } from '../collectibles/Checkpoint';
import { Spike } from '../hazards/Spike';
import { Lava } from '../hazards/Lava';
import { RotatingHammer } from '../hazards/RotatingHammer';

export function Scene() {
  const playerRef = useRef<RigidBodyApi>(null);

  return (
    <>
      {/* Camera follows player */}
      <CameraRig target={playerRef} />

      {/* Player */}
      <Player ref={playerRef} />

      {/* Tutorial Level - Green Fields Theme */}

      {/* Starting platform with checkpoint */}
      <Platform position={[0, 0, 0]} size={[10, 0.5, 10]} color="#7FBF7F" />
      <Checkpoint id="checkpoint_1" position={[0, 1, 0]} />

      {/* Some coins to collect */}
      <Coin id="coin_1" position={[3, 1.5, 0]} type="speed" />
      <Coin id="coin_2" position={[5, 1.5, 2]} type="gravity" />
      <Coin id="coin_3" position={[-3, 1.5, -2]} type="speed" />

      {/* Platform with spikes */}
      <Platform position={[12, 1, 0]} size={[6, 0.5, 4]} color="#D4A574" />
      <Spike position={[10, 1.5, 0]} size={0.8} />
      <Spike position={[14, 1.5, 0]} size={0.8} />
      <Coin id="coin_4" position={[12, 2.5, 0]} type="speed" />

      {/* Jump gap */}
      <Platform position={[22, 2, 2]} size={[4, 0.5, 4]} color="#FFD700" />
      <Coin id="coin_5" position={[22, 3, 2]} type="gravity" />

      {/* Lava pit */}
      <Lava position={[30, 1, 0]} size={[6, 0.3, 8]} />

      {/* Platform after lava */}
      <Platform position={[38, 3, 0]} size={[5, 0.5, 5]} color="#FF6347" />
      <Checkpoint id="checkpoint_2" position={[38, 3.5, 0]} />
      <Coin id="coin_6" position={[38, 4.5, 0]} type="speed" />

      {/* Rotating hammer obstacle */}
      <Platform position={[46, 3, 0]} size={[8, 0.5, 6]} color="#8B7355" />
      <RotatingHammer position={[46, 5, 0]} rotationSpeed={1.5} hammerLength={3} />
      <Coin id="coin_7" position={[46, 4, 3]} type="gravity" />
      <Coin id="coin_8" position={[46, 4, -3]} type="speed" />

      {/* High platform with multiple jumps */}
      <Platform position={[54, 5, 0]} size={[3, 0.5, 3]} color="#4A90E2" />
      <Platform position={[58, 6.5, 2]} size={[3, 0.5, 3]} color="#9B59B6" />
      <Platform position={[62, 8, -1]} size={[3, 0.5, 3]} color="#E74C3C" />
      <Coin id="coin_9" position={[54, 6, 0]} type="speed" />
      <Coin id="coin_10" position={[58, 7.5, 2]} type="gravity" />
      <Coin id="coin_11" position={[62, 9, -1]} type="speed" />

      {/* Final platform */}
      <Platform position={[68, 10, 0]} size={[8, 0.5, 8]} color="#2ECC71" />
      <Checkpoint id="checkpoint_3" position={[68, 10.5, 0]} />

      {/* Victory coins */}
      <Coin id="coin_12" position={[66, 11.5, 0]} type="gravity" />
      <Coin id="coin_13" position={[68, 12.5, 0]} type="speed" />
      <Coin id="coin_14" position={[70, 11.5, 0]} type="gravity" />

      {/* Death plane (large ground far below) */}
      <Platform position={[35, -20, 0]} size={[200, 1, 200]} color="#34495E" />
    </>
  );
}
