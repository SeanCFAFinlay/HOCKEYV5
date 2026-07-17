---
title: "Soccer Map - Legendary Final"
kind: map
theme: soccer
difficulty: 10
layout: crossover
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/crossover
---
# Legendary Final

![[soccer-map-10-legendary-final.svg]]

Ultimate challenge - master all strategies. Paths cross in the middle, so centre placements cover several lanes at once. The reward for finding the intersection is real.

Unlocked by completing **Olympic Stadium**.

## Setup

| Setting | Value |
|---|---|
| Grid | 36 x 20 (720 cells) |
| Waves | 65 |
| Starting money | $1600 |
| Lives | 4 |
| Difficulty | 10 / 10 |
| Layout | `crossover` |
| Spawns | 4 |
| Campaign slot | 10 of 10 |
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
