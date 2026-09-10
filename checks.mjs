import assert from 'node:assert/strict';
import { Quaternion, Vector3 } from 'three';
import { rotateAircraft, adjustThrottle, afterburnerEngaged, stepAircraft, AIRFRAME } from './src/lib/aircraft.js';
import { stepBoids } from './src/lib/boids.js';
import { SEA_LEVEL, terrainHeight, terrainColor, emitsContrails, createPlane, createTerrain, createContrails } from './src/lib/world.js';
import { readFileSync, existsSync } from 'node:fs';
import { projects } from './src/lib/projects.js';
import { crossingTime, findCrossing, outsidePanel, projectPosition, smooth, clampStick, flightStick } from './src/lib/flight.js';
import { parseMarkdownToHtml as render } from './src/lib/markdown.js';

const panel = { x: 0, y: 0, z: 0 };
assert.equal(crossingTime({ x: 0, y: 0, z: 50 }, { x: 0, y: 0, z: -50 }, panel), 0.5);
assert.equal(crossingTime({ x: 20, y: 0, z: 50 }, { x: 20, y: 0, z: -50 }, panel), null);
assert.equal(crossingTime({ x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 }, panel), null);
assert.equal(crossingTime({ x: 0, y: 10, z: 50 }, { x: 0, y: 10, z: -50 }, panel), null);
assert.equal(crossingTime({ x: 0, y: 0, z: -5 }, { x: 0, y: 0, z: 5 }, panel), 0.5);
const blocked = new Set();
assert.equal(findCrossing({ x: 0, y: 0, z: 2 }, { x: 0, y: 0, z: -0.1 }, [panel], blocked), 0);
assert.equal(findCrossing({ x: 0, y: 0, z: -0.1 }, { x: 0, y: 0, z: 1 }, [panel], blocked), null);
assert.equal(outsidePanel({ x: 0, y: 0, z: 7 }, panel), true);
assert.equal(findCrossing({ x: 0, y: 0, z: 7 }, { x: 0, y: 0, z: -1 }, [panel], blocked), 0);
assert.equal(findCrossing({ x: 0, y: 0, z: 10 }, { x: 0, y: 0, z: -10 }, [panel, { ...panel, z: 5 }], new Set()), 1);

assert.equal(render('`**literal** <tag>`'), '<p><code>**literal** &lt;tag&gt;</code></p>');
assert.equal(render('```\n<script>**literal**</script>\n```'), '<pre><code>&lt;script&gt;**literal**&lt;/script&gt;</code></pre>');
assert.ok(render('<script>alert(1)</script>').includes('&lt;script&gt;'));
for (const url of ['javascript:alert', 'JaVaScRiPt:alert', 'data:text/html,evil', 'vbscript:evil', '//evil.example']) {
  assert.ok(!render(`[bad](${url})`).includes('href='), url);
  assert.ok(!render(`![bad](${url})`).includes('<img'), url);
}
assert.ok(!render('[bad](java&#115;cript:alert)').includes('href="javascript:'));
assert.ok(render('[safe](https://example.com/?a=1&b=2)').includes('href="https://example.com/?a=1&amp;b=2"'));
assert.ok(render('![photo](/images/sojs.png)').includes('<img'));
assert.ok(render('# Heading\n\n**bold** and *italic*\n\n- one\n- two').includes('<ul>\n<li>one</li>\n<li>two</li>\n</ul>'));
assert.equal(projects.length, 22);
assert.equal(new Set(projects.map(p => p.slug)).size, projects.length);
for (const [i, project] of projects.entries()) {
  assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const post = readFileSync(`public${project.postMarkdownPath}`, 'utf8');
  assert.ok(post.startsWith(`# ${project.title}\n`));
  assert.ok(existsSync(`public${project.imageUrl}`));
  assert.ok(Object.values(projectPosition(i, projects.length)).every(Number.isFinite));
}
console.log('Flight crossing, re-entry suppression, Markdown safety, and all 22 posts passed.');

// Sudden steering changes ease in, independently of display refresh rate.
assert.ok(smooth(0, Math.PI, 1 / 60) > 0);
assert.ok(smooth(0, Math.PI, 1 / 60) < Math.PI / 10);
assert.equal(smooth(0, Math.PI, 0), 0);
let at30 = 0, at120 = 0;
for (let i = 0; i < 30; i++) at30 = smooth(at30, 1, 1 / 30);
for (let i = 0; i < 120; i++) at120 = smooth(at120, 1, 1 / 120);
assert.ok(Math.abs(at30 - at120) < 1e-12);
assert.ok(at30 > 0.9 && at30 < 1);
console.log('Smooth steering checks passed.');


