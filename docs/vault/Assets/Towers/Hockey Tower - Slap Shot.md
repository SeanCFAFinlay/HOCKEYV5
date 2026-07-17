---
title: "Hockey Tower - Slap Shot"
kind: tower
theme: hockey
id: t1
role: ANTI-SWARM
cost: 80
tags:
  - asset
  - asset/tower
  - theme/hockey
  - role/anti-swarm
---
# 🏒 Slap Shot

![[hockey-tower-t1-slap-shot.svg]]

The starter tower and the only one you can afford on wave 1. A skater winding up a slap shot, with the puck pulsing at the blade.

**How it plays.** Cheap enough to spam early and the fastest-firing option until Hot Stick unlocks. Its damage curve is deliberately unremarkable — it stops scaling around the point Heavy Pucks appear, which is the nudge toward Sniper and Enforcer.

## Stats

Build cost **$80**, upgrades **$60 → $100 → $170**, **$410** to max.
Fires [[Hockey Projectile - puck|puck]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 25 | 40 | 60 | 90 |
| Range | 2.8 | 3.2 | 3.6 | 4.1 |
| Fire rate /s | 1.2 | 1.4 | 1.7 | 2 |
| Burst DPS | 30.0 | 56.0 | 102.0 | 180.0 |


## Appearance

Colour `#00d4ff`, on the [[Hockey Theme]] palette. Mesh built by
`buildHockeyTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `hockey:0`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Hockey Theme]]
- Same role elsewhere — [[Soccer Tower - Striker|soccer/Striker]], [[Space Tower - Laser Emitter|space/Laser Emitter]]
- Defined in: `src/js/config/towers.js`
