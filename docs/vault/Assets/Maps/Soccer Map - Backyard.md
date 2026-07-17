---
title: "Soccer Map - Backyard"
kind: map
theme: soccer
difficulty: 1
layout: funnel
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/funnel
---
# Backyard

![[soccer-map-1-backyard.svg]]

Simple funnel layout - learn the basics. Multiple spawns converge on a single chokepoint. The forgiving layout — one killzone covers everything.

Unlocked by default.

## Setup

| Setting | Value |
|---|---|
| Grid | 18 x 11 (198 cells) |
| Waves | 15 |
| Starting money | $650 |
| Lives | 20 |
| Difficulty | 1 / 10 |
| Layout | `funnel` |
| Spawns | 1 |
| Campaign slot | 1 of 10 |
| Pressure | `mixed_lanes` |

Recommended towers: [[Soccer Tower - Striker|Striker]], [[Soccer Tower - Free Kick|Free Kick]], [[Soccer Tower - Playmaker|Playmaker]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Soccer Theme]]
- Layout family: all `funnel` maps — [[Hockey Map - Practice Rink|Practice Rink]], [[Soccer Map - Backyard|Backyard]], [[Space Map - Docking Bay|Docking Bay]]
- Defined in: `src/js/config/maps.js`
