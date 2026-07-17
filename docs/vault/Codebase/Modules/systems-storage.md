---
title: "systems/storage.js"
layer: systems
loc: 386
fan_in: 6
fan_out: 0
tags:
  - code
  - layer/systems
---
# `systems/storage.js`

Persistent storage system using localStorage Handles save/load with versioning and migration

**386 lines · imports 0 · imported by 6**

## Exports

- `initStorage`
- `getSaveData`
- `saveMapCompletion`
- `getMapProgress`
- `isMapUnlocked`
- `getTotalStars`
- `updateStats`
- `getStats`
- `addAchievement`
- `hasAchievement`
- `getAchievements`
- `setSetting`
- `getSetting`
- `getSettings`
- `resetAllProgress`
- `exportSaveData`
- `importSaveData`

## Imports

_None. This is a leaf module._

## Imported by

- [[root-main|main.js]]
- [[systems-achievements|systems/achievements.js]]
- [[systems-progression|systems/progression.js]]
- [[systems-settings|systems/settings.js]]
- [[ui-modals|ui/modals.js]]
- [[ui-settings|ui/settings.js]]

## Links

- Layer: [[Layer - Systems]]
- [[Codebase Map]]
