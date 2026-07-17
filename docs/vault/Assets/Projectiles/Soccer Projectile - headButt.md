---
title: "Soccer Projectile - headButt"
kind: projectile
theme: soccer
speed: 8.5
tags:
  - asset
  - asset/projectile
  - theme/soccer
---
# headButt

![[soccer-projectile-headbutt.svg]]

An expanding ring with a shockwave trail.

## Definition

| Field | Value |
|---|---|
| Mesh | `ring` |
| Trail | `shock` |
| Impact | `ring` |
| Colour | `#22dddd` |
| Speed | 8.5 u/s |

Fired by: [[Soccer Tower - Header|Header]].

## Links

- Theme: [[Soccer Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `soccer.projectiles.headButt`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
