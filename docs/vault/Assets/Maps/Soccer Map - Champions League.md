---
title: "Soccer Map - Champions League"
kind: map
theme: soccer
difficulty: 8
layout: split_lane
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/split-lane
---
# Champions League

![[soccer-map-8-champions-league.svg]]

Four lanes - test your multitasking. Distinct parallel paths to the base. Punishes stacking all your towers in one place.

Unlocked by completing **Beach Field**.

## Setup

| Setting | Value |
|---|---|
| Grid | 32 x 18 (576 cells) |
| Waves | 55 |
| Starting money | $1400 |
| Lives | 6 |
| Difficulty | 8 / 10 |
| Layout | `split_lane` |
| Spawns | 4 |
| Campaign slot | 8 of 10 |
| Pressure | `mixed_lanes` |

Recommended towers: [[Soccer Tower - Striker|Striker]], [[Soccer Tower - Free Kick|Free Kick]], [[Soccer Tower - Playmaker|Playmaker]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Soccer Theme]]
- Layout family: all `split_lane` maps — [[Hockey Map - College Ice|College Ice]], [[Hockey Map - World Championships|World Championships]], [[Soccer Map - Club Ground|Club Ground]], [[Soccer Map - Champions League|Champions League]], [[Space Map - Asteroid Gate|Asteroid Gate]]
- Defined in: `src/js/config/maps.js`
