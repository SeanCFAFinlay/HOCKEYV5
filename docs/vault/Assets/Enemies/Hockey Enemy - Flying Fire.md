---
title: "Hockey Enemy - Flying Fire"
kind: enemy
theme: hockey
id: e6
role: FLYING_FIRE
hp: 120
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/flying-fire
  - threat/air
  - threat/flying
  - threat/fire
  - threat/elite
---
# Flying Fire

![[hockey-enemy-e6-flying-fire.svg]]

Flying plus fire — reaches the base over your obstacles and burns on death. Fast, fragile relative to the ground elites, and easy to miss until it is through.

## Stats

| Stat | Value |
|---|---|
| Base HP | 120 |
| Effective HP | 120 |
| Speed | 2.2 (fast) |
| Reward | $28 (medium) |
| Size | 1 |
| Armor | — |
| Unlocks at wave | 12 |
| Wave weight | 0.3 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Fire** — burn effect on death.
- **Flying** — ignores obstacles and pathing entirely.

## Appearance

Body `puck`, colour `#ff7a18`, accent `#9be8ff`, effects `wings`. Resolved through the `flying_fire` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `air`, `flying`, `fire`, `elite`
- Defined in: `src/js/config/enemies.js`
