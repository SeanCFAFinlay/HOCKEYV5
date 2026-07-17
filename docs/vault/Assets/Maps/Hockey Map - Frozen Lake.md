---
title: "Hockey Map - Frozen Lake"
kind: map
theme: hockey
difficulty: 6
layout: maze
tags:
  - asset
  - asset/map
  - theme/hockey
  - layout/maze
---
# Frozen Lake

![[hockey-map-6-frozen-lake.svg]]

Winding maze - maximize path length. Winding paths through obstacles. The layout that maximises path length, and so maximises time-in-range.

Unlocked by completing **Stanley Cup**.

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
| Pressure | `ground_swarm` |

Recommended towers: [[Hockey Tower - Slap Shot|Slap Shot]], [[Hockey Tower - Enforcer|Enforcer]], [[Hockey Tower - Ice Spray|Ice Spray]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Hockey Theme]]
- Layout family: all `maze` maps — [[Hockey Map - Frozen Lake|Frozen Lake]], [[Soccer Map - Street Pitch|Street Pitch]]
- Defined in: `src/js/config/maps.js`
