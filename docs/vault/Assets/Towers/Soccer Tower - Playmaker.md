---
title: "Soccer Tower - Playmaker"
kind: tower
theme: soccer
id: t6
role: CHAIN
cost: 160
tags:
  - asset
  - asset/tower
  - theme/soccer
  - role/chain
---
# 🔄 Playmaker

![[soccer-tower-t6-playmaker.svg]]

A hub with three pentagon-flecked balls orbiting a pulsing octahedral core inside two tilted rings.

**How it plays.** Chains to more targets than Power Play at max (7 vs 6) and reaches further. The best answer in either theme to enemies arriving in a long strung-out line.

## Stats

Build cost **$160**, upgrades **$120 → $200 → $340**, **$820** to max.
Fires [[Soccer Projectile - chain|chain]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 38 | 60 | 90 | 135 |
| Range | 3.8 | 4.3 | 4.9 | 5.5 |
| Fire rate /s | 0.82 | 0.96 | 1.12 | 1.3 |
| Burst DPS | 31.2 | 57.6 | 100.8 | 175.5 |
| Chain targets | 2 | 3 | 5 | 7 |

## Special

- Chains to 2–7 targets within 2.5 units.

## Appearance

Colour `#06b6d4`, on the [[Soccer Theme]] palette. Mesh built by
`buildSoccerTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `soccer:5`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Soccer Theme]]
- Same role elsewhere — [[Hockey Tower - Power Play|hockey/Power Play]], [[Space Tower - Arc Relay|space/Arc Relay]]
- Defined in: `src/js/config/towers.js`
