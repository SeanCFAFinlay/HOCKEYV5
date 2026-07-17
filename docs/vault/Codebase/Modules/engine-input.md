---
title: "engine/input.js"
layer: engine
loc: 865
fan_in: 4
fan_out: 6
tags:
  - code
  - layer/engine
---
# `engine/input.js`

Input handling - touch, mouse, keyboard events Mobile-first input state machine with improved gesture handling

**865 lines · imports 6 · imported by 4**

## Exports

- `InputState`
- `getInputState`
- `setupInputHandlers`
- `attachHandlers`
- `clearPreview`
- `updatePreviewAnimation`
- `resetInputState`
- `showPreviewForTest`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-camera|engine/camera.js]]
- [[systems-towers|systems/towers.js]]
- [[engine-scene|engine/scene.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]
- [[ui-hud|ui/hud.js]]

## Imported by

- [[engine-cleanup|engine/cleanup.js]]
- [[engine-loop|engine/loop.js]]
- [[engine-scene|engine/scene.js]]
- [[root-main|main.js]]

## Links

- Layer: [[Layer - Engine]]
- [[Codebase Map]]
