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
    unlocked: true,
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
    unlocked: true,
    description: 'Cunning and quick-witted.',
    color: '#FF6347', // Orange-red
  },

  owl_head: {
    id: 'owl_head',
    name: 'Owl Head',
    type: 'head',
    statModifier: {
      jumpForce: 0.15, // +15% jump
    },
    unlocked: true,
    description: 'Wise and observant. Better aerial control.',
    color: '#8B7355', // Brown
  },

  wolf_head: {
    id: 'wolf_head',
    name: 'Wolf Head',
    type: 'head',
    statModifier: {
      speed: 0.10, // +10% speed
      defense: 0.5, // Half defense point
    },
    unlocked: true,
    description: 'Pack hunter instincts. Faster and tougher.',
    color: '#696969', // Gray
  },

  shark_head: {
    id: 'shark_head',
    name: 'Shark Head',
    type: 'head',
    statModifier: {
      speed: 0.15, // +15% speed
    },
    unlocked: false,
    description: 'Apex predator. Relentless speed.',
    color: '#4682B4', // Steel blue
  },

  rabbit_head: {
    id: 'rabbit_head',
    name: 'Rabbit Head',
    type: 'head',
    statModifier: {
      jumpForce: 0.10, // +10% jump
      speed: 0.05, // +5% speed
    },
    unlocked: true,
    description: 'Quick and nimble. Balanced bonuses.',
    color: '#DEB887', // Burlywood
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
    unlocked: true,
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
    unlocked: true,
    description: 'Powerful core muscles for higher jumps.',
    color: '#555555', // Dark gray
  },

  bear_body: {
    id: 'bear_body',
    name: 'Bear Body',
    type: 'body',
    statModifier: {
      defense: 1.5, // 1.5 hit protection
      speed: -0.15, // -15% speed
    },
    unlocked: true,
    description: 'Thick fur and muscle. Very defensive, but slow.',
    color: '#8B4513', // Saddle brown
  },

  cheetah_body: {
    id: 'cheetah_body',
    name: 'Cheetah Body',
    type: 'body',
    statModifier: {
      speed: 0.20, // +20% speed
      defense: -0.5, // Less defense
    },
    unlocked: true,
    description: 'Sleek and aerodynamic. Built for speed, not defense.',
    color: '#DAA520', // Goldenrod
  },

  elephant_body: {
    id: 'elephant_body',
    name: 'Elephant Body',
    type: 'body',
    statModifier: {
      defense: 2, // 2 hit protection
      speed: -0.20, // -20% speed
      jumpForce: -0.10, // -10% jump
    },
    unlocked: false,
    description: 'Massive and tough. Maximum defense, minimum speed.',
    color: '#A9A9A9', // Dark gray
  },

  monkey_body: {
    id: 'monkey_body',
    name: 'Monkey Body',
    type: 'body',
    statModifier: {
      jumpForce: 0.10, // +10% jump
      speed: 0.10, // +10% speed
    },
    unlocked: true,
    description: 'Agile and nimble. Balanced mobility boost.',
    color: '#CD853F', // Peru
  },

  rhino_body: {
    id: 'rhino_body',
    name: 'Rhino Body',
    type: 'body',
    statModifier: {
      defense: 1, // 1 hit protection
      speed: 0.10, // +10% speed when sprinting
    },
    unlocked: false,
    description: 'Armored charger. Defensive with sprint power.',
    color: '#778899', // Light slate gray
  },

  // LEG PARTS
  cheetah_legs: {
    id: 'cheetah_legs',
    name: 'Cheetah Legs',
    type: 'legs',
    statModifier: {
      speed: 0.25, // +25% speed
    },
    unlocked: true,
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
    unlocked: true,
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
    unlocked: true,
    description: 'Balanced speed and jump power.',
    color: '#CD853F', // Tan
  },

  ostrich_legs: {
    id: 'ostrich_legs',
    name: 'Ostrich Legs',
    type: 'legs',
    statModifier: {
      speed: 0.30, // +30% speed
    },
    unlocked: true,
    description: 'Fastest land animal legs! Pure speed.',
    color: '#D2691E', // Chocolate
  },

  grasshopper_legs: {
    id: 'grasshopper_legs',
    name: 'Grasshopper Legs',
    type: 'legs',
    statModifier: {
      jumpForce: 0.35, // +35% jump
      speed: -0.05, // -5% speed
    },
    ability: 'double_jump',
    unlocked: true,
    description: 'Insane jumping power! Enables double jump.',
    color: '#228B22', // Forest green
  },

  spider_legs: {
    id: 'spider_legs',
    name: 'Spider Legs',
    type: 'legs',
    statModifier: {
      speed: 0.15, // +15% speed
      jumpForce: 0.05, // +5% jump
    },
    unlocked: true,
    description: 'Eight legs worth of mobility. Great all-rounder.',
    color: '#000000', // Black
  },

  horse_legs: {
    id: 'horse_legs',
    name: 'Horse Legs',
    type: 'legs',
    statModifier: {
      speed: 0.20, // +20% speed
      jumpForce: 0.10, // +10% jump
    },
    unlocked: true,
    description: 'Galloping power. Excellent mobility.',
    color: '#8B4513', // Saddle brown
  },

  gecko_legs: {
    id: 'gecko_legs',
    name: 'Gecko Legs',
    type: 'legs',
    statModifier: {
      jumpForce: 0.20, // +20% jump
    },
    unlocked: false,
    description: 'Sticky feet for better control and jumping.',
    color: '#9ACD32', // Yellow green
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
