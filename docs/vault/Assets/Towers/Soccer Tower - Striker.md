---
title: "Soccer Tower - Striker"
kind: tower
theme: soccer
id: t1
role: ANTI-SWARM
cost: 80
tags:
  - asset
  - asset/tower
  - theme/soccer
  - role/anti-swarm
---
# ⚽ Striker

![[soccer-tower-t1-striker.svg]]

A striker mid-kick — planted leg, extended leg, ball pulsing at the boot with pentagon decals.

**How it plays.** The hockey Slap Shot with the numbers nudged: more damage, slightly less range and a hair slower. Same job, same early-game ceiling.

## Stats

Build cost **$80**, upgrades **$60 → $100 → $170**, **$410** to max.
Fires [[Soccer Projectile - ball|ball]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 28 | 44 | 66 | 100 |
| Range | 2.6 | 3 | 3.4 | 3.9 |
| Fire rate /s | 1.15 | 1.35 | 1.6 | 1.9 |
| Burst DPS | 32.2 | 59.4 | 105.6 | 190.0 |


## Appearance

Colour `#22c55e`, on the [[Soccer Theme]] palette. Mesh built by
`buildSoccerTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `soccer:0`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Soccer Theme]]
- Same role elsewhere — [[Hockey Tower - Slap Shot|hockey/Slap Shot]], [[Space Tower - Laser Emitter|space/Laser Emitter]]
- Defined in: `src/js/config/towers.js`
