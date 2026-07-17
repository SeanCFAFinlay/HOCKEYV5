---
title: "Hockey Tower - Captain"
kind: tower
theme: hockey
id: t8
role: BOSS_KILLER
cost: 280
tags:
  - asset
  - asset/tower
  - theme/hockey
  - role/boss-killer
---
# 👑 Captain

![[hockey-tower-t8-captain.svg]]

The trophy itself: a gold cup with handles, a spiked crown, a spinning red gem, and sparkles orbiting the whole thing.

**How it plays.** The most expensive tower and the slowest-firing by a wide margin. It exists for boss waves — its crit chance and huge per-shot damage are wasted on anything that would have died anyway.

## Stats

Build cost **$280**, upgrades **$200 → $360 → $600**, **$1440** to max.
Fires [[Hockey Projectile - star|star]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 200 | 320 | 480 | 720 |
| Range | 5.5 | 6.1 | 6.8 | 7.5 |
| Fire rate /s | 0.2 | 0.26 | 0.33 | 0.42 |
| Burst DPS | 40.0 | 83.2 | 158.4 | 302.4 |

## Special

- 40% critical hit chance.

## Appearance

Colour `#fbbf24`, on the [[Hockey Theme]] palette. Mesh built by
`buildHockeyTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `hockey:7`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Hockey Theme]]
- Same role elsewhere — [[Soccer Tower - Legend|soccer/Legend]], [[Space Tower - Command Core|space/Command Core]]
- Defined in: `src/js/config/towers.js`
