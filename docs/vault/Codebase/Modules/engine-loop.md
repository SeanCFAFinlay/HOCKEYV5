---
title: "engine/loop.js"
layer: engine
loc: 271
fan_in: 3
fan_out: 19
tags:
  - code
  - layer/engine
---
# `engine/loop.js`

Main game loop with fixed timestep Uses accumulator pattern for deterministic physics

**271 lines · imports 19 · imported by 3**

## Exports

- `triggerHitStop`
- `getHitStopRemaining`
- `gameLoop`
- `startGameLoop`
- `stopGameLoop`
- `getGameTime`
- `resetGameTime`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-events|engine/events.js]]
- [[systems-enemies|systems/enemies.js]]
- [[systems-towers|systems/towers.js]]
- [[systems-projectiles|systems/projectiles.js]]
- [[systems-particles|systems/particles.js]]
- [[rendering-animations|rendering/animations.js]]
- [[rendering-trails|rendering/trails.js]]
- [[engine-camera|engine/camera.js]]
- [[ui-hud|ui/hud.js]]
- [[systems-waves|systems/waves.js]]
- [[engine-input|engine/input.js]]
- [[ui-perf-overlay|ui/perf-overlay.js]]
- [[ui-minimap|ui/minimap.js]]
- [[engine-scene|engine/scene.js]]
- [[engine-postprocessing|engine/postprocessing.js]]
- [[engine-auto-quality|engine/auto-quality.js]]
- [[rendering-targeting-feedback|rendering/targeting-feedback.js]]
- [[systems-auto-wave|systems/auto-wave.js]]

## Imported by

- [[engine-cleanup|engine/cleanup.js]]
- [[systems-damage|systems/damage.js]]
- [[ui-screens|ui/screens.js]]

## Links

- Layer: [[Layer - Engine]]
- [[Codebase Map]]
