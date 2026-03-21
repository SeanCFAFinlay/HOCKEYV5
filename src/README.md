# Hockey vs Soccer TD - Tower Defense 3D

A dual-theme tower defense game built with Three.js.

## Project Structure

```
src/
├── index.html              # Main HTML shell
├── package.json            # Project configuration
│
├── css/                    # Stylesheets (separated by concern)
│   ├── variables.css       # CSS custom properties
│   ├── base.css            # Reset, html, body
│   ├── screens.css         # Menu, map, game screens
│   ├── hud.css             # Heads-up display
│   ├── tower-bar.css       # Tower selection bar
│   ├── action-bar.css      # Action buttons
│   ├── upgrade-sheet.css   # Upgrade panel
│   ├── modals.css          # Win/lose modals
│   ├── camera-btns.css     # Camera controls
│   └── responsive.css      # Media queries
│
└── js/
    ├── main.js             # Entry point
    │
    ├── config/             # Game data (easy to extend)
    │   ├── themes.js       # Theme definitions
    │   ├── towers.js       # Tower stats and upgrades
    │   ├── enemies.js      # Enemy types
    │   ├── maps.js         # Map configurations
    │   └── waves.js        # Wave generation
    │
    ├── engine/             # Core game engine
    │   ├── state.js        # Shared state variables
    │   ├── scene.js        # Three.js setup
    │   ├── loop.js         # Game loop
    │   ├── camera.js       # Camera controls
    │   └── input.js        # Input handling
    │
    ├── systems/            # Game mechanics
    │   ├── map.js          # Map generation
    │   ├── pathfinding.js  # A* pathfinding
    │   ├── enemies.js      # Enemy spawning/movement
    │   ├── towers.js       # Tower placement/targeting
    │   ├── projectiles.js  # Projectile system
    │   ├── particles.js    # Particle effects
    │   ├── damage.js       # Damage calculations
    │   └── waves.js        # Wave management
    │
    ├── rendering/          # 3D mesh creation
    │   ├── tower-meshes.js # Tower visuals
    │   ├── enemy-meshes.js # Enemy visuals
    │   ├── obstacles.js    # Obstacle props
    │   ├── markers.js      # Spawn/base markers
    │   ├── environment.js  # Environment details
    │   ├── animations.js   # Animation updates
    │   └── sprites.js      # Text sprites
    │
    ├── ui/                 # User interface
    │   ├── hud.js          # HUD updates
    │   ├── screens.js      # Screen management
    │   ├── tower-bar.js    # Tower selection
    │   ├── upgrade-sheet.js# Upgrade panel
    │   ├── modals.js       # Modal dialogs
    │   └── controls.js     # Game controls
    │
    └── utils/              # Utilities
        ├── rng.js          # Random number generation
        └── math.js         # Math helpers
```

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Simple Server (no build)
```bash
npm run serve
```

## Adding New Themes

To add a new theme (e.g., "basketball"):

1. Edit `js/config/themes.js` - Add theme configuration
2. Edit `js/config/towers.js` - Add tower definitions
3. Edit `js/config/enemies.js` - Add enemy definitions
4. Edit `js/config/maps.js` - Add map configurations

No changes required to engine, systems, or rendering code.

## Technologies

- **Three.js r128** - 3D graphics (loaded via CDN)
- **Vanilla JavaScript** - ES modules
- **Vite** - Development server and bundler

## Game Features

- 2 themes (Hockey and Soccer)
- 10 maps per theme with increasing difficulty
- 8 unique tower types per theme
- 7 enemy types per theme
- A* pathfinding with dynamic obstacle avoidance
- Tower upgrades (4 levels)
- Special abilities: splash, chain lightning, slow, burn, critical hits
- Mobile-responsive with touch controls
