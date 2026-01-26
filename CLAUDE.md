# Animal Obby - Claude Code Instructions

## Project Overview

Animal Obby is a 3D voxel platformer built with React Three Fiber and Rapier physics. The game features 12 themed levels, an animal parts customization system, and various hazards/collectibles.

## Tech Stack

- **React 19** with TypeScript
- **Three.js** via React Three Fiber 9.4
- **Rapier** physics via @react-three/rapier 2.2
- **Zustand** 5 for state management (with localStorage persistence)
- **Tailwind CSS 4**
- **Vite 7** for build

## Key Files & Locations

### Entry Points
- `src/App.tsx` - Main app wrapper with Canvas/Physics setup
- `src/main.tsx` - React root render
- `src/components/GameManager.tsx` - Game flow orchestration

### Core Systems
- `src/store/useGameStore.ts` - Zustand state store (coins, loadout, progression)
- `src/data/animalParts.ts` - Animal part definitions and stats
- `src/data/levelRegistry.ts` - Level loading and registry

### Types
- `src/types/game.types.ts` - Game state and entity types
- `src/types/level.types.ts` - Level schema definitions

### Components
- `src/components/player/Player.tsx` - Player movement and physics
- `src/components/level/EntityFactory.tsx` - Maps JSON entities to React components
- `src/components/environment/Platform.tsx` - Platform with moving/bouncy/disappearing variants
- `src/components/hazards/` - All hazard implementations (15 types)
- `src/components/collectibles/` - Coins, checkpoints, animal parts, end goal
- `src/components/ui/` - HUD, menus, modals

### Levels
- `src/levels/*.json` - 12 level files (green-fields, unicorn-castle, etc.)

## Game Constants

```typescript
// Physics
const GRAVITY = -20;
const BASE_SPEED = 5;
const BASE_JUMP_FORCE = 10;
const DEATH_Y = -30;

// Jump distances
const EASY_JUMP = 2-3; // units
const NORMAL_JUMP = 4-5;
const HARD_JUMP = 6-7;
const MAX_JUMP = 7-8;
```

## Architecture Patterns

### Level Loading
1. JSON levels in `src/levels/`
2. Registered in `levelRegistry.ts`
3. Loaded via `getLevelById()`
4. Entities rendered via `EntityFactory`

### State Management
- Zustand store with `persist` middleware
- Key `'animal-obby-save'` in localStorage
- Actions: `collectCoin`, `equipPart`, `die`, `respawn`, `loadLevel`, etc.

### Player Movement
- Capsule collider with Rapier RigidBody
- Keyboard controls via `@react-three/drei` KeyboardControls
- Features: coyote time, jump buffering, variable jump height

### Hazard Detection
- Hazards track `playerPosition` from store
- Distance-based collision checks in `useFrame`
- Call `die()` on contact

## Common Tasks

### Add a New Entity Type
1. Create component in appropriate folder
2. Add to `EntityFactory.tsx` switch statement
3. Add type definition to `level.types.ts`
4. Document in `GAME_CAPABILITIES.json`

### Add a New Animal Part
1. Add to `src/data/animalParts.ts`
2. Define `id`, `name`, `type`, `statModifier`, `ability`, `description`, `color`
3. Optionally add voxel model to `voxelModels.ts`

### Create a New Level
1. Copy existing level JSON as template
2. Define `id`, `name`, `difficulty`, `theme`, `spawnPoint`, `entities`
3. Add to `levelRegistry.ts`
4. See `LEVEL_SCHEMA.md` for full documentation

## Known Considerations

### Audio System
The audio manager uses placeholder silent audio files. Replace base64 data URLs with actual audio files for production.

### Performance
- Quality setting controls shadows, anti-aliasing, particles
- Default to 'low' quality for better performance
- Moving platforms use `setNextKinematicTranslation()` for proper physics

### Mobile Support
- Touch controls via nipplejs joystick
- Responsive UI
- Use `react-device-detect` for detection

## Testing

```bash
npm run test        # Run Vitest
npm run test:ui     # Vitest UI mode
npm run lint        # ESLint
```

## Development Tips

1. Use Leva for debug controls (already integrated)
2. Quality 'low' recommended during development for performance
3. `reset()` in store clears all game state
4. Check `completedLevels` and `levelStats` for progression debugging
