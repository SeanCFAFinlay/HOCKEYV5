---
title: "systems/enemies.js"
layer: systems
loc: 496
fan_in: 2
fan_out: 11
tags:
  - code
  - layer/systems
---
# `systems/enemies.js`

Enemy spawning and movement with state machine Delta-time based, deterministic movement

**496 lines · imports 11 · imported by 2**

## Exports

- `EnemyState`
- `spawnEnemy`
- `updateEnemies`
- `removeEnemy`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-events|engine/events.js]]
- [[engine-audio|engine/audio.js]]
- [[systems-pathfinding|systems/pathfinding.js]]
- [[rendering-enemy-meshes|rendering/enemy-meshes.js]]
- [[rendering-sprites|rendering/sprites.js]]
- [[ui-hud|ui/hud.js]]
- [[ui-currency-fly|ui/currency-fly.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]
- [[utils-assertions|utils/assertions.js]]
- [[engine-camera|engine/camera.js]]

## Imported by

- [[engine-loop|engine/loop.js]]
- [[systems-waves|systems/waves.js]]

## Links

- Layer: [[Layer - Systems]]
- [[Codebase Map]]
