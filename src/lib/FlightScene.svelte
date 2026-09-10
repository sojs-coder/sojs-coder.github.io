<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { projects } from './projects.js';
  import { START, PANEL_WIDTH, PANEL_HEIGHT, projectPosition, findCrossing, smooth, clampStick, flightStick } from './flight.js';
  import { rotateAircraft, adjustThrottle, afterburnerEngaged, stepAircraft } from './aircraft.js';
  import { createTerrain, createPlane, createContrails, emitsContrails, terrainHeight, SEA_LEVEL } from './world.js';
  import { stepBoids } from './boids.js';
  import { createFrameMetrics } from './frameMetrics.js';

  let { enabled = true, onOpen, onActive, onReady, onError } = $props();
  let canvas;
  let running = false, started = false, disposed = false, raf = 0, previousTime = 0;
  let renderer, scene, camera, plane, trails, resizeObserver;
  let speed = $state(12), throttle = $state(0.11), burning = $state(false);
  let afterburner;
  let pointerX = 0, pointerY = 0;
  let stickX = $state(0), stickY = $state(0), locked = $state(false), lockError = $state(false);
  let animationTime = 0, simulationTime = 0;
  let hudRoll = $state(0), hudPitch = $state(0);
  const keys = new Set(), suppressed = new Set();
  const panels = projects.map((_, i) => {
    const p = projectPosition(i, projects.length);
    p.y = Math.max(p.y, terrainHeight(p.x, p.z) + 22);
    return p;
  });
  const resources = new Set();
  const metrics = createFrameMetrics('Flight');
  const oldPosition = new THREE.Vector3();
  const velocity = new THREE.Vector3(0, 0, -12);
  const angularVelocity = new THREE.Vector3(), targetAngularVelocity = new THREE.Vector3();
  const dummy = new THREE.Object3D();
  const chasePosition = new THREE.Vector3(), chaseLook = new THREE.Vector3(), worldUp = new THREE.Vector3(0, 1, 0);
  const chaseMatrix = new THREE.Matrix4(), chaseRotation = new THREE.Quaternion(), hudAttitude = new THREE.Euler(0, 0, 0, 'YXZ');
  let birds, flock = [];
  const own = (resource) => { resources.add(resource); return resource; };

  export function enter() {
    if (!started || !renderer || !enabled || document.hidden || disposed) return;
    running = true;
    onActive(true);
    start();
  }

  export function focus() { canvas?.focus({ preventScroll: true }); }

  export async function startFlight() {
    if (!renderer || !enabled || disposed) return;
    started = true;
    enter(); focus();
    await captureMouse();
  }

  // Called synchronously from Close, before history navigation consumes the gesture.
  export async function captureMouse() {
    if (!renderer || disposed) return;
    started = true;
    lockError = false;
    try { await canvas.requestPointerLock(); }
    catch (error) { lockError = true; console.warn('Mouse lock:', error.message); }
  }

  export function pause() {
    running = false;
    keys.clear();
    burning = false;
    if (afterburner) afterburner.visible = false;
    pointerX = pointerY = 0;
    stickX = stickY = 0;
    angularVelocity.set(0, 0, 0);
    stop();
    onActive(false);
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }

  export function reset() {
    pause();
    if (!camera) return;
    plane.position.set(START.x, START.y, START.z);
    plane.quaternion.identity();
    velocity.set(0, 0, -12); speed = 12; throttle = 0.11;
    trails.reset(); updateCamera(0, true);
    suppressed.clear();
    draw();
    enter();
  }

  $effect(() => {
    if (!enabled) { pause(); stop(); }
    else if (renderer) enter();
  });

  function start() {
    if (raf || disposed || !enabled || document.hidden) return;
    previousTime = 0;
    metrics.reset();
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; previousTime = 0; }
  function draw() { renderer?.render(scene, camera); }

  function updateCamera(dt, snap = false) {
    chasePosition.set(0, 3.5, 13).applyQuaternion(plane.quaternion).add(plane.position);
    chasePosition.y = Math.max(chasePosition.y, SEA_LEVEL + 3, terrainHeight(chasePosition.x, chasePosition.z) + 3);
    chaseLook.set(0, 0.5, -12).applyQuaternion(plane.quaternion).add(plane.position);
    camera.position.lerp(chasePosition, snap ? 1 : smooth(0, 1, dt, 5));
    chaseMatrix.lookAt(camera.position, chaseLook, worldUp);
    chaseRotation.setFromRotationMatrix(chaseMatrix);
    camera.quaternion.slerp(chaseRotation, snap ? 1 : smooth(0, 1, dt, 5));
    hudAttitude.setFromQuaternion(plane.quaternion, 'YXZ');
    hudRoll = -hudAttitude.z * 180 / Math.PI;
    hudPitch = THREE.MathUtils.clamp(hudAttitude.x * 12, -16, 16);
  }

  function makePanel(project, index) {
    const surface = document.createElement('canvas');
    surface.width = 1024; surface.height = 732;
    const ctx = surface.getContext('2d');
    const texture = own(new THREE.CanvasTexture(surface));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    function paint(image) {
      ctx.clearRect(0, 0, 1024, 732);
      ctx.fillStyle = '#f6f6f3'; ctx.fillRect(0, 0, 1024, 732);
      ctx.fillStyle = '#eee'; ctx.fillRect(24, 24, 976, 464);
      if (image) {
        const scale = Math.max(976 / image.width, 464 / image.height);
        ctx.save(); ctx.beginPath(); ctx.rect(24, 24, 976, 464); ctx.clip();
        ctx.globalAlpha = 0.82;
        ctx.drawImage(image, 24 + (976 - image.width * scale) / 2, 24 + (464 - image.height * scale) / 2, image.width * scale, image.height * scale);
        ctx.restore();
      }
      ctx.fillStyle = '#666'; ctx.font = '24px "Cormorant Garamond", "Iowan Old Style", "Times New Roman", serif';
      ctx.fillText(`${String(index + 1).padStart(2, '0')} / ${project.category.toUpperCase()}`, 40, 538);
      ctx.fillStyle = '#111';
      ctx.font = `${project.title.length > 25 ? 43 : 58}px "Cormorant Garamond", "Iowan Old Style", "Times New Roman", serif`;
      ctx.fillText(project.title, 38, 610, 940);

      ctx.strokeStyle = '#c8c8c2'; ctx.lineWidth = 3; ctx.strokeRect(2, 2, 1020, 728);
      texture.needsUpdate = true;
    }
    paint();
    const image = new Image();
    image.onload = () => { if (!disposed) { paint(image); if (enabled) draw(); } };
    image.src = project.imageUrl;
    const group = new THREE.Group();
    group.position.copy(panels[index]);
    const geometry = own(new THREE.PlaneGeometry(PANEL_WIDTH, PANEL_HEIGHT));
    const material = own(new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.88, depthWrite: false }));
    const front = new THREE.Mesh(geometry, material);
    front.position.z = 0.015;
    const back = new THREE.Mesh(geometry, material);
    back.rotation.y = Math.PI; back.position.z = -0.015;
    group.add(front, back);
    const edge = new THREE.LineSegments(own(new THREE.EdgesGeometry(geometry)), own(new THREE.LineBasicMaterial({ color: 0xc8c8c2, transparent: true, opacity: 0.7 })));
    group.add(edge);
    scene.add(group);
  }

  function makeFlock() {
    const geometry = own(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      0, 0, -0.4, -0.75, 0.18, 0.23, 0, 0, 0.1,
      0, 0, -0.4, 0, 0, 0.1, 0.75, 0.18, 0.23,
    ], 3));
    birds = new THREE.InstancedMesh(geometry, own(new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide })), 160);
    birds.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    birds.frustumCulled = false;
    scene.add(birds);
    flock = Array.from({ length: 160 }, () => {
      const position = new THREE.Vector3((Math.random() - 0.5) * 180, Math.random() * 50, -Math.random() * 160);
      position.y = Math.max(position.y, terrainHeight(position.x, position.z) + 22);
      const heading = new THREE.Vector3(Math.random() - 0.5, (Math.random() - 0.5) * 0.5, Math.random() - 0.5).normalize();
      return { position, velocity: heading.multiplyScalar(6), next: new THREE.Vector3() };
    });
    for (let i = 0; i < flock.length; i++) {
      dummy.position.copy(flock[i].position);
      dummy.updateMatrix(); birds.setMatrixAt(i, dummy.matrix);
    }
    birds.instanceMatrix.needsUpdate = true;
  }

  function frame(now) {
    raf = 0;
    if (!enabled || disposed || document.hidden) return;
    if (!running) { draw(); return; }
    const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.04) : 0;
    previousTime = now;
    metrics.record(now);
    animationTime += dt; simulationTime += dt;
    if (running) {
      const stick = flightStick(pointerX, pointerY, keys);
      stickX = stick.x; stickY = stick.y;
      const rudder = Number(keys.has('KeyA')) - Number(keys.has('KeyD'));
      const authority = THREE.MathUtils.clamp(speed / 12, 0.15, 1);
      targetAngularVelocity.set(stick.y * 1.05, rudder * 0.65, -stick.x * 1.5).multiplyScalar(authority);
      angularVelocity.lerp(targetAngularVelocity, smooth(0, 1, dt));
      rotateAircraft(plane.quaternion, angularVelocity, dt);
      throttle = adjustThrottle(throttle, Number(keys.has('KeyW')) - Number(keys.has('KeyS')), dt);
      burning = afterburnerEngaged(throttle, keys.has('ShiftLeft') || keys.has('ShiftRight'));
      afterburner.visible = burning;
      afterburner.scale.set(1, 1, throttle * (1 + Math.sin(animationTime * 47) * 0.06));
      oldPosition.copy(plane.position);
      stepAircraft(plane.position, velocity, plane.quaternion, throttle, burning, dt);
      speed = velocity.length();
      if (plane.position.y < Math.max(SEA_LEVEL, terrainHeight(plane.position.x, plane.position.z)) + 1) { reset(); return; }
      updateCamera(dt);
      trails.update(plane, dt, emitsContrails(angularVelocity.x, speed, hudAttitude.x));
      const hit = findCrossing(oldPosition, plane.position, panels, suppressed);
      if (hit !== null) { pause(); onOpen(projects[hit]); draw(); return; }
    }
    if (simulationTime >= 1 / 30) { stepBoids(flock, simulationTime, plane.position); simulationTime = 0; }
    for (let i = 0; i < flock.length; i++) {
      const bird = flock[i];
      dummy.position.copy(bird.position);
      dummy.rotation.set(Math.asin(bird.velocity.y / bird.velocity.length()), Math.atan2(-bird.velocity.x, -bird.velocity.z), Math.sin(animationTime * 5 + i) * 0.1, 'YXZ');
      dummy.scale.set(1, 0.5 + Math.sin(animationTime * 7 + i) * 0.4, 1);
      dummy.updateMatrix(); birds.setMatrixAt(i, dummy.matrix);
    }
    birds.instanceMatrix.needsUpdate = true;
    draw();
    raf = requestAnimationFrame(frame);
  }

  onMount(() => {
    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color('#f6f6f3');
      scene.fog = new THREE.Fog('#f6f6f3', 240, 1500);
      camera = new THREE.PerspectiveCamera(62, 1, 0.1, 6000);
      camera.position.set(START.x, START.y, START.z);
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      scene.add(new THREE.HemisphereLight(0xf6f6f3, 0x6e7869, 2));
      const sun = new THREE.DirectionalLight(0xfff5df, 2.2);
      sun.position.set(-180, 350, 100); scene.add(sun);
      scene.add(createTerrain(own));
      plane = createPlane(own); plane.position.set(START.x, START.y, START.z); scene.add(plane);
      afterburner = plane.getObjectByName('afterburner');
      trails = createContrails(own); scene.add(trails.object);
      updateCamera(0, true);
      projects.forEach(makePanel);
      makeFlock();
      resizeObserver = new ResizeObserver(() => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height; camera.updateProjectionMatrix(); draw();
      });
      resizeObserver.observe(canvas);
      onReady(); draw();
    } catch (error) { onError(error); }

    function keydown(event) {
      if (event.code === 'Enter' && event.target === canvas && enabled) { startFlight(); return; }
      if (!running || !enabled) return;
      if (event.code === 'Tab') { pause(); return; }
      if (event.code === 'Escape') { pause(); return; }
      if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) { event.preventDefault(); keys.add(event.code); }
    }
    function keyup(event) { keys.delete(event.code); }
    function mousemove(event) {
      if (!running || (document.pointerLockElement !== canvas && event.target !== canvas)) { pointerX = pointerY = 0; return; }
      const stick = clampStick(pointerX + event.movementX / 500, pointerY + event.movementY / 500);
      pointerX = stick.x; pointerY = stick.y;
    }
    function lockchange() {
      locked = document.pointerLockElement === canvas;
      pointerX = pointerY = 0;
      if (!locked) pause();
    }
    function lockfailed() { lockError = true; }
    function visibility() { if (document.hidden) pause(); else enter(); }
    function contextlost(event) { event.preventDefault(); pause(); stop(); onError(new Error('Graphics context lost')); }
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', pause);
    window.addEventListener('focus', enter);
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('pointerlockchange', lockchange);
    document.addEventListener('pointerlockerror', lockfailed);
    canvas.addEventListener('click', startFlight);

    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('webglcontextlost', contextlost);
    return () => {
      disposed = true; pause(); stop(); resizeObserver?.disconnect();
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', pause);
      window.removeEventListener('focus', enter);
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('pointerlockchange', lockchange);
      document.removeEventListener('pointerlockerror', lockfailed);
      canvas.removeEventListener('click', startFlight);

      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', contextlost);
      for (const resource of resources) resource.dispose();
      renderer?.dispose();
    };
  });
