// Enemy definitions for each theme
// Each enemy has: id, nm (name), hp, spd (speed), rwd (reward), sz (size)
// Optional properties: fire, flying, armor, boss

export const HOCKEY_ENEMIES = [
  {
    id: 'e1',
    nm: 'Puck',
    hp: 50,
    spd: 2.4,
    rwd: 10,
    sz: 1.0
  },
  {
    id: 'e2',
    nm: 'Hot Puck',
    hp: 70,
    spd: 2.0,
    rwd: 15,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e3',
    nm: 'Flying Puck',
    hp: 45,
    spd: 2.8,
    rwd: 12,
    flying: true,
    sz: 0.9
  },
  {
    id: 'e4',
    nm: 'Heavy Puck',
    hp: 250,
    spd: 0.7,
    rwd: 35,
    armor: 0.4,
    sz: 1.4
  },
  {
    id: 'e5',
    nm: 'Inferno Puck',
    hp: 400,
    spd: 0.55,
    rwd: 55,
    fire: true,
    armor: 0.3,
    sz: 1.5
  },
  {
    id: 'e6',
    nm: 'Flying Fire',
    hp: 120,
    spd: 2.2,
    rwd: 25,
    flying: true,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e7',
    nm: 'Boss Puck',
    hp: 2500,
    spd: 0.35,
    rwd: 350,
    armor: 0.35,
    boss: true,
    sz: 2.2
  }
];

export const SOCCER_ENEMIES = [
  {
    id: 'e1',
    nm: 'Ball',
    hp: 45,
    spd: 2.5,
    rwd: 10,
    sz: 1.0
  },
  {
    id: 'e2',
    nm: 'Fire Ball',
    hp: 65,
    spd: 2.1,
    rwd: 15,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e3',
    nm: 'Flying Ball',
    hp: 40,
    spd: 3.0,
    rwd: 12,
    flying: true,
    sz: 0.9
  },
  {
    id: 'e4',
    nm: 'Heavy Ball',
    hp: 280,
    spd: 0.65,
    rwd: 35,
    armor: 0.45,
    sz: 1.4
  },
  {
    id: 'e5',
    nm: 'Inferno Ball',
    hp: 450,
    spd: 0.5,
    rwd: 55,
    fire: true,
    armor: 0.35,
    sz: 1.5
  },
  {
    id: 'e6',
    nm: 'Flying Fire',
    hp: 130,
    spd: 2.3,
    rwd: 25,
    flying: true,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e7',
    nm: 'Boss Ball',
    hp: 2800,
    spd: 0.32,
    rwd: 400,
    armor: 0.38,
    boss: true,
    sz: 2.2
  }
];
