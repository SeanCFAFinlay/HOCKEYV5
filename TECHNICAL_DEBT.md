# Technical Debt - Hockey vs Soccer TD

*Audit Date: Phase 1 Complete*

## Architecture Overview

The codebase follows a clean layered architecture:
- **Engine**: state.js, events.js, loop.js, scene.js, camera.js, input.js
- **Systems**: enemies.js, towers.js, projectiles.js, waves.js, map.js, damage.js, particles.js, pathfinding.js
- **Config**: towers.js, enemies.js, maps.js, waves.js, themes.js
- **Rendering**: tower-meshes.js, enemy-meshes.js, environment.js, animations.js, sprites.js
- **UI**: screens.js, hud.js, tower-bar.js, upgrade-sheet.js, modals.js, controls.js

## Phase 1 Fixes Completed

### 1. Direct State Mutations Fixed
- `upgrade-sheet.js`: Now uses `dispatch()` and `addMoney()` instead of direct `state.money` mutation
- `hud.js`: Now uses `setRunning()` instead of direct `state.running` mutation
- `waves.js`: Now uses `setAutoWave()` instead of direct `state.autoWave` mutation
- `input.js`: Now uses `dispatch(ActionTypes.SET_CAMERA_STATE)` instead of direct camera state mutation

### 2. Dead Code Removed
- Removed `game-controller.js` (duplicate game loop, never imported)

---

## Phase 2 Fixes Completed

### 1. State Helper Functions Added
- `clearAutoWaveTimerSafe()`: Safe timer cleanup
- `getAllEntities()`: Returns all entity arrays for cleanup
- `isCleanState()`: Check if game is in clean state

### 2. Centralized Cleanup Module
- Created `engine/cleanup.js` with:
  - `performFullCleanup()`: Complete game reset
  - `performSoftReset()`: Reset without destroying scene
- Proper Three.js resource disposal
- Integrated with `exitGame()`

---

## Phase 3 Fixes Completed

### 1. Input State Machine
- Created proper input state machine with states:
  - `IDLE`: Default state
  - `CAMERA_DRAG`: Dragging to rotate/tilt camera
  - `PINCH_ZOOM`: Two-finger zoom gesture
  - `AWAITING_TAP`: Touch started, waiting to determine intent
  - `UI_BLOCKED`: Touch started on UI element

### 2. Improved Mobile Touch Handling
- Increased drag threshold from 3px to 8px for better tap detection
- Proper tap vs drag detection with distance AND timing
- Long-press detection (400ms) for tower details
- UI touch prevention: touches on HUD/buttons don't affect camera
- `resetInputState()` for cleanup

### 3. Resource Management
- Preview mesh now properly disposes geometries and materials
- Long press timer properly canceled on touch end/cancel

---

## Phase 4 Fixes Completed

### 1. Tower Identity Documentation
- Added `role` property to each tower defining its tactical purpose
- Roles: ANTI-SWARM, SNIPER, SPLASH, CROWD_CONTROL, CHOKEPOINT, CHAIN, DOT, BOSS_KILLER

### 2. Enemy Identity Documentation
- Added `role` property to each enemy defining its tactical pressure
- Roles: SWARM, FIRE, FLYING, ARMORED, ELITE, FLYING_FIRE, BOSS

### 3. Improved Wave Generation
- Created wave "themes" for tactical variety:
  - SWARM: Many weak enemies (tests AoE)
  - TANK_RUSH: Few tanky enemies (tests single-target DPS)
  - AIR_RAID: Flying enemies (tests positioning)
  - FIRE_WAVE: Fire enemies (tests sustained damage)
  - BOSS: Boss + support enemies
  - RECOVERY: Easy wave after hard one
  - MIXED: Balanced composition
- Wave themes cycle to create varied pressure
- Difficulty multiplier increases through the game (0.8 → 1.4)
- Boss waves every 5th wave with recovery wave following
- Added `getWaveThemeName()` utility for UI

---

## Phase 5 Fixes Completed

### 1. Map Strategic Identity
- Added `MapLayout` enum with 8 distinct layout types:
  - FUNNEL: Multiple spawns converge to single chokepoint
  - SPLIT_LANE: Multiple distinct paths to base
  - CROSSOVER: Paths cross in middle, strategic tower placement
  - OPEN_CENTER: Wide open center, many placement options
  - CHOKEPOINT: Natural narrow passages
  - MAZE: Winding paths through obstacles
  - GAUNTLET: Long path, enemies run through tower gauntlet
  - MULTI_BASE: Multiple base entry points (advanced)
- Each map now has `layout`, `spawns`, and `description` properties

### 2. Layout-Based Map Generation
- `generateMap()` now reads layout and spawn count from map config
- `getSpawnPositions()` places spawns based on layout type
- Each layout has its own obstacle generation pattern:
  - Funnel: Creates walls that channel enemies to center
  - Split Lane: Horizontal dividers separate distinct lanes
  - Crossover: X-pattern obstacles with central island
  - Open Center: Sparse edges, flexible center
  - Chokepoint: Vertical walls with strategic gaps
  - Maze: Winding paths through dense obstacles
  - Gauntlet: Corridor with scattered tower positions
  - Multi-Base: Islands for distributed defense

