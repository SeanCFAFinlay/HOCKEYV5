# Changelog Next Pass

## Added

- Content-pack metadata registry for Hockey, Soccer, and a playable Space stub.
- Metadata-driven wave generator.
- Enemy roles/tags/unlock/weight validation.
- Endless and sandbox mode foundations.
- Mobile touch placement preview/confirmation.
- Renderer quality tiers.
- FPS/performance overlay via `?perf=1`.
- Config smoke validation script.

## Changed

- Root scripts now delegate through `npm --prefix src`.
- Wave preview now shows role pressure tags.
- Camera touch drag/pinch now updates camera targets.
- Projectile cleanup now disposes meshes on impact.

## Remaining

- Move rendering branches fully behind pack skins.
- Add Playwright browser smoke tests.
- Add deeper map path validation in Node or browser.
- Pool projectiles and enemy meshes by visual type.
