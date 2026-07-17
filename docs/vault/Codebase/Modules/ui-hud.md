---
title: "ui/hud.js"
layer: ui
loc: 725
fan_in: 9
fan_out: 8
tags:
  - code
  - layer/ui
---
# `ui/hud.js`

HUD updates and tower bar rendering

**725 lines · imports 8 · imported by 9**

## Exports

- `initHUD`
- `updateHUD`
- `renderTowers`
- `computeWaveDifficulty`
- `getWaveTypeClass`
- `getSpeedIndicator`
- `buildEnhancedWavePreview`
- `showWaveAnnouncement`
- `resetHUD`

## Imports

- [[engine-state|engine/state.js]]
- [[engine-events|engine/events.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]
- [[systems-particles|systems/particles.js]]
- [[config-waves|config/waves.js]]
- [[ui-currency-fly|ui/currency-fly.js]]
- [[ui-tooltips|ui/tooltips.js]]
- [[engine-postprocessing|engine/postprocessing.js]]

## Imported by

- [[engine-input|engine/input.js]]
- [[engine-loop|engine/loop.js]]
- [[root-main|main.js]]
- [[systems-enemies|systems/enemies.js]]
- [[systems-towers|systems/towers.js]]
- [[systems-waves|systems/waves.js]]
- [[ui-screens|ui/screens.js]]
- [[ui-tower-bar|ui/tower-bar.js]]
- [[ui-upgrade-sheet|ui/upgrade-sheet.js]]

## Links

- Layer: [[Layer - Ui]]
- [[Codebase Map]]
