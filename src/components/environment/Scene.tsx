import { useRef } from 'react';
import { RigidBodyApi } from '@react-three/rapier';
import { Player } from '../player/Player';
import { CameraRig } from './CameraRig';
import { Platform } from './Platform';

export function Scene() {
  const playerRef = useRef<RigidBodyApi>(null);

  return (
    <>
      {/* Camera follows player */}
      <CameraRig target={playerRef} />

      {/* Player */}
      <Player ref={playerRef} />

      {/* Test platforms */}
      <Platform position={[0, 0, 0]} size={[10, 0.5, 10]} color="#7FBF7F" />
      <Platform position={[8, 1, 0]} size={[4, 0.5, 4]} color="#FFD700" />
      <Platform position={[15, 2, 3]} size={[4, 0.5, 4]} color="#FF6347" />
      <Platform position={[20, 4, -2]} size={[6, 0.5, 6]} color="#4A90E2" />
    </>
  );
}
