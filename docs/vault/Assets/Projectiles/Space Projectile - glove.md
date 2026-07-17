---
title: "Space Projectile - glove"
kind: projectile
theme: space
speed: 9
tags:
  - asset
  - asset/projectile
  - theme/space
---
# glove

![[space-projectile-glove.svg]]

A simple sphere; shared by both goalkeeper towers across themes.

## Definition

| Field | Value |
|---|---|
| Mesh | `sphere` |
| Trail | `shield` |
| Impact | `save` |
| Colour | `#93c5fd` |
| Speed | 9 u/s |

Fired by: [[Space Tower - Shield Node|Shield Node]].

## Links

- Theme: [[Space Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `space.projectiles.glove`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
