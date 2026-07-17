---
title: "Hockey Tower - Ice Spray"
kind: tower
theme: hockey
id: t4
role: CROWD_CONTROL
cost: 90
tags:
  - asset
  - asset/tower
  - theme/hockey
  - role/crowd-control
---
# ❄️ Ice Spray

![[hockey-tower-t4-ice-spray.svg]]

A zamboni with a glowing coolant tank and a rake of five nozzles, trailing floating ice crystals.

**How it plays.** A force multiplier, not a damage dealer — its damage is the lowest in the roster on purpose. Value comes from the slow, so place it where enemies enter a killzone rather than where they leave it.

## Stats

Build cost **$90**, upgrades **$65 → $115 → $190**, **$460** to max.
Fires [[Hockey Projectile - shard|shard]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 18 | 28 | 42 | 60 |
| Range | 3 | 3.4 | 3.8 | 4.3 |
| Fire rate /s | 1.3 | 1.55 | 1.8 | 2.1 |
| Burst DPS | 23.4 | 43.4 | 75.6 | 126.0 |
| Slow duration | 2 | 2.5 | 3.2 | 4 |

## Special

- Slows by 50% for 2–4s.

## Appearance

Colour `#38bdf8`, on the [[Hockey Theme]] palette. Mesh built by
`buildHockeyTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `hockey:3`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Hockey Theme]]
- Same role elsewhere — [[Soccer Tower - Tackle|soccer/Tackle]], [[Space Tower - Ion Snare|space/Ion Snare]]
- Defined in: `src/js/config/towers.js`
