// Map definitions for each theme
// Each map has strategic identity and tactical purpose

/**
 * MAP LAYOUTS:
 * - FUNNEL: Multiple spawns converge to single chokepoint
 * - SPLIT_LANE: Multiple distinct paths to base
 * - CROSSOVER: Paths cross in middle, strategic tower placement
 * - OPEN_CENTER: Wide open center, many placement options
 * - CHOKEPOINT: Natural narrow passages
 * - MAZE: Winding paths through obstacles
 * - GAUNTLET: Long path, enemies run through tower gauntlet
 * - MULTI_BASE: Multiple base entry points (advanced)
 */

export const MapLayout = {
  FUNNEL: 'funnel',
  SPLIT_LANE: 'split_lane',
  CROSSOVER: 'crossover',
  OPEN_CENTER: 'open_center',
  CHOKEPOINT: 'chokepoint',
  MAZE: 'maze',
  GAUNTLET: 'gauntlet',
  MULTI_BASE: 'multi_base'
};

export const HOCKEY_MAPS = [
  {
    name: 'Practice Rink',
    cols: 18, rows: 11,
    waves: 15, money: 650, lives: 20,
    diff: 1,
    layout: MapLayout.FUNNEL,
    spawns: 1,  // Single spawn for beginners
    description: 'Simple funnel layout - learn the basics'
  },
  {
    name: 'Local Arena',
    cols: 20, rows: 12,
    waves: 20, money: 700, lives: 18,
    diff: 2,
    layout: MapLayout.OPEN_CENTER,
    spawns: 2,
    description: 'Open center - experiment with placements'
  },
  {
    name: 'College Ice',
    cols: 22, rows: 13,
    waves: 25, money: 750, lives: 15,
    diff: 3,
    layout: MapLayout.SPLIT_LANE,
    spawns: 2,
    description: 'Two lanes - split your defense'
  },
  {
    name: 'Pro Stadium',
    cols: 24, rows: 14,
    waves: 30, money: 850, lives: 12,
    diff: 4,
    layout: MapLayout.CHOKEPOINT,
    spawns: 3,
    description: 'Natural chokepoints - control the flow'
  },
  {
    name: 'Stanley Cup',
    cols: 26, rows: 15,
    waves: 40, money: 1000, lives: 10,
    diff: 5,
    layout: MapLayout.CROSSOVER,
    spawns: 3,
    description: 'Crossing paths - cover multiple angles'
  },
  {
    name: 'Frozen Lake',
    cols: 28, rows: 16,
    waves: 45, money: 1200, lives: 8,
    diff: 6,
    layout: MapLayout.MAZE,
    spawns: 2,
    description: 'Winding maze - maximize path length'
  },
  {
    name: 'Winter Classic',
    cols: 30, rows: 17,
    waves: 50, money: 1300, lives: 7,
    diff: 7,
    layout: MapLayout.GAUNTLET,
    spawns: 2,
    description: 'Long gauntlet - sustained firepower needed'
  },
  {
    name: 'World Championships',
    cols: 32, rows: 18,
    waves: 55, money: 1400, lives: 6,
    diff: 8,
    layout: MapLayout.SPLIT_LANE,
    spawns: 4,
    description: 'Four lanes - test your multitasking'
  },
  {
    name: 'All-Star Arena',
    cols: 34, rows: 19,
    waves: 60, money: 1500, lives: 5,
    diff: 9,
    layout: MapLayout.MULTI_BASE,
    spawns: 3,
    description: 'Multiple entry points - defend everywhere'
  },
  {
    name: 'Hall of Fame',
    cols: 36, rows: 20,
    waves: 65, money: 1600, lives: 4,
    diff: 10,
    layout: MapLayout.CROSSOVER,
    spawns: 4,
    description: 'Ultimate challenge - master all strategies'
  }
];

export const SOCCER_MAPS = [
  {
    name: 'Backyard',
    cols: 18, rows: 11,
    waves: 15, money: 650, lives: 20,
    diff: 1,
    layout: MapLayout.FUNNEL,
    spawns: 1,
    description: 'Simple funnel layout - learn the basics'
  },
  {
    name: 'School Field',
    cols: 20, rows: 12,
    waves: 20, money: 700, lives: 18,
    diff: 2,
    layout: MapLayout.OPEN_CENTER,
    spawns: 2,
    description: 'Open center - experiment with placements'
  },
  {
    name: 'Club Ground',
    cols: 22, rows: 13,
    waves: 25, money: 750, lives: 15,
    diff: 3,
    layout: MapLayout.SPLIT_LANE,
    spawns: 2,
    description: 'Two lanes - split your defense'
  },
  {
    name: 'Premier League',
    cols: 24, rows: 14,
    waves: 30, money: 850, lives: 12,
    diff: 4,
    layout: MapLayout.CHOKEPOINT,
    spawns: 3,
    description: 'Natural chokepoints - control the flow'
  },
  {
    name: 'World Cup',
    cols: 26, rows: 15,
    waves: 40, money: 1000, lives: 10,
    diff: 5,
    layout: MapLayout.CROSSOVER,
    spawns: 3,
    description: 'Crossing paths - cover multiple angles'
  },
  {
    name: 'Street Pitch',
    cols: 28, rows: 16,
    waves: 45, money: 1200, lives: 8,
    diff: 6,
    layout: MapLayout.MAZE,
    spawns: 2,
    description: 'Winding maze - maximize path length'
  },
  {
    name: 'Beach Field',
    cols: 30, rows: 17,
    waves: 50, money: 1300, lives: 7,
    diff: 7,
    layout: MapLayout.GAUNTLET,
    spawns: 2,
    description: 'Long gauntlet - sustained firepower needed'
  },
  {
    name: 'Champions League',
    cols: 32, rows: 18,
    waves: 55, money: 1400, lives: 6,
    diff: 8,
    layout: MapLayout.SPLIT_LANE,
    spawns: 4,
    description: 'Four lanes - test your multitasking'
  },
  {
    name: 'Olympic Stadium',
    cols: 34, rows: 19,
    waves: 60, money: 1500, lives: 5,
    diff: 9,
    layout: MapLayout.MULTI_BASE,
    spawns: 3,
    description: 'Multiple entry points - defend everywhere'
  },
  {
    name: 'Legendary Final',
    cols: 36, rows: 20,
    waves: 65, money: 1600, lives: 4,
    diff: 10,
    layout: MapLayout.CROSSOVER,
    spawns: 4,
    description: 'Ultimate challenge - master all strategies'
  }
];