---

## Phase 6 Fixes Completed

### 1. Status Effect Visualizations
- Added slow effect visuals to enemies:
  - Frost aura ring pulsing at enemy feet
  - Ice crystals orbiting around slowed enemies
  - Frost particles floating upward
- Added burn effect visuals to enemies:
  - Heat shimmer aura around burning enemies
  - Burn flames flickering at edges
  - Ember particles rising and resetting
- Animations tied to `slow` and `burnT` enemy state

### 2. Enhanced Tower Placement Preview
- Replaced basic cylinder with hexagonal base platform
- Added animated glow effects (pulsing, rotating)
- Grid cell highlight underneath placement
- Tower icon indicator floating above
- Range preview with subtle inner fill
- Valid (green) vs Invalid (red) color states
- All materials cached for performance

### 3. Wave Transition Effects
- **Wave Start**: Spawn portal pulse effect with expanding ring and burst particles
- **Wave Complete**: Celebration particles from center and confetti from edges
- **Victory**: Multi-burst golden particles with trophy sparkles at base
- **Defeat**: Explosion at base with rising smoke particles

---

## Phase 7 Fixes Completed

### 1. Enhanced HUD Information Display
- **Wave Theme Indicator**: Shows current wave type (Swarm, Heavy, Air Raid, Inferno, BOSS, Breather, Mixed)
- Color-coded wave themes for quick visual identification
- Theme clears after wave completion

### 2. Enemy Counter
- Real-time enemy count during waves (enemies alive + pending spawns)
- Active state styling when wave is in progress
- Hidden on very small screens for space efficiency

### 3. Kill Counter
- Tracks total enemies defeated per game
- Added `kills` to game state with proper action types
- `incrementKills()` called on enemy death

### 4. Money Animation Feedback
- Pulse-gain animation (scale up + glow) when gaining money
- Pulse-spend animation (scale down + fade) when spending
- Smooth transitions via CSS animations

### 5. Lives Warning System
- Automatic warning animation when lives drop to 25% or below
- Pulsing red glow effect to alert player
- Clears when lives recover or game ends

### 6. Tower Role Indicators
- Tower bar now shows role type (Fast, Sniper, AOE, Slow, etc.)
- Color-coded to match tower color
- Hidden on very small screens

### 7. Upgrade Sheet Enhancement
- Shows tower role description (Fast Attack, Long Range, Area Damage, etc.)
- Styled badge with gold accent

### 8. Responsive Adjustments
- Kill counter and enemy counter hidden on smallest screens
- Tower role hidden in landscape mode and small phones
- Wave theme hidden in landscape mode

---

## Phase 8 Fixes Completed

### 1. Config Validation Module (`config/validation.js`)
- **Tower Validation**: Checks required fields (id, nm, icon, cost, role), validates stat arrays have 4 levels, validates upgrade array has 3 costs, validates optional arrays (splash, slowDur, chain, burn)
- **Enemy Validation**: Checks required fields (id, nm, role, hp, spd, rwd), validates optional fields (sz, armor), validates boolean flags (fire, flying, boss)
- **Map Validation**: Checks required fields (name, cols, rows, waves, money, lives, diff), validates layout is valid MapLayout, validates spawns count
- **Theme Validation**: Checks all theme properties, validates all towers/enemies/maps in theme, checks for duplicate IDs
- **Balance Warnings**: Warns about large tower cost variance, starting money < cheapest tower, difficulty not increasing with maps

### 2. Runtime Assertions Module (`utils/assertions.js`)
- `assert(condition, message)` - Basic assertion
- `assertDefined(value, name)` - Check not null/undefined
- `assertPositiveNumber(value, name)` - Check positive number
- `assertArrayLength(arr, length, name)` - Check array size
- `assertInRange(value, min, max, name)` - Check value range
- `assertHasKeys(obj, keys, name)` - Check object keys
- `assertValidGridPos(x, y, cols, rows)` - Check grid bounds
- `assertValidEnemy(enemy)` - Validate enemy state
- `assertValidTower(tower)` - Validate tower state
- `warnIf(condition, message)` - Conditional warning

### 3. Integration Points
- **main.js**: Runs `runValidation(THEMES)` on startup
- **enemies.js**: Validates enemy definitions on spawn
- **towers.js**: Validates grid positions and tower definitions on placement

### 4. Validation on Startup
- All config errors logged to console with specific location
- Balance warnings logged as warnings
- Game continues even if validation fails (graceful degradation)

---

## Remaining Technical Debt (Future Phases)

### MEDIUM Priority

#### Tower Bar Performance
- **Issue**: `renderTowers()` rebuilds all buttons on every call
- **Location**: `ui/hud.js`
- **Fix**: Only update changed elements or use diffing

#### Damage System Animation Timing
- **Issue**: `flashMesh()` and `punchScale()` use `setTimeout` not tied to game time
- **Location**: `systems/damage.js`
- **Problems**:
  - Won't respect game pause
  - Won't respect game speed multiplier
- **Fix**: Integrate into animation system or use game time

