---
title: "Soccer Map - Premier League"
kind: map
theme: soccer
difficulty: 4
layout: chokepoint
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/chokepoint
---
# Premier League

![[soccer-map-4-premier-league.svg]]

Natural chokepoints - control the flow. Natural narrow passages the pathing has to squeeze through. Where short-range, high-damage towers finally pay off.

Unlocked by completing **Club Ground**.

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
| Pressure | `mixed_lanes` |

Recommended towers: [[Soccer Tower - Striker|Striker]], [[Soccer Tower - Free Kick|Free Kick]], [[Soccer Tower - Playmaker|Playmaker]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Soccer Theme]]
- Layout family: all `chokepoint` maps — [[Hockey Map - Pro Stadium|Pro Stadium]], [[Soccer Map - Premier League|Premier League]]
- Defined in: `src/js/config/maps.js`
