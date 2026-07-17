---
title: "Hockey Map - Winter Classic"
kind: map
theme: hockey
difficulty: 7
layout: gauntlet
tags:
  - asset
  - asset/map
  - theme/hockey
  - layout/gauntlet
---
# Winter Classic

![[hockey-map-7-winter-classic.svg]]

Long gauntlet - sustained firepower needed. One long path that runs enemies past your whole defence. Favours sustained DPS over burst.

Unlocked by completing **Frozen Lake**.

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
| Pressure | `ground_swarm` |

Recommended towers: [[Hockey Tower - Slap Shot|Slap Shot]], [[Hockey Tower - Enforcer|Enforcer]], [[Hockey Tower - Ice Spray|Ice Spray]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Hockey Theme]]
- Layout family: all `gauntlet` maps — [[Hockey Map - Winter Classic|Winter Classic]], [[Soccer Map - Beach Field|Beach Field]]
- Defined in: `src/js/config/maps.js`