### LOW Priority

#### Redundant Window Function Exposures
- **Issue**: Functions exposed to `window` in multiple places
- **Location**: `waves.js`, `towers.js`, `upgrade-sheet.js`, `screens.js`, `modals.js`, `main.js`
- **Fix**: Consolidate all window exposures in main.js

#### Canvas Texture Caching
- **Issue**: Ice/grass textures recreated each time scene is built
- **Location**: `engine/scene.js`
- **Fix**: Cache canvas textures between games

#### CSS Box Model Consistency
- **Issue**: Some elements use inconsistent padding/margin approaches
- **Location**: Various CSS files
- **Fix**: Standardize on consistent spacing system

---

## Performance Considerations

### Currently Good
- Trail particles are properly pooled (`projectiles.js`)
- Ambient particles managed correctly (`scene.js`)
- A* pathfinding uses aggressive caching (`pathfinding.js`)
- Fixed timestep prevents death spiral (`loop.js`)
- Shadow maps properly sized for grid (`scene.js`)
- Object pooling system exists (`pools.js`)

### Monitor for Mobile
- Shadow map size (2048x2048) may need reduction on low-end devices
- Point lights at corners (4 total) - could reduce for mobile
- Particle counts may need quality tier adjustment
- Canvas texture resolution could be reduced

---

## Balance System Notes

### Current Formulas
- Enemy HP scaling: `baseHp * (1 + wave * 0.12)` (12% per wave)
- Tower sell value: 60% of total invested cost
- Wave enemy count: Complex formula based on wave number
- Boss waves: Every 5th wave

### Balance Files
- `config/towers.js`: 8 towers per theme, 4 upgrade levels each
- `config/enemies.js`: 7 enemy types per theme
- `config/waves.js`: Procedural wave generation based on wave number
- `config/maps.js`: 10 maps per theme with difficulty progression

---

## Entity Lifecycle Notes

### Clean Creation/Removal Flow
- Enemies: `spawnEnemy()` -> `addEnemy()` -> update loop -> `handleEnemyDeath()` or `handleEnemyEscape()` -> `removeEnemy()`
- Towers: `handleCellTap()` -> `addTower()` -> `sellTower()` or wave reset
- Projectiles: `createProjectile()` -> `projectiles.push()` -> `updateProjectiles()` -> `handleHit()` -> `splice()`
- Particles: `createExplosion()` etc -> `addParticle()` -> `updateParticles()` -> `removeParticle()`

### Reset Flow
1. `stopGameLoop()` - Cancel animation frame
2. `resetGameState()` - Clear entity arrays
3. `clearSpawnQueue()` - Clear pending spawns
4. `clearPathCache()` - Reset pathfinding
5. `resetGameTime()` - Reset timing
6. `cleanupScene()` - Remove Three.js objects

---

## Phase 9 Fixes Completed

### 1. Storage System (`systems/storage.js`)
- **localStorage Persistence**: Save data with versioning and migration
- **Map Progress**: Save/load map completion (stars, best score, completed)
- **Global Stats**: Track totalKills, totalScore, gamesPlayed, gamesWon, towersPlaced, moneyEarned
- **Settings Storage**: Persist user preferences
- **Import/Export**: Backup and restore save data

### 2. Progression System (`systems/progression.js`)
- **Star Grading**: 1-3 stars based on score percentage (30%/60%/90% thresholds)
- **Bonus Multipliers**: Perfect defense (1.5x), no towers lost (1.1x)
- **Map Unlocks**: Complete previous map to unlock next
- **Session Tracking**: Track lives lost, towers placed, money earned per game
- **Event Integration**: Hooks into GAME_WIN, GAME_LOSE, TOWER_PLACE, etc.

### 3. Achievements System (`systems/achievements.js`)
- **16 Achievements** across 5 categories:
  - Beginner: First Victory, Perfect Defense
  - Progression: Tower Master (100), Exterminator (1000 kills), Millionaire (100k gold)
  - Skill: Three Stars, Speedrunner, Indestructible, Boss Slayer
  - Completion: Hockey/Soccer Champion, All-Stars
  - Challenge: Minimalist, High Scorer, Survivor
- **Auto-Detection**: Achievements unlock automatically based on events
- **Notification System**: Toast notification on achievement unlock

### 4. Settings System (`systems/settings.js`)
- **Audio**: Music volume, SFX volume (ready for audio system)
- **Gameplay**: Show damage numbers, range indicators, auto-wave default, default speed
- **Metadata**: UI generation info (type, min/max, options)
- **Validation**: Type checking for settings values

### 5. UI Updates
- **Map Selection**: Shows earned stars (gold), best score, locked indicator
- **Locked Maps**: Visual lock icon, shake animation when tapped
- **Achievement Notification**: Slide-down toast with icon and name

---

## File Size Reference

| Directory | Approximate Lines |
|-----------|------------------|
| engine/ | ~1,450 |
| systems/ | ~2,700 |
| config/ | ~550 |
| rendering/ | ~800 |
| ui/ | ~600 |
| utils/ | ~200 |
| CSS | ~1,700 |
| **Total** | **~8,000** |
