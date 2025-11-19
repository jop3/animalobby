# Animal Obby - Level Creation Schema

This document describes how to create levels for Animal Obby using JSON format. This format is designed to be simple for both humans and LLMs to generate.

## Table of Contents
- [Quick Start](#quick-start)
- [Level Structure](#level-structure)
- [Entity Types](#entity-types)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## Quick Start

A minimal level requires:
1. Metadata (id, name, difficulty)
2. Theme (colors)
3. Spawn point
4. At least one platform and checkpoint

```json
{
  "id": "my_level",
  "name": "My First Level",
  "difficulty": 1,
  "theme": {
    "skyColor": "#87CEEB"
  },
  "spawnPoint": [0, 2, 0],
  "entities": [
    {
      "type": "platform",
      "position": [0, 0, 0],
      "size": [10, 0.5, 10],
      "color": "#7FBF7F"
    },
    {
      "type": "checkpoint",
      "id": "start",
      "position": [0, 1, 0]
    }
  ]
}
```

---

## Level Structure

### Root Level Object

```typescript
{
  // REQUIRED FIELDS
  "id": string,              // Unique identifier (lowercase, underscores)
  "name": string,            // Display name
  "difficulty": 1-5,         // Difficulty rating
  "theme": { ... },          // Visual theme (see below)
  "spawnPoint": [x, y, z],   // Player start position
  "entities": [ ... ],       // Array of game objects

  // OPTIONAL FIELDS
  "description": string,     // Level description
  "physics": { ... },        // Custom physics settings
  "effects": { ... }         // Special effects
}
```

### Theme Object

```json
{
  "skyColor": "#87CEEB",       // Required: Background color
  "ambientColor": "#B3D9FF",   // Optional: Ambient light color
  "fogColor": "#FFFFFF",       // Optional: Fog color
  "fogDensity": 0.01           // Optional: Fog density (0-1)
}
```

### Physics Object (Optional)

```json
{
  "gravity": -20,                    // Custom gravity (default -20)
  "windForce": [0, 0, 1],           // Wind direction & strength
  "friction": 1.0                    // Friction multiplier
}
```

---

## Entity Types

All entities share a base structure:
```json
{
  "type": "entity_type",
  "position": [x, y, z],
  "id": "optional_unique_id"
}
```

### 1. Platform

Basic solid platform players can stand on.

```json
{
  "type": "platform",
  "position": [0, 0, 0],
  "size": [10, 0.5, 10],     // [width, height, depth]
  "color": "#7FBF7F"          // Hex color
}
```

**Tips:**
- Use height around 0.5 for thin platforms
- Typical starting platform: 10x10
- Small jump platforms: 3x3 or 4x4

### 2. Coin

Collectible coins that rotate and glow.

```json
{
  "type": "coin",
  "id": "coin_1",              // Required for coins
  "position": [3, 1.5, 0],
  "coinType": "speed"          // "speed" or "gravity"
}
```

**Tips:**
- Place coins 1-2 units above platforms
- Speed coins are yellow, Gravity coins are purple
- Use unique IDs to track collection

### 3. Checkpoint

Save points that glow green when activated.

```json
{
  "type": "checkpoint",
  "id": "checkpoint_1",        // Required - used as respawn ID
  "position": [0, 1, 0]
}
```

**Tips:**
- Place 0.5-1 unit above platform
- Space checkpoints every 20-30 units
- Always have one at spawn point

### 4. Spike

Deadly spikes that kill on contact.

```json
{
  "type": "spike",
  "position": [10, 1.5, 0],
  "size": 0.8                  // Optional: scale multiplier (default 1)
}
```

**Tips:**
- Place 0.5-1 unit above platform
- Size 0.8 is good for platform edges
- Use red (#FF4444) for danger

### 5. Lava

Deadly lava pools with animated surface.

```json
{
  "type": "lava",
  "position": [20, 1, 0],
  "size": [6, 0.3, 8]          // Optional: [width, height, depth]
}
```

**Tips:**
- Keep height around 0.2-0.3
- Place slightly above platform level
- Creates a jump challenge

### 6. Rotating Hammer

Rotating obstacle that sweeps an area.

```json
{
  "type": "rotating_hammer",
  "position": [30, 5, 0],
  "rotationSpeed": 1.5,        // Optional: rotation speed (default 1)
  "hammerLength": 3            // Optional: arm length (default 3)
}
```

**Tips:**
- Place 3-5 units above platform
- Speed 1.5 is challenging but fair
- Length 3 covers about 6 units diameter

### 7. Moving Platform (Coming Soon)

```json
{
  "type": "moving_platform",
  "position": [40, 2, 0],
  "size": [4, 0.5, 4],
  "color": "#4A90E2",
  "pattern": "linear",         // "linear" or "circular"
  "speed": 1,
  "range": [5, 0, 0]          // Movement offset
}
```

### 8. End Goal (Coming Soon)

Victory marker at level end.

```json
{
  "type": "end_goal",
  "position": [100, 10, 0],
  "modelType": "trophy"        // "dog_head", "trophy", or "portal"
}
```

---

## Examples

### Example 1: Simple Linear Level

```json
{
  "id": "first_steps",
  "name": "First Steps",
  "difficulty": 1,
  "theme": {
    "skyColor": "#87CEEB"
  },
  "spawnPoint": [0, 2, 0],
  "entities": [
    {
      "type": "platform",
      "position": [0, 0, 0],
      "size": [8, 0.5, 8],
      "color": "#7FBF7F"
    },
    {
      "type": "checkpoint",
      "id": "start",
      "position": [0, 1, 0]
    },
    {
      "type": "coin",
      "id": "coin_1",
      "position": [0, 2, 0],
      "coinType": "speed"
    },
    {
      "type": "platform",
      "position": [12, 1, 0],
      "size": [6, 0.5, 6],
      "color": "#FFD700"
    },
    {
      "type": "coin",
      "id": "coin_2",
      "position": [12, 2, 0],
      "coinType": "gravity"
    }
  ]
}
```

### Example 2: Spike Gauntlet

```json
{
  "id": "spike_run",
  "name": "Spike Run",
  "difficulty": 3,
  "theme": {
    "skyColor": "#1a1a2e",
    "ambientColor": "#FF4444"
  },
  "spawnPoint": [0, 2, 0],
  "entities": [
    {
      "type": "platform",
      "position": [0, 0, 0],
      "size": [20, 0.5, 4],
      "color": "#7F8C8D"
    },
    {
      "type": "checkpoint",
      "id": "start",
      "position": [0, 1, 0]
    },
    {
      "type": "spike",
      "position": [3, 0.5, -1]
    },
    {
      "type": "spike",
      "position": [6, 0.5, 1]
    },
    {
      "type": "spike",
      "position": [9, 0.5, -1]
    },
    {
      "type": "spike",
      "position": [12, 0.5, 0]
    },
    {
      "type": "checkpoint",
      "id": "victory",
      "position": [18, 1, 0]
    }
  ]
}
```

---

## Best Practices

### Spacing Guidelines

- **Platforms:** Minimum 2-3 units apart for easy jumps, 4-6 for challenging
- **Coins:** 1-2 units above platforms for easy collection
- **Checkpoints:** Every 20-30 units or after difficult sections
- **Hazards:** Leave 1-2 unit safe zones between obstacles

### Difficulty Curve

**Difficulty 1 (Tutorial):**
- Wide platforms (6x6 or larger)
- Short jumps (2-3 units)
- Few hazards
- Many coins

**Difficulty 3 (Medium):**
- Medium platforms (3x3 to 4x4)
- Moderate jumps (4-5 units)
- Rotating hazards
- Strategic coin placement

**Difficulty 5 (Hard):**
- Small platforms (2x2)
- Long jumps (6+ units)
- Multiple hazards
- Precision required

### Color Palette

**Safe/Easy:**
- Green: `#7FBF7F`, `#2ECC71`
- Blue: `#4A90E2`, `#3498DB`
- Gold: `#FFD700`, `#F1C40F`

**Challenge:**
- Orange: `#FF6347`, `#E67E22`
- Purple: `#9B59B6`, `#8E44AD`

**Danger:**
- Red: `#FF4444`, `#E74C3C`
- Dark: `#2C3E50`, `#34495E`

### Level Length

- **Short:** 30-50 units, 5-10 coins
- **Medium:** 50-80 units, 10-15 coins
- **Long:** 80+ units, 15+ coins

---

## For LLMs: How to Generate Levels

When asked to create a level:

1. **Understand the request** - Identify difficulty, theme, length
2. **Create metadata** - Generate unique ID, name, description
3. **Plan layout** - Sketch progression (start → obstacles → end)
4. **Generate entities** - Create platforms, coins, hazards, checkpoints
5. **Output JSON** - Format as valid JSON following this schema

**Example prompt response:**
> "Create a lava-themed level with rotating hammers"

```json
{
  "id": "lava_fortress",
  "name": "Lava Fortress",
  "difficulty": 4,
  "theme": {
    "skyColor": "#2C1810",
    "ambientColor": "#FF6600"
  },
  "spawnPoint": [0, 2, 0],
  "entities": [
    {
      "type": "platform",
      "position": [0, 0, 0],
      "size": [8, 0.5, 8],
      "color": "#7F2C1F"
    },
    {
      "type": "checkpoint",
      "id": "start",
      "position": [0, 1, 0]
    },
    {
      "type": "lava",
      "position": [12, 0, 0],
      "size": [8, 0.3, 10]
    },
    {
      "type": "platform",
      "position": [24, 2, 0],
      "size": [6, 0.5, 6],
      "color": "#A0522D"
    },
    {
      "type": "rotating_hammer",
      "position": [24, 5, 0],
      "rotationSpeed": 2,
      "hammerLength": 3
    },
    {
      "type": "checkpoint",
      "id": "end",
      "position": [24, 2.5, 0]
    }
  ]
}
```

---

## Validation

Use the provided `validateLevel()` function to check your JSON:

```typescript
import { validateLevel } from './levels';

const result = validateLevel(myLevel);
if (!result.valid) {
  console.error('Errors:', result.errors);
}
```

---

## Tips for Success

✅ **DO:**
- Start with spawn platform and checkpoint
- Use consistent spacing
- Test jump distances (4-5 units is standard)
- Add checkpoints before difficult sections
- Use color coding (green = safe, red = danger)

❌ **DON'T:**
- Create impossible jumps (>7 units without power-ups)
- Place hazards without warning
- Forget checkpoints
- Use clashing colors
- Make platforms too small (<2x2)

---

## Questions?

For more examples, see:
- `src/levels/green-fields.json` - Tutorial level
- `src/levels/parkour-challenge.json` - Vertical platforming

TypeScript types: `src/types/level.types.ts`
