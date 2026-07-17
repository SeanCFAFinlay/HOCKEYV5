---
title: "Space Map - Docking Bay"
kind: map
theme: space
difficulty: 1
layout: funnel
tags:
  - asset
  - asset/map
  - theme/space
  - layout/funnel
---
# Docking Bay

![[space-map-1-docking-bay.svg]]

Intro outpost lane defense. Multiple spawns converge on a single chokepoint. The forgiving layout — one killzone covers everything.

Unlocked by default.

## Setup

| Setting | Value |
|---|---|
| Grid | 18 x 11 (198 cells) |
| Waves | 12 |
| Starting money | $700 |
| Lives | 20 |
| Difficulty | 1 / 10 |
| Layout | `funnel` |
| Spawns | 1 |
| Campaign slot | 1 of 3 |
| Pressure | `prototype_mixed` |

Recommended towers: [[Space Tower - Laser Emitter|Laser Emitter]], [[Space Tower - Ion Snare|Ion Snare]], [[Space Tower - Arc Relay|Arc Relay]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Space Theme]]
- Layout family: all `funnel` maps — [[Hockey Map - Practice Rink|Practice Rink]], [[Soccer Map - Backyard|Backyard]], [[Space Map - Docking Bay|Docking Bay]]
- Defined in: `src/js/config/maps.js`
