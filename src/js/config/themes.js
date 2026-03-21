// Theme configuration - defines visual properties for each theme
// To add a new theme, add a new entry here with matching entries in towers.js, enemies.js, maps.js

import { HOCKEY_TOWERS, SOCCER_TOWERS } from './towers.js';
import { HOCKEY_ENEMIES, SOCCER_ENEMIES } from './enemies.js';
import { HOCKEY_MAPS, SOCCER_MAPS } from './maps.js';

export const THEMES = {
  hockey: {
    name: 'Hockey Arena',
    icon: '🏒',
    color: '#00d4ff',
    groundColor: 0xe0f0f8,
    pathColor: 0xc8dce8,
    envColor: 0x0a1520,
    maps: HOCKEY_MAPS,
    towers: HOCKEY_TOWERS,
    enemies: HOCKEY_ENEMIES
  },
  soccer: {
    name: 'Soccer Stadium',
    icon: '⚽',
    color: '#22c55e',
    groundColor: 0x2d8a3a,
    pathColor: 0x215a28,
    envColor: 0x0a1a0a,
    maps: SOCCER_MAPS,
    towers: SOCCER_TOWERS,
    enemies: SOCCER_ENEMIES
  }
};
