import { describe, it, expect } from 'vitest';
import { getPart } from '../data/animalParts';
import { Loadout } from '../types/game.types';

// Replicate the stat calculation logic from Player.tsx
function calculatePlayerStats(loadout: Loadout) {
  const BASE_SPEED = 5;
  const BASE_JUMP = 10;

  let speedMod = 0;
  let jumpMod = 0;
  let defense = 0;
  let canDoubleJump = false;

  Object.values(loadout).forEach((partId) => {
    if (!partId) return;
    const part = getPart(partId);
    if (!part) return;

    const { statModifier, ability } = part;

    speedMod += statModifier.speed || 0;
    jumpMod += statModifier.jumpForce || 0;
    defense += statModifier.defense || 0;

    if (ability === 'double_jump') {
      canDoubleJump = true;
    }
  });

  return {
    speed: BASE_SPEED * (1 + speedMod),
    jumpForce: BASE_JUMP * (1 + jumpMod),
    defense,
    canDoubleJump,
  };
}

describe('Player Stats Calculations', () => {
  describe('Base Stats', () => {
    it('should have correct base stats with default loadout', () => {
      const loadout: Loadout = {
        head: 'default_head',
        body: 'default_body',
        legs: 'default_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.speed).toBe(5); // BASE_SPEED
      expect(stats.jumpForce).toBe(10); // BASE_JUMP
      expect(stats.defense).toBe(0);
      expect(stats.canDoubleJump).toBe(false);
    });
  });

  describe('Speed Calculations', () => {
    it('should increase speed with cheetah legs', () => {
      const loadout: Loadout = {
        head: 'default_head',
        body: 'default_body',
        legs: 'cheetah_legs', // +25% speed
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.speed).toBe(5 * 1.25); // 6.25
    });

    it('should stack speed bonuses', () => {
      const loadout: Loadout = {
        head: 'fox_head', // +5% speed
        body: 'cheetah_body', // +20% speed
        legs: 'cheetah_legs', // +25% speed
      };

      const stats = calculatePlayerStats(loadout);

      // Total: 1 + 0.05 + 0.20 + 0.25 = 1.50 multiplier
      expect(stats.speed).toBeCloseTo(5 * 1.5, 2); // 7.5
    });

    it('should apply speed penalties', () => {
      const loadout: Loadout = {
        head: 'default_head',
        body: 'turtle_body', // -10% speed
        legs: 'default_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.speed).toBe(5 * 0.9); // 4.5
    });

    it('should calculate max speed build', () => {
      const loadout: Loadout = {
        head: 'fox_head', // +5% speed
        body: 'cheetah_body', // +20% speed
        legs: 'ostrich_legs', // +30% speed
      };

      const stats = calculatePlayerStats(loadout);

      // Total: 1 + 0.05 + 0.20 + 0.30 = 1.55 multiplier
      expect(stats.speed).toBeCloseTo(5 * 1.55, 2); // 7.75
    });
  });

  describe('Jump Calculations', () => {
    it('should increase jump with frog legs', () => {
      const loadout: Loadout = {
        head: 'default_head',
        body: 'default_body',
        legs: 'frog_legs', // +25% jump
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.jumpForce).toBe(10 * 1.25); // 12.5
    });

    it('should stack jump bonuses', () => {
      const loadout: Loadout = {
        head: 'owl_head', // +15% jump
        body: 'gorilla_body', // +15% jump
        legs: 'frog_legs', // +25% jump
      };

      const stats = calculatePlayerStats(loadout);

      // Total: 1 + 0.15 + 0.15 + 0.25 = 1.55 multiplier
      expect(stats.jumpForce).toBeCloseTo(10 * 1.55, 2); // 15.5
    });

    it('should calculate max jump build', () => {
      const loadout: Loadout = {
        head: 'owl_head', // +15% jump
        body: 'gorilla_body', // +15% jump
        legs: 'grasshopper_legs', // +35% jump
      };

      const stats = calculatePlayerStats(loadout);

      // Total: 1 + 0.15 + 0.15 + 0.35 = 1.65 multiplier
      expect(stats.jumpForce).toBeCloseTo(10 * 1.65, 2); // 16.5
    });
  });

  describe('Defense Calculations', () => {
    it('should add defense from turtle body', () => {
      const loadout: Loadout = {
        head: 'default_head',
        body: 'turtle_body', // +1 defense
        legs: 'default_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.defense).toBe(1);
    });

    it('should stack defense bonuses', () => {
      const loadout: Loadout = {
        head: 'wolf_head', // +0.5 defense
        body: 'bear_body', // +1.5 defense
        legs: 'default_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.defense).toBeCloseTo(2, 2);
    });
  });

  describe('Abilities', () => {
    it('should grant double jump with grasshopper legs', () => {
      const loadout: Loadout = {
        head: 'default_head',
        body: 'default_body',
        legs: 'grasshopper_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.canDoubleJump).toBe(true);
    });

    it('should not have double jump without grasshopper legs', () => {
      const loadout: Loadout = {
        head: 'eagle_head',
        body: 'turtle_body',
        legs: 'cheetah_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.canDoubleJump).toBe(false);
    });
  });

  describe('Balanced Builds', () => {
    it('should support speed-focused build', () => {
      const loadout: Loadout = {
        head: 'fox_head',
        body: 'cheetah_body',
        legs: 'ostrich_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.speed).toBeGreaterThan(7);
      expect(stats.defense).toBeLessThan(0); // Speed builds sacrifice defense
    });

    it('should support defense-focused build', () => {
      const loadout: Loadout = {
        head: 'wolf_head',
        body: 'bear_body',
        legs: 'default_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.defense).toBeGreaterThanOrEqual(2);
      expect(stats.speed).toBeLessThan(5); // Defense builds are slower
    });

    it('should support jump-focused build', () => {
      const loadout: Loadout = {
        head: 'owl_head',
        body: 'gorilla_body',
        legs: 'grasshopper_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.jumpForce).toBeGreaterThan(15);
      expect(stats.canDoubleJump).toBe(true);
    });

    it('should support balanced build', () => {
      const loadout: Loadout = {
        head: 'rabbit_head', // +10% jump, +5% speed
        body: 'monkey_body', // +10% jump, +10% speed
        legs: 'kangaroo_legs', // +15% jump, +15% speed
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.speed).toBeCloseTo(5 * 1.30, 2); // 6.5
      expect(stats.jumpForce).toBeCloseTo(10 * 1.35, 2); // 13.5
    });
  });

  describe('Trade-offs', () => {
    it('should slow down with heavy armor', () => {
      const loadout: Loadout = {
        head: 'default_head',
        body: 'bear_body', // +1.5 defense, -15% speed
        legs: 'default_legs',
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.speed).toBeLessThan(5);
      expect(stats.defense).toBeGreaterThan(1);
    });

    it('should be fragile with speed build', () => {
      const loadout: Loadout = {
        head: 'default_head',
        body: 'cheetah_body', // +20% speed, -0.5 defense
        legs: 'cheetah_legs', // +25% speed
      };

      const stats = calculatePlayerStats(loadout);

      expect(stats.speed).toBeGreaterThan(7);
      expect(stats.defense).toBe(-0.5); // Negative defense
    });
  });
});