assert.equal(flightStick(0, 0, new Set(['ArrowUp'])).y, -1);
assert.equal(flightStick(0, 0, new Set(['ArrowDown'])).y, 1);
assert.deepEqual(flightStick(0, 0, new Set(['ArrowUp', 'ArrowDown'])), {x:0,y:0});
const diagonal = flightStick(0.8, -0.8, new Set(['ArrowRight','ArrowUp']));
assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-12);
assert.deepEqual(clampStick(0.3, 0.4), {x:0.3,y:0.4});
assert.deepEqual(clampStick(0, 0), {x:0,y:0});
assert.ok(Math.abs(clampStick(2, 2).x - Math.SQRT1_2) < 1e-12);
console.log('Stick limits and inverted pitch checks passed.');

const attitude = new Quaternion();
const forward = () => new Vector3(0, 0, -1).applyQuaternion(attitude);
rotateAircraft(attitude, new Vector3(0, 0, Math.PI / 2), 1);
assert.ok(forward().distanceTo(new Vector3(0, 0, -1)) < 1e-12, 'Rolling alone must not change heading');
rotateAircraft(attitude, new Vector3(Math.PI / 2, 0, 0), 1);
assert.ok(forward().distanceTo(new Vector3(-1, 0, 0)) < 1e-12, 'Pulling up while banked left turns left');
attitude.identity();
rotateAircraft(attitude, new Vector3(-Math.PI / 2, 0, 0), 1);
assert.ok(forward().distanceTo(new Vector3(0, -1, 0)) < 1e-12, 'Pushing up pitches down');
attitude.identity();
rotateAircraft(attitude, new Vector3(0, 0, Math.PI), 1);
rotateAircraft(attitude, new Vector3(0, Math.PI / 2, 0), 1);
assert.ok(forward().distanceTo(new Vector3(1, 0, 0)) < 1e-12, 'Rudder uses the inverted aircraft axis');
attitude.identity();
for(let i=0;i<120;i++) rotateAircraft(attitude, new Vector3(Math.PI * 2, 0, 0), 1 / 120);
assert.ok(forward().distanceTo(new Vector3(0, 0, -1)) < 1e-12, 'Full pitch loop without a clamp');
assert.ok(Math.abs(attitude.length() - 1) < 1e-12);
console.log('Local-axis rotation, bank-and-pull turns, inverted rudder, and full loops passed.');

// No imposed orbit: an isolated boid away from boundaries maintains its heading.
const bird = (x,y,z,vx=0,vy=0,vz=-6) => ({position:new Vector3(x,y,z),velocity:new Vector3(vx,vy,vz),next:new Vector3()});
const distantPlane=new Vector3(1000,1000,1000);
const solo=[bird(0,50,0)];
stepBoids(solo,0.1,distantPlane);
assert.deepEqual(solo[0].velocity.toArray(),[0,0,-6]);
const neighbors=[bird(0,50,0),bird(1,51,0)];
stepBoids(neighbors,0.1,distantPlane);
assert.ok(neighbors[0].velocity.x<0 && neighbors[0].velocity.y<0);
assert.ok(neighbors[1].velocity.x>0 && neighbors[1].velocity.y>0);
const alignment=[bird(0,50,0,6,0,0),bird(0,65,0,0,0,-6)];
stepBoids(alignment,0.1,distantPlane);
assert.ok(alignment[0].velocity.z<0 && alignment[1].velocity.x>0);
assert.ok(alignment[0].velocity.y>0 && alignment[1].velocity.y<0);
const overlaps=[bird(0,50,0),bird(0,50,0)];stepBoids(overlaps,0.1,distantPlane);
assert.ok(overlaps[0].velocity.x<0 && overlaps[1].velocity.x>0);
for(let i=0;i<600;i++)stepBoids(neighbors,1/30,distantPlane);
for(const b of neighbors){assert.ok(b.velocity.length()<=10.00001);assert.ok(b.position.toArray().every(Number.isFinite));}
let land=0,water=0,mountain=0;
for(let x=-800;x<=800;x+=40)for(let z=-1000;z<=600;z+=40){
  const h=terrainHeight(x,z);assert.equal(h,terrainHeight(x,z));assert.ok(Number.isFinite(h));
  if(h<SEA_LEVEL)water++;else land++;if(h>25)mountain++;
}
assert.ok(land>0&&water>0&&mountain>0);
assert.notEqual(terrainColor(-30,0.1),terrainColor(-30,0.9));
assert.equal(emitsContrails(0.2,11),false);assert.equal(emitsContrails(-0.8,11),true);
assert.equal(emitsContrails(0.8,0),false);assert.equal(emitsContrails(0,11,0.8),true);
const resources=[];const own=r=>(resources.push(r),r);
const planeMesh=createPlane(own);assert.ok(planeMesh.children.length>=8);
const terrainMesh=createTerrain(own);
assert.equal(terrainMesh.children[1].position.y,SEA_LEVEL);
assert.ok(terrainMesh.children[0].geometry.attributes.position.array.every(Number.isFinite));
const trails=createContrails(own);trails.update(planeMesh,0.1,true);planeMesh.position.z=-1;trails.update(planeMesh,0.1,true);
assert.ok(trails.object.geometry.attributes.color.array.some(c=>c>0));
trails.update(planeMesh,4,false);assert.ok(trails.object.geometry.attributes.color.array.every(c=>c===0));
for(const resource of resources)resource.dispose();
console.log('Terrain, plane mesh, contrail lifetime, and three-dimensional flocking checks passed.');

