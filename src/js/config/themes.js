// Content-pack registry.
// Themes are skins/content packs over the same tower-defense engine.

import { HOCKEY_TOWERS, SOCCER_TOWERS } from './towers.js';
import { HOCKEY_ENEMIES, SOCCER_ENEMIES } from './enemies.js';
import { HOCKEY_MAPS, SOCCER_MAPS } from './maps.js';
import { VISUAL_PROFILES } from './visual-profiles.js';

function enrichMaps(packId, maps, defaults) {
  return maps.map((map, index) => ({
    ...map,
    id: map.id || `${packId}.${index + 1}`,
    campaignIndex: index,
    difficulty: map.difficulty || map.diff,
    layoutType: map.layoutType || map.layout,
    recommendedTowers: map.recommendedTowers || defaults.recommendedTowers,
    pressureType: map.pressureType || defaults.pressureType,
    unlock: map.unlock || (index === 0 ? { type: 'default' } : { type: 'map_complete', mapIndex: index - 1 }),
    metadata: {
      difficulty: map.difficulty || map.diff,
      layoutType: map.layoutType || map.layout,
      recommendedTowers: map.recommendedTowers || defaults.recommendedTowers,
      pressureType: map.pressureType || defaults.pressureType,
      unlock: map.unlock || (index === 0 ? { type: 'default' } : { type: 'map_complete', mapIndex: index - 1 })
    }
  }));
}

function withPackFields(pack) {
  return {
    ...pack,
    meta: {
      id: pack.id,
      name: pack.name,
      shortName: pack.shortName,
      icon: pack.icon,
      sortOrder: pack.sortOrder,
      description: pack.description,
      status: pack.status || 'playable'
    },
    balance: {
      waveModel: 'metadata-weighted-v1',
      endless: { enabled: true, startAfterCampaign: true },
      sandbox: { enabled: true, startingMoneyMultiplier: 3, livesMultiplier: 3 },
      ...(pack.balance || {})
    },
    skins: {
      environment: pack.environmentSkin,
      enemy: pack.enemySkin,
      tower: pack.towerSkin,
      projectiles: pack.visuals?.projectiles || {},
      ...(pack.skins || {})
    },
    visuals: pack.visuals
  };
}

const hockey = withPackFields({
  id: 'hockey',
  name: 'Hockey Arena',
  shortName: 'Hockey',
  icon: '🏒',
  sortOrder: 10,
  description: 'Ice rink tower defense with fast puck pressure and armored skaters.',
  color: '#00d4ff',
  groundColor: 0xe0f0f8,
  pathColor: 0xc8dce8,
  envColor: 0x0a1520,
  visuals: VISUAL_PROFILES.hockey,
  environmentSkin: { arena: 'rink', floor: 'ice', markerIcon: '🏒' },
  enemySkin: { body: 'puck', icon: '🏒' },
  towerSkin: { family: 'hockey' },
  maps: enrichMaps('hockey', HOCKEY_MAPS, {
    recommendedTowers: ['t1', 't3', 't4'],
    pressureType: 'ground_swarm'
  }),
  towers: HOCKEY_TOWERS,
  enemies: HOCKEY_ENEMIES
});

const soccer = withPackFields({
  id: 'soccer',
  name: 'Soccer Stadium',
  shortName: 'Soccer',
  icon: '⚽',
  sortOrder: 20,
  description: 'Grass pitch tower defense with split lanes and aerial ball pressure.',
  color: '#22c55e',
  groundColor: 0x2d8a3a,
  pathColor: 0x215a28,
  envColor: 0x0a1a0a,
  visuals: VISUAL_PROFILES.soccer,
  environmentSkin: { arena: 'pitch', floor: 'grass', markerIcon: '⚽' },
  enemySkin: { body: 'ball', icon: '⚽' },
  towerSkin: { family: 'soccer' },
  maps: enrichMaps('soccer', SOCCER_MAPS, {
    recommendedTowers: ['t1', 't2', 't6'],
    pressureType: 'mixed_lanes'
  }),
  towers: SOCCER_TOWERS,
  enemies: SOCCER_ENEMIES
});

const space = withPackFields({
  id: 'space',
  name: 'Orbital Outpost',
  shortName: 'Space',
  icon: '🛰️',
  sortOrder: 30,
  status: 'stub-playable',
  description: 'Example future content pack using the shared engine and metadata model.',
  color: '#c084fc',
  groundColor: 0x2d2842,
  pathColor: 0x463d5c,
  envColor: 0x090812,
  visuals: VISUAL_PROFILES.space,
  environmentSkin: { arena: 'outpost', floor: 'turf', markerIcon: '🛰️' },
  enemySkin: { body: 'orb', icon: '🛰️' },
  towerSkin: { family: 'generic' },
  maps: enrichMaps('space', SOCCER_MAPS.slice(0, 3).map((map, index) => ({
    ...map,
    name: ['Docking Bay', 'Solar Yard', 'Asteroid Gate'][index],
    description: ['Intro outpost lane defense', 'Open resource yard', 'Two-lane asteroid pressure'][index],
    diff: index + 1,
    waves: [12, 16, 20][index],
    money: [700, 760, 840][index]
  })), {
    recommendedTowers: ['t1', 't4', 't6'],
    pressureType: 'prototype_mixed'
  }),
  towers: SOCCER_TOWERS.map(tower => {
    const spaceTowers = {
      t1: { nm: 'Laser Emitter', icon: '🔷', clr: '#67e8f9' },
      t2: { nm: 'Plasma Cannon', icon: '🟣', clr: '#c084fc' },
      t3: { nm: 'Gravity Well', icon: '🌀', clr: '#7dd3fc' },
      t4: { nm: 'Ion Snare', icon: '⚛️', clr: '#38bdf8' },
      t5: { nm: 'Shield Node', icon: '🛡️', clr: '#93c5fd' },
      t6: { nm: 'Arc Relay', icon: '⚡', clr: '#f0abfc' },
      t7: { nm: 'Nova Flare', icon: '☄️', clr: '#ff5ca8' },
      t8: { nm: 'Command Core', icon: '✦', clr: '#fbbf24' }
    };
    return {
      ...tower,
      ...spaceTowers[tower.id]
    };
  }),
  enemies: SOCCER_ENEMIES.map(enemy => ({
    ...enemy,
    nm: enemy.nm.replace('Ball', 'Drone'),
    id: enemy.id
  }))
});

export const CONTENT_PACKS = {
  hockey,
  soccer,
  space
};

export const THEMES = CONTENT_PACKS;
