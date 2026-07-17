---
title: "Soccer Map - Olympic Stadium"
kind: map
theme: soccer
difficulty: 9
layout: multi_base
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/multi-base
---
# Olympic Stadium

![[soccer-map-9-olympic-stadium.svg]]

Multiple entry points - defend everywhere. Several base entry points. You cannot cover them all — the layout is about choosing what to concede.

Unlocked by completing **Champions League**.

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
| Pressure | `mixed_lanes` |

Recommended towers: [[Soccer Tower - Striker|Striker]], [[Soccer Tower - Free Kick|Free Kick]], [[Soccer Tower - Playmaker|Playmaker]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Soccer Theme]]
- Layout family: all `multi_base` maps — [[Hockey Map - All-Star Arena|All-Star Arena]], [[Soccer Map - Olympic Stadium|Olympic Stadium]]
- Defined in: `src/js/config/maps.js`
