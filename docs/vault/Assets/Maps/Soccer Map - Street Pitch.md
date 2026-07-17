---
title: "Soccer Map - Street Pitch"
kind: map
theme: soccer
difficulty: 6
layout: maze
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/maze
---
# Street Pitch

![[soccer-map-6-street-pitch.svg]]

Winding maze - maximize path length. Winding paths through obstacles. The layout that maximises path length, and so maximises time-in-range.

Unlocked by completing **World Cup**.

## Setup

| Setting | Value |
|---|---|
| Grid | 28 x 16 (448 cells) |
| Waves | 45 |
| Starting money | $1200 |
| Lives | 8 |
| Difficulty | 6 / 10 |
| Layout | `maze` |
| Spawns | 2 |
| Campaign slot | 6 of 10 |
| Pressure | `mixed_lanes` |

Recommended towers: [[Soccer Tower - Striker|Striker]], [[Soccer Tower - Free Kick|Free Kick]], [[Soccer Tower - Playmaker|Playmaker]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Soccer Theme]]
- Layout family: all `maze` maps — [[Hockey Map - Frozen Lake|Frozen Lake]], [[Soccer Map - Street Pitch|Street Pitch]]
- Defined in: `src/js/config/maps.js`
