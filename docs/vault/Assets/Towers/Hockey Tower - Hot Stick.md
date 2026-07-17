---
title: "Hockey Tower - Hot Stick"
kind: tower
theme: hockey
id: t7
role: DOT
cost: 140
tags:
  - asset
  - asset/tower
  - theme/hockey
  - role/dot
---
# 🔥 Hot Stick

![[hockey-tower-t7-hot-stick.svg]]

A vented furnace throwing a column of flame, with the vents glowing hot orange through the casing.

**How it plays.** By far the fastest fire rate in the game, but the per-hit damage is nearly the lowest — the burn is the real payload. Strong against tanky enemies where the DoT has time to tick, wasted on things that die instantly.

## Stats

Build cost **$140**, upgrades **$100 → $175 → $290**, **$705** to max.
Fires [[Hockey Projectile - fireball|fireball]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 15 | 24 | 36 | 52 |
| Range | 2.6 | 3 | 3.4 | 3.9 |
| Fire rate /s | 3.5 | 4.2 | 5 | 6 |
| Burst DPS | 52.5 | 100.8 | 180.0 | 312.0 |
| Burn /s | 10 | 16 | 24 | 35 |

## Special

- Burns for 10–35/s over 3s.

## Appearance

Colour `#f97316`, on the [[Hockey Theme]] palette. Mesh built by
`buildHockeyTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `hockey:6`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Hockey Theme]]
- Same role elsewhere — [[Soccer Tower - Flare|soccer/Flare]], [[Space Tower - Nova Flare|space/Nova Flare]]
- Defined in: `src/js/config/towers.js`
