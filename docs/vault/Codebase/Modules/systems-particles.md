---
title: "systems/particles.js"
layer: systems
loc: 880
fan_in: 7
fan_out: 2
tags:
  - code
  - layer/systems
---
# `systems/particles.js`

Particle system with object pooling and enhanced visuals Zero-allocation during gameplay

**880 lines · imports 2 · imported by 7**

## Exports

- `initParticlePool`
- `createExplosion`
- `createImpact`
- `spawnTrailParticle`
- `spawnGroundRipple`
- `spawnTowerDust`
- `spawnDustPuff`
- `updateAmbientParticles`
- `createMoneyPickup`
- `createLightning`
- `updateParticles`
- `clearAllParticles`
- `getParticlePoolStats`
- `getActiveParticleCount`
- `createSpawnPulse`
- `createWaveComplete`
- `createVictoryEffect`
- `createDefeatEffect`

## Imports

- [[engine-state|engine/state.js]]
- [[rendering-quality|rendering/quality.js]]

## Imported by

- [[engine-cleanup|engine/cleanup.js]]
- [[engine-loop|engine/loop.js]]
- [[systems-damage|systems/damage.js]]
- [[systems-towers|systems/towers.js]]
- [[systems-waves|systems/waves.js]]
- [[ui-hud|ui/hud.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]

## Links

- Layer: [[Layer - Systems]]
- [[Codebase Map]]
