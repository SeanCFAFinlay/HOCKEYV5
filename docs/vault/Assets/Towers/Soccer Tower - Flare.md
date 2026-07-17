---
title: "Soccer Tower - Flare"
kind: tower
theme: soccer
id: t7
role: DOT
cost: 140
tags:
  - asset
  - asset/tower
  - theme/soccer
  - role/dot
---
# 🔥 Flare

![[soccer-tower-t7-flare.svg]]

A three-tube launcher venting stacked flares and drifting smoke.

**How it plays.** Burns harder and longer than Hot Stick but fires slower and reaches less far. The trade is more damage per tick, fewer ticks.

## Stats

Build cost **$140**, upgrades **$100 → $175 → $290**, **$705** to max.
Fires [[Soccer Projectile - flare|flare]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 16 | 26 | 40 | 58 |
| Range | 2.4 | 2.8 | 3.2 | 3.7 |
| Fire rate /s | 3.2 | 3.9 | 4.7 | 5.6 |
| Burst DPS | 51.2 | 101.4 | 188.0 | 324.8 |
| Burn /s | 12 | 18 | 28 | 40 |

## Special

- Burns for 12–40/s over 3.5s.

## Appearance

Colour `#ef4444`, on the [[Soccer Theme]] palette. Mesh built by
`buildSoccerTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `soccer:6`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Soccer Theme]]
- Same role elsewhere — [[Hockey Tower - Hot Stick|hockey/Hot Stick]], [[Space Tower - Nova Flare|space/Nova Flare]]
- Defined in: `src/js/config/towers.js`
