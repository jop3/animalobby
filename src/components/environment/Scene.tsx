import { useRef } from 'react';
import { RigidBodyApi } from '@react-three/rapier';
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
  const playerRef = useRef<RigidBodyApi>(null);

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
