---
title: "systems/towers.js"
layer: systems
loc: 371
fan_in: 3
fan_out: 12
tags:
  - code
  - layer/systems
---
# `systems/towers.js`

Tower placement, targeting, and shooting Uses delta-time based cooldowns, not wall clock

**371 lines · imports 12 · imported by 3**

## Exports

- `TargetPriority`
- `wouldBlockPath`
- `handleCellTap`
- `updateTowers`
- `toggleSell`
- `cycleTowerPriority`
- `setTowerPriority`
- `getPriorityOptions`
- `getPriorityName`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-events|engine/events.js]]
- [[systems-pathfinding|systems/pathfinding.js]]
- [[rendering-tower-meshes|rendering/tower-meshes.js]]
- [[systems-projectiles|systems/projectiles.js]]
- [[ui-hud|ui/hud.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]
- [[utils-assertions|utils/assertions.js]]
- [[systems-particles|systems/particles.js]]
- [[engine-camera|engine/camera.js]]
- [[config-sounds|config/sounds.js]]
- [[engine-audio|engine/audio.js]]

## Imported by

- [[engine-input|engine/input.js]]
- [[engine-loop|engine/loop.js]]
- [[root-main|main.js]]

## Links

- Layer: [[Layer - Systems]]
- [[Codebase Map]]
