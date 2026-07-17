---
title: "Layer - Rendering"
tags:
  - code
  - layer-index
---
# `rendering/`

Turns game data into Three.js meshes and per-frame visual updates. All art is procedural — there are no model files.

**11 modules · 3886 lines**

| Module | Purpose | LOC | In | Out |
|---|---|---|---|---|
| [[rendering-quality\|quality.js]] | — | 76 | 6 | 1 |
| [[rendering-tower-meshes\|tower-meshes.js]] | Tower mesh creation with enhanced visuals | 1081 | 5 | 3 |
| [[rendering-trails\|trails.js]] | SC-3.3: Projectile Trail System Ribbon trails using THREE.Line with BufferGeometry pool SC-5.5:  | 211 | 3 | 1 |
| [[rendering-enemy-meshes\|enemy-meshes.js]] | Enemy mesh creation with pooling support and enhanced visuals | 888 | 2 | 3 |
| [[rendering-path-preview\|path-preview.js]] | Enemy Path Preview Lines — SC-1.5 Shows dashed path lines from each spawn to the base | 169 | 2 | 3 |
| [[rendering-sprites\|sprites.js]] | Text sprites for labels | 72 | 2 | 1 |
| [[rendering-targeting-feedback\|targeting-feedback.js]] | — | 145 | 2 | 2 |
| [[rendering-animations\|animations.js]] | Animation updates for towers and enemies | 415 | 1 | 3 |
| [[rendering-environment\|environment.js]] | Environment rendering - cells, lights, perimeter decor, and stadium stands | 424 | 1 | 2 |
| [[rendering-markers\|markers.js]] | Spawn and base marker rendering | 139 | 1 | 3 |
| [[rendering-obstacles\|obstacles.js]] | Obstacle visual rendering | 266 | 1 | 3 |

[[Codebase Map]]
