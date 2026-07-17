---
title: "Hockey Map - Hall of Fame"
kind: map
theme: hockey
difficulty: 10
layout: crossover
tags:
  - asset
  - asset/map
  - theme/hockey
  - layout/crossover
---
# Hall of Fame

![[hockey-map-10-hall-of-fame.svg]]

Ultimate challenge - master all strategies. Paths cross in the middle, so centre placements cover several lanes at once. The reward for finding the intersection is real.

Unlocked by completing **All-Star Arena**.

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
| Pressure | `ground_swarm` |

Recommended towers: [[Hockey Tower - Slap Shot|Slap Shot]], [[Hockey Tower - Enforcer|Enforcer]], [[Hockey Tower - Ice Spray|Ice Spray]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Hockey Theme]]
- Layout family: all `crossover` maps — [[Hockey Map - Stanley Cup|Stanley Cup]], [[Hockey Map - Hall of Fame|Hall of Fame]], [[Soccer Map - World Cup|World Cup]], [[Soccer Map - Legendary Final|Legendary Final]]
- Defined in: `src/js/config/maps.js`
