---
title: "Hockey Tower - Sniper"
kind: tower
theme: hockey
id: t2
role: SNIPER
cost: 150
tags:
  - asset
  - asset/tower
  - theme/hockey
  - role/sniper
---
# 🎯 Sniper

![[hockey-tower-t2-sniper.svg]]

A tripod-mounted rifle with a scope and a red laser sight that blinks between shots. The longest reach in the hockey roster short of Captain.

**How it plays.** Built to delete single high-HP targets, and the natural answer to armored enemies that shrug off Slap Shot. Its slow rate makes it dead weight against swarms — pair it with something that clears chaff.

## Stats

Build cost **$150**, upgrades **$110 → $190 → $320**, **$770** to max.
Fires [[Hockey Projectile - dart|dart]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 70 | 110 | 165 | 250 |
| Range | 4.5 | 5 | 5.6 | 6.2 |
| Fire rate /s | 0.5 | 0.6 | 0.72 | 0.85 |
| Burst DPS | 35.0 | 66.0 | 118.8 | 212.5 |


## Appearance

Colour `#ef4444`, on the [[Hockey Theme]] palette. Mesh built by
`buildHockeyTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `hockey:1`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Hockey Theme]]
- Same role elsewhere — [[Soccer Tower - Free Kick|soccer/Free Kick]], [[Space Tower - Plasma Cannon|space/Plasma Cannon]]
- Defined in: `src/js/config/towers.js`
