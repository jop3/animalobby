import { useRef } from 'react';
import { Player } from '../player/Player';
import { CameraRig } from './CameraRig';
import { LevelLoader } from '../level/LevelLoader';
import { LevelDefinition } from '../../types/level.types';

/**
 * Scene - Main game scene
 * Renders player, camera, and level entities
 */
interface SceneProps {
  level: LevelDefinition | null;
}

export function Scene({ level }: SceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  if (!level) return null;

  return (
    <>
      {/* Camera follows player */}
      <CameraRig target={playerRef} />

      {/* Player */}
      <Player ref={playerRef} />

      {/* Load level from JSON */}
      <LevelLoader level={level} />
    </>
  );
}
