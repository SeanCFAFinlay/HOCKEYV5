---
title: "Hockey Map - Pro Stadium"
kind: map
theme: hockey
difficulty: 4
layout: chokepoint
tags:
  - asset
  - asset/map
  - theme/hockey
  - layout/chokepoint
---
# Pro Stadium

![[hockey-map-4-pro-stadium.svg]]

Natural chokepoints - control the flow. Natural narrow passages the pathing has to squeeze through. Where short-range, high-damage towers finally pay off.

Unlocked by completing **College Ice**.

## Setup

| Setting | Value |
|---|---|
| Grid | 24 x 14 (336 cells) |
| Waves | 30 |
| Starting money | $850 |
| Lives | 12 |
| Difficulty | 4 / 10 |
| Layout | `chokepoint` |
| Spawns | 3 |
| Campaign slot | 4 of 10 |
| Pressure | `ground_swarm` |

Recommended towers: [[Hockey Tower - Slap Shot|Slap Shot]], [[Hockey Tower - Enforcer|Enforcer]], [[Hockey Tower - Ice Spray|Ice Spray]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Hockey Theme]]
- Layout family: all `chokepoint` maps — [[Hockey Map - Pro Stadium|Pro Stadium]], [[Soccer Map - Premier League|Premier League]]
- Defined in: `src/js/config/maps.js`
