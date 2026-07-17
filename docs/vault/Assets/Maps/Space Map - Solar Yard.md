---
title: "Space Map - Solar Yard"
kind: map
theme: space
difficulty: 2
layout: open_center
tags:
  - asset
  - asset/map
  - theme/space
  - layout/open-center
---
# Solar Yard

![[space-map-2-solar-yard.svg]]

Open resource yard. A wide unobstructed middle with many valid placements. The sandbox layout.

Unlocked by completing **Docking Bay**.

## Setup

| Setting | Value |
|---|---|
| Grid | 20 x 12 (240 cells) |
| Waves | 16 |
| Starting money | $760 |
| Lives | 18 |
| Difficulty | 2 / 10 |
| Layout | `open_center` |
| Spawns | 2 |
| Campaign slot | 2 of 3 |
| Pressure | `prototype_mixed` |

Recommended towers: [[Space Tower - Laser Emitter|Laser Emitter]], [[Space Tower - Ion Snare|Ion Snare]], [[Space Tower - Arc Relay|Arc Relay]].

> [!note] The image is the declared grid, not the played maze
> Only `cols`, `rows` and `spawns` are authored here. The actual obstacle
> layout is generated at runtime by `systems/map.js` from `level-layouts.js`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[Space Theme]]
- Layout family: all `open_center` maps — [[Hockey Map - Local Arena|Local Arena]], [[Soccer Map - School Field|School Field]], [[Space Map - Solar Yard|Solar Yard]]
- Defined in: `src/js/config/maps.js`
