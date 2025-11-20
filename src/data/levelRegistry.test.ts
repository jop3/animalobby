import { describe, it, expect } from 'vitest';
import { getLevelById, getLevelByIndex, getNextLevel, getLevelIndex, LEVEL_REGISTRY } from './levelRegistry';

describe('Level Registry', () => {
  describe('Level Registry Structure', () => {
    it('should have multiple levels', () => {
      expect(LEVEL_REGISTRY.length).toBeGreaterThan(0);
    });

    it('should have first level as green fields', () => {
      expect(LEVEL_REGISTRY[0].level.id).toBe('green_fields');
    });

    it('should have unicorn castle as second level', () => {
      expect(LEVEL_REGISTRY[1].level.id).toBe('unicorn_castle');
    });

    it('should have all levels unlocked', () => {
      const allUnlocked = LEVEL_REGISTRY.every(meta => meta.unlocked === true);
      expect(allUnlocked).toBe(true);
    });
  });

  describe('getLevelById', () => {
    it('should get level by ID', () => {
      const level = getLevelById('green_fields');

      expect(level).toBeDefined();
      expect(level?.id).toBe('green_fields');
      expect(level?.name).toBeDefined();
    });

    it('should get unicorn castle level', () => {
      const level = getLevelById('unicorn_castle');

      expect(level).toBeDefined();
      expect(level?.id).toBe('unicorn_castle');
      expect(level?.name).toContain('Unicorn');
    });

    it('should return null for non-existent level', () => {
      const level = getLevelById('nonexistent_level');
      expect(level).toBeNull();
    });

    it('should get all registered levels by ID', () => {
      const levelIds = [
        'green_fields',
        'unicorn_castle',
        'sky_islands',
        'desert_ruins',
        'jungle_challenge',
        'ice_cavern',
        'mushroom_forest',
        'lava_volcano',
        'neon_city',
        'underwater_temple',
        'space_station',
      ];

      levelIds.forEach(id => {
        const level = getLevelById(id);
        expect(level).toBeDefined();
        expect(level?.id).toBe(id);
      });
    });
  });

  describe('getLevelByIndex', () => {
    it('should get first level by index 0', () => {
      const level = getLevelByIndex(0);

      expect(level).toBeDefined();
      expect(level?.id).toBe('green_fields');
    });

    it('should get second level by index 1', () => {
      const level = getLevelByIndex(1);

      expect(level).toBeDefined();
      expect(level?.id).toBe('unicorn_castle');
    });

    it('should return null for negative index', () => {
      const level = getLevelByIndex(-1);
      expect(level).toBeNull();
    });

    it('should return null for out-of-bounds index', () => {
      const level = getLevelByIndex(999);
      expect(level).toBeNull();
    });

    it('should get last level', () => {
      const lastIndex = LEVEL_REGISTRY.length - 1;
      const level = getLevelByIndex(lastIndex);

      expect(level).toBeDefined();
      expect(level?.id).toBe('space_station');
    });
  });

  describe('getNextLevel', () => {
    it('should get next level after green fields', () => {
      const nextLevel = getNextLevel('green_fields');

      expect(nextLevel).toBeDefined();
      expect(nextLevel?.id).toBe('unicorn_castle');
    });

    it('should get next level after unicorn castle', () => {
      const nextLevel = getNextLevel('unicorn_castle');

      expect(nextLevel).toBeDefined();
      expect(nextLevel?.id).toBe('sky_islands');
    });

    it('should return null after last level', () => {
      const nextLevel = getNextLevel('space_station');
      expect(nextLevel).toBeNull();
    });

    it('should return null for non-existent level', () => {
      const nextLevel = getNextLevel('nonexistent_level');
      expect(nextLevel).toBeNull();
    });
  });

  describe('getLevelIndex', () => {
    it('should get index of green fields', () => {
      const index = getLevelIndex('green_fields');
      expect(index).toBe(0);
    });

    it('should get index of unicorn castle', () => {
      const index = getLevelIndex('unicorn_castle');
      expect(index).toBe(1);
    });

    it('should get index of last level', () => {
      const index = getLevelIndex('space_station');
      expect(index).toBe(LEVEL_REGISTRY.length - 1);
    });

    it('should return -1 for non-existent level', () => {
      const index = getLevelIndex('nonexistent_level');
      expect(index).toBe(-1);
    });
  });

  describe('Level Progression', () => {
    it('should allow progression through all levels', () => {
      let currentLevelId = 'green_fields';
      let count = 0;
      const maxLevels = LEVEL_REGISTRY.length;

      while (currentLevelId && count < maxLevels + 1) {
        const nextLevel = getNextLevel(currentLevelId);
        if (!nextLevel) break;
        currentLevelId = nextLevel.id;
        count++;
      }

      // Should be able to progress through all but the last level
      expect(count).toBe(maxLevels - 1);
    });

    it('should have consistent index and next level', () => {
      for (let i = 0; i < LEVEL_REGISTRY.length - 1; i++) {
        const currentLevel = getLevelByIndex(i);
        const nextLevel = getLevelByIndex(i + 1);
        const nextLevelByFunction = getNextLevel(currentLevel!.id);

        expect(nextLevelByFunction?.id).toBe(nextLevel?.id);
      }
    });
  });

  describe('Level Properties', () => {
    it('should have required level properties', () => {
      LEVEL_REGISTRY.forEach(({ level }) => {
        expect(level.id).toBeDefined();
        expect(level.name).toBeDefined();
        expect(level.description).toBeDefined();
        expect(level.spawnPoint).toBeDefined();
        expect(level.entities).toBeDefined();
        expect(Array.isArray(level.entities)).toBe(true);
      });
    });

    it('should have spawn points as 3D coordinates', () => {
      LEVEL_REGISTRY.forEach(({ level }) => {
        expect(level.spawnPoint).toHaveLength(3);
        expect(typeof level.spawnPoint[0]).toBe('number');
        expect(typeof level.spawnPoint[1]).toBe('number');
        expect(typeof level.spawnPoint[2]).toBe('number');
      });
    });

    it('should have difficulty ratings', () => {
      LEVEL_REGISTRY.forEach(({ level }) => {
        expect(level.difficulty).toBeDefined();
        expect(typeof level.difficulty).toBe('number');
        expect(level.difficulty).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have theme colors', () => {
      LEVEL_REGISTRY.forEach(({ level }) => {
        expect(level.theme).toBeDefined();
        expect(level.theme.skyColor).toBeDefined();
        expect(level.theme.skyColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('Unicorn Castle Level', () => {
    it('should have magical theme', () => {
      const level = getLevelById('unicorn_castle');

      expect(level?.name).toContain('Unicorn');
      expect(level?.description).toBeDefined();
      expect(level?.theme.skyColor).toBeDefined();
    });

    it('should have entities', () => {
      const level = getLevelById('unicorn_castle');

      expect(level?.entities).toBeDefined();
      expect(level?.entities.length).toBeGreaterThan(0);
    });

    it('should have spawn point', () => {
      const level = getLevelById('unicorn_castle');

      expect(level?.spawnPoint).toBeDefined();
      expect(level?.spawnPoint).toHaveLength(3);
    });
  });
});
