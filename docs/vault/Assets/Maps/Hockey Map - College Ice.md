---
title: "Hockey Map - College Ice"
kind: map
theme: hockey
difficulty: 3
layout: split_lane
tags:
  - asset
  - asset/map
  - theme/hockey
  - layout/split-lane
---
# College Ice

![[hockey-map-3-college-ice.svg]]

Two lanes - split your defense. Distinct parallel paths to the base. Punishes stacking all your towers in one place.

Unlocked by completing **Local Arena**.

## Setup

| Setting | Value |
|---|---|
| Grid | 22 x 13 (286 cells) |
| Waves | 25 |
| Starting money | $750 |
| Lives | 15 |
| Difficulty | 3 / 10 |
| Layout | `split_lane` |
| Spawns | 2 |
| Campaign slot | 3 of 10 |
| Pressure | `ground_swarm` |

Recommended towers: [[Hockey Tower - Slap Shot|Slap Shot]], [[Hockey Tower - Enforcer|Enforcer]], [[Hockey Tower - Ice Spray|Ice Spray]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Hockey Theme]]
- Layout family: all `split_lane` maps — [[Hockey Map - College Ice|College Ice]], [[Hockey Map - World Championships|World Championships]], [[Soccer Map - Club Ground|Club Ground]], [[Soccer Map - Champions League|Champions League]], [[Space Map - Asteroid Gate|Asteroid Gate]]
- Defined in: `src/js/config/maps.js`
