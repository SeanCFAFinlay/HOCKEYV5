---
title: "Space Enemy - Flying Fire"
kind: enemy
theme: space
id: e6
role: FLYING_FIRE
hp: 130
tags:
  - asset
  - asset/enemy
  - theme/space
  - role/flying-fire
  - threat/air
  - threat/flying
  - threat/fire
  - threat/elite
---
# Flying Fire

![[space-enemy-e6-flying-fire.svg]]

Inherited wholesale from the soccer roster with "Ball" renamed to "Drone" — stats, roles and wave weights are untouched. The space pack has no speedster or bruiser, because those exist only in hockey.

## Stats

| Stat | Value |
|---|---|
| Base HP | 130 |
| Effective HP | 130 |
| Speed | 2.3 (fast) |
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

Body `orb`, colour `#ff5ca8`, accent `#67e8f9`, effects `wings`. Resolved through the `flying_fire` slot of the [[Space Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Space Theme]]
- Threat tags: `air`, `flying`, `fire`, `elite`
- Defined in: `src/js/config/enemies.js`
