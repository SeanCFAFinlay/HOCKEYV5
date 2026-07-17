---
title: "config/enemies.js"
layer: config
loc: 212
fan_in: 1
fan_out: 0
tags:
  - code
  - layer/config
---
# `config/enemies.js`

Enemy definitions for each theme. Core systems consume these as data, not by array position. Required metadata: role, threatTags, unlockWave, waveWeight, speedClass, rewardClass Balance notes: - Base HP is scaled per-wave in systems/enemies.js: hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6) - Rewards are fixed values; stronger/boss enemies give more - Armor reduces damage taken as a flat multiplier (e.g., 0.35 = 35% damage reduction) ENEMY ROLES: - SWARM: Fast, weak, comes in numbers - tests AoE - FIRE: On death creates burn effect, moderate stats - FLYING: Bypasses obstacles, ignores pathing - tests positioning - ARMORED: High HP, slow, damage reduction - tests sustained DPS - ELITE: Combined traits (fire + armor) - late game challenge - FLYING_FIRE: Flying + fire - aerial threat - BOSS: Massive HP, armor, slow - tests entire defense - SPEEDSTER: Extremely fast, fragile pressure - BRUISER: Medium-speed armored disruptor

**212 lines · imports 0 · imported by 1**

## Exports

- `HOCKEY_ENEMIES`
- `SOCCER_ENEMIES`

## Imports

_None. This is a leaf module._

## Imported by

- [[config-themes|config/themes.js]]

## Links

- Layer: [[Layer - Config]]
- [[Codebase Map]]
