# Game Audit Review

## Repo Map

- `src/index.html`: static shell, HUD, game screen, modal markup, and Vite entry.
- `src/js/main.js`: startup, config validation, storage/progression init, global handlers.
- `src/js/engine`: state, loop, camera, input, scene lifecycle, cleanup, pools, events.
- `src/js/systems`: tower defense rules for map generation, pathing, towers, enemies, waves, projectiles, damage, particles, progression, storage.
- `src/js/config`: content data for towers, enemies, maps, themes/content packs, waves, validation.
- `src/js/rendering`: Three.js mesh/environment helpers.
- `src/js/ui`: HUD, screens, controls, modals, upgrade sheet, perf overlay.
- `src/css`: screen, HUD, tower/action bar, camera, modal, upgrade, and responsive styling.

## Findings

- The core engine is mostly generic, but `engine/scene.js`, `rendering/enemy-meshes.js`, `rendering/tower-meshes.js`, and `systems/projectiles.js` still contain hockey/soccer visual branches.
- The old wave generator used fixed enemy array positions and an `e.length > 7` Hockey-only branch. This is now replaced by enemy metadata.
- Hockey `e8/e9/e10` were missing roles and are now validated as `SPEEDSTER`, `ARMORED`, and `BRUISER`.
- UI and systems remain coupled in places: systems still call HUD/render helpers directly. This is acceptable for this pass but should be untangled later through events.
- Mobile support existed, but placement needed a safer confirmation flow and camera target fixes.

## Boundary Recommendation

Keep `engine` theme-agnostic. Treat each theme as a content pack with:

- `meta`
- `maps`
- `towers`
- `enemies`
- `balance`
- `skins`
- optional level layouts and visual factories

Rendering should eventually resolve visuals from pack `skins` instead of checking `theme === 'hockey'`.
