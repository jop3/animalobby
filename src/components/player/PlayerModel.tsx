import { useMemo } from 'react';
import { Group } from 'three';
import { Loadout } from '../../types/game.types';
import { VOXEL_MODELS, createVoxelGroup } from '../../utils/voxelBuilder';

interface PlayerModelProps {
  loadout: Loadout;
}

export function PlayerModel({ loadout }: PlayerModelProps) {
  // Build the player model based on equipped parts
  const playerModel = useMemo(() => {
    const group = new Group();

    // Head (positioned on top)
    const headModel = loadout.head
      ? VOXEL_MODELS[loadout.head.replace('_', '_')] || VOXEL_MODELS.human_head
      : VOXEL_MODELS.human_head;

    const head = createVoxelGroup(headModel);
    head.position.set(0, 1.2, 0);
    group.add(head);

    // Body (positioned in middle)
    const bodyModel = loadout.body
      ? VOXEL_MODELS[loadout.body.replace('_', '_')] || VOXEL_MODELS.human_body
      : VOXEL_MODELS.human_body;

    const body = createVoxelGroup(bodyModel);
    body.position.set(0, 0.3, 0);
    group.add(body);

    // Legs (positioned at bottom)
    const legsModel = loadout.legs
      ? VOXEL_MODELS[loadout.legs.replace('_', '_')] || VOXEL_MODELS.human_legs
      : VOXEL_MODELS.human_legs;

    const legs = createVoxelGroup(legsModel);
    legs.position.set(0, -0.5, 0);
    group.add(legs);

    return group;
  }, [loadout]);

  return <primitive object={playerModel} />;
}
