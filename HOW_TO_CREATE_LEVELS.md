# How to Create Levels in Animal Obby

## For Users

Want to create a new level? Just copy `GAME_CAPABILITIES.json` and give it to ChatGPT (or any LLM) along with your level idea!

### Quick Start:

1. **Copy the game capabilities:**
   ```
   Copy the contents of GAME_CAPABILITIES.json
   ```

2. **Start a conversation with ChatGPT:**
   ```
   Paste GAME_CAPABILITIES.json and say:

   "I want to create a level for this game.
   Create a lava-themed level with rotating hammers and 10 coins."
   ```

3. **ChatGPT will output JSON like this:**
   ```json
   {
     "id": "lava_fortress",
     "name": "Lava Fortress",
     "difficulty": 3,
     ...
   }
   ```

4. **Save the JSON:**
   - Create a new file in `src/levels/` (e.g., `lava-fortress.json`)
   - Paste the JSON

5. **Load it in the game:**
   ```typescript
   // In src/levels/index.ts, add:
   import lavaFortressData from './lava-fortress.json';
   export const LAVA_FORTRESS = lavaFortressData as LevelDefinition;

   // In src/components/environment/Scene.tsx:
   import { LAVA_FORTRESS } from '../../levels';
   const currentLevel = LAVA_FORTRESS;
   ```

Done! Your level is now playable.

---

## For LLMs (ChatGPT/Claude/etc.)

When a user wants to create a level:

### Step 1: Read the Schema
Read `GAME_CAPABILITIES.json` to understand all available entities and properties.

### Step 2: Understand the Request
Parse what the user wants:
- Theme (lava, ice, forest, space, etc.)
- Difficulty (1-5)
- Length (short/medium/long)
- Features (coins, hazards, parkour, etc.)

### Step 3: Generate JSON
Output valid JSON following this structure:

```json
{
  "id": "unique_id",
  "name": "Display Name",
  "description": "Optional description",
  "difficulty": 1-5,
  "theme": {
    "skyColor": "#HEXCOLOR"
  },
  "spawnPoint": [0, 2, 0],
  "entities": [
    // Add platforms, coins, checkpoints, hazards, etc.
  ]
}
```

### Entity Checklist:
- ✅ Start with a spawn platform
- ✅ Add a checkpoint at spawn
- ✅ Place coins for collection
- ✅ Add checkpoints every 20-30 units
- ✅ Use hazards sparingly based on difficulty
- ✅ End with a final checkpoint/goal

### Jump Distance Reference:
- Easy: 2-3 units
- Normal: 4-5 units
- Hard: 6-7 units

### Example Response Format:

**User:** "Create a space-themed level with zero gravity"

**LLM Response:**
```json
{
  "id": "zero_gravity",
  "name": "Zero Gravity Zone",
  "difficulty": 4,
  "theme": {
    "skyColor": "#0a0a1a",
    "ambientColor": "#8888ff"
  },
  "physics": {
    "gravity": -5
  },
  "spawnPoint": [0, 2, 0],
  "entities": [
    {
      "type": "platform",
      "position": [0, 0, 0],
      "size": [6, 0.5, 6],
      "color": "#2C3E50"
    },
    {
      "type": "checkpoint",
      "id": "start",
      "position": [0, 1, 0]
    },
    {
      "type": "coin",
      "id": "coin_1",
      "position": [0, 5, 0],
      "coinType": "gravity"
    },
    {
      "type": "platform",
      "position": [0, 10, 8],
      "size": [4, 0.5, 4],
      "color": "#34495E"
    },
    {
      "type": "checkpoint",
      "id": "end",
      "position": [0, 10.5, 8]
    }
  ]
}
```

---

## Common Patterns

### Linear Path
```json
"entities": [
  {"type": "platform", "position": [0, 0, 0], "size": [6, 0.5, 6], "color": "#7FBF7F"},
  {"type": "platform", "position": [10, 1, 0], "size": [6, 0.5, 6], "color": "#FFD700"},
  {"type": "platform", "position": [20, 2, 0], "size": [6, 0.5, 6], "color": "#FF6347"}
]
```

### Spiral Staircase
```json
"entities": [
  {"type": "platform", "position": [0, 0, 0], "size": [4, 0.5, 4], "color": "#3498DB"},
  {"type": "platform", "position": [3, 2, 3], "size": [4, 0.5, 4], "color": "#9B59B6"},
  {"type": "platform", "position": [0, 4, 6], "size": [4, 0.5, 4], "color": "#E74C3C"},
  {"type": "platform", "position": [-3, 6, 3], "size": [4, 0.5, 4], "color": "#F39C12"}
]
```

### Coin Circle
```json
"entities": [
  {"type": "coin", "id": "c1", "position": [5, 2, 0], "coinType": "speed"},
  {"type": "coin", "id": "c2", "position": [3.5, 2, 3.5], "coinType": "speed"},
  {"type": "coin", "id": "c3", "position": [0, 2, 5], "coinType": "speed"},
  {"type": "coin", "id": "c4", "position": [-3.5, 2, 3.5], "coinType": "speed"},
  {"type": "coin", "id": "c5", "position": [-5, 2, 0], "coinType": "speed"}
]
```

---

## Troubleshooting

### JSON doesn't load?
- Check for syntax errors (missing commas, brackets)
- Validate all required fields are present
- Use `validateLevel()` function in code

### Level too hard?
- Decrease jump distances (< 5 units)
- Add more checkpoints
- Reduce hazards

### Level too easy?
- Increase jump distances (5-7 units)
- Add rotating hammers
- Use smaller platforms

---

## Tips for Great Levels

1. **Start Simple** - First platform should be safe and large
2. **Progressive Difficulty** - Get harder as you go
3. **Checkpoint Often** - Every major section
4. **Visual Variety** - Use different colors for different sections
5. **Test Jumps** - Standard jump is 4-5 units
6. **Reward Exploration** - Hide coins in tricky spots
7. **Theme Consistency** - Match colors to theme

---

## Need Help?

- See `LEVEL_SCHEMA.md` for full documentation
- See `GAME_CAPABILITIES.json` for all available entities
- See `src/levels/green-fields.json` for a complete example
- See `src/levels/parkour-challenge.json` for a vertical level

Happy level creation! 🎮
