---
title: "engine/scene.js"
layer: engine
loc: 1097
fan_in: 3
fan_out: 13
tags:
  - code
  - layer/engine
---
# `engine/scene.js`

Three.js scene setup with enhanced graphics Improved lighting, materials, and visual effects

**1097 lines · imports 13 · imported by 3**

## Exports

- `setGridVisible`
- `createIceScratchNormalMap`
- `init3D`
- `updateLights`
- `updateAmbientParticles`
- `onResize`
- `cleanupScene`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-camera|engine/camera.js]]
- [[engine-input|engine/input.js]]
- [[rendering-obstacles|rendering/obstacles.js]]
- [[rendering-markers|rendering/markers.js]]
- [[rendering-environment|rendering/environment.js]]
- [[rendering-quality|rendering/quality.js]]
- [[config-visual-profiles|config/visual-profiles.js]]
- [[rendering-path-preview|rendering/path-preview.js]]
- [[engine-postprocessing|engine/postprocessing.js]]
- [[rendering-tower-meshes|rendering/tower-meshes.js]]
- [[engine-events|engine/events.js]]
- [[rendering-trails|rendering/trails.js]]

## Imported by

- [[engine-input|engine/input.js]]
- [[engine-loop|engine/loop.js]]
- [[ui-screens|ui/screens.js]]

## Links

- Layer: [[Layer - Engine]]
- [[Codebase Map]]
