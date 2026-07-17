---
title: "Hockey Tower - Goalie"
kind: tower
theme: hockey
id: t5
role: CHOKEPOINT
cost: 200
tags:
  - asset
  - asset/tower
  - theme/hockey
  - role/chokepoint
---
# 🥅 Goalie

![[hockey-tower-t5-goalie.svg]]

Full goalie kit: leg pads, blocker, catching glove and a caged mask. Reads as a wall, which is exactly its job.

**How it plays.** The shortest range in the roster paired with the second-highest damage. It only pays off at a genuine chokepoint or as the last line before the base — anywhere else most of its DPS never finds a target.

## Stats

Build cost **$200**, upgrades **$140 → $250 → $420**, **$1010** to max.
Fires [[Hockey Projectile - glove|glove]].

|  | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Damage | 100 | 155 | 230 | 350 |
| Range | 2 | 2.4 | 2.8 | 3.2 |
| Fire rate /s | 0.7 | 0.85 | 1 | 1.2 |
| Burst DPS | 70.0 | 131.8 | 230.0 | 420.0 |


## Appearance

Colour `#ffd700`, on the [[Hockey Theme]] palette. Mesh built by
`buildHockeyTowerMesh` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette `hockey:4`), on the shared hex plinth every tower gets from
`createTowerMesh()`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[Hockey Theme]]
- Same role elsewhere — [[Soccer Tower - Keeper|soccer/Keeper]], [[Space Tower - Shield Node|space/Shield Node]]
- Defined in: `src/js/config/towers.js`
