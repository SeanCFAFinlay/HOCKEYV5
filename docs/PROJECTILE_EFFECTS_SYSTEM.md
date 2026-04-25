# Projectile Effects System

Projectile visuals are configured per theme in `visuals.projectiles`.

## Profile Fields

- `mesh`: visual primitive such as `puck`, `ball`, `laser`, `plasma`, `ring`, `bolt`, `star`.
- `trail`: trail behavior such as `ice`, `spin`, `curve`, `laser`, `plasma`, `electric`, `gravity`.
- `impact`: impact behavior such as `frost`, `freeze`, `ring`, `burn`, `gravity`, `chain`, `crit`.
- `color`: numeric Three.js color.
- `speed`: projectile movement speed.
- `curve`: optional curve/spin offset.
- `beam`: optional instant-ray style flag foundation.

## Current Behavior

- Hockey puck/shard/fire/electric projectiles use icy, frost, fire, and chain colors.
- Soccer projectiles use ball spin, curve-shot trails, shock rings, and grass-kick impacts.
- Orbital projectiles use lasers, plasma bolts, gravity rings, ion bolts, and sci-fi glow trails.

## Cleanup

Projectile meshes and their glow children are recursively disposed on impact. Trail particles are pooled and disposed when the pool is full.

