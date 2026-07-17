---
title: "Hockey Enemy - Speed Skater"
kind: enemy
theme: hockey
id: e8
role: SPEEDSTER
hp: 35
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/speedster
  - threat/ground
  - threat/swarm
  - threat/speed
---
# Speed Skater

![[hockey-enemy-e8-speed-skater.svg]]

The fastest thing in the game at 3.5 speed, and the most fragile at 35 HP. Pure pressure — designed to get past slow-firing towers before they cycle.

## Stats

| Stat | Value |
|---|---|
| Base HP | 35 |
| Effective HP | 35 |
| Speed | 3.5 (very_fast) |
| Reward | $12 (low) |
| Size | 0.85 |
| Armor | — |
| Unlocks at wave | 4 |
| Wave weight | 0.95 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.


## Appearance

Body `puck`, colour `#00eaff`, accent `#c8ffff`, effects `speedLines`. Resolved through the `speedster` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `ground`, `swarm`, `speed`
- Defined in: `src/js/config/enemies.js`
