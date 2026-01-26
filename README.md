# Animal Obby

A 3D voxel platformer game built with React, Three.js, and Rapier physics engine. Navigate through 12 themed levels, customize your character with animal parts, collect coins, and overcome various hazards.

## Tech Stack

- **Frontend Framework:** React 19 with TypeScript
- **3D Rendering:** Three.js with React Three Fiber
- **Physics Engine:** Rapier (via @react-three/rapier)
- **State Management:** Zustand with localStorage persistence
- **Styling:** Tailwind CSS 4
- **Build Tool:** Vite 7

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Game Features

### Core Gameplay
- **Movement:** WASD/Arrow keys to move, Space to jump, Shift to sprint
- **Level Progression:** 12 themed levels of increasing difficulty (1-5 scale)
- **Death & Respawn:** Players die from hazards or falling, respawn at last checkpoint
- **Mobile Support:** Touch controls with joystick for mobile devices

### 12 Available Levels
1. **Green Fields** - Tutorial level with basic platforming
2. **Unicorn Castle** - Fantasy themed
3. **Sky Islands** - Floating platforms
4. **Desert Ruins** - Ancient structures
5. **Jungle Challenge** - Tropical obstacles
6. **Ice Cavern** - Frozen environment
7. **Mushroom Forest** - Whimsical setting
8. **Lava Volcano** - Molten hazards
9. **Neon City** - Cyberpunk aesthetic
10. **Underwater Temple** - Aquatic themed
11. **Space Station** - Zero-gravity theme
12. **Parkour Challenge** - Vertical progression

### Animal Parts System
Players can collect and equip animal parts to modify stats:

**Head Parts:** Eagle, Fox, Owl, Wolf, Shark, Rabbit, etc.
- Modifiers: Jump Force +5-15%, Speed +5-15%
- Abilities: Glide, enhanced vision

**Body Parts:** Turtle, Gorilla, Bear, Cheetah, Elephant, Monkey, Rhino
- Modifiers: Speed -20% to +20%, Jump Force, Defense
- Abilities: Shield (absorb hits)

**Leg Parts:** Cheetah, Frog, Kangaroo, Ostrich, Grasshopper, Spider, Horse, Gecko
- Speed bonuses: +15-30%
- Jump bonuses: +15-35%
- Special: Grasshopper legs enable double jump

### Entity Types
The game includes 31 different entity types:

**Platforms:** Static, Moving, Bouncy, Disappearing, Rotating, Hologram

**Collectibles:** Coins (Speed/Gravity), Checkpoints, Animal Parts, End Goal

**Hazards:** Spike, Lava, Rotating Hammer, Zeus Lightning, Fire Jet, Pendulum Blade, Laser Beam, Crushing Piston, Spinning Blade, Moving Wall, Swinging Log, Wind Tunnel, Rising Lava, Dart Trap

**Interactive:** Switch/Button, Door, Pressure Plate, Climbable Wall, Low Obstacle, Power-ups

### Power-ups
- **Speed Boost** - Temporary speed increase
- **Shield** - Absorb one hit
- **Double Jump** - Jump twice in mid-air
- **Invincibility** - Immune to hazards temporarily
- **Magnet** - Attract nearby coins

## Project Structure

```
src/
├── components/
│   ├── player/          # Player character and movement
│   ├── environment/     # Platforms, camera, scene setup
│   ├── hazards/         # Deadly obstacles
│   ├── collectibles/    # Coins, checkpoints, goals
│   ├── effects/         # Particles, post-processing
│   ├── level/           # Level loading and entity factory
│   ├── ui/              # Menus, HUD, modals
│   └── bosses/          # Boss encounters
├── store/               # Zustand game state management
├── data/                # Level registry, animal parts database
├── types/               # TypeScript type definitions
├── levels/              # 12 level JSON files
└── utils/               # Helper functions
```

## Creating Levels

See [HOW_TO_CREATE_LEVELS.md](./HOW_TO_CREATE_LEVELS.md) and [LEVEL_SCHEMA.md](./LEVEL_SCHEMA.md) for detailed documentation on creating custom levels.

### Quick Start
1. Copy `GAME_CAPABILITIES.json`
2. Give it to an LLM with your level idea
3. Save the generated JSON in `src/levels/`
4. Register it in `src/data/levelRegistry.ts`

## Settings

- **Quality:** Low, Medium, High (affects shadows, anti-aliasing, particles)
- **Difficulty:** Easy, Normal, Hard (affects timer display)
- **Sound/Music:** Toggle audio on/off

## State Persistence

Game progress is automatically saved to localStorage:
- Coins collected
- Unlocked parts
- Current loadout
- Completed levels
- Best times and stats
- Player name
- Settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## License

MIT
