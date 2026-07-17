---
title: "Layer - Config"
tags:
  - code
  - layer-index
---
# `config/`

Static game data. Intended to be a pure leaf layer — you add a content pack by editing these files and nothing else. Two files break that intent.

**9 modules · 2141 lines**

| Module | Purpose | LOC | In | Out |
|---|---|---|---|---|
| [[config-visual-profiles\|visual-profiles.js]] | — | 182 | 8 | 0 |
| [[config-maps\|maps.js]] | Map definitions for each theme Each map has strategic identity and tactical purpose | 212 | 3 | 0 |
| [[config-waves\|waves.js]] | Data-driven wave generation. Enemy selection is based on enemy metadata, never array position. | 279 | 3 | 1 |
| [[config-sounds\|sounds.js]] | SC-5.2: Sound Effects Registry — centralized sound catalogue | 43 | 2 | 1 |
| [[config-themes\|themes.js]] | Content-pack registry. Themes are skins/content packs over the same tower-defense engine. | 161 | 2 | 4 |
| [[config-enemies\|enemies.js]] | Enemy definitions for each theme. Core systems consume these as data, not by array position. Req | 212 | 1 | 0 |
| [[config-level-layouts\|level-layouts.js]] | Level-specific layouts and gameplay modifiers for hockey maps Each level has unique layout, obst | 299 | 1 | 0 |
| [[config-towers\|towers.js]] | Tower definitions for each theme Each tower has a clear tactical identity and role | 245 | 1 | 0 |
| [[config-validation\|validation.js]] | Config validation module Validates all game configuration at startup to catch errors early | 508 | 1 | 1 |

[[Codebase Map]]
