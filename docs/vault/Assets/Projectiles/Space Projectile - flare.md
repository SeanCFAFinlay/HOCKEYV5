---
title: "Space Projectile - flare"
kind: projectile
theme: space
speed: 11
tags:
  - asset
  - asset/projectile
  - theme/space
---
# flare

![[space-projectile-flare.svg]]

A shard trailing firework sparks, burning on impact.

## Definition

| Field | Value |
|---|---|
| Mesh | `plasma` |
| Trail | `plasma` |
| Impact | `burn` |
| Colour | `#ff5ca8` |
| Speed | 11 u/s |

Fired by: [[Space Tower - Nova Flare|Nova Flare]].

## Links

- Theme: [[Space Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `space.projectiles.flare`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
