import { useMemo } from 'react';
import { Group } from 'three';
import { Loadout } from '../../types/game.types';
import { VOXEL_MODELS, createVoxelGroup } from '../../utils/voxelBuilder';
import { useGameStore } from '../../store/useGameStore';

interface PlayerModelProps {
  loadout: Loadout;
}

export function PlayerModel({ loadout }: PlayerModelProps) {
  const characterBase = useGameStore((state) => state.characterBase);

  // Build the player model based on equipped parts
  const playerModel = useMemo(() => {
    const group = new Group();

    // Helper function to get the actual model ID
    // If it's a default part, use the character base, otherwise use the part ID directly
    const getModelId = (partId: string | null, partType: string): string => {
      if (!partId || partId === `default_${partType}`) {
        return `${characterBase}_${partType}`;
      }
      return partId;
    };

    // Head (positioned on top)
    const headModelId = getModelId(loadout.head, 'head');
    const headModel = VOXEL_MODELS[headModelId] || VOXEL_MODELS.human_head;

    const head = createVoxelGroup(headModel);
    head.position.set(0, 1.2, 0);
    group.add(head);

    // Body (positioned in middle)
    const bodyModelId = getModelId(loadout.body, 'body');
    const bodyModel = VOXEL_MODELS[bodyModelId] || VOXEL_MODELS.human_body;

    const body = createVoxelGroup(bodyModel);
    body.position.set(0, 0.3, 0);
    group.add(body);

    // Legs (positioned at bottom)
    const legsModelId = getModelId(loadout.legs, 'legs');
    const legsModel = VOXEL_MODELS[legsModelId] || VOXEL_MODELS.human_legs;

    const legs = createVoxelGroup(legsModel);
    legs.position.set(0, -0.5, 0);
    group.add(legs);

    return group;
  }, [loadout, characterBase]);

  return <primitive object={playerModel} />;
}
