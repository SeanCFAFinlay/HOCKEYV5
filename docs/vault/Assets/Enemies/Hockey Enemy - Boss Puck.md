---
title: "Hockey Enemy - Boss Puck"
kind: enemy
theme: hockey
id: e7
role: BOSS
hp: 2500
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/boss
  - threat/ground
  - threat/armor
  - threat/boss
---
# Boss Puck

![[hockey-enemy-e7-boss-puck.svg]]

The boss. 50x a Puck's HP, 35% armor, crawling. Boss-wave only, and worth more than 35 basic Pucks combined.

## Stats

| Stat | Value |
|---|---|
| Base HP | 2500 |
| Effective HP | 3846 |
| Speed | 0.35 (slow) |
| Reward | $380 (boss) |
| Size | 2.2 |
| Armor | 35% |
| Unlocks at wave | 5 |
| Wave weight | 0.08 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 35% less damage (3846 effective HP).
- **Boss** — spawns only on boss waves.

## Appearance

Body `puck`, colour `#070707`, accent `#ffd700`, effects `crown`. Resolved through the `boss` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `ground`, `armor`, `boss`
- Defined in: `src/js/config/enemies.js`
