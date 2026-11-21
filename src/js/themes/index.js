// Theme plug-ins.
//
// Hockey, soccer and space are wired into the engine by hand. Every theme added
// since lives in one file here and plugs in through three exports:
//
//   pack    - names, colours and menu text (config/themes.js builds the content pack)
//   visuals - the visual profile: lighting, floor, projectiles, enemy colours
//   kit     - builders the renderer calls: towers, enemies, floor, props, scenery
//
// Game balance (tower stats, enemy stats, map layouts, waves) is shared with the
// soccer pack, so a new theme is a reskin with its own models, not a new ruleset.

import * as kitchen from './kitchen.js';
import * as golf from './golf.js';
import * as bowling from './bowling.js';
import * as bathtub from './bathtub.js';
import * as garden from './garden.js';
import * as sushi from './sushi.js';
import * as library from './library.js';
import * as pizza from './pizza.js';
import * as arcade from './arcade.js';

export const THEME_MODULES = { kitchen, golf, bowling, bathtub, garden, sushi, library, pizza, arcade };

/** The renderer kit for a theme, or null for the built-in themes. */
export function getThemeKit(themeId) {
  return THEME_MODULES[themeId]?.kit || null;
}
