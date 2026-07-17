---
title: "engine/camera.js"
layer: engine
loc: 456
fan_in: 10
fan_out: 1
tags:
  - code
  - layer/engine
---
# `engine/camera.js`

Camera controls with smooth easing Supports zoom, pan, and rotation with interpolation

**456 lines · imports 1 · imported by 10**

## Exports

- `getCinematicMode`
- `cancelCinematic`
- `cameraWaveStartPullback`
- `cameraBossTrack`
- `cameraVictoryOrbit`
- `cameraDefeatDrop`
- `updateCamera`
- `zoomIn`
- `zoomOut`
- `resetCam`
- `computeFitDistance`
- `rotateCamera`
- `setCameraAngle`
- `setCameraZoom`
- `cameraZoomPulse`
- `shakeCamera`
- `triggerCameraShake`
- `initCameraState`
- `getCameraTargets`

## Imports

- [[engine-state|engine/state.js]]

## Imported by

- [[engine-input|engine/input.js]]
- [[engine-loop|engine/loop.js]]
- [[engine-scene|engine/scene.js]]
- [[root-main|main.js]]
- [[systems-damage|systems/damage.js]]
- [[systems-enemies|systems/enemies.js]]
- [[systems-towers|systems/towers.js]]
- [[systems-waves|systems/waves.js]]
- [[ui-minimap|ui/minimap.js]]
- [[ui-screens|ui/screens.js]]

## Links

- Layer: [[Layer - Engine]]
- [[Codebase Map]]
