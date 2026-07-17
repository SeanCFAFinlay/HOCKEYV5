---
title: "Hockey Projectile - fireball"
kind: projectile
theme: hockey
speed: 11
tags:
  - asset
  - asset/projectile
  - theme/hockey
---
# fireball

![[hockey-projectile-fireball.svg]]

A plasma ball trailing fire and burning on impact.

## Definition

| Field | Value |
|---|---|
| Mesh | `plasma` |
| Trail | `fire` |
| Impact | `burn` |
| Colour | `#ff4400` |
| Speed | 11 u/s |

Fired by: [[Hockey Tower - Hot Stick|Hot Stick]].

## Links

- Theme: [[Hockey Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `hockey.projectiles.fireball`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
