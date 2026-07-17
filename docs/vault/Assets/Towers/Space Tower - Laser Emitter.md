---
title: "Space Tower - Laser Emitter"
kind: tower
theme: space
id: t1
role: ANTI-SWARM
cost: 80
tags:
  - asset
  - asset/tower
  - theme/space
  - role/anti-swarm
---
# 🔷 Laser Emitter

![[space-tower-t1-laser-emitter.svg]]

Part of the `space` content pack, which is marked `stub-playable` — a proof that the engine is genuinely content-driven. Its stats are inherited unchanged from the soccer roster; only the name, icon and colour are overridden.


## Stats

Build cost **$80**, upgrades **$60 → $100 → $170**, **$410** to max.
Fires [[Space Projectile - ball|ball]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 28 | 44 | 66 | 100 |
| Range | 2.6 | 3 | 3.4 | 3.9 |
| Fire rate /s | 1.15 | 1.35 | 1.6 | 1.9 |
| Burst DPS | 32.2 | 59.4 | 105.6 | 190.0 |


## Appearance

Colour `#67e8f9`, on the [[Space Theme]] palette. Mesh built by
`buildSpaceTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `space:laser`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Space Theme]]
- Same role elsewhere — [[Hockey Tower - Slap Shot|hockey/Slap Shot]], [[Soccer Tower - Striker|soccer/Striker]]
- Defined in: `src/js/config/towers.js`
