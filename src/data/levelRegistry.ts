import { LevelDefinition } from '../types/level.types';
import greenFieldsData from '../levels/green-fields.json';
import jungleChallengeData from '../levels/jungle-challenge.json';
import skyIslandsData from '../levels/sky-islands.json';

// Cast JSON imports to LevelDefinition type
const greenFields = greenFieldsData as LevelDefinition;
const jungleChallenge = jungleChallengeData as LevelDefinition;
const skyIslands = skyIslandsData as LevelDefinition;

export interface LevelMetadata {
  level: LevelDefinition;
  thumbnail?: string;
  unlocked: boolean;
}

export const LEVEL_REGISTRY: LevelMetadata[] = [
  {
    level: greenFields,
    unlocked: true, // First level always unlocked
  },
  {
    level: skyIslands,
    unlocked: true,
  },
  {
    level: jungleChallenge,
    unlocked: true,
  },
];

export function getLevelById(id: string): LevelDefinition | null {
  const found = LEVEL_REGISTRY.find((meta) => meta.level.id === id);
  return found ? found.level : null;
}

export function getLevelByIndex(index: number): LevelDefinition | null {
  if (index < 0 || index >= LEVEL_REGISTRY.length) return null;
  return LEVEL_REGISTRY[index].level;
}

export function getNextLevel(currentLevelId: string): LevelDefinition | null {
  const currentIndex = LEVEL_REGISTRY.findIndex((meta) => meta.level.id === currentLevelId);
  if (currentIndex === -1 || currentIndex >= LEVEL_REGISTRY.length - 1) return null;
  return LEVEL_REGISTRY[currentIndex + 1].level;
}

export function getLevelIndex(levelId: string): number {
  return LEVEL_REGISTRY.findIndex((meta) => meta.level.id === levelId);
}
