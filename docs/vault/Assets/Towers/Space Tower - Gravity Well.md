---
title: "Space Tower - Gravity Well"
kind: tower
theme: space
id: t3
role: SPLASH
cost: 120
tags:
  - asset
  - asset/tower
  - theme/space
  - role/splash
---
# 🌀 Gravity Well

![[space-tower-t3-gravity-well.svg]]

Part of the `space` content pack, which is marked `stub-playable` — a proof that the engine is genuinely content-driven. Its stats are inherited unchanged from the soccer roster; only the name, icon and colour are overridden.


## Stats

Build cost **$120**, upgrades **$90 → $155 → $260**, **$625** to max.
Fires [[Space Projectile - headButt|headButt]].

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

Colour `#7dd3fc`, on the [[Space Theme]] palette. Mesh built by
`buildSpaceTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `space:gravity-ring`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Space Theme]]
- Same role elsewhere — [[Hockey Tower - Enforcer|hockey/Enforcer]], [[Soccer Tower - Header|soccer/Header]]
- Defined in: `src/js/config/towers.js`
