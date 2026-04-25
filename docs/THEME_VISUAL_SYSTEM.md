# Theme Visual System

Visual profiles live in `src/js/config/visual-profiles.js` and are attached to each content pack through `src/js/config/themes.js`.

## Required Sections

- `map`: background, fog, floor material, path style, build-zone style, spawn/base styling.
- `lighting`: hemisphere, sun, rim, accent, and exposure settings.
- `ui`: accent colors.
- `projectiles`: per projectile id mesh/trail/impact/color/speed config.
- `enemies`: visual fallback by role or slot.
- `towers`: family/base/metal/level-glow config.

## Renderer Usage

- `engine/scene.js` reads map and lighting profile.
- `rendering/environment.js` reads path/build/prop colors.
- `rendering/markers.js` reads spawn/base colors and labels.
- `rendering/tower-meshes.js` reads tower profile and theme family.
- `rendering/enemy-meshes.js` reads enemy role/slot profile.
- `systems/projectiles.js` reads projectile visual profile.

## Fallback Rules

Themes must provide a projectile profile for every `tower.projectile`. Enemies resolve by `enemy.slot`, then `enemy.role.toLowerCase()`, then `swarm`.

