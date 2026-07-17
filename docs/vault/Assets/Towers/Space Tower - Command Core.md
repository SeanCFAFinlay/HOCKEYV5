---
title: "Space Tower - Command Core"
kind: tower
theme: space
id: t8
role: BOSS_KILLER
cost: 280
tags:
  - asset
  - asset/tower
  - theme/space
  - role/boss-killer
---
# ✦ Command Core

![[space-tower-t8-command-core.svg]]

Part of the `space` content pack, which is marked `stub-playable` — a proof that the engine is genuinely content-driven. Its stats are inherited unchanged from the soccer roster; only the name, icon and colour are overridden.


## Stats

Build cost **$280**, upgrades **$200 → $360 → $600**, **$1440** to max.
Fires [[Space Projectile - legend|legend]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 220 | 350 | 525 | 790 |
| Range | 5.2 | 5.8 | 6.5 | 7.2 |
| Fire rate /s | 0.18 | 0.24 | 0.31 | 0.4 |
| Burst DPS | 39.6 | 84.0 | 162.8 | 316.0 |

## Special

- 45% critical hit chance.

## Appearance

Colour `#fbbf24`, on the [[Space Theme]] palette. Mesh built by
`buildSpaceTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `space:generic-turret`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Space Theme]]
- Same role elsewhere — [[Hockey Tower - Captain|hockey/Captain]], [[Soccer Tower - Legend|soccer/Legend]]
- Defined in: `src/js/config/towers.js`
