---
title: "Space Theme"
kind: theme
id: space
status: stub-playable
tags:
  - asset
  - asset/theme
  - theme/space
---
# 🛰️ Orbital Outpost

![[theme-space.svg]]

Example future content pack using the shared engine and metadata model.

A deliberate proof that the engine is content-driven, marked `stub-playable`. It ships no original content: towers are the soccer roster with new names and colours, enemies are soccer enemies with "Ball" renamed to "Drone", and its three maps are the first three soccer maps re-labelled. Its tower meshes branch on projectile type rather than tower id, so its eight towers render as only five distinct shapes.

## Contents

|  | Count |
|---|---|
| Towers | 8 — [[Space Tower - Laser Emitter|Laser Emitter]], [[Space Tower - Plasma Cannon|Plasma Cannon]], [[Space Tower - Gravity Well|Gravity Well]], [[Space Tower - Ion Snare|Ion Snare]], [[Space Tower - Shield Node|Shield Node]], [[Space Tower - Arc Relay|Arc Relay]], [[Space Tower - Nova Flare|Nova Flare]], [[Space Tower - Command Core|Command Core]] |
| Enemies | 7 — [[Space Enemy - Drone|Drone]], [[Space Enemy - Fire Drone|Fire Drone]], [[Space Enemy - Flying Drone|Flying Drone]], [[Space Enemy - Heavy Drone|Heavy Drone]], [[Space Enemy - Inferno Drone|Inferno Drone]], [[Space Enemy - Flying Fire|Flying Fire]], [[Space Enemy - Boss Drone|Boss Drone]] |
| Maps | 3 — [[Space Map - Docking Bay|Docking Bay]], [[Space Map - Solar Yard|Solar Yard]], [[Space Map - Asteroid Gate|Asteroid Gate]] |
| Projectiles | [[Space Projectile - ball|ball]], [[Space Projectile - curveBall|curveBall]], [[Space Projectile - headButt|headButt]], [[Space Projectile - tackle|tackle]], [[Space Projectile - glove|glove]], [[Space Projectile - chain|chain]], [[Space Projectile - flare|flare]], [[Space Projectile - legend|legend]] |

## Lighting & atmosphere

| Setting | Value |
|---|---|
| Exposure | 0.86 |
| Sun intensity | 0.9 |
| Hemi intensity | 0.34 |
| Rim intensity | 0.52 |
| Fog density | 0.005 |
| Arena | `outpost` / floor `turf` |
| Status | `stub-playable` |

## Links

- Registered in: `src/js/config/themes.js`
- Visual profile: `src/js/config/visual-profiles.js`
- [[Asset Index]]
