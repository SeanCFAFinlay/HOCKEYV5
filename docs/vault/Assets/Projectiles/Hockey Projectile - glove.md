---
title: "Hockey Projectile - glove"
kind: projectile
theme: hockey
speed: 8.8
tags:
  - asset
  - asset/projectile
  - theme/hockey
---
# glove

![[hockey-projectile-glove.svg]]

A simple sphere; shared by both goalkeeper towers across themes.

## Definition

| Field | Value |
|---|---|
| Mesh | `sphere` |
| Trail | `gold` |
| Impact | `slam` |
| Colour | `#ffd34d` |
| Speed | 8.8 u/s |

Fired by: [[Hockey Tower - Goalie|Goalie]].

## Links

- Theme: [[Hockey Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `hockey.projectiles.glove`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
