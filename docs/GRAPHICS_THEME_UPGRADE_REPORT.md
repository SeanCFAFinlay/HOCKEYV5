# Graphics Theme Upgrade Report

## Themes Upgraded

- Hockey: higher-contrast ice rink palette, icy build/path overlays, frosty projectile colors, puck/skater enemy variants, and hockey tower visuals.
- Soccer: richer green pitch palette, brighter field/path readability, spin/curve ball projectile profiles, and field-style enemy/tower accents.
- Orbital: new sci-fi platform treatment, neon build/path overlays, orbital drone enemies, sci-fi towers, laser/plasma/gravity projectile profiles, and space props.

## Rendering Pipeline Changes

- Added `src/js/config/visual-profiles.js`.
- Theme packs now expose `visuals` and projectile/enemy/tower/map profiles.
- `scene.js`, `environment.js`, `markers.js`, `obstacles.js`, `tower-meshes.js`, `enemy-meshes.js`, `projectiles.js`, and `damage.js` now consume visual profile data.

## Readability Changes

- Buildable tiles now have subtle theme-colored overlays.
- Spawn/base/path tiles are stronger and easier to read.
- Theme fog, background, tone exposure, and lighting are profile-driven.
- Upgraded towers have visible glowing collars and stronger level treatment.

## Validation

`npm run validate` now checks required visual sections plus projectile and enemy visual fallbacks.

