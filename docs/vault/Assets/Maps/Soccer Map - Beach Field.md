---
title: "Soccer Map - Beach Field"
kind: map
theme: soccer
difficulty: 7
layout: gauntlet
tags:
  - asset
  - asset/map
  - theme/soccer
  - layout/gauntlet
---
# Beach Field

![[soccer-map-7-beach-field.svg]]

Long gauntlet - sustained firepower needed. One long path that runs enemies past your whole defence. Favours sustained DPS over burst.

Unlocked by completing **Street Pitch**.

## Setup

| Setting | Value |
|---|---|
| Grid | 30 x 17 (510 cells) |
| Waves | 50 |
| Starting money | $1300 |
| Lives | 7 |
| Difficulty | 7 / 10 |
| Layout | `gauntlet` |
| Spawns | 2 |
| Campaign slot | 7 of 10 |
| Pressure | `mixed_lanes` |

Recommended towers: [[Soccer Tower - Striker|Striker]], [[Soccer Tower - Free Kick|Free Kick]], [[Soccer Tower - Playmaker|Playmaker]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Soccer Theme]]
- Layout family: all `gauntlet` maps — [[Hockey Map - Winter Classic|Winter Classic]], [[Soccer Map - Beach Field|Beach Field]]
- Defined in: `src/js/config/maps.js`
