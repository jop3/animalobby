import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.getState().reset();
  });

  describe('Coin Collection', () => {
    it('should collect speed coins', () => {
      const { collectCoin, coins } = useGameStore.getState();

      expect(coins.speed).toBe(0);
      collectCoin('speed');
      expect(useGameStore.getState().coins.speed).toBe(1);
      collectCoin('speed');
      expect(useGameStore.getState().coins.speed).toBe(2);
    });

    it('should collect gravity coins', () => {
      const { collectCoin, coins } = useGameStore.getState();

      expect(coins.gravity).toBe(0);
      collectCoin('gravity');
      expect(useGameStore.getState().coins.gravity).toBe(1);
    });

    it('should collect coins independently', () => {
      const { collectCoin } = useGameStore.getState();

      collectCoin('speed');
      collectCoin('speed');
      collectCoin('gravity');

      const state = useGameStore.getState();
      expect(state.coins.speed).toBe(2);
      expect(state.coins.gravity).toBe(1);
    });
  });

  describe('Part Unlocking', () => {
    it('should unlock a new part', () => {
      const { unlockPart, unlockedParts } = useGameStore.getState();

      // shark_head is locked by default
      expect(unlockedParts.includes('shark_head')).toBe(false);

      unlockPart('shark_head');

      expect(useGameStore.getState().unlockedParts.includes('shark_head')).toBe(true);
    });

    it('should not duplicate unlocked parts', () => {
      const { unlockPart } = useGameStore.getState();

      unlockPart('shark_head');
      const countAfterFirst = useGameStore.getState().unlockedParts.filter(p => p === 'shark_head').length;

      unlockPart('shark_head');
      const countAfterSecond = useGameStore.getState().unlockedParts.filter(p => p === 'shark_head').length;

      expect(countAfterFirst).toBe(1);
      expect(countAfterSecond).toBe(1);
    });

    it('should start with default parts unlocked', () => {
      const { unlockedParts } = useGameStore.getState();

      expect(unlockedParts).toContain('default_head');
      expect(unlockedParts).toContain('default_body');
      expect(unlockedParts).toContain('default_legs');
    });

    it('should start with starter animal parts unlocked', () => {
      const { unlockedParts } = useGameStore.getState();

      // Check heads
      expect(unlockedParts).toContain('eagle_head');
      expect(unlockedParts).toContain('fox_head');

      // Check bodies
      expect(unlockedParts).toContain('turtle_body');
      expect(unlockedParts).toContain('gorilla_body');

      // Check legs
      expect(unlockedParts).toContain('cheetah_legs');
      expect(unlockedParts).toContain('frog_legs');
      expect(unlockedParts).toContain('grasshopper_legs');
    });
  });

  describe('Part Equipping', () => {
    it('should equip an unlocked part', () => {
      const { equipPart, currentLoadout } = useGameStore.getState();

      // eagle_head is unlocked by default
      equipPart('eagle_head', 'head');

      expect(useGameStore.getState().currentLoadout.head).toBe('eagle_head');
    });

    it('should not equip a locked part', () => {
      const { equipPart, currentLoadout } = useGameStore.getState();

      const initialHead = currentLoadout.head;

      // shark_head is locked by default
      equipPart('shark_head', 'head');

      // Should remain unchanged
      expect(useGameStore.getState().currentLoadout.head).toBe(initialHead);
    });

    it('should equip parts to different slots', () => {
      const { equipPart } = useGameStore.getState();

      equipPart('eagle_head', 'head');
      equipPart('turtle_body', 'body');
      equipPart('cheetah_legs', 'legs');

      const loadout = useGameStore.getState().currentLoadout;
      expect(loadout.head).toBe('eagle_head');
      expect(loadout.body).toBe('turtle_body');
      expect(loadout.legs).toBe('cheetah_legs');
    });
  });

  describe('Character Base', () => {
    it('should start with human base', () => {
      const { characterBase } = useGameStore.getState();
      expect(characterBase).toBe('human');
    });

    it('should change character base', () => {
      const { setCharacterBase } = useGameStore.getState();

      setCharacterBase('princess');
      expect(useGameStore.getState().characterBase).toBe('princess');

      setCharacterBase('unicorn');
      expect(useGameStore.getState().characterBase).toBe('unicorn');
    });
  });

  describe('Death and Respawn', () => {
    it('should die when not invincible', () => {
      const { die, isDead } = useGameStore.getState();

      expect(isDead).toBe(false);

      die();

      expect(useGameStore.getState().isDead).toBe(true);
    });

    it('should NOT die when invincible', () => {
      const { die, setInvincible, isDead } = useGameStore.getState();

      setInvincible(true);
      expect(useGameStore.getState().isInvincible).toBe(true);

      die();

      // Should still be alive because invincible
      expect(useGameStore.getState().isDead).toBe(false);
    });

    it('should grant invincibility on respawn', () => {
      const { respawn, isInvincible } = useGameStore.getState();

      expect(isInvincible).toBe(false);

      respawn();

      expect(useGameStore.getState().isInvincible).toBe(true);
      expect(useGameStore.getState().isDead).toBe(false);
    });
  });

  describe('Invincibility', () => {
    it('should set invincibility state', () => {
      const { setInvincible, isInvincible } = useGameStore.getState();

      expect(isInvincible).toBe(false);

      setInvincible(true);
      expect(useGameStore.getState().isInvincible).toBe(true);

      setInvincible(false);
      expect(useGameStore.getState().isInvincible).toBe(false);
    });

    it('should start not invincible', () => {
      const { isInvincible } = useGameStore.getState();
      expect(isInvincible).toBe(false);
    });
  });

  describe('Checkpoint System', () => {
    it('should set checkpoint position', () => {
      const { setCheckpoint, checkpointPosition } = useGameStore.getState();

      const newPosition: [number, number, number] = [10, 5, -3];
      setCheckpoint(newPosition, 'checkpoint_1');

      const state = useGameStore.getState();
      expect(state.checkpointPosition).toEqual(newPosition);
      expect(state.lastCheckpointId).toBe('checkpoint_1');
    });

    it('should start at spawn position', () => {
      const { checkpointPosition } = useGameStore.getState();
      expect(checkpointPosition).toEqual([0, 2, 0]);
    });
  });

  describe('Level Management', () => {
    it('should load a level', () => {
      const { loadLevel, currentLevelId } = useGameStore.getState();

      expect(currentLevelId).toBe(null);

      loadLevel('green_fields');

      const state = useGameStore.getState();
      expect(state.currentLevelId).toBe('green_fields');
      expect(state.isDead).toBe(false);
      expect(state.hasWon).toBe(false);
    });

    it('should reset level state on load', () => {
      const { loadLevel, die } = useGameStore.getState();

      // Set some state
      die();
      useGameStore.setState({ hasWon: true, isPaused: true });

      // Load level
      loadLevel('unicorn_castle');

      const state = useGameStore.getState();
      expect(state.isDead).toBe(false);
      expect(state.hasWon).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('should reset level without changing level ID', () => {
      const { loadLevel, resetLevel, die } = useGameStore.getState();

      loadLevel('green_fields');
      die();

      resetLevel();

      const state = useGameStore.getState();
      expect(state.currentLevelId).toBe('green_fields');
      expect(state.isDead).toBe(false);
    });
  });

  describe('Prestige System', () => {
    it('should start at prestige 0', () => {
      const { prestigeLevel } = useGameStore.getState();
      expect(prestigeLevel).toBe(0);
    });

    it('should increment prestige level on reset', () => {
      const { prestigeReset, prestigeLevel } = useGameStore.getState();

      expect(prestigeLevel).toBe(0);

      prestigeReset();
      expect(useGameStore.getState().prestigeLevel).toBe(1);

      useGameStore.getState().prestigeReset();
      expect(useGameStore.getState().prestigeLevel).toBe(2);
    });

    it('should reset coins on prestige', () => {
      const { collectCoin, prestigeReset } = useGameStore.getState();

      collectCoin('speed');
      collectCoin('speed');
      collectCoin('gravity');

      prestigeReset();

      const state = useGameStore.getState();
      expect(state.coins.speed).toBe(0);
      expect(state.coins.gravity).toBe(0);
    });

    it('should keep default parts unlocked after prestige', () => {
      const { prestigeReset, unlockedParts } = useGameStore.getState();

      prestigeReset();

      const newUnlockedParts = useGameStore.getState().unlockedParts;
      expect(newUnlockedParts).toContain('default_head');
      expect(newUnlockedParts).toContain('cheetah_legs');
      expect(newUnlockedParts).toContain('grasshopper_legs');
    });
  });

  describe('Settings', () => {
    it('should toggle sound', () => {
      const { toggleSound, soundEnabled } = useGameStore.getState();

      expect(soundEnabled).toBe(true);

      toggleSound();
      expect(useGameStore.getState().soundEnabled).toBe(false);

      useGameStore.getState().toggleSound();
      expect(useGameStore.getState().soundEnabled).toBe(true);
    });

    it('should toggle music', () => {
      const { toggleMusic, musicEnabled } = useGameStore.getState();

      expect(musicEnabled).toBe(true);

      toggleMusic();
      expect(useGameStore.getState().musicEnabled).toBe(false);
    });

    it('should set quality level', () => {
      const { setQuality, quality } = useGameStore.getState();

      expect(quality).toBe('medium');

      setQuality('high');
      expect(useGameStore.getState().quality).toBe('high');

      useGameStore.getState().setQuality('low');
      expect(useGameStore.getState().quality).toBe('low');
    });

    it('should set paused state', () => {
      const { setPaused, isPaused } = useGameStore.getState();

      expect(isPaused).toBe(false);

      setPaused(true);
      expect(useGameStore.getState().isPaused).toBe(true);

      useGameStore.getState().setPaused(false);
      expect(useGameStore.getState().isPaused).toBe(false);
    });
  });
});