assert.equal(adjustThrottle(0.7, 1, 2), 1);
assert.equal(adjustThrottle(0.2, -1, 2), 0);
assert.equal(adjustThrottle(0.7, 0, 2), 0.7);
assert.equal(afterburnerEngaged(0.9, true), true);
assert.equal(afterburnerEngaged(1, false), false);
assert.equal(afterburnerEngaged(1, true), true);
function simulate(pitch, throttle, burner, seconds, hz = 60) {
  const p = new Vector3(), q = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), pitch);
  const v = new Vector3(0, 0, -12).applyQuaternion(q);
  for (let i = 0; i < seconds * hz; i++) stepAircraft(p, v, q, throttle, burner, 1 / hz);
  assert.ok([...p.toArray(), ...v.toArray()].every(Number.isFinite));
  return { p, v };
}
assert.ok(simulate(0.5, 0.55, false, 1).v.length() < 12, 'Climbing spends airspeed');
assert.ok(simulate(-0.5, 0.55, false, 1).v.length() > 12, 'Diving gains airspeed');
assert.ok(simulate(Math.PI / 2, 1, false, 10).v.y < 0, 'Dry thrust cannot sustain vertical climb');
assert.ok(simulate(Math.PI / 2, 0.9, true, 10).v.y > 0, 'Thrust, not a throttle gate, decides climb');
assert.ok(simulate(Math.PI / 2, 1, true, 10).v.y > 10, 'Full afterburner sustains vertical climb');
assert.ok(simulate(0, 0, false, 10).p.y > -12, 'Idle retains a shallow glide');
assert.ok(Math.abs(simulate(0, 0.11, false, 10).p.y) < 1, 'Cruise is trimmed');
assert.ok(simulate(0.3, 0.7, false, 3, 30).v.distanceTo(simulate(0.3, 0.7, false, 3, 120).v) < 1e-10);
assert.equal(planeMesh.getObjectByName('afterburner').visible, false);
console.log('Throttle, climb/dive energy, stall, afterburner, and frame-rate independence passed.');

// Cutting thrust leaves the same aerodynamic support and stored kinetic energy.
const coast = simulate(0, 0, false, 1);
assert.ok(coast.v.length() > 11 && coast.p.y > -0.2, 'Throttle cut must not cause immediate falling');
assert.ok(AIRFRAME.dryThrust / AIRFRAME.mass < AIRFRAME.gravity);
assert.ok((AIRFRAME.dryThrust + AIRFRAME.burnerThrust) / AIRFRAME.mass > AIRFRAME.gravity);
const zoomPosition = new Vector3(), zoomVelocity = new Vector3(0, 40, 0);
const vertical = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
let energy = zoomVelocity.lengthSq() / 2;
for (let i = 0; i < 240; i++) {
  stepAircraft(zoomPosition, zoomVelocity, vertical, 0, false, 1 / 120);
  const nextEnergy = zoomVelocity.lengthSq() / 2 + AIRFRAME.gravity * zoomPosition.y;
  assert.ok(nextEnergy <= energy + 0.001, 'Unpowered lift cannot manufacture mechanical energy');
  energy = nextEnergy;
}
assert.ok(zoomPosition.y > 50 && zoomVelocity.y > 10, 'Stored momentum sustains an unpowered zoom climb');
const dropped = new Vector3(), falling = new Vector3();
stepAircraft(dropped, falling, new Quaternion(), 0, false, 0.001);
assert.ok(Math.abs(falling.y / 0.001 + 9.82) < 0.001, 'Gravity acts even without airspeed');
console.log('Unpowered glide, zoom climb, energy conservation, and gravity passed.');
