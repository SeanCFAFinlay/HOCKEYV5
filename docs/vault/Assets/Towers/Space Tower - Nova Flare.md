---
title: "Space Tower - Nova Flare"
kind: tower
theme: space
id: t7
role: DOT
cost: 140
tags:
  - asset
  - asset/tower
  - theme/space
  - role/dot
---
# ☄️ Nova Flare

![[space-tower-t7-nova-flare.svg]]

Part of the `space` content pack, which is marked `stub-playable` — a proof that the engine is genuinely content-driven. Its stats are inherited unchanged from the soccer roster; only the name, icon and colour are overridden.


## Stats

Build cost **$140**, upgrades **$100 → $175 → $290**, **$705** to max.
Fires [[Space Projectile - flare|flare]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 16 | 26 | 40 | 58 |
| Range | 2.4 | 2.8 | 3.2 | 3.7 |
| Fire rate /s | 3.2 | 3.9 | 4.7 | 5.6 |
| Burst DPS | 51.2 | 101.4 | 188.0 | 324.8 |
| Burn /s | 12 | 18 | 28 | 40 |

## Special

- Burns for 12–40/s over 3.5s.

## Appearance

Colour `#ff5ca8`, on the [[Space Theme]] palette. Mesh built by
`buildSpaceTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `space:plasma-cannon`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Space Theme]]
- Same role elsewhere — [[Hockey Tower - Hot Stick|hockey/Hot Stick]], [[Soccer Tower - Flare|soccer/Flare]]
- Defined in: `src/js/config/towers.js`
