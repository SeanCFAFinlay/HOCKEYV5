---
title: "Hockey Map - Practice Rink"
kind: map
theme: hockey
difficulty: 1
layout: funnel
tags:
  - asset
  - asset/map
  - theme/hockey
  - layout/funnel
---
# Practice Rink

![[hockey-map-1-practice-rink.svg]]

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
| Pressure | `ground_swarm` |

Recommended towers: [[Hockey Tower - Slap Shot|Slap Shot]], [[Hockey Tower - Enforcer|Enforcer]], [[Hockey Tower - Ice Spray|Ice Spray]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Hockey Theme]]
- Layout family: all `funnel` maps — [[Hockey Map - Practice Rink|Practice Rink]], [[Soccer Map - Backyard|Backyard]], [[Space Map - Docking Bay|Docking Bay]]
- Defined in: `src/js/config/maps.js`