</script>

<canvas bind:this={canvas} tabindex="0" aria-label="Flight. Click or press Enter to lock the mouse. Up pitches down; Down pitches up. Q and E roll, A and D yaw, W increases throttle, S decreases throttle, Shift engages afterburners, Escape pauses and unlocks."></canvas>
{#if enabled}
  <div class="stick-hud" aria-hidden="true">
    <svg viewBox="-50 -50 100 100" fill="none">
      <circle r="39" class="boundary" />
      <path d="M-9 0H9M0-9V9" />
      <g transform={`translate(0 ${hudPitch - 15}) rotate(${hudRoll})`}><path d="M-12 0H12M0 0V-8" class="gimbal" /></g>
      <path d={`M0 0L${stickX * 36} ${stickY * 36}`} class="connection" />
      <circle cx={stickX * 36} cy={stickY * 36} r="3" class="stick" />
    </svg>
    {#if lockError && !locked}<span>Mouse lock unavailable</span>{/if}
    <span>THR {Math.round(throttle * 100)}% · {Math.round(speed)} m/s{burning ? ' · AB' : ''}</span>
  </div>
{/if}

<style>
  canvas { display: block; width: 100%; height: 100%; outline-offset: -4px; }
  .stick-hud { position: absolute; top: 50%; left: 50%; width: 96px; height: 96px; transform: translate(-50%, -50%); pointer-events: none; color: #111; text-align: center; }
  svg { display: block; width: 100%; height: 100%; stroke: currentColor; stroke-width: 1; filter: drop-shadow(0 0 2px #f6f6f3); }
  .gimbal { stroke-width: 2; }
  .boundary { opacity: 0.25; }
  .connection { opacity: 0.4; }
  .stick { fill: currentColor; stroke: #f6f6f3; }
  .stick-hud span { display: block; font-size: 11px; white-space: nowrap; margin-top: 3px; }
</style>
