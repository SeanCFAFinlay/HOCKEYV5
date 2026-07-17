---
title: "Hockey Tower - Enforcer"
kind: tower
theme: hockey
id: t3
role: SPLASH
cost: 120
tags:
  - asset
  - asset/tower
  - theme/hockey
  - role/splash
---
# 👊 Enforcer

![[hockey-tower-t3-enforcer.svg]]

A broad-shouldered bruiser with red gloves that throw punches, ringed by expanding impact rings on the strike side.

**How it plays.** The theme's only early splash option, so it carries the anti-swarm load once Pucks start arriving in packs. Short range means it wants to sit on the path, not behind it.

## Stats

Build cost **$120**, upgrades **$90 → $155 → $260**, **$625** to max.
Fires [[Hockey Projectile - hammer|hammer]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 45 | 70 | 105 | 160 |
| Range | 2.5 | 2.9 | 3.3 | 3.8 |
| Fire rate /s | 0.55 | 0.65 | 0.78 | 0.92 |
| Burst DPS | 24.8 | 45.5 | 81.9 | 147.2 |
| Splash radius | 1.2 | 1.5 | 1.8 | 2.2 |

## Special

- Area damage on hit.

## Appearance

Colour `#f97316`, on the [[Hockey Theme]] palette. Mesh built by
`buildHockeyTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `hockey:2`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Hockey Theme]]
- Same role elsewhere — [[Soccer Tower - Header|soccer/Header]], [[Space Tower - Gravity Well|space/Gravity Well]]
- Defined in: `src/js/config/towers.js`
