import { create } from 'zustand';
import { LevelDefinition, LevelEntity, EntityType, LevelTheme, LevelPhysics } from '../types/level.types';

// ============================================================================
// EDITOR STATE TYPES
// ============================================================================

export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface EditorState {
  // Level data
  levelData: LevelDefinition;

  // Selection
  selectedEntityId: string | null;
  selectedEntityIds: string[]; // multi-select
  hoveredEntityId: string | null;

  // Tools
  transformMode: TransformMode;
  snapEnabled: boolean;
  snapSize: number;

  // History
  undoStack: LevelDefinition[];
  redoStack: LevelDefinition[];

  // UI state
  isTestPlaying: boolean;
  showGrid: boolean;
  showWireframe: boolean;
  showBounds: boolean;

  // Panel state
  activePanel: 'entities' | 'properties' | 'settings';

  // Actions
  // Entity operations
  addEntity: (type: EntityType, position: [number, number, number]) => string;
  updateEntity: (id: string, updates: Partial<LevelEntity>) => void;
  deleteEntity: (id: string) => void;
  deleteSelectedEntities: () => void;
  duplicateEntity: (id: string) => string | null;
  duplicateSelectedEntities: () => void;

  // Selection
  selectEntity: (id: string | null, addToSelection?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setHoveredEntity: (id: string | null) => void;

  // Transform
  setTransformMode: (mode: TransformMode) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapSize: (size: number) => void;

  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Level settings
  updateLevelMetadata: (updates: Partial<Pick<LevelDefinition, 'id' | 'name' | 'description' | 'difficulty'>>) => void;
  updateLevelTheme: (updates: Partial<LevelTheme>) => void;
  updateLevelPhysics: (updates: Partial<LevelPhysics>) => void;
  setSpawnPoint: (position: [number, number, number]) => void;

  // Import/Export
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
  newLevel: () => void;
  loadLevel: (level: LevelDefinition) => void;

  // UI
  setTestPlaying: (playing: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowWireframe: (show: boolean) => void;
  setShowBounds: (show: boolean) => void;
  setActivePanel: (panel: 'entities' | 'properties' | 'settings') => void;

  // Utilities
  getEntityById: (id: string) => LevelEntity | undefined;
  getSelectedEntity: () => LevelEntity | undefined;
  getSelectedEntities: () => LevelEntity[];
}

// ============================================================================
// DEFAULT LEVEL
// ============================================================================

const DEFAULT_LEVEL: LevelDefinition = {
  id: 'new_level',
  name: 'New Level',
  description: 'A new level created in the editor',
  difficulty: 1,
  theme: {
    skyColor: '#87CEEB',
    ambientColor: '#B3D9FF',
  },
  spawnPoint: [0, 2, 0],
  entities: [
    // Starting platform
    {
      type: 'platform',
      id: 'platform_start',
      position: [0, 0, 0],
      size: [10, 0.5, 10],
      color: '#7FBF7F',
    },
    // Starting checkpoint
    {
      type: 'checkpoint',
      id: 'checkpoint_start',
      position: [0, 1, 0],
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateEntityId(type: EntityType, entities: LevelEntity[]): string {
  const existingIds = entities.map(e => e.id).filter(Boolean);
  let counter = 1;
  let id = `${type}_${counter}`;
  while (existingIds.includes(id)) {
    counter++;
    id = `${type}_${counter}`;
  }
  return id;
}

function snapToGrid(value: number, snapSize: number): number {
  return Math.round(value / snapSize) * snapSize;
}

function snapPosition(position: [number, number, number], snapSize: number): [number, number, number] {
  return [
    snapToGrid(position[0], snapSize),
    snapToGrid(position[1], snapSize),
    snapToGrid(position[2], snapSize),
  ];
}

function getDefaultEntityProps(type: EntityType): Partial<LevelEntity> {
  switch (type) {
    case 'platform':
      return { size: [4, 0.5, 4], color: '#7FBF7F' };
    case 'coin':
      return { coinType: 'speed' };
    case 'checkpoint':
      return {};
    case 'spike':
      return { size: 1 };
    case 'lava':
      return { size: [4, 0.3, 4] };
    case 'rotating_hammer':
      return { rotationSpeed: 1, hammerLength: 3 };
    case 'zeus_lightning':
      return { radius: 2, interval: 5, warningDuration: 1 };
    case 'vine':
      return { height: 6, swingSpeed: 1.2, swingAngle: 0.8 };
    case 'moving_platform':
      return { size: [4, 0.5, 4], color: '#6AAF6A', pattern: 'linear', speed: 1, range: [0, 2, 0] };
    case 'end_goal':
      return { modelType: 'trophy' };
    case 'spawn_portal':
      return {};
    case 'fire_jet':
      return { interval: 3, duration: 1, height: 4, direction: 'up' };
    case 'pendulum_blade':
      return { length: 4, speed: 1, swingAngle: Math.PI / 3 };
    case 'laser_beam':
      return { length: 10, orientation: 'horizontal', sweeping: false, speed: 1 };
    case 'crushing_piston':
      return { height: 5, interval: 4, crushDuration: 1.5 };
    case 'spinning_blade':
      return { size: 1.5, speed: 2 };
    case 'moving_wall':
      return { size: [4, 4, 0.5], pattern: 'linear', speed: 1, range: [4, 0, 0] };
    case 'cannon_turret':
      return { interval: 3, projectileSpeed: 10, direction: [1, 0, 0] };
    case 'falling_icicle':
      return { triggerRadius: 3, fallSpeed: 8, respawnTime: 5 };
    case 'wind_tunnel':
      return { size: [4, 8, 4], force: [0, 10, 0] };
    case 'rising_lava':
      return { size: [10, 1, 10], riseHeight: 5, interval: 8, riseDuration: 3 };
    case 'dart_trap':
      return { interval: 2, direction: [1, 0, 0], dartSpeed: 15 };
    case 'swinging_log':
      return { length: 5, speed: 1.2, swingAngle: Math.PI / 2, logSize: 0.8 };
    case 'power_up':
      return { powerUpType: 'speed_boost', duration: 10 };
    case 'animal_part':
      return { partId: 'default_head' };
    case 'switch':
      return { targetId: '', switchType: 'button', duration: 5 };
    case 'door':
      return { size: [2, 4, 0.5], color: '#8B4513', startsOpen: false };
    case 'pressure_plate':
      return { targetId: '', size: [2, 0.2, 2], requiresWeight: false };
    case 'climbable_wall':
      return { size: [4, 8, 0.5], color: '#654321', climbSpeed: 5 };
    case 'low_obstacle':
      return { size: [4, 1, 4], color: '#DC143C' };
    case 'boss_encounter':
      return { bossType: 'dragon', arenaSize: [30, 20, 30] };
    case 'laser_grid':
      return { rows: 3, cols: 3, spacing: 2, beatDuration: 1, laserColor: '#FF0000', orientation: 'horizontal' };
    case 'crumbling_platform':
      return { size: [4, 0.5, 4], color: '#A0522D', crumbleDelay: 0.8, respawnTime: 5 };
    case 'bounce_pad':
      return { launchDirection: [0, 1, 0], launchPower: 15, size: [2, 0.3, 2], color: '#FFD700' };
    case 'gravity_zone':
      return { size: [6, 6, 6], gravityMultiplier: 0.3, color: '#8B00FF' };
    case 'secret_area':
      return { triggerZone: { size: [6, 4, 6] }, revealedEntities: [], secretMessage: 'Secret Found!' };
    case 'fake_wall':
      return { size: [4, 4, 0.5], color: '#808080', revealRadius: 3 };
    default:
      return {};
  }
}

// ============================================================================
// STORE
// ============================================================================

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState>()((set, get) => ({
  // Initial state
  levelData: { ...DEFAULT_LEVEL },
  selectedEntityId: null,
  selectedEntityIds: [],
  hoveredEntityId: null,
  transformMode: 'translate',
  snapEnabled: true,
  snapSize: 0.5,
  undoStack: [],
  redoStack: [],
  isTestPlaying: false,
  showGrid: true,
  showWireframe: false,
  showBounds: false,
  activePanel: 'entities',

  // Entity operations
  addEntity: (type: EntityType, position: [number, number, number]) => {
    const { levelData, snapEnabled, snapSize, saveToHistory } = get();
    saveToHistory();

    const finalPosition = snapEnabled ? snapPosition(position, snapSize) : position;
    const id = generateEntityId(type, levelData.entities);
    const defaultProps = getDefaultEntityProps(type);

    const newEntity = {
      type,
      id,
      position: finalPosition,
      ...defaultProps,
    } as LevelEntity;

    set({
      levelData: {
        ...levelData,
        entities: [...levelData.entities, newEntity],
      },
      selectedEntityId: id,
      selectedEntityIds: [id],
      redoStack: [],
    });

    return id;
  },

  updateEntity: (id: string, updates: Partial<LevelEntity>) => {
    const { levelData, saveToHistory, snapEnabled, snapSize } = get();
    saveToHistory();

    // Apply snapping to position if being updated
    let finalUpdates = { ...updates };
    if (updates.position && snapEnabled) {
      finalUpdates.position = snapPosition(updates.position as [number, number, number], snapSize);
    }

    set({
      levelData: {
        ...levelData,
        entities: levelData.entities.map(e =>
          e.id === id ? { ...e, ...finalUpdates } as LevelEntity : e
        ),
      },
      redoStack: [],
    });
  },

  deleteEntity: (id: string) => {
    const { levelData, selectedEntityId, selectedEntityIds, saveToHistory } = get();
    saveToHistory();

    set({
      levelData: {
        ...levelData,
        entities: levelData.entities.filter(e => e.id !== id),
      },
      selectedEntityId: selectedEntityId === id ? null : selectedEntityId,
      selectedEntityIds: selectedEntityIds.filter(eid => eid !== id),
      redoStack: [],
    });
  },

  deleteSelectedEntities: () => {
    const { levelData, selectedEntityIds, saveToHistory } = get();
    if (selectedEntityIds.length === 0) return;

    saveToHistory();

    set({
      levelData: {
        ...levelData,
        entities: levelData.entities.filter(e => !selectedEntityIds.includes(e.id || '')),
      },
      selectedEntityId: null,
      selectedEntityIds: [],
      redoStack: [],
    });
  },

  duplicateEntity: (id: string) => {
    const { levelData, saveToHistory } = get();
    const entity = levelData.entities.find(e => e.id === id);
    if (!entity) return null;

    saveToHistory();

    const newId = generateEntityId(entity.type, levelData.entities);
    const newEntity = {
      ...entity,
      id: newId,
      position: [
        entity.position[0] + 2,
        entity.position[1],
        entity.position[2],
      ] as [number, number, number],
    };

    set({
      levelData: {
        ...levelData,
        entities: [...levelData.entities, newEntity],
      },
      selectedEntityId: newId,
      selectedEntityIds: [newId],
      redoStack: [],
    });

    return newId;
  },

  duplicateSelectedEntities: () => {
    const { levelData, selectedEntityIds, saveToHistory } = get();
    if (selectedEntityIds.length === 0) return;

    saveToHistory();

    const newIds: string[] = [];
    const newEntities: LevelEntity[] = [];

    for (const id of selectedEntityIds) {
      const entity = levelData.entities.find(e => e.id === id);
      if (!entity) continue;

      const newId = generateEntityId(entity.type, [...levelData.entities, ...newEntities]);
      newIds.push(newId);
      newEntities.push({
        ...entity,
        id: newId,
        position: [
          entity.position[0] + 2,
          entity.position[1],
          entity.position[2],
        ] as [number, number, number],
      });
    }

    set({
      levelData: {
        ...levelData,
        entities: [...levelData.entities, ...newEntities],
      },
      selectedEntityId: newIds[0] || null,
      selectedEntityIds: newIds,
      redoStack: [],
    });
  },

  // Selection
  selectEntity: (id: string | null, addToSelection = false) => {
    const { selectedEntityIds } = get();

    if (id === null) {
      set({ selectedEntityId: null, selectedEntityIds: [] });
      return;
    }

    if (addToSelection) {
      // Toggle selection
      if (selectedEntityIds.includes(id)) {
        const newSelection = selectedEntityIds.filter(eid => eid !== id);
        set({
          selectedEntityId: newSelection[newSelection.length - 1] || null,
          selectedEntityIds: newSelection,
        });
      } else {
        set({
          selectedEntityId: id,
          selectedEntityIds: [...selectedEntityIds, id],
        });
      }
    } else {
      set({
        selectedEntityId: id,
        selectedEntityIds: [id],
      });
    }
  },

  selectAll: () => {
    const { levelData } = get();
    const allIds = levelData.entities.map(e => e.id).filter(Boolean) as string[];
    set({
      selectedEntityId: allIds[allIds.length - 1] || null,
      selectedEntityIds: allIds,
    });
  },

  clearSelection: () => {
    set({ selectedEntityId: null, selectedEntityIds: [] });
  },

  setHoveredEntity: (id: string | null) => {
    set({ hoveredEntityId: id });
  },

  // Transform
  setTransformMode: (mode: TransformMode) => {
    set({ transformMode: mode });
  },

  setSnapEnabled: (enabled: boolean) => {
    set({ snapEnabled: enabled });
  },

  setSnapSize: (size: number) => {
    set({ snapSize: Math.max(0.1, size) });
  },

  // History
  undo: () => {
    const { undoStack, levelData } = get();
    if (undoStack.length === 0) return;

    const newUndoStack = [...undoStack];
    const previousState = newUndoStack.pop()!;

    set(state => ({
      levelData: previousState,
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, levelData].slice(-MAX_HISTORY),
      selectedEntityId: null,
      selectedEntityIds: [],
    }));
  },

  redo: () => {
    const { redoStack, levelData } = get();
    if (redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const nextState = newRedoStack.pop()!;

    set(state => ({
      levelData: nextState,
      redoStack: newRedoStack,
      undoStack: [...state.undoStack, levelData].slice(-MAX_HISTORY),
      selectedEntityId: null,
      selectedEntityIds: [],
    }));
  },

  saveToHistory: () => {
    const { levelData, undoStack } = get();
    set({
      undoStack: [...undoStack, JSON.parse(JSON.stringify(levelData))].slice(-MAX_HISTORY),
    });
  },

  // Level settings
  updateLevelMetadata: (updates) => {
    const { levelData, saveToHistory } = get();
    saveToHistory();
    set({
      levelData: { ...levelData, ...updates },
      redoStack: [],
    });
  },

  updateLevelTheme: (updates) => {
    const { levelData, saveToHistory } = get();
    saveToHistory();
    set({
      levelData: {
        ...levelData,
        theme: { ...levelData.theme, ...updates },
      },
      redoStack: [],
    });
  },

  updateLevelPhysics: (updates) => {
    const { levelData, saveToHistory } = get();
    saveToHistory();
    set({
      levelData: {
        ...levelData,
        physics: { ...levelData.physics, ...updates },
      },
      redoStack: [],
    });
  },

  setSpawnPoint: (position) => {
    const { levelData, saveToHistory, snapEnabled, snapSize } = get();
    saveToHistory();
    const finalPosition = snapEnabled ? snapPosition(position, snapSize) : position;
    set({
      levelData: { ...levelData, spawnPoint: finalPosition },
      redoStack: [],
    });
  },

  // Import/Export
  exportJSON: () => {
    const { levelData } = get();
    return JSON.stringify(levelData, null, 2);
  },

  importJSON: (json: string) => {
    try {
      const parsed = JSON.parse(json) as LevelDefinition;

      // Basic validation
      if (!parsed.id || !parsed.name || !parsed.entities || !Array.isArray(parsed.entities)) {
        console.error('Invalid level JSON: missing required fields');
        return false;
      }

      const { saveToHistory } = get();
      saveToHistory();

      set({
        levelData: parsed,
        selectedEntityId: null,
        selectedEntityIds: [],
        redoStack: [],
      });

      return true;
    } catch (error) {
      console.error('Failed to parse level JSON:', error);
      return false;
    }
  },

  newLevel: () => {
    const { saveToHistory } = get();
    saveToHistory();
    set({
      levelData: JSON.parse(JSON.stringify(DEFAULT_LEVEL)),
      selectedEntityId: null,
      selectedEntityIds: [],
      redoStack: [],
    });
  },

  loadLevel: (level: LevelDefinition) => {
    const { saveToHistory } = get();
    saveToHistory();
    set({
      levelData: JSON.parse(JSON.stringify(level)),
      selectedEntityId: null,
      selectedEntityIds: [],
      redoStack: [],
    });
  },

  // UI
  setTestPlaying: (playing: boolean) => {
    set({ isTestPlaying: playing });
  },

  setShowGrid: (show: boolean) => {
    set({ showGrid: show });
  },

  setShowWireframe: (show: boolean) => {
    set({ showWireframe: show });
  },

  setShowBounds: (show: boolean) => {
    set({ showBounds: show });
  },

  setActivePanel: (panel) => {
    set({ activePanel: panel });
  },

  // Utilities
  getEntityById: (id: string) => {
    const { levelData } = get();
    return levelData.entities.find(e => e.id === id);
  },

  getSelectedEntity: () => {
    const { levelData, selectedEntityId } = get();
    if (!selectedEntityId) return undefined;
    return levelData.entities.find(e => e.id === selectedEntityId);
  },

  getSelectedEntities: () => {
    const { levelData, selectedEntityIds } = get();
    return levelData.entities.filter(e => selectedEntityIds.includes(e.id || ''));
  },
}));

// ============================================================================
// ENTITY TYPE CATEGORIES (for UI grouping)
// ============================================================================

export const ENTITY_CATEGORIES = {
  environment: [
    'platform',
    'moving_platform',
    'climbable_wall',
    'low_obstacle',
    'power_up',
    'wind_tunnel',
    'bounce_pad',
    'gravity_zone',
    'fake_wall',
  ],
  hazards: [
    'spike',
    'lava',
    'rotating_hammer',
    'zeus_lightning',
    'fire_jet',
    'pendulum_blade',
    'laser_beam',
    'crushing_piston',
    'spinning_blade',
    'moving_wall',
    'cannon_turret',
    'falling_icicle',
    'rising_lava',
    'dart_trap',
    'swinging_log',
    'laser_grid',
    'crumbling_platform',
  ],
  collectibles: [
    'coin',
    'animal_part',
  ],
  progression: [
    'checkpoint',
    'end_goal',
    'spawn_portal',
    'door',
    'switch',
    'pressure_plate',
    'secret_area',
  ],
  interactive: [
    'vine',
    'boss_encounter',
  ],
} as const;

export const ENTITY_ICONS: Record<EntityType, string> = {
  platform: '▬',
  coin: '●',
  checkpoint: '⚑',
  spike: '△',
  lava: '🔥',
  rotating_hammer: '🔨',
  zeus_lightning: '⚡',
  vine: '🌿',
  moving_platform: '↔',
  end_goal: '🏆',
  spawn_portal: '🌀',
  fire_jet: '🔥',
  pendulum_blade: '⚔',
  laser_beam: '━',
  crushing_piston: '⬇',
  spinning_blade: '◎',
  moving_wall: '▐',
  cannon_turret: '▶',
  falling_icicle: '❄',
  wind_tunnel: '💨',
  rising_lava: '🌋',
  dart_trap: '➤',
  swinging_log: '◯',
  power_up: '★',
  animal_part: '🐾',
  switch: '⚙',
  door: '🚪',
  pressure_plate: '▭',
  climbable_wall: '⬆',
  low_obstacle: '▄',
  boss_encounter: '👹',
  laser_grid: '⊞',
  crumbling_platform: '▒',
  bounce_pad: '⬆',
  gravity_zone: '◊',
  secret_area: '❓',
  fake_wall: '▓',
};

export const ENTITY_LABELS: Record<EntityType, string> = {
  platform: 'Platform',
  coin: 'Coin',
  checkpoint: 'Checkpoint',
  spike: 'Spike',
  lava: 'Lava',
  rotating_hammer: 'Rotating Hammer',
  zeus_lightning: 'Zeus Lightning',
  vine: 'Vine',
  moving_platform: 'Moving Platform',
  end_goal: 'End Goal',
  spawn_portal: 'Spawn Portal',
  fire_jet: 'Fire Jet',
  pendulum_blade: 'Pendulum Blade',
  laser_beam: 'Laser Beam',
  crushing_piston: 'Crushing Piston',
  spinning_blade: 'Spinning Blade',
  moving_wall: 'Moving Wall',
  cannon_turret: 'Cannon Turret',
  falling_icicle: 'Falling Icicle',
  wind_tunnel: 'Wind Tunnel',
  rising_lava: 'Rising Lava',
  dart_trap: 'Dart Trap',
  swinging_log: 'Swinging Log',
  power_up: 'Power Up',
  animal_part: 'Animal Part',
  switch: 'Switch',
  door: 'Door',
  pressure_plate: 'Pressure Plate',
  climbable_wall: 'Climbable Wall',
  low_obstacle: 'Low Obstacle',
  boss_encounter: 'Boss Encounter',
  laser_grid: 'Laser Grid',
  crumbling_platform: 'Crumbling Platform',
  bounce_pad: 'Bounce Pad',
  gravity_zone: 'Gravity Zone',
  secret_area: 'Secret Area',
  fake_wall: 'Fake Wall',
};
