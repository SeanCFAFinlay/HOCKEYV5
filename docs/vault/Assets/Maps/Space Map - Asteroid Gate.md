---
title: "Space Map - Asteroid Gate"
kind: map
theme: space
difficulty: 3
layout: split_lane
tags:
  - asset
  - asset/map
  - theme/space
  - layout/split-lane
---
# Asteroid Gate

![[space-map-3-asteroid-gate.svg]]

Two-lane asteroid pressure. Distinct parallel paths to the base. Punishes stacking all your towers in one place.

Unlocked by completing **Solar Yard**.

## Setup

| Setting | Value |
|---|---|
| Grid | 22 x 13 (286 cells) |
| Waves | 20 |
| Starting money | $840 |
| Lives | 15 |
| Difficulty | 3 / 10 |
| Layout | `split_lane` |
| Spawns | 2 |
| Campaign slot | 3 of 3 |
| Pressure | `prototype_mixed` |

Recommended towers: [[Space Tower - Laser Emitter|Laser Emitter]], [[Space Tower - Ion Snare|Ion Snare]], [[Space Tower - Arc Relay|Arc Relay]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Space Theme]]
- Layout family: all `split_lane` maps — [[Hockey Map - College Ice|College Ice]], [[Hockey Map - World Championships|World Championships]], [[Soccer Map - Club Ground|Club Ground]], [[Soccer Map - Champions League|Champions League]], [[Space Map - Asteroid Gate|Asteroid Gate]]
- Defined in: `src/js/config/maps.js`
