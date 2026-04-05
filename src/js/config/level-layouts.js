// Level-specific layouts and gameplay modifiers for hockey maps
// Each level has unique layout, obstacles, and strategic identity

export const HOCKEY_LEVEL_LAYOUTS = [
  // Level 1: Practice Rink - Tutorial-friendly, wide open
  {
    mapIndex: 0,
    name: 'Practice Rink',
    identity: 'Wide Open Training Ground',
    description: 'Simple, open rink with minimal obstacles. Great for learning.',
    layout: {
      // Few obstacles, easy sightlines
      obstacleCount: 8,
      obstaclePattern: 'scattered',
      pathStyle: 'straight',
      chokePoints: 0
    },
    props: [
      { type: 'cone', x: 0.2, y: 0.3 },
      { type: 'cone', x: 0.2, y: 0.7 },
      { type: 'stick', x: 0.5, y: 0.5 },
      { type: 'puck', x: 0.8, y: 0.4 },
      { type: 'puck', x: 0.8, y: 0.6 }
    ],
    waveModifiers: {
      spawnInterval: 450, // Standard
      speedMultiplier: 1.0
    }
  },

  // Level 2: Local Arena - Narrow defensive corridor
  {
    mapIndex: 1,
    name: 'Local Arena',
    identity: 'Penalty Kill Setup',
    description: 'Narrow defensive zone. Control the corridor.',
    layout: {
      obstacleCount: 12,
      obstaclePattern: 'corridor',
      pathStyle: 'narrow',
      chokePoints: 1
    },
    props: [
      { type: 'boards', x: 0.3, y: 0.2 },
      { type: 'boards', x: 0.3, y: 0.8 },
      { type: 'bench', x: 0.15, y: 0.5 },
      { type: 'goal', x: 0.9, y: 0.5 },
      { type: 'faceoff', x: 0.5, y: 0.5 }
    ],
    waveModifiers: {
      spawnInterval: 400, // Slightly faster
      speedMultiplier: 1.0
    }
  },

  // Level 3: College Ice - Multi-lane pressure
  {
    mapIndex: 2,
    name: 'College Ice',
    identity: 'Two-Lane Rush',
    description: 'Split paths create dual-threat pressure.',
    layout: {
      obstacleCount: 16,
      obstaclePattern: 'split',
      pathStyle: 'curved',
      chokePoints: 2
    },
    props: [
      { type: 'goal', x: 0.9, y: 0.3 },
      { type: 'goal', x: 0.9, y: 0.7 },
      { type: 'faceoff', x: 0.4, y: 0.35 },
      { type: 'faceoff', x: 0.4, y: 0.65 },
      { type: 'boards', x: 0.5, y: 0.5 },
      { type: 'bench', x: 0.2, y: 0.2 },
      { type: 'bench', x: 0.2, y: 0.8 }
    ],
    waveModifiers: {
      spawnInterval: 420,
      speedMultiplier: 1.05
    }
  },

  // Level 4: Pro Stadium - Heavy choke point near goal
  {
    mapIndex: 3,
    name: 'Pro Stadium',
    identity: 'Defensive Zone Scramble',
    description: 'Tight cluster near the goal. Defend the crease!',
    layout: {
      obstacleCount: 14,
      obstaclePattern: 'defensive',
      pathStyle: 'tight',
      chokePoints: 2
    },
    props: [
      { type: 'goal', x: 0.85, y: 0.5 },
      { type: 'boards', x: 0.75, y: 0.3 },
      { type: 'boards', x: 0.75, y: 0.7 },
      { type: 'faceoff', x: 0.6, y: 0.5 },
      { type: 'bench', x: 0.15, y: 0.35 },
      { type: 'bench', x: 0.15, y: 0.65 },
      { type: 'scoreboard', x: 0.5, y: 0.1 }
    ],
    waveModifiers: {
      spawnInterval: 380,
      speedMultiplier: 1.1
    }
  },

  // Level 5: Stanley Cup - Long shot map
  {
    mapIndex: 4,
    name: 'Stanley Cup',
    identity: 'Neutral Zone Trap',
    description: 'Long, winding path. Maximize range towers.',
    layout: {
      obstacleCount: 18,
      obstaclePattern: 'winding',
      pathStyle: 'long',
      chokePoints: 3
    },
    props: [
      { type: 'goal', x: 0.9, y: 0.5 },
      { type: 'faceoff', x: 0.3, y: 0.5 },
      { type: 'faceoff', x: 0.6, y: 0.3 },
      { type: 'faceoff', x: 0.6, y: 0.7 },
      { type: 'boards', x: 0.4, y: 0.2 },
      { type: 'boards', x: 0.4, y: 0.8 },
      { type: 'boards', x: 0.7, y: 0.2 },
      { type: 'boards', x: 0.7, y: 0.8 },
      { type: 'bench', x: 0.1, y: 0.5 }
    ],
    waveModifiers: {
      spawnInterval: 350,
      speedMultiplier: 1.0 // Normal speed but longer path
    }
  },

  // Level 6: Frozen Lake - Outdoor chaos
  {
    mapIndex: 5,
    name: 'Frozen Lake',
    identity: 'Outdoor Pond Hockey',
    description: 'Natural obstacles, unpredictable paths.',
    layout: {
      obstacleCount: 20,
      obstaclePattern: 'organic',
      pathStyle: 'curved',
      chokePoints: 2
    },
    props: [
      { type: 'snowbank', x: 0.25, y: 0.3 },
      { type: 'snowbank', x: 0.25, y: 0.7 },
      { type: 'snowbank', x: 0.55, y: 0.4 },
      { type: 'snowbank', x: 0.55, y: 0.6 },
      { type: 'goal', x: 0.85, y: 0.5 },
      { type: 'stick', x: 0.4, y: 0.5 },
      { type: 'cone', x: 0.6, y: 0.25 },
      { type: 'cone', x: 0.6, y: 0.75 }
    ],
    waveModifiers: {
      spawnInterval: 360,
      speedMultiplier: 1.15
    }
  },

  // Level 7: Winter Classic - Fast rush map
  {
    mapIndex: 6,
    name: 'Winter Classic',
    identity: 'Speed Rush',
    description: 'Short path, high speed. React quickly!',
    layout: {
      obstacleCount: 10,
      obstaclePattern: 'minimal',
      pathStyle: 'direct',
      chokePoints: 1
    },
    props: [
      { type: 'goal', x: 0.8, y: 0.5 },
      { type: 'faceoff', x: 0.4, y: 0.5 },
      { type: 'boards', x: 0.5, y: 0.25 },
      { type: 'boards', x: 0.5, y: 0.75 },
      { type: 'scoreboard', x: 0.5, y: 0.05 },
      { type: 'bench', x: 0.15, y: 0.4 },
      { type: 'bench', x: 0.15, y: 0.6 }
    ],
    waveModifiers: {
      spawnInterval: 320, // Fast spawns
      speedMultiplier: 1.3 // High speed
    }
  },

  // Level 8: World Championships - Complex maze
  {
    mapIndex: 7,
    name: 'World Championships',
    identity: 'Tactical Maze',
    description: 'Complex paths require strategic tower placement.',
    layout: {
      obstacleCount: 24,
      obstaclePattern: 'maze',
      pathStyle: 'complex',
      chokePoints: 4
    },
    props: [
      { type: 'goal', x: 0.9, y: 0.5 },
      { type: 'faceoff', x: 0.3, y: 0.3 },
      { type: 'faceoff', x: 0.3, y: 0.7 },
      { type: 'faceoff', x: 0.6, y: 0.5 },
      { type: 'boards', x: 0.4, y: 0.5 },
      { type: 'boards', x: 0.7, y: 0.3 },
      { type: 'boards', x: 0.7, y: 0.7 },
      { type: 'bench', x: 0.15, y: 0.5 },
      { type: 'scoreboard', x: 0.5, y: 0.1 }
    ],
    waveModifiers: {
      spawnInterval: 340,
      speedMultiplier: 1.2
    }
  },

  // Level 9: All-Star Arena - Multi-threat chaos
  {
    mapIndex: 8,
    name: 'All‑Star Arena',
    identity: 'All-Out Assault',
    description: 'Multiple paths, maximum pressure.',
    layout: {
      obstacleCount: 22,
      obstaclePattern: 'multi',
      pathStyle: 'split3',
      chokePoints: 3
    },
    props: [
      { type: 'goal', x: 0.88, y: 0.5 },
      { type: 'faceoff', x: 0.35, y: 0.25 },
      { type: 'faceoff', x: 0.35, y: 0.5 },
      { type: 'faceoff', x: 0.35, y: 0.75 },
      { type: 'boards', x: 0.6, y: 0.2 },
      { type: 'boards', x: 0.6, y: 0.8 },
      { type: 'bench', x: 0.1, y: 0.3 },
      { type: 'bench', x: 0.1, y: 0.7 },
      { type: 'scoreboard', x: 0.5, y: 0.08 }
    ],
    waveModifiers: {
      spawnInterval: 300, // Very fast
      speedMultiplier: 1.25
    }
  },

  // Level 10: Hall of Fame - Ultimate challenge
  {
    mapIndex: 9,
    name: 'Hall of Fame',
    identity: 'Legendary Gauntlet',
    description: 'The ultimate test. Everything at once.',
    layout: {
      obstacleCount: 28,
      obstaclePattern: 'ultimate',
      pathStyle: 'extreme',
      chokePoints: 5
    },
    props: [
      { type: 'goal', x: 0.9, y: 0.5 },
      { type: 'faceoff', x: 0.25, y: 0.25 },
      { type: 'faceoff', x: 0.25, y: 0.5 },
      { type: 'faceoff', x: 0.25, y: 0.75 },
      { type: 'faceoff', x: 0.55, y: 0.35 },
      { type: 'faceoff', x: 0.55, y: 0.65 },
      { type: 'faceoff', x: 0.75, y: 0.5 },
      { type: 'boards', x: 0.4, y: 0.15 },
      { type: 'boards', x: 0.4, y: 0.85 },
      { type: 'boards', x: 0.65, y: 0.25 },
      { type: 'boards', x: 0.65, y: 0.75 },
      { type: 'bench', x: 0.12, y: 0.4 },
      { type: 'bench', x: 0.12, y: 0.6 },
      { type: 'scoreboard', x: 0.5, y: 0.05 }
    ],
    waveModifiers: {
      spawnInterval: 280, // Extremely fast
      speedMultiplier: 1.35 // Maximum speed
    }
  }
];

// Prop type definitions for hockey-themed obstacles
export const PROP_TYPES = {
  goal: { size: 1.5, blocking: true, visual: 'net' },
  boards: { size: 1.2, blocking: true, visual: 'boards' },
  bench: { size: 1.3, blocking: true, visual: 'bench' },
  faceoff: { size: 0.8, blocking: false, visual: 'circle' },
  cone: { size: 0.4, blocking: false, visual: 'cone' },
  stick: { size: 0.6, blocking: false, visual: 'stick' },
  puck: { size: 0.3, blocking: false, visual: 'puck' },
  scoreboard: { size: 1.0, blocking: false, visual: 'scoreboard' },
  snowbank: { size: 1.4, blocking: true, visual: 'snow' }
};
