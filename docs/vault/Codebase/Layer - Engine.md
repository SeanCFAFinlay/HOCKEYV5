---
title: "Layer - Engine"
tags:
  - code
  - layer-index
---
# `engine/`

Scene, loop, state, input, audio, camera, post-processing. The runtime substrate the rest of the game sits on.

**13 modules · 5418 lines**

| Module | Purpose | LOC | In | Out |
|---|---|---|---|---|
| [[engine-state\|state.js]] | Centralized game state with dispatch pattern Single source of truth - all mutations through disp | 719 | 37 | 1 |
| [[engine-events\|events.js]] | Event system - pub/sub for decoupled communication | 130 | 18 | 0 |
| [[engine-camera\|camera.js]] | Camera controls with smooth easing Supports zoom, pan, and rotation with interpolation | 456 | 10 | 1 |
| [[engine-audio\|audio.js]] | SC-5.1: Audio Engine — Web Audio API sound manager | 263 | 8 | 0 |
| [[engine-postprocessing\|postprocessing.js]] | — | 888 | 7 | 0 |
| [[engine-input\|input.js]] | Input handling - touch, mouse, keyboard events Mobile-first input state machine with improved ge | 865 | 4 | 6 |
| [[engine-loop\|loop.js]] | Main game loop with fixed timestep Uses accumulator pattern for deterministic physics | 271 | 3 | 19 |
| [[engine-scene\|scene.js]] | Three.js scene setup with enhanced graphics Improved lighting, materials, and visual effects | 1097 | 3 | 13 |
| [[engine-ambient\|ambient.js]] | SC-5.4: Ambient Soundscape — per-theme ambient audio with intensity scaling | 112 | 1 | 1 |
| [[engine-auto-quality\|auto-quality.js]] | — | 106 | 1 | 3 |
| [[engine-cleanup\|cleanup.js]] | Centralized cleanup for game reset/exit Ensures all resources are properly disposed | 186 | 1 | 7 |
| [[engine-music\|music.js]] | SC-5.3: Music State Manager Thin state machine that delegates to audio.js | 110 | 1 | 2 |
| [[engine-pools\|pools.js]] | Object pooling system for zero-allocation game loop Pools: enemies, projectiles, particles | 215 | 1 | 0 |

[[Codebase Map]]
