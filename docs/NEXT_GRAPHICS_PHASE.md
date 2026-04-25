# Next Graphics Phase

## Recommended Next Work

1. Move all remaining hockey/soccer branches in `tower-meshes.js`, `enemy-meshes.js`, and `scene.js` into visual factory tables.
2. Add mesh pools keyed by projectile visual type.
3. Add browser smoke tests with screenshots for all three themes.
4. Replace per-cell overlay meshes with instanced meshes or a computed raycast plane for better mobile performance.
5. Add a user-facing quality selector tied to the existing `quality` profile system.
6. Add per-theme sound and hit feedback once audio settings are ready.

## Known Constraints

The current pass keeps the existing architecture and avoids a renderer rewrite. Some visual branching remains, but the config profile now controls palette, lighting, projectiles, markers, overlays, and orbital-specific visuals.

