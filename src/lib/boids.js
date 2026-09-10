import { Vector3 } from 'three';
import { SEA_LEVEL, terrainHeight } from './world.js';

const acceleration = new Vector3();

export function stepBoids(flock, dt, aircraft) {
  // ponytail: pairwise neighbors capped at 160; use a spatial grid for larger flocks.
  for (let i = 0; i < flock.length; i++) {
    const bird = flock[i];
    let ax = 0, ay = 0, az = 0, cx = 0, cy = 0, cz = 0, sx = 0, sy = 0, sz = 0, count = 0;
    for (let j = 0; j < flock.length; j++) {
      if (i === j) continue;
      const other = flock[j], d = bird.position.distanceToSquared(other.position);
      if (d > 26 * 26) continue;
      count++;
      ax += other.velocity.x; ay += other.velocity.y; az += other.velocity.z;
      cx += other.position.x; cy += other.position.y; cz += other.position.z;
      if (d < 25) {
        if (d < 0.0001) { sx += i < j ? -1 : 1; continue; }
        sx += (bird.position.x - other.position.x) / d;
        sy += (bird.position.y - other.position.y) / d;
        sz += (bird.position.z - other.position.z) / d;
      }
    }
    acceleration.set(0, 0, 0);
    if (count) acceleration.set(
      (ax / count - bird.velocity.x) * 0.65 + (cx / count - bird.position.x) * 0.09 + sx * 14,
      (ay / count - bird.velocity.y) * 0.65 + (cy / count - bird.position.y) * 0.09 + sy * 14,
      (az / count - bird.velocity.z) * 0.65 + (cz / count - bird.position.z) * 0.09 + sz * 14,
    );
    // Soft volume boundaries and terrain avoidance, with no orbit or waypoint target.
    for (const axis of ['x', 'z']) {
      const limit = axis === 'x' ? 280 : 320;
      const value = bird.position[axis] + (axis === 'z' ? 70 : 0);
      if (Math.abs(value) > limit) acceleration[axis] -= Math.sign(value) * (Math.abs(value) - limit) * 0.12;
    }
    const ground = Math.max(SEA_LEVEL, terrainHeight(bird.position.x + bird.velocity.x * 2, bird.position.z + bird.velocity.z * 2));
    if (bird.position.y < ground + 18) acceleration.y += (ground + 18 - bird.position.y) * 0.6;
    if (bird.position.y > 110) acceleration.y -= (bird.position.y - 110) * 0.15;
    const d = bird.position.distanceToSquared(aircraft);
    if (d < 100) {
      acceleration.x += (bird.position.x - aircraft.x) * 22 / Math.max(1, d);
      acceleration.y += (bird.position.y - aircraft.y) * 22 / Math.max(1, d);
      acceleration.z += (bird.position.z - aircraft.z) * 22 / Math.max(1, d);
    }
    acceleration.clampLength(0, 12);
    bird.next.copy(bird.velocity).addScaledVector(acceleration, dt).clampLength(4, 10);
  }
  for (const bird of flock) { bird.velocity.copy(bird.next); bird.position.addScaledVector(bird.velocity, dt); }
}
