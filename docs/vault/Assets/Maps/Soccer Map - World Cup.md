---
title: "Soccer Map - World Cup"
kind: map
theme: soccer
difficulty: 5
layout: crossover
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/crossover
---
# World Cup

![[soccer-map-5-world-cup.svg]]

Crossing paths - cover multiple angles. Paths cross in the middle, so centre placements cover several lanes at once. The reward for finding the intersection is real.

Unlocked by completing **Premier League**.

## Setup

| Setting | Value |
|---|---|
| Grid | 26 x 15 (390 cells) |
| Waves | 40 |
| Starting money | $1000 |
| Lives | 10 |
| Difficulty | 5 / 10 |
| Layout | `crossover` |
| Spawns | 3 |
| Campaign slot | 5 of 10 |
| Pressure | `mixed_lanes` |

Recommended towers: [[Soccer Tower - Striker|Striker]], [[Soccer Tower - Free Kick|Free Kick]], [[Soccer Tower - Playmaker|Playmaker]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Soccer Theme]]
- Layout family: all `crossover` maps — [[Hockey Map - Stanley Cup|Stanley Cup]], [[Hockey Map - Hall of Fame|Hall of Fame]], [[Soccer Map - World Cup|World Cup]], [[Soccer Map - Legendary Final|Legendary Final]]
- Defined in: `src/js/config/maps.js`
