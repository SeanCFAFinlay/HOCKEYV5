---
title: "Soccer Tower - Keeper"
kind: tower
theme: soccer
id: t5
role: CHOKEPOINT
cost: 200
tags:
  - asset
  - asset/tower
  - theme/soccer
  - role/chokepoint
---
# 🧤 Keeper

![[soccer-tower-t5-keeper.svg]]

A goal frame with the keeper diving across it, gloves glowing at full stretch.

**How it plays.** The shortest range of any tower in the game (1.8 at level 1) in exchange for the highest chokepoint damage. Even more position-dependent than hockey's Goalie.

## Stats

Build cost **$200**, upgrades **$140 → $250 → $420**, **$1010** to max.
Fires [[Soccer Projectile - glove|glove]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 110 | 170 | 255 | 385 |
| Range | 1.8 | 2.2 | 2.6 | 3 |
| Fire rate /s | 0.75 | 0.9 | 1.05 | 1.25 |
| Burst DPS | 82.5 | 153.0 | 267.8 | 481.3 |


## Appearance

Colour `#a855f7`, on the [[Soccer Theme]] palette. Mesh built by
`buildSoccerTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `soccer:4`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Soccer Theme]]
- Same role elsewhere — [[Hockey Tower - Goalie|hockey/Goalie]], [[Space Tower - Shield Node|space/Shield Node]]
- Defined in: `src/js/config/towers.js`
