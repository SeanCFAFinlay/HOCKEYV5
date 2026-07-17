---
title: "ui/minimap.js"
layer: ui
loc: 211
fan_in: 2
fan_out: 3
tags:
  - code
  - layer/ui
---
# `ui/minimap.js`

Strategic Minimap — SC-4.4 2D canvas overlay: top-down grid view with towers, enemies, spawns, base.

**211 lines · imports 3 · imported by 2**

## Exports

- `initMinimap`
- `setMinimapVisible`
- `updateMinimap`
- `setMinimapLowQualityMode`
- `forceMinimapRedraw`
- `getMinimapCellSize`
- `tapToGrid`
- `drawTowerDot`
- `drawEnemyDot`
- `drawSpawnMarker`
- `drawBaseMarker`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-camera|engine/camera.js]]
- [[ui-minimap-draw|ui/minimap-draw.js]]

## Imported by

- [[engine-loop|engine/loop.js]]
- [[root-main|main.js]]

## Links

- Layer: [[Layer - Ui]]
- [[Codebase Map]]
