---
title: "engine/cleanup.js"
layer: engine
loc: 186
fan_in: 1
fan_out: 7
tags:
  - code
  - layer/engine
---
# `engine/cleanup.js`

Centralized cleanup for game reset/exit Ensures all resources are properly disposed

**186 lines · imports 7 · imported by 1**

## Exports

- `performFullCleanup`
- `performSoftReset`

## Imports

- [[engine-state|engine/state.js]]
- [[systems-waves|systems/waves.js]]
- [[systems-pathfinding|systems/pathfinding.js]]
- [[systems-particles|systems/particles.js]]
- [[rendering-enemy-meshes|rendering/enemy-meshes.js]]
- [[engine-loop|engine/loop.js]]
- [[engine-input|engine/input.js]]

## Imported by

- [[ui-screens|ui/screens.js]]

## Links

- Layer: [[Layer - Engine]]
- [[Codebase Map]]
