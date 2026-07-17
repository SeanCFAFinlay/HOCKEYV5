---
title: "Soccer Enemy - Fire Ball"
kind: enemy
theme: soccer
id: e2
role: FIRE
hp: 65
tags:
  - asset
  - asset/enemy
  - theme/soccer
  - role/fire
  - threat/ground
  - threat/fire
---
# Fire Ball

![[soccer-enemy-e2-fire-ball.svg]]

A Ball that burns. The soccer mirror of Hot Puck, a touch faster and slightly less healthy.

## Stats

| Stat | Value |
|---|---|
| Base HP | 65 |
| Effective HP | 65 |
| Speed | 2.1 (normal) |
| Reward | $15 (low) |
| Size | 1 |
| Armor | — |
| Unlocks at wave | 2 |
| Wave weight | 0.9 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Fire** — burn effect on death.

## Appearance

Body `ball`, colour `#ff5522`, accent `#ffdd66`. Resolved through the `fire` slot of the [[Soccer Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Soccer Theme]]
- Threat tags: `ground`, `fire`
- Defined in: `src/js/config/enemies.js`
