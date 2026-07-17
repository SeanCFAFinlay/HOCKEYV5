---
title: "Soccer Tower - Header"
kind: tower
theme: soccer
id: t3
role: SPLASH
cost: 120
tags:
  - asset
  - asset/tower
  - theme/soccer
  - role/splash
---
# 🤕 Header

![[soccer-tower-t3-header.svg]]

A player pitched forward mid-header, arms flung wide, impact rings blooming at the brow.

**How it plays.** Wider splash and more damage than hockey's Enforcer, with better range too — the soccer pack's crowd clear is straightforwardly stronger.

## Stats

Build cost **$120**, upgrades **$90 → $155 → $260**, **$625** to max.
Fires [[Soccer Projectile - headButt|headButt]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 50 | 78 | 118 | 178 |
| Range | 2.8 | 3.2 | 3.6 | 4.1 |
| Fire rate /s | 0.5 | 0.6 | 0.72 | 0.86 |
| Burst DPS | 25.0 | 46.8 | 85.0 | 153.1 |
| Splash radius | 1.3 | 1.6 | 2 | 2.4 |

## Special

- Area damage on hit.

## Appearance

Colour `#3b82f6`, on the [[Soccer Theme]] palette. Mesh built by
`buildSoccerTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `soccer:2`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Soccer Theme]]
- Same role elsewhere — [[Hockey Tower - Enforcer|hockey/Enforcer]], [[Space Tower - Gravity Well|space/Gravity Well]]
- Defined in: `src/js/config/towers.js`
