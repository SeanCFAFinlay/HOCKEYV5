---
title: "systems/waves.js"
layer: systems
loc: 180
fan_in: 4
fan_out: 10
tags:
  - code
  - layer/systems
---
# `systems/waves.js`

Wave management with game-time based spawning No setTimeout - all spawns tied to fixed timestep

**180 lines · imports 10 · imported by 4**

## Exports

- `startWave`
- `processWaveSpawns`
- `checkWaveCompletion`
- `toggleAutoWave`
- `getRemainingSpawns`
- `clearSpawnQueue`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-events|engine/events.js]]
- [[engine-audio|engine/audio.js]]
- [[systems-enemies|systems/enemies.js]]
- [[ui-hud|ui/hud.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]
- [[systems-particles|systems/particles.js]]
- [[config-waves|config/waves.js]]
- [[rendering-path-preview|rendering/path-preview.js]]
- [[engine-camera|engine/camera.js]]

## Imported by

- [[engine-cleanup|engine/cleanup.js]]
- [[engine-loop|engine/loop.js]]
- [[root-main|main.js]]
- [[ui-screens|ui/screens.js]]

## Links

- Layer: [[Layer - Systems]]
- [[Codebase Map]]
