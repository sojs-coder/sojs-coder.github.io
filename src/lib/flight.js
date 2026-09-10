export const PANEL_WIDTH = 14;
export const PANEL_HEIGHT = 10;
export const START = { x: 0, y: 2, z: 24 };

export function smooth(current, target, dt, rate = 3) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

export function clampStick(x, y) {
  const radius = Math.max(1, Math.hypot(x, y));
  return { x: x / radius, y: y / radius };
}

export function flightStick(x, y, keys) {
  return clampStick(
    x + Number(keys.has('ArrowRight') || keys.has('KeyE')) - Number(keys.has('ArrowLeft') || keys.has('KeyQ')),
    y + Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp')),
  );
}

export function projectPosition(index, count) {
  const angle = index / count * Math.PI * 2;
  return { x: Math.sin(angle) * 78, y: Math.sin(angle * 2) * 13 + 2, z: Math.cos(angle) * 78 - 78 };
}

// Panels stay parallel to the XY plane, with two readable faces.
export function crossingTime(from, to, panel) {
  const dz = to.z - from.z;
  if (Math.abs(dz) < 1e-8) return null;
  const t = (panel.z - from.z) / dz;
  if (t < 0 || t > 1) return null;
  return Math.abs(from.x + (to.x - from.x) * t - panel.x) <= PANEL_WIDTH / 2
    && Math.abs(from.y + (to.y - from.y) * t - panel.y) <= PANEL_HEIGHT / 2 ? t : null;
}

export function outsidePanel(position, panel) {
  return Math.abs(position.x - panel.x) > PANEL_WIDTH / 2 + 3
    || Math.abs(position.y - panel.y) > PANEL_HEIGHT / 2 + 3
    || Math.abs(position.z - panel.z) > 5;
}

export function findCrossing(from, to, panels, suppressed) {
  let first = null, time = Infinity;
  for (let i = 0; i < panels.length; i++) {
    if (suppressed.has(i)) {
      if (outsidePanel(from, panels[i])) suppressed.delete(i);
      else continue;
    }
    const t = crossingTime(from, to, panels[i]);
    if (t !== null && t < time) { first = i; time = t; }
  }
  if (first !== null) suppressed.add(first);
  return first;
}
