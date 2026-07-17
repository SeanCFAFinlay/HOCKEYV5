---
title: "systems/pathfinding.js"
layer: systems
loc: 250
fan_in: 8
fan_out: 2
tags:
  - code
  - layer/systems
---
# `systems/pathfinding.js`

A* pathfinding with path caching Optimized to only recalculate when map changes

**250 lines · imports 2 · imported by 8**

## Exports

- `findPathGrid`
- `onNavChanged`
- `clearPathCache`
- `getPathCacheStats`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-events|engine/events.js]]

## Imported by

- [[engine-cleanup|engine/cleanup.js]]
- [[root-main|main.js]]
- [[rendering-path-preview|rendering/path-preview.js]]
- [[systems-enemies|systems/enemies.js]]
- [[systems-map|systems/map.js]]
- [[systems-towers|systems/towers.js]]
- [[ui-screens|ui/screens.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]

## Links

- Layer: [[Layer - Systems]]
- [[Codebase Map]]
