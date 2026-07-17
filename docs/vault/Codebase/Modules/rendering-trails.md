---
title: "rendering/trails.js"
layer: rendering
loc: 211
fan_in: 3
fan_out: 1
tags:
  - code
  - layer/rendering
---
# `rendering/trails.js`

SC-3.3: Projectile Trail System Ribbon trails using THREE.Line with BufferGeometry pool SC-5.5: Quality LOD — low=disabled, medium=4 segments, high=8 segments

**211 lines · imports 1 · imported by 3**

## Exports

- `getTrailSegmentCount`
- `initTrails`
- `attachTrail`
- `updateTrails`
- `removeTrail`
- `cleanupTrails`
- `getTrailPoolStats`

## Imports

- [[rendering-quality|rendering/quality.js]]

## Imported by

- [[engine-loop|engine/loop.js]]
- [[engine-scene|engine/scene.js]]
- [[systems-projectiles|systems/projectiles.js]]

## Links

- Layer: [[Layer - Rendering]]
- [[Codebase Map]]
