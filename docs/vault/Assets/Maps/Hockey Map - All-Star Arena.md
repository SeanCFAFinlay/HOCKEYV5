---
title: "Hockey Map - All-Star Arena"
kind: map
theme: hockey
difficulty: 9
layout: multi_base
tags:
  - asset
  - asset/map
  - theme/hockey
  - layout/multi-base
---
# All-Star Arena

![[hockey-map-9-all-star-arena.svg]]

Multiple entry points - defend everywhere. Several base entry points. You cannot cover them all — the layout is about choosing what to concede.

Unlocked by completing **World Championships**.

## Setup

| Setting | Value |
|---|---|
| Grid | 34 x 19 (646 cells) |
| Waves | 60 |
| Starting money | $1500 |
| Lives | 5 |
| Difficulty | 9 / 10 |
| Layout | `multi_base` |
| Spawns | 3 |
| Campaign slot | 9 of 10 |
| Pressure | `ground_swarm` |

Recommended towers: [[Hockey Tower - Slap Shot|Slap Shot]], [[Hockey Tower - Enforcer|Enforcer]], [[Hockey Tower - Ice Spray|Ice Spray]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Hockey Theme]]
- Layout family: all `multi_base` maps — [[Hockey Map - All-Star Arena|All-Star Arena]], [[Soccer Map - Olympic Stadium|Olympic Stadium]]
- Defined in: `src/js/config/maps.js`
