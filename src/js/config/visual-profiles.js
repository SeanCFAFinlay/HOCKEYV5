export const VISUAL_PROFILES = {
  hockey: {
    map: {
      background: 0x06111f,
      fog: 0x071626,
      fogDensity: 0.007,
      floor: {
        base: '#b8d9e8',
        line: 'rgba(92, 150, 184, 0.42)',
        scratch: 'rgba(255, 255, 255, 0.28)',
        meshColor: 0x9fcbe0,
        roughness: 0.22,
        metalness: 0.08
      },
      path: {
        color: 0x80dfff,
        emissive: 0x0c5b7a,
        opacity: 0.38,
        edge: 0x1e90ff
      },
      buildZone: {
        color: 0xeaf9ff,
        opacity: 0.08,
        line: 0x6ddcff
      },
      obstacle: { accent: 0x00d4ff },
      base: { color: 0xfbbf24, icon: 'DEFEND HOCKEY' },
      spawn: { color: 0xef4444, icon: 'PUCKS' }
    },
    lighting: {
      hemiSky: 0xaedcff,
      hemiGround: 0x263955,
      hemiIntensity: 0.46,
      sun: 0xe5f7ff,
      sunIntensity: 1.18,
      rim: 0x1e88ff,
      rimIntensity: 0.34,
      accent: 0x00d4ff,
      exposure: 0.94
    },
    ui: { accent: '#00d4ff', dark: '#06111f' },
    projectiles: {
      puck: { mesh: 'puck', trail: 'ice', impact: 'frost', color: 0x9be8ff, speed: 10.5 },
      dart: { mesh: 'tracer', trail: 'line', impact: 'spark', color: 0xffaa22, speed: 13 },
      hammer: { mesh: 'block', trail: 'shock', impact: 'ring', color: 0xff8844, speed: 8 },
      shard: { mesh: 'shard', trail: 'frost', impact: 'freeze', color: 0xaaffff, speed: 9.5 },
      glove: { mesh: 'sphere', trail: 'gold', impact: 'slam', color: 0xffd34d, speed: 8.8 },
      lightning: { mesh: 'bolt', trail: 'electric', impact: 'chain', color: 0xe6ff4a, speed: 16 },
      fireball: { mesh: 'plasma', trail: 'fire', impact: 'burn', color: 0xff4400, speed: 11 },
      star: { mesh: 'star', trail: 'gold', impact: 'crit', color: 0xffd700, speed: 11.5 }
    },
    enemies: {
      swarm: { body: 'puck', color: 0x111111, accent: 0x00d4ff },
      fire: { body: 'puck', color: 0xff3b18, accent: 0xffd166 },
      speedster: { body: 'puck', color: 0x00eaff, accent: 0xc8ffff, effects: ['speedLines'] },
      armored: { body: 'puck', color: 0x1a3f8f, accent: 0xbddcff, effects: ['armorPlates'] },
      bruiser: { body: 'puck', color: 0xcc2936, accent: 0xff8080, effects: ['spikes'] },
      elite: { body: 'puck', color: 0xff6b1a, accent: 0x334466, effects: ['armorPlates'] },
      flying: { body: 'puck', color: 0x77ccff, accent: 0xd9f7ff, effects: ['wings'] },
      flying_fire: { body: 'puck', color: 0xff7a18, accent: 0x9be8ff, effects: ['wings'] },
      boss: { body: 'puck', color: 0x070707, accent: 0xffd700, effects: ['crown'] }
    },
    towers: { family: 'hockey', base: 0x071426, metal: 0x8fb8cc, levelGlow: 0x00d4ff }
  },
  soccer: {
    map: {
      background: 0x061407,
      fog: 0x071807,
      fogDensity: 0.006,
      floor: {
        base: '#247a39',
        alt: '#1d6630',
        blade: 'rgba(93, 180, 87, 0.14)',
        meshColor: 0x228743,
        roughness: 0.86,
        metalness: 0.0
      },
      path: { color: 0xf7f0c4, emissive: 0x304a12, opacity: 0.32, edge: 0xffffff },
      buildZone: { color: 0x3ad65d, opacity: 0.10, line: 0xe9fbe7 },
      obstacle: { accent: 0xfbbf24 },
      base: { color: 0xffffff, icon: 'DEFEND GOAL' },
      spawn: { color: 0xffb020, icon: 'BALLS' }
    },
    lighting: {
      hemiSky: 0xd8ffd6,
      hemiGround: 0x1b3f20,
      hemiIntensity: 0.43,
      sun: 0xfff4d0,
      sunIntensity: 1.08,
      rim: 0x37d957,
      rimIntensity: 0.28,
      accent: 0x22c55e,
      exposure: 0.9
    },
    ui: { accent: '#22c55e', dark: '#061407' },
    projectiles: {
      ball: { mesh: 'ball', trail: 'spin', impact: 'grassKick', color: 0xffffff, speed: 9.5, curve: 0.55 },
      curveBall: { mesh: 'tracer', trail: 'curve', impact: 'spark', color: 0x88eeff, speed: 12, curve: 0.9 },
      headButt: { mesh: 'ring', trail: 'shock', impact: 'ring', color: 0x22dddd, speed: 8.5 },
      tackle: { mesh: 'cone', trail: 'dust', impact: 'slam', color: 0xb58a32, speed: 9 },
      glove: { mesh: 'sphere', trail: 'aqua', impact: 'save', color: 0x88eeff, speed: 8.8 },
      chain: { mesh: 'beam', trail: 'electric', impact: 'chain', color: 0xffffff, speed: 13 },
      flare: { mesh: 'shard', trail: 'firework', impact: 'burn', color: 0xff4444, speed: 9.5 },
      legend: { mesh: 'star', trail: 'gold', impact: 'crit', color: 0xffd700, speed: 11.5 }
    },
    enemies: {
      swarm: { body: 'ball', color: 0xffffff, accent: 0x111111 },
      fire: { body: 'ball', color: 0xff5522, accent: 0xffdd66 },
      armored: { body: 'ball', color: 0x264d2e, accent: 0xd9f99d, effects: ['armorPlates'] },
      elite: { body: 'ball', color: 0xf97316, accent: 0xfef08a, effects: ['armorPlates'] },
      flying: { body: 'ball', color: 0xc7f9ff, accent: 0x44d3ff, effects: ['wings'] },
      flying_fire: { body: 'ball', color: 0xff7a33, accent: 0x7dd3fc, effects: ['wings'] },
      boss: { body: 'ball', color: 0xffffff, accent: 0xffd700, effects: ['crown'] }
    },
    towers: { family: 'soccer', base: 0x102812, metal: 0xd6d6d6, levelGlow: 0x22c55e }
  },
  space: {
    map: {
      background: 0x05040d,
      fog: 0x090616,
      fogDensity: 0.005,
      floor: {
        base: '#24273f',
        alt: '#17192b',
        line: 'rgba(171, 124, 255, 0.35)',
        meshColor: 0x30344f,
        roughness: 0.48,
        metalness: 0.38
      },
      path: { color: 0x9d7cff, emissive: 0x5b21b6, opacity: 0.42, edge: 0x67e8f9 },
      buildZone: { color: 0x67e8f9, opacity: 0.11, line: 0xc084fc },
      obstacle: { accent: 0xc084fc },
      base: { color: 0x67e8f9, icon: 'DEFEND CORE' },
      spawn: { color: 0xff3d81, icon: 'DRONES' }
    },
    lighting: {
      hemiSky: 0xbda4ff,
      hemiGround: 0x111827,
      hemiIntensity: 0.34,
      sun: 0xddd6ff,
      sunIntensity: 0.9,
      rim: 0x67e8f9,
      rimIntensity: 0.52,
      accent: 0xc084fc,
      exposure: 1.02
    },
    ui: { accent: '#c084fc', dark: '#05040d' },
    projectiles: {
      ball: { mesh: 'laser', trail: 'laser', impact: 'spark', color: 0x67e8f9, speed: 20, beam: true },
      curveBall: { mesh: 'plasma', trail: 'plasma', impact: 'plasma', color: 0xc084fc, speed: 12 },
      headButt: { mesh: 'ring', trail: 'gravity', impact: 'gravity', color: 0x7dd3fc, speed: 8 },
      tackle: { mesh: 'bolt', trail: 'ion', impact: 'slam', color: 0x38bdf8, speed: 10 },
      glove: { mesh: 'sphere', trail: 'shield', impact: 'save', color: 0x93c5fd, speed: 9 },
      chain: { mesh: 'beam', trail: 'electric', impact: 'chain', color: 0xf0abfc, speed: 15 },
      flare: { mesh: 'plasma', trail: 'plasma', impact: 'burn', color: 0xff5ca8, speed: 11 },
      legend: { mesh: 'star', trail: 'gold', impact: 'crit', color: 0xffd700, speed: 12 }
    },
    enemies: {
      swarm: { body: 'orb', color: 0x67e8f9, accent: 0xffffff },
      fire: { body: 'orb', color: 0xff5ca8, accent: 0xffd1e3 },
      armored: { body: 'orb', color: 0x4c1d95, accent: 0xc084fc, effects: ['armorPlates'] },
      elite: { body: 'orb', color: 0x7c3aed, accent: 0xff5ca8, effects: ['armorPlates'] },
      flying: { body: 'orb', color: 0x93c5fd, accent: 0x67e8f9, effects: ['wings'] },
      flying_fire: { body: 'orb', color: 0xff5ca8, accent: 0x67e8f9, effects: ['wings'] },
      boss: { body: 'orb', color: 0x111827, accent: 0xffd700, effects: ['crown'] }
    },
    towers: { family: 'space', base: 0x101827, metal: 0x8b9bb8, levelGlow: 0xc084fc }
  }
};

export function getVisualProfile(themeData) {
  return themeData?.visuals || VISUAL_PROFILES.hockey;
}
