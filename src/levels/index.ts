import { LevelDefinition } from '../types/level.types';
import greenFieldsData from './green-fields.json';
import parkourChallengeData from './parkour-challenge.json';

// Import and cast JSON to LevelDefinition type
export const GREEN_FIELDS = greenFieldsData as LevelDefinition;
export const PARKOUR_CHALLENGE = parkourChallengeData as LevelDefinition;

// All available levels
export const LEVELS: Record<string, LevelDefinition> = {
  green_fields: GREEN_FIELDS,
  parkour_challenge: PARKOUR_CHALLENGE,
};

// Get level by ID
export function getLevel(levelId: string): LevelDefinition | null {
  return LEVELS[levelId] || null;
}

// List all level IDs
export function getLevelIds(): string[] {
  return Object.keys(LEVELS);
}

// Load level from JSON string (useful for LLM-generated levels)
export function loadLevelFromJSON(jsonString: string): LevelDefinition {
  try {
    const level = JSON.parse(jsonString) as LevelDefinition;

    // Basic validation
    if (!level.id || !level.name || !level.spawnPoint || !level.entities) {
      throw new Error('Invalid level format: missing required fields');
    }

    return level;
  } catch (error) {
    console.error('Failed to load level from JSON:', error);
    throw error;
  }
}

// Validate level definition
export function validateLevel(level: LevelDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!level.id) errors.push('Missing required field: id');
  if (!level.name) errors.push('Missing required field: name');
  if (!level.spawnPoint || level.spawnPoint.length !== 3) {
    errors.push('Invalid spawnPoint: must be [x, y, z]');
  }
  if (!level.entities || !Array.isArray(level.entities)) {
    errors.push('Invalid entities: must be an array');
  }
  if (!level.theme || !level.theme.skyColor) {
    errors.push('Invalid theme: must have skyColor');
  }

  // Validate difficulty
  if (level.difficulty < 1 || level.difficulty > 5) {
    errors.push('Invalid difficulty: must be 1-5');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
