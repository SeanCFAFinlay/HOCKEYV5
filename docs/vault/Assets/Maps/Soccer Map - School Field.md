---
title: "Soccer Map - School Field"
kind: map
theme: soccer
difficulty: 2
layout: open_center
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/open-center
---
# School Field

![[soccer-map-2-school-field.svg]]

Open center - experiment with placements. A wide unobstructed middle with many valid placements. The sandbox layout.

Unlocked by completing **Backyard**.

## Setup

| Setting | Value |
|---|---|
| Grid | 20 x 12 (240 cells) |
| Waves | 20 |
| Starting money | $700 |
| Lives | 18 |
| Difficulty | 2 / 10 |
| Layout | `open_center` |
| Spawns | 2 |
| Campaign slot | 2 of 10 |
| Pressure | `mixed_lanes` |

Recommended towers: [[Soccer Tower - Striker|Striker]], [[Soccer Tower - Free Kick|Free Kick]], [[Soccer Tower - Playmaker|Playmaker]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Soccer Theme]]
- Layout family: all `open_center` maps — [[Hockey Map - Local Arena|Local Arena]], [[Soccer Map - School Field|School Field]], [[Space Map - Solar Yard|Solar Yard]]
- Defined in: `src/js/config/maps.js`
