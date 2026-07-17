---
title: "Soccer Enemy - Ball"
kind: enemy
theme: soccer
id: e1
role: SWARM
hp: 45
tags:
  - asset
  - asset/enemy
  - theme/soccer
  - role/swarm
  - threat/ground
  - threat/swarm
---
# Ball

![[soccer-enemy-e1-ball.svg]]

The soccer baseline — marginally faster and squishier than a Puck. Same role, same wave-1 arrival.

## Stats

| Stat | Value |
|---|---|
| Base HP | 45 |
| Effective HP | 45 |
| Speed | 2.5 (fast) |
| Reward | $10 (low) |
| Size | 1 |
| Armor | — |
| Unlocks at wave | 1 |
| Wave weight | 1.4 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.


## Appearance

Body `ball`, colour `#ffffff`, accent `#111111`. Resolved through the `swarm` slot of the [[Soccer Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Soccer Theme]]
- Threat tags: `ground`, `swarm`
- Defined in: `src/js/config/enemies.js`
