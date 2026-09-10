import { Quaternion, Vector3 } from 'three';

const axis = new Vector3();
const rotation = new Quaternion();
const forward = new Vector3(), up = new Vector3(), right = new Vector3(), liftDirection = new Vector3();
const acceleration = new Vector3(), midpointVelocity = new Vector3();

// Representative lightweight airframe in SI units; coefficients are not a measured aircraft polar.
export const AIRFRAME = { mass: 80, wingArea: 10, span: 7.6, density: 1.225, gravity: 9.82,
  liftAtZero: 0.8907, liftSlope: 4.5, parasiticDrag: 0.025, efficiency: 0.8,
  dryThrust: 640, burnerThrust: 640 };

export function adjustThrottle(throttle, input, dt) {
  return Math.max(0, Math.min(1, throttle + input * dt * 0.35));
}

export function afterburnerEngaged(throttle, shift) {
  return shift && throttle > 0;
}

function forces(velocity, throttle, afterburner, result) {
  const a = AIRFRAME, speed = velocity.length();
  result.copy(forward).multiplyScalar((a.dryThrust + (afterburner ? a.burnerThrust : 0)) * throttle / a.mass);
  result.y -= a.gravity;
  if (speed < 1e-6) return;
  const axial = velocity.dot(forward), normal = velocity.dot(up);
  const alpha = Math.atan2(-normal, axial);
  // Blend the attached-flow polar into a flat-plate polar after stall, including reverse flow.
  const blend = Math.min(1, Math.max(0, (Math.abs(alpha) - 0.25) / 0.3));
  const t = blend * blend * (3 - 2 * blend);
  const cl = (a.liftAtZero + a.liftSlope * alpha) * (1 - t) + Math.sin(2 * alpha) * t;
  const aspect = a.span * a.span / a.wingArea;
  const cd = a.parasiticDrag + cl * cl / (Math.PI * aspect * a.efficiency)
    + 1.2 * Math.sin(alpha) ** 2 * t + 0.8 * (velocity.dot(right) / speed) ** 2;
  const pressurePerMass = 0.5 * a.density * speed * speed * a.wingArea / a.mass;
  // Lift is perpendicular to airflow; it redirects momentum without adding energy.
  liftDirection.crossVectors(right, velocity).normalize();
  result.addScaledVector(liftDirection, pressurePerMass * cl);
  result.addScaledVector(velocity, -pressurePerMass * cd / speed);
}

// ponytail: prescribed attitude, no aerodynamic torque or compressibility model.
export function stepAircraft(position, velocity, attitude, throttle, afterburner, dt) {
  forward.set(0, 0, -1).applyQuaternion(attitude);
  up.set(0, 1, 0).applyQuaternion(attitude);
  right.set(1, 0, 0).applyQuaternion(attitude);
  const steps = Math.max(1, Math.ceil(dt * 120)), h = dt / steps;
  for (let i = 0; i < steps; i++) {
    forces(velocity, throttle, afterburner, acceleration);
    midpointVelocity.copy(velocity).addScaledVector(acceleration, h / 2);
    forces(midpointVelocity, throttle, afterburner, acceleration);
    position.addScaledVector(midpointVelocity, h);
    velocity.addScaledVector(acceleration, h);
  }
}

// Postmultiplication rotates about the aircraft's own axes, including when inverted.
export function rotateAircraft(attitude, angularVelocity, dt) {
  const rate = angularVelocity.length();
  if (rate === 0 || dt === 0) return;
  axis.copy(angularVelocity).multiplyScalar(1 / rate);
  rotation.setFromAxisAngle(axis, rate * dt);
  attitude.multiply(rotation).normalize();
}
