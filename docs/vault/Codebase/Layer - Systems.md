---
title: "Layer - Systems"
tags:
  - code
  - layer-index
---
# `systems/`

Game mechanics: pathfinding, waves, towers, enemies, damage, particles, progression, persistence.

**14 modules · 4771 lines**

| Module | Purpose | LOC | In | Out |
|---|---|---|---|---|
| [[systems-pathfinding\|pathfinding.js]] | A* pathfinding with path caching Optimized to only recalculate when map changes | 250 | 8 | 2 |
| [[systems-particles\|particles.js]] | Particle system with object pooling and enhanced visuals Zero-allocation during gameplay | 880 | 7 | 2 |
| [[systems-storage\|storage.js]] | Persistent storage system using localStorage Handles save/load with versioning and migration | 386 | 6 | 0 |
| [[systems-waves\|waves.js]] | Wave management with game-time based spawning No setTimeout - all spawns tied to fixed timestep | 180 | 4 | 10 |
| [[systems-towers\|towers.js]] | Tower placement, targeting, and shooting Uses delta-time based cooldowns, not wall clock | 371 | 3 | 12 |
| [[systems-damage\|damage.js]] | Damage calculations and hit handling Includes visual feedback and effects | 329 | 2 | 5 |
| [[systems-enemies\|enemies.js]] | Enemy spawning and movement with state machine Delta-time based, deterministic movement | 496 | 2 | 11 |
| [[systems-progression\|progression.js]] | Progression system - map completion grading, unlocks, and rewards Integrates with storage and ev | 266 | 2 | 3 |
| [[systems-projectiles\|projectiles.js]] | Projectile creation and movement with enhanced visuals | 466 | 2 | 4 |
| [[systems-achievements\|achievements.js]] | Achievement system - track and award player accomplishments Integrates with events and storage | 356 | 1 | 3 |
| [[systems-auto-wave\|auto-wave.js]] | — | 17 | 1 | 0 |
| [[systems-map\|map.js]] | Map generation - grid setup and obstacle placement Uses map layout and spawn config for strategi | 491 | 1 | 5 |
| [[systems-settings\|settings.js]] | Game settings system Manages user preferences with persistence | 171 | 1 | 2 |
| [[systems-highscores\|highscores.js]] | High score system using localStorage Tracks best scores per theme/map combination | 112 | 0 | 0 |

[[Codebase Map]]
