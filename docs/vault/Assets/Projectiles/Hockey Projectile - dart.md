---
title: "Hockey Projectile - dart"
kind: projectile
theme: hockey
speed: 13
tags:
  - asset
  - asset/projectile
  - theme/hockey
---
# dart

![[hockey-projectile-dart.svg]]

A fast tracer with a line trail — the second-quickest projectile in the hockey pack.

## Definition

| Field | Value |
|---|---|
| Mesh | `tracer` |
| Trail | `line` |
| Impact | `spark` |
| Colour | `#ffaa22` |
| Speed | 13 u/s |

Fired by: [[Hockey Tower - Sniper|Sniper]].

## Links

- Theme: [[Hockey Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `hockey.projectiles.dart`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
