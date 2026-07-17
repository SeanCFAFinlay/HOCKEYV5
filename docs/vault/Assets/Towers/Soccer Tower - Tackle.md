---
title: "Soccer Tower - Tackle"
kind: tower
theme: soccer
id: t4
role: CROWD_CONTROL
cost: 90
tags:
  - asset
  - asset/tower
  - theme/soccer
  - role/crowd-control
---
# 🦶 Tackle

![[soccer-tower-t4-tackle.svg]]

A slide tackle frozen mid-motion: body on its side, leg extended, boot studs glowing, dust kicking up behind.

**How it plays.** Same 50% slow as Ice Spray but shorter duration at low levels, traded for slightly more damage. A support piece — its job is to hold enemies inside someone else's range.

## Stats

Build cost **$90**, upgrades **$65 → $115 → $190**, **$460** to max.
Fires [[Soccer Projectile - tackle|tackle]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 20 | 32 | 48 | 70 |
| Range | 2.8 | 3.2 | 3.6 | 4.1 |
| Fire rate /s | 1.25 | 1.48 | 1.72 | 2 |
| Burst DPS | 25.0 | 47.4 | 82.6 | 140.0 |
| Slow duration | 1.8 | 2.4 | 3 | 3.8 |

## Special

- Slows by 50% for 1.8–3.8s.

## Appearance

Colour `#f97316`, on the [[Soccer Theme]] palette. Mesh built by
`buildSoccerTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `soccer:3`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Soccer Theme]]
- Same role elsewhere — [[Hockey Tower - Ice Spray|hockey/Ice Spray]], [[Space Tower - Ion Snare|space/Ion Snare]]
- Defined in: `src/js/config/towers.js`
