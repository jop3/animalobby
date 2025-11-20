import { describe, it, expect } from 'vitest';
import { getPart, getPartsByType, getUnlockedParts, ANIMAL_PARTS } from './animalParts';

describe('Animal Parts', () => {
  describe('getPart', () => {
    it('should get a part by ID', () => {
      const part = getPart('cheetah_legs');

      expect(part).toBeDefined();
      expect(part?.id).toBe('cheetah_legs');
      expect(part?.name).toBe('Cheetah Legs');
      expect(part?.type).toBe('legs');
    });

    it('should return undefined for non-existent part', () => {
      const part = getPart('nonexistent_part');
      expect(part).toBeUndefined();
    });

    it('should get default parts', () => {
      const head = getPart('default_head');
      const body = getPart('default_body');
      const legs = getPart('default_legs');

      expect(head?.id).toBe('default_head');
      expect(body?.id).toBe('default_body');
      expect(legs?.id).toBe('default_legs');
    });
  });

  describe('getPartsByType', () => {
    it('should get all head parts', () => {
      const heads = getPartsByType('head');

      expect(heads.length).toBeGreaterThan(0);
      expect(heads.every(part => part.type === 'head')).toBe(true);

      const headIds = heads.map(h => h.id);
      expect(headIds).toContain('default_head');
      expect(headIds).toContain('eagle_head');
      expect(headIds).toContain('fox_head');
    });

    it('should get all body parts', () => {
      const bodies = getPartsByType('body');

      expect(bodies.length).toBeGreaterThan(0);
      expect(bodies.every(part => part.type === 'body')).toBe(true);

      const bodyIds = bodies.map(b => b.id);
      expect(bodyIds).toContain('default_body');
      expect(bodyIds).toContain('turtle_body');
      expect(bodyIds).toContain('gorilla_body');
    });

    it('should get all leg parts', () => {
      const legs = getPartsByType('legs');

      expect(legs.length).toBeGreaterThan(0);
      expect(legs.every(part => part.type === 'legs')).toBe(true);

      const legIds = legs.map(l => l.id);
      expect(legIds).toContain('default_legs');
      expect(legIds).toContain('cheetah_legs');
      expect(legIds).toContain('frog_legs');
      expect(legIds).toContain('grasshopper_legs');
    });
  });

  describe('getUnlockedParts', () => {
    it('should return parts for valid IDs', () => {
      const unlockedIds = ['cheetah_legs', 'eagle_head', 'turtle_body'];
      const parts = getUnlockedParts(unlockedIds);

      expect(parts.length).toBe(3);
      expect(parts.map(p => p.id)).toEqual(unlockedIds);
    });

    it('should filter out invalid IDs', () => {
      const unlockedIds = ['cheetah_legs', 'nonexistent_part', 'eagle_head'];
      const parts = getUnlockedParts(unlockedIds);

      expect(parts.length).toBe(2);
      expect(parts.map(p => p.id)).toEqual(['cheetah_legs', 'eagle_head']);
    });

    it('should return empty array for empty input', () => {
      const parts = getUnlockedParts([]);
      expect(parts).toEqual([]);
    });
  });

  describe('Part Properties', () => {
    it('should have correct stat modifiers for speed parts', () => {
      const cheetahLegs = getPart('cheetah_legs');
      expect(cheetahLegs?.statModifier.speed).toBe(0.25); // +25%

      const ostrichLegs = getPart('ostrich_legs');
      expect(ostrichLegs?.statModifier.speed).toBe(0.30); // +30%
    });

    it('should have correct stat modifiers for jump parts', () => {
      const frogLegs = getPart('frog_legs');
      expect(frogLegs?.statModifier.jumpForce).toBe(0.25); // +25%

      const grasshopperLegs = getPart('grasshopper_legs');
      expect(grasshopperLegs?.statModifier.jumpForce).toBe(0.35); // +35%
    });

    it('should have abilities assigned correctly', () => {
      const grasshopperLegs = getPart('grasshopper_legs');
      expect(grasshopperLegs?.ability).toBe('double_jump');

      const eagleHead = getPart('eagle_head');
      expect(eagleHead?.ability).toBe('glide');

      const turtleBody = getPart('turtle_body');
      expect(turtleBody?.ability).toBe('shield');
    });

    it('should have defense values for defensive parts', () => {
      const turtleBody = getPart('turtle_body');
      expect(turtleBody?.statModifier.defense).toBe(1);

      const bearBody = getPart('bear_body');
      expect(bearBody?.statModifier.defense).toBe(1.5);
    });

    it('should mark default parts as unlocked', () => {
      expect(getPart('default_head')?.unlocked).toBe(true);
      expect(getPart('default_body')?.unlocked).toBe(true);
      expect(getPart('default_legs')?.unlocked).toBe(true);
    });

    it('should mark starter parts as unlocked', () => {
      expect(getPart('eagle_head')?.unlocked).toBe(true);
      expect(getPart('cheetah_legs')?.unlocked).toBe(true);
      expect(getPart('grasshopper_legs')?.unlocked).toBe(true);
      expect(getPart('turtle_body')?.unlocked).toBe(true);
    });

    it('should have negative modifiers for tradeoff parts', () => {
      const turtleBody = getPart('turtle_body');
      expect(turtleBody?.statModifier.speed).toBe(-0.1); // Slower

      const bearBody = getPart('bear_body');
      expect(bearBody?.statModifier.speed).toBe(-0.15); // Even slower
    });
  });

  describe('Part Balance', () => {
    it('should have both positive and negative modifiers', () => {
      const allParts = Object.values(ANIMAL_PARTS);

      const partsWithPositive = allParts.filter(part =>
        (part.statModifier.speed && part.statModifier.speed > 0) ||
        (part.statModifier.jumpForce && part.statModifier.jumpForce > 0)
      );

      const partsWithNegative = allParts.filter(part =>
        (part.statModifier.speed && part.statModifier.speed < 0) ||
        (part.statModifier.jumpForce && part.statModifier.jumpForce < 0)
      );

      expect(partsWithPositive.length).toBeGreaterThan(0);
      expect(partsWithNegative.length).toBeGreaterThan(0);
    });

    it('should have parts for each type', () => {
      const heads = getPartsByType('head');
      const bodies = getPartsByType('body');
      const legs = getPartsByType('legs');

      expect(heads.length).toBeGreaterThanOrEqual(3);
      expect(bodies.length).toBeGreaterThanOrEqual(3);
      expect(legs.length).toBeGreaterThanOrEqual(3);
    });
  });
});
