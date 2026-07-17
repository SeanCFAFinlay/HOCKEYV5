---
title: "Hockey Enemy - Inferno Puck"
kind: enemy
theme: hockey
id: e5
role: ELITE
hp: 400
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/elite
  - threat/ground
  - threat/fire
  - threat/armor
  - threat/elite
---
# Inferno Puck

![[hockey-enemy-e5-inferno-puck.svg]]

Fire and armor on one body. Arrives at wave 10 and is the point where an all-in-on-one-tower defence usually falls over.

## Stats

| Stat | Value |
|---|---|
| Base HP | 400 |
| Effective HP | 571 |
| Speed | 0.55 (slow) |
| Reward | $65 (high) |
| Size | 1.5 |
| Armor | 30% |
| Unlocks at wave | 10 |
| Wave weight | 0.35 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 30% less damage (571 effective HP).
- **Fire** — burn effect on death.

## Appearance

Body `puck`, colour `#ff6b1a`, accent `#334466`, effects `armorPlates`. Resolved through the `elite` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `ground`, `fire`, `armor`, `elite`
- Defined in: `src/js/config/enemies.js`
