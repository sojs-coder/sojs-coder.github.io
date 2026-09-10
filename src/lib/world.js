import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const noise = new ImprovedNoise();
export const SEA_LEVEL = -65;
export const CONTRAIL_PITCH = 0.55;

export function terrainHeight(x, z) {
  const wx = x + noise.noise(x / 420, z / 420, 8.3) * 90;
  const wz = z + noise.noise(x / 420, z / 420, 19.7) * 90;
  const land = 1 - Math.hypot((wx + 100) / 700, (wz + 240) / 580)
    + noise.noise(wx / 240, wz / 240, 4.2) * 0.23;
  let detail = 0, frequency = 1 / 130, amplitude = 12;
  for (let octave = 0; octave < 5; octave++) {
    detail += noise.noise(wx * frequency, wz * frequency, 31.4) * amplitude;
    frequency *= 2; amplitude *= 0.48;
  }
  const ridge = Math.pow(1 - Math.abs(noise.noise(wx / 105, wz / 105, 17.3)), 3);
  const mountains = THREE.MathUtils.smoothstep(land, 0.48, 0.9) * ridge * 105;
  return SEA_LEVEL + (land - 0.28) * 78 + mountains + detail;
}

export function terrainColor(height, slope) {
  if (height < SEA_LEVEL + 3) return 0xc0b49a;
  if (height > 62 && slope < 0.85) return 0xe5e4dc;
  if (slope > 0.65 || height > 25) return 0x777b75;
  if (height > -10) return 0x7d8968;
  return 0x68825a;
}

export function createTerrain(own) {
  const indexed = new THREE.PlaneGeometry(1900, 1900, 180, 180);
  indexed.rotateX(-Math.PI / 2);
  indexed.translate(0, 0, -180);
  const p = indexed.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, terrainHeight(p.getX(i), p.getZ(i)));
  const geometry = own(indexed.toNonIndexed());
  indexed.dispose();
  geometry.computeVertexNormals();
  const vertices = geometry.attributes.position, normals = geometry.attributes.normal;
  const colors = new Float32Array(vertices.count * 3), color = new THREE.Color();
  for (let i = 0; i < vertices.count; i += 3) {
    const height = (vertices.getY(i) + vertices.getY(i + 1) + vertices.getY(i + 2)) / 3;
    const slope = 1 - Math.abs(normals.getY(i));
    color.setHex(terrainColor(height, slope));
    const shade = 0.96 + noise.noise(vertices.getX(i) / 40, vertices.getZ(i) / 40, 7) * 0.08;
    color.multiplyScalar(shade);
    for (let j = 0; j < 3; j++) color.toArray(colors, (i + j) * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, own(new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }))));
  const water = new THREE.Mesh(own(new THREE.PlaneGeometry(12000, 12000)), own(new THREE.MeshStandardMaterial({ color: 0x769caa, roughness: 0.32, metalness: 0.18 })));
  water.rotation.x = -Math.PI / 2; water.position.y = SEA_LEVEL;
  group.add(water);
  return group;
}

export function createPlane(own) {
  const plane = new THREE.Group();
  const body = own(new THREE.MeshStandardMaterial({ color: 0xd6d4c9, roughness: 0.65, flatShading: true }));
  const dark = own(new THREE.MeshStandardMaterial({ color: 0x343b3e, roughness: 0.45, flatShading: true }));
  function mesh(geometry, material, x = 0, y = 0, z = 0) {
    const item = new THREE.Mesh(own(geometry), material);
    item.position.set(x, y, z); plane.add(item); return item;
  }
  const fuselage = mesh(new THREE.CylinderGeometry(0.25, 0.48, 4.6, 6), body);
  fuselage.rotation.x = -Math.PI / 2;
  const nose = mesh(new THREE.ConeGeometry(0.25, 1.2, 6), dark, 0, 0, -2.9);
  nose.rotation.x = -Math.PI / 2;
  const cockpit = mesh(new THREE.SphereGeometry(0.55, 6, 4), dark, 0, 0.36, -0.7);
  cockpit.scale.set(0.7, 0.75, 1.6);
  // Swept wings and tail are thin triangular prisms, not external model assets.
  function wing(span, rootFront, tipBack, rootBack, y, z) {
    for (const side of [-1, 1]) {
      const shape = new THREE.Shape();
      shape.moveTo(0, rootFront); shape.lineTo(span * side, tipBack); shape.lineTo(span * side * 0.94, tipBack + 0.38); shape.lineTo(0, rootBack); shape.closePath();
      const g = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
      g.rotateX(Math.PI / 2);
      mesh(g, body, 0, y, z);
    }
  }
  wing(3.8, -1.1, 0.85, 1.15, 0, 0);
  wing(1.5, -0.5, 0.2, 0.7, 0.1, 1.8);
  const fin = mesh(new THREE.ConeGeometry(0.8, 1.6, 3), body, 0, 0.65, 1.75);
  fin.scale.x = 0.12;
  mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.5, 8), dark, 0, 0, 2.45).rotation.x = Math.PI / 2;
  const flame = new THREE.Group();
  flame.name = 'afterburner'; flame.position.z = 2.7; flame.visible = false;
  for (const [radius, length, color, opacity] of [[0.36, 2.5, 0xff702a, 0.45], [0.2, 1.7, 0x9bbdff, 0.9]]) {
    const jet = new THREE.Mesh(own(new THREE.ConeGeometry(radius, length, 12)), own(new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })));
    jet.rotation.x = Math.PI / 2; jet.position.z = length / 2;
    flame.add(jet);
  }
  const glow = new THREE.PointLight(0xff8844, 8, 8, 2); flame.add(glow);
  plane.add(flame);
  return plane;
}

export function emitsContrails(pitchRate, speed, pitchAngle = 0) {
  return (Math.abs(pitchRate) > CONTRAIL_PITCH || Math.abs(pitchAngle) > Math.PI / 5) && Math.abs(speed) > 2;
}

export function createContrails(own) {
  const capacity = 180, life = 3;
  const positions = new Float32Array(capacity * 2 * 3), colors = new Float32Array(capacity * 2 * 3);
  const ages = new Float32Array(capacity).fill(life), ends = new Float32Array(capacity * 6);
  const geometry = own(new THREE.BufferGeometry());
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(geometry, own(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })));
  lines.frustumCulled = false;
  let cursor = 0, emitting = false;
  const previous = [new THREE.Vector3(), new THREE.Vector3()], tip = new THREE.Vector3();
  return {
    object: lines,
    reset() { ages.fill(life); emitting = false; positions.fill(0); geometry.attributes.position.needsUpdate = true; },
    update(plane, dt, enabled) {
      for (let i = 0; i < capacity; i++) ages[i] += dt;
      if (enabled) {
        for (let side = 0; side < 2; side++) {
          tip.set(side ? 3.7 : -3.7, 0, 1.1).applyQuaternion(plane.quaternion).add(plane.position);
          if (emitting) { previous[side].toArray(ends, cursor * 6); tip.toArray(ends, cursor * 6 + 3); ages[cursor] = 0; cursor = (cursor + 1) % capacity; }
          previous[side].copy(tip);
        }
      }
      emitting = enabled;
      for (let i = 0; i < capacity; i++) {
        const opacity = Math.max(0, 1 - ages[i] / life);
        for (let j = 0; j < 6; j++) { positions[i * 6 + j] = opacity ? ends[i * 6 + j] : 0; colors[i * 6 + j] = opacity; }
      }
      geometry.attributes.position.needsUpdate = geometry.attributes.color.needsUpdate = true;
    },
  };
}
