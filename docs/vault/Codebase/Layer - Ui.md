---
title: "Layer - Ui"
tags:
  - code
  - layer-index
---
# `ui/`

DOM overlay — HUD, screens, modals, tower bar, upgrade sheet, minimap, tooltips.

**14 modules · 2852 lines**

| Module | Purpose | LOC | In | Out |
|---|---|---|---|---|
| [[ui-hud\|hud.js]] | HUD updates and tower bar rendering | 725 | 9 | 8 |
| [[ui-upgrade-sheet\|upgrade-sheet.js]] | Upgrade panel logic | 210 | 7 | 8 |
| [[ui-currency-fly\|currency-fly.js]] | SC-3.4: Currency Fly-to-HUD Floating "+$X" text that arcs from enemy death position to money HUD | 220 | 2 | 1 |
| [[ui-minimap\|minimap.js]] | Strategic Minimap — SC-4.4 2D canvas overlay: top-down grid view with towers, enemies, spawns, b | 211 | 2 | 3 |
| [[ui-perf-overlay\|perf-overlay.js]] | — | 54 | 2 | 2 |
| [[ui-screens\|screens.js]] | Screen management - menu, map selection, game | 273 | 2 | 16 |
| [[ui-transitions\|transitions.js]] | Screen transition animations for SC-4.1 Provides animated transitions between game screens | 95 | 2 | 0 |
| [[ui-controls\|controls.js]] | Game controls - speed buttons, sell mode, auto-wave | 22 | 1 | 2 |
| [[ui-minimap-draw\|minimap-draw.js]] | Minimap drawing primitives — SC-4.4 Pure canvas drawing helpers, no state dependencies. | 82 | 1 | 0 |
| [[ui-modals\|modals.js]] | Modal dialog management | 83 | 1 | 5 |
| [[ui-settings\|settings.js]] | — | 543 | 1 | 2 |
| [[ui-tooltips\|tooltips.js]] | Tower info tooltips — SC-4.2 Show rich tower stats on hover (300ms) or long-press (400ms) | 203 | 1 | 0 |
| [[ui-tower-bar\|tower-bar.js]] | Tower bar selection logic Most tower bar functionality is in hud.js This file can be extended fo | 27 | 1 | 3 |
| [[ui-upgrade-path\|upgrade-path.js]] | Upgrade path visualization — SC-4.3 Renders 4-level upgrade nodes, handles MAX state, animates s | 104 | 1 | 0 |

[[Codebase Map]]
