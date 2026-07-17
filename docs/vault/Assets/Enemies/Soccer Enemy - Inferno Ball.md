---
title: "Soccer Enemy - Inferno Ball"
kind: enemy
theme: soccer
id: e5
role: ELITE
hp: 450
tags:
  - asset
  - asset/enemy
  - theme/soccer
  - role/elite
  - threat/ground
  - threat/fire
  - threat/armor
  - threat/elite
---
# Inferno Ball

![[soccer-enemy-e5-inferno-ball.svg]]

The highest non-boss HP in the game at 450, with fire and 35% armor on top.

## Stats

| Stat | Value |
|---|---|
| Base HP | 450 |
| Effective HP | 692 |
| Speed | 0.5 (slow) |
| Reward | $65 (high) |
| Size | 1.5 |
| Armor | 35% |
| Unlocks at wave | 10 |
| Wave weight | 0.35 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 35% less damage (692 effective HP).
- **Fire** — burn effect on death.

## Appearance

Body `ball`, colour `#f97316`, accent `#fef08a`, effects `armorPlates`. Resolved through the `elite` slot of the [[Soccer Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Soccer Theme]]
- Threat tags: `ground`, `fire`, `armor`, `elite`
- Defined in: `src/js/config/enemies.js`
