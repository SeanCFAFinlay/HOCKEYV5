---
title: "Space Tower - Shield Node"
kind: tower
theme: space
id: t5
role: CHOKEPOINT
cost: 200
tags:
  - asset
  - asset/tower
  - theme/space
  - role/chokepoint
---
# 🛡️ Shield Node

![[space-tower-t5-shield-node.svg]]

Part of the `space` content pack, which is marked `stub-playable` — a proof that the engine is genuinely content-driven. Its stats are inherited unchanged from the soccer roster; only the name, icon and colour are overridden.


## Stats

Build cost **$200**, upgrades **$140 → $250 → $420**, **$1010** to max.
Fires [[Space Projectile - glove|glove]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 110 | 170 | 255 | 385 |
| Range | 1.8 | 2.2 | 2.6 | 3 |
| Fire rate /s | 0.75 | 0.9 | 1.05 | 1.25 |
| Burst DPS | 82.5 | 153.0 | 267.8 | 481.3 |


## Appearance

Colour `#93c5fd`, on the [[Space Theme]] palette. Mesh built by
`buildSpaceTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `space:generic-turret`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Space Theme]]
- Same role elsewhere — [[Hockey Tower - Goalie|hockey/Goalie]], [[Soccer Tower - Keeper|soccer/Keeper]]
- Defined in: `src/js/config/towers.js`
