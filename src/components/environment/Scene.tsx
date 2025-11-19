import { useRef } from 'react';
import { Player } from '../player/Player';
import { CameraRig } from './CameraRig';
import { LevelLoader } from '../level/LevelLoader';
import { GREEN_FIELDS } from '../../levels';

/**
 * Scene - Main game scene
 * Loads levels from JSON and renders player + camera
 *
 * To load a different level, import it from '../../levels' and pass to LevelLoader
 * Example: import { PARKOUR_CHALLENGE } from '../../levels';
 */
export function Scene() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  // TODO: Make this dynamic based on game state
  // For now, hardcoded to GREEN_FIELDS
  const currentLevel = GREEN_FIELDS;

  return (
    <>
      {/* Camera follows player */}
      <CameraRig target={playerRef} />

      {/* Player */}
      <Player ref={playerRef} />

      {/* Load level from JSON */}
      <LevelLoader level={currentLevel} />
    </>
  );
}
