---
title: "Space Tower - Arc Relay"
kind: tower
theme: space
id: t6
role: CHAIN
cost: 160
tags:
  - asset
  - asset/tower
  - theme/space
  - role/chain
---
# ⚡ Arc Relay

![[space-tower-t6-arc-relay.svg]]

Part of the `space` content pack, which is marked `stub-playable` — a proof that the engine is genuinely content-driven. Its stats are inherited unchanged from the soccer roster; only the name, icon and colour are overridden.


## Stats

Build cost **$160**, upgrades **$120 → $200 → $340**, **$820** to max.
Fires [[Space Projectile - chain|chain]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 38 | 60 | 90 | 135 |
| Range | 3.8 | 4.3 | 4.9 | 5.5 |
| Fire rate /s | 0.82 | 0.96 | 1.12 | 1.3 |
| Burst DPS | 31.2 | 57.6 | 100.8 | 175.5 |
| Chain targets | 2 | 3 | 5 | 7 |

## Special

- Chains to 2–7 targets within 2.5 units.

## Appearance

Colour `#f0abfc`, on the [[Space Theme]] palette. Mesh built by
`buildSpaceTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `space:arc-reactor`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Space Theme]]
- Same role elsewhere — [[Hockey Tower - Power Play|hockey/Power Play]], [[Soccer Tower - Playmaker|soccer/Playmaker]]
- Defined in: `src/js/config/towers.js`
