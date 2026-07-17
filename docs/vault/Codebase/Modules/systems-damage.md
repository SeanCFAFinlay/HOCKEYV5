---
title: "systems/damage.js"
layer: systems
loc: 329
fan_in: 2
fan_out: 5
tags:
  - code
  - layer/systems
---
# `systems/damage.js`

Damage calculations and hit handling Includes visual feedback and effects

**329 lines · imports 5 · imported by 2**

## Exports

- `handleHit`
- `hurtEnemy`
- `tickDamageAnimations`
- `showDamageNumber`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-events|engine/events.js]]
- [[systems-particles|systems/particles.js]]
- [[engine-loop|engine/loop.js]]
- [[engine-camera|engine/camera.js]]

## Imported by

- [[rendering-animations|rendering/animations.js]]
- [[systems-projectiles|systems/projectiles.js]]

## Links

- Layer: [[Layer - Systems]]
- [[Codebase Map]]
