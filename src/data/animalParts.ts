import { AnimalPart } from '../types/game.types';

export const ANIMAL_PARTS: Record<string, AnimalPart> = {
  // DEFAULT PARTS (Always unlocked)
  default_head: {
    id: 'default_head',
    name: 'Human Head',
    type: 'head',
    statModifier: {},
    unlocked: true,
    description: 'Your regular head. Nothing special.',
    color: '#FFD1A3', // Peach
  },
  default_body: {
    id: 'default_body',
    name: 'Human Body',
    type: 'body',
    statModifier: {},
    unlocked: true,
    description: 'Your regular body. Time to upgrade!',
    color: '#4A90E2', // Blue shirt
  },
  default_legs: {
    id: 'default_legs',
    name: 'Human Legs',
    type: 'legs',
    statModifier: {},
    unlocked: true,
    description: 'Regular legs. Could be faster...',
    color: '#2C3E50', // Dark pants
  },

  // HEAD PARTS
  eagle_head: {
    id: 'eagle_head',
    name: 'Eagle Head',
    type: 'head',
    statModifier: {
      jumpForce: 0.1, // +10% vision/jump arc
    },
    ability: 'glide',
    unlocked: false,
    description: 'Sharp eyes see further. Slight glide when falling.',
    color: '#8B4513', // Brown
  },

  fox_head: {
    id: 'fox_head',
    name: 'Fox Head',
    type: 'head',
    statModifier: {
      speed: 0.05, // +5% speed
    },
    unlocked: false,
    description: 'Cunning and quick-witted.',
    color: '#FF6347', // Orange-red
  },

  // BODY PARTS
  turtle_body: {
    id: 'turtle_body',
    name: 'Turtle Shell',
    type: 'body',
    statModifier: {
      defense: 1, // Absorbs 1 hit
      speed: -0.1, // -10% speed
    },
    ability: 'shield',
    unlocked: false,
    description: 'Protects from one hazard hit. Slows you down.',
    color: '#2ECC71', // Green
  },

  gorilla_body: {
    id: 'gorilla_body',
    name: 'Gorilla Chest',
    type: 'body',
    statModifier: {
      jumpForce: 0.15, // +15% jump
    },
    unlocked: false,
    description: 'Powerful core muscles for higher jumps.',
    color: '#555555', // Dark gray
  },

  // LEG PARTS
  cheetah_legs: {
    id: 'cheetah_legs',
    name: 'Cheetah Legs',
    type: 'legs',
    statModifier: {
      speed: 0.25, // +25% speed
    },
    unlocked: false,
    description: 'Lightning-fast sprinter legs!',
    color: '#F4A300', // Golden yellow
  },

  frog_legs: {
    id: 'frog_legs',
    name: 'Frog Legs',
    type: 'legs',
    statModifier: {
      jumpForce: 0.25, // +25% jump
    },
    unlocked: false,
    description: 'Springy legs for massive jumps!',
    color: '#7FFF00', // Chartreuse green
  },

  kangaroo_legs: {
    id: 'kangaroo_legs',
    name: 'Kangaroo Legs',
    type: 'legs',
    statModifier: {
      jumpForce: 0.15, // +15% jump
      speed: 0.15, // +15% speed
    },
    unlocked: false,
    description: 'Balanced speed and jump power.',
    color: '#CD853F', // Tan
  },

  // PRESTIGE PARTS
  dragon_wings: {
    id: 'dragon_wings',
    name: 'Dragon Wings',
    type: 'body',
    statModifier: {
      speed: 0.2, // +20% speed
    },
    ability: 'fly',
    unlocked: false,
    description: 'PRESTIGE 3: Enables flight mode!',
    color: '#9B59B6', // Purple
  },
};

// Helper functions
export const getPartsByType = (type: 'head' | 'body' | 'legs'): AnimalPart[] => {
  return Object.values(ANIMAL_PARTS).filter((part) => part.type === type);
};

export const getPart = (id: string): AnimalPart | undefined => {
  return ANIMAL_PARTS[id];
};

export const getUnlockedParts = (unlockedIds: string[]): AnimalPart[] => {
  return unlockedIds
    .map((id) => ANIMAL_PARTS[id])
    .filter((part): part is AnimalPart => part !== undefined);
};
