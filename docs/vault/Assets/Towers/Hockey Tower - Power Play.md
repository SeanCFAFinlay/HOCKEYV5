---
title: "Hockey Tower - Power Play"
kind: tower
theme: hockey
id: t6
role: CHAIN
cost: 160
tags:
  - asset
  - asset/tower
  - theme/hockey
  - role/chain
---
# ⚡ Power Play

![[hockey-tower-t6-power-play.svg]]

A tesla coil: six spinning rings climbing a tapered mast to a pulsing electrode, with four grounding rods around the base.

**How it plays.** Chain count is the stat that matters, and it more than doubles across upgrades. Best against spread-out lines rather than tight clumps, where splash already wins.

## Stats

Build cost **$160**, upgrades **$120 → $200 → $340**, **$820** to max.
Fires [[Hockey Projectile - lightning|lightning]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 35 | 55 | 82 | 125 |
| Range | 3.5 | 4 | 4.5 | 5.1 |
| Fire rate /s | 0.85 | 1 | 1.15 | 1.35 |
| Burst DPS | 29.8 | 55.0 | 94.3 | 168.8 |
| Chain targets | 2 | 3 | 4 | 6 |

## Special

- Chains to 2–6 targets within 2.2 units.

## Appearance

Colour `#a855f7`, on the [[Hockey Theme]] palette. Mesh built by
`buildHockeyTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `hockey:5`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Hockey Theme]]
- Same role elsewhere — [[Soccer Tower - Playmaker|soccer/Playmaker]], [[Space Tower - Arc Relay|space/Arc Relay]]
- Defined in: `src/js/config/towers.js`
