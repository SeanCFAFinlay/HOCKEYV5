---
title: "Hockey Projectile - hammer"
kind: projectile
theme: hockey
speed: 8
tags:
  - asset
  - asset/projectile
  - theme/hockey
---
# hammer

![[hockey-projectile-hammer.svg]]

A slow, heavy block with a shockwave trail and a ring impact.

## Definition

| Field | Value |
|---|---|
| Mesh | `block` |
| Trail | `shock` |
| Impact | `ring` |
| Colour | `#ff8844` |
| Speed | 8 u/s |

Fired by: [[Hockey Tower - Enforcer|Enforcer]].

## Links

- Theme: [[Hockey Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `hockey.projectiles.hammer`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
