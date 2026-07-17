---
title: "Soccer Tower - Legend"
kind: tower
theme: soccer
id: t8
role: BOSS_KILLER
cost: 280
tags:
  - asset
  - asset/tower
  - theme/soccer
  - role/boss-killer
---
# 👑 Legend

![[soccer-tower-t8-legend.svg]]

A gold statue on a plinth with a name plaque, arms raised, crowned, ringed by three pulsing aura bands and eight orbiting sparkles.

**How it plays.** The single hardest-hitting tower in the game and the slowest — under one shot every five seconds at level 1. Boss insurance, nothing else.

## Stats

Build cost **$280**, upgrades **$200 → $360 → $600**, **$1440** to max.
Fires [[Soccer Projectile - legend|legend]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 220 | 350 | 525 | 790 |
| Range | 5.2 | 5.8 | 6.5 | 7.2 |
| Fire rate /s | 0.18 | 0.24 | 0.31 | 0.4 |
| Burst DPS | 39.6 | 84.0 | 162.8 | 316.0 |

## Special

- 45% critical hit chance.

## Appearance

Colour `#fbbf24`, on the [[Soccer Theme]] palette. Mesh built by
`buildSoccerTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `soccer:7`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Soccer Theme]]
- Same role elsewhere — [[Hockey Tower - Captain|hockey/Captain]], [[Space Tower - Command Core|space/Command Core]]
- Defined in: `src/js/config/towers.js`
