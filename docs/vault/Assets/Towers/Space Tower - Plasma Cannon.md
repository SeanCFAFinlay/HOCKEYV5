---
title: "Space Tower - Plasma Cannon"
kind: tower
theme: space
id: t2
role: SNIPER
cost: 150
tags:
  - asset
  - asset/tower
  - theme/space
  - role/sniper
---
# 🟣 Plasma Cannon

![[space-tower-t2-plasma-cannon.svg]]

Part of the `space` content pack, which is marked `stub-playable` — a proof that the engine is genuinely content-driven. Its stats are inherited unchanged from the soccer roster; only the name, icon and colour are overridden.


## Stats

Build cost **$150**, upgrades **$110 → $190 → $320**, **$770** to max.
Fires [[Space Projectile - curveBall|curveBall]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 75 | 118 | 175 | 265 |
| Range | 4.8 | 5.3 | 5.9 | 6.5 |
| Fire rate /s | 0.48 | 0.58 | 0.7 | 0.84 |
| Burst DPS | 36.0 | 68.4 | 122.5 | 222.6 |


## Appearance

Colour `#c084fc`, on the [[Space Theme]] palette. Mesh built by
`buildSpaceTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `space:plasma-cannon`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Space Theme]]
- Same role elsewhere — [[Hockey Tower - Sniper|hockey/Sniper]], [[Soccer Tower - Free Kick|soccer/Free Kick]]
- Defined in: `src/js/config/towers.js`
