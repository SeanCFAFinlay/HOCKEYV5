---
title: "Soccer Tower - Free Kick"
kind: tower
theme: soccer
id: t2
role: SNIPER
cost: 150
tags:
  - asset
  - asset/tower
  - theme/soccer
  - role/sniper
---
# 🎯 Free Kick

![[soccer-tower-t2-free-kick.svg]]

A ball on a tee behind a target arm, with a blinking laser sight and a spinning reticle downrange.

**How it plays.** The longest-reaching non-boss tower in the soccer roster and the hardest-hitting sniper of the two themes. Its curve stat makes the projectile arc rather than fly straight.

## Stats

Build cost **$150**, upgrades **$110 → $190 → $320**, **$770** to max.
Fires [[Soccer Projectile - curveBall|curveBall]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 75 | 118 | 175 | 265 |
| Range | 4.8 | 5.3 | 5.9 | 6.5 |
| Fire rate /s | 0.48 | 0.58 | 0.7 | 0.84 |
| Burst DPS | 36.0 | 68.4 | 122.5 | 222.6 |


## Appearance

Colour `#fbbf24`, on the [[Soccer Theme]] palette. Mesh built by
`buildSoccerTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `soccer:1`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Soccer Theme]]
- Same role elsewhere — [[Hockey Tower - Sniper|hockey/Sniper]], [[Space Tower - Plasma Cannon|space/Plasma Cannon]]
- Defined in: `src/js/config/towers.js`
