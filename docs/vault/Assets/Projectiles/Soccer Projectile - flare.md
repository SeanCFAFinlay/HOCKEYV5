---
title: "Soccer Projectile - flare"
kind: projectile
theme: soccer
speed: 9.5
tags:
  - asset
  - asset/projectile
  - theme/soccer
---
# flare

![[soccer-projectile-flare.svg]]

A shard trailing firework sparks, burning on impact.

## Definition

| Field | Value |
|---|---|
| Mesh | `shard` |
| Trail | `firework` |
| Impact | `burn` |
| Colour | `#ff4444` |
| Speed | 9.5 u/s |

Fired by: [[Soccer Tower - Flare|Flare]].

## Links

- Theme: [[Soccer Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `soccer.projectiles.flare`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
