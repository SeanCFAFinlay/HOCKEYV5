---
title: "Space Projectile - tackle"
kind: projectile
theme: space
speed: 10
tags:
  - asset
  - asset/projectile
  - theme/space
---
# tackle

![[space-projectile-tackle.svg]]

A cone kicking up a dust trail.

## Definition

| Field | Value |
|---|---|
| Mesh | `bolt` |
| Trail | `ion` |
| Impact | `slam` |
| Colour | `#38bdf8` |
| Speed | 10 u/s |

Fired by: [[Space Tower - Ion Snare|Ion Snare]].

## Links

- Theme: [[Space Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `space.projectiles.tackle`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
