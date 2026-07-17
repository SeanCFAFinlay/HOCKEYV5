---
title: "Hockey Enemy - Enforcer"
kind: enemy
theme: hockey
id: e10
role: BRUISER
hp: 180
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/bruiser
  - threat/ground
  - threat/armor
  - threat/bruiser
---
# Enforcer

![[hockey-enemy-e10-enforcer.svg]]

A mid-speed armored disruptor that fills the gap between swarm and tank. Hockey-only.

## Stats

| Stat | Value |
|---|---|
| Base HP | 180 |
| Effective HP | 240 |
| Speed | 1.5 (normal) |
| Reward | $35 (medium) |
| Size | 1.3 |
| Armor | 25% |
| Unlocks at wave | 6 |
| Wave weight | 0.6 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 25% less damage (240 effective HP).

## Appearance

Body `puck`, colour `#cc2936`, accent `#ff8080`, effects `spikes`. Resolved through the `bruiser` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `ground`, `armor`, `bruiser`
- Defined in: `src/js/config/enemies.js`
