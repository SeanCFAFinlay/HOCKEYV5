---
title: "engine/state.js"
layer: engine
loc: 719
fan_in: 37
fan_out: 1
tags:
  - code
  - layer/engine
---
# `engine/state.js`

Centralized game state with dispatch pattern Single source of truth - all mutations through dispatch()

**719 lines · imports 1 · imported by 37**

## Exports

- `ActionTypes`
- `subscribeToState`
- `dispatch`
- `getState`
- `setTheme`
- `setMapData`
- `setMapDimensions`
- `setSpawnsAndBase`
- `setWaves`
- `setGrid`
- `setMoney`
- `addMoney`
- `setLives`
- `decrementLives`
- `setWave`
- `incrementWave`
- `setScore`
- `addScore`
- `setKills`
- `incrementKills`
- `setGameSpeed`
- `setGameMode`
- `updateRunStats`
- `setAutoWave`
- `setWaveStartLives`
- `setAutoWaveTimer`
- `setSpawnsPending`
- `decrementSpawnsPending`
- `incrementNavVersion`
- `setSelectedTower`
- `setSelectedPlaced`
- `setSellMode`
- `setWaveActive`
- `setRunning`
- `setLastTime`
- `addAnimTime`
- `setThreeObjects`
- `setCells`
- `setCameraState`
- `setDragging`
- `setDragMoved`
- `setLastPosition`
- `setTouchStart`
- `addTower`
- `removeTower`
- `addEnemy`
- `removeEnemy`
- `addProjectile`
- `removeProjectile`
- `addParticle`
- `removeParticle`
- `clearCells`
- `resetGameState`
- `clearAutoWaveTimerSafe`
- `getAllEntities`
- `isCleanState`

## Imports

- [[engine-events|engine/events.js]]

## Imported by

- [[config-waves|config/waves.js]]
- [[engine-auto-quality|engine/auto-quality.js]]
- [[engine-camera|engine/camera.js]]
- [[engine-cleanup|engine/cleanup.js]]
- [[engine-input|engine/input.js]]
- [[engine-loop|engine/loop.js]]
- [[engine-scene|engine/scene.js]]
- [[root-main|main.js]]
- [[rendering-animations|rendering/animations.js]]
- [[rendering-enemy-meshes|rendering/enemy-meshes.js]]
- [[rendering-environment|rendering/environment.js]]
- [[rendering-markers|rendering/markers.js]]
- [[rendering-obstacles|rendering/obstacles.js]]
- [[rendering-path-preview|rendering/path-preview.js]]
- [[rendering-sprites|rendering/sprites.js]]
- [[rendering-targeting-feedback|rendering/targeting-feedback.js]]
- [[rendering-tower-meshes|rendering/tower-meshes.js]]
- [[systems-achievements|systems/achievements.js]]
- [[systems-damage|systems/damage.js]]
- [[systems-enemies|systems/enemies.js]]
- [[systems-map|systems/map.js]]
- [[systems-particles|systems/particles.js]]
- [[systems-pathfinding|systems/pathfinding.js]]
- [[systems-progression|systems/progression.js]]
- [[systems-projectiles|systems/projectiles.js]]
- [[systems-towers|systems/towers.js]]
- [[systems-waves|systems/waves.js]]
- [[ui-controls|ui/controls.js]]
- [[ui-currency-fly|ui/currency-fly.js]]
- [[ui-hud|ui/hud.js]]
- [[ui-minimap|ui/minimap.js]]
- [[ui-modals|ui/modals.js]]
- [[ui-perf-overlay|ui/perf-overlay.js]]
- [[ui-screens|ui/screens.js]]
- [[ui-tower-bar|ui/tower-bar.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]
- [[utils-rng|utils/rng.js]]

## Links

- Layer: [[Layer - Engine]]
- [[Codebase Map]]
