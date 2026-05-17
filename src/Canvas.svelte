<script lang="ts">
    import { onMount } from "svelte";

    var canvas: HTMLCanvasElement = $state(null);
    var ctx: CanvasRenderingContext2D | null = null;
    var WIDTH = $state(window.innerWidth);
    var HEIGHT = $state(window.innerHeight);

    const BOID_COUNT = 500;
    const MIN_BOIDS = 80;
    const MAX_BOIDS = 1200;
    const DOT_SIZE = 3;
    const DOT_SPEED = 0.45;
    const STEP_SCALE = 0.5;
    const VISUAL_RANGE = 85;
    const SEPARATION_RANGE = 16;
    const CELL_SIZE = SEPARATION_RANGE;
    const COHERENCE_WEIGHT = 0.04;
    const ALIGNMENT_WEIGHT = 0.085;
    const SEPARATION_WEIGHT = 0.18;
    const EDGE_AVOID_WEIGHT = 0.12;
    const MOUSE_TEND_WEIGHT = 0.16;
    const MOUSE_TEND_RANGE = 180;
    const EDGE_MARGIN = 120;
    const JITTER_WEIGHT = 0.01;
    const MAX_TURN_PER_FRAME = 0.11;
    const MAX_DELTA_MS = 33;
    const FADE_IN_RATE = 0.08;
    const FADE_OUT_RATE = 0.05;

    // Cellular-life layer driven by occupancy over time
    const LIFE_TICK_FRAMES = 6;
    const TEMPORAL_DECAY = 0.8;
    const OCCUPIED_THRESHOLD = 0.45;
    const CROWD_LIMIT = 3.6;

    let dots = $state<Dot[]>([]);
    let lastFrame = 0;
    let frameCounter = 0;
    let bufferedPopulation = $state(0);
    let temporalOccupancy: Float32Array = new Float32Array(0);
    let mouse = { x: 0, y: 0, active: false };
    let nextDirsPool: [number, number][] = [];
    let bucketsPool: (number[])[] = [];
    let toRemoveIndices: number[] = [];

    onMount(() => {
        ctx = canvas.getContext("2d");
        buildDots();
        
        requestAnimationFrame(render);

        window.addEventListener("resize", updateWH);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseleave", onMouseLeave);

        return () => {
            window.removeEventListener("resize", updateWH);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseleave", onMouseLeave);
        };
    });

    function updateWH() {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
    }
    function render() {
        if (!ctx) return;
        const now = performance.now();
        if (lastFrame === 0) lastFrame = now;
        const deltaMs = Math.min(MAX_DELTA_MS, now - lastFrame);
        lastFrame = now;
        frameCounter++;

        if (frameCounter % 60 === 0) {
            bufferedPopulation = dots.length;
        }

        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        updateSimulation(deltaMs);
        drawDots();
        requestAnimationFrame(render);
    }

    function drawDots() {
        ctx!.fillStyle = "black";
        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            ctx!.globalAlpha = dot.alpha;
            ctx!.fillRect(dot.x, dot.y, DOT_SIZE, DOT_SIZE);
        }
        ctx!.globalAlpha = 1;
    }

    function buildDots() {
        for (var i = 0; i < BOID_COUNT; i++) {
            dots.push(new Dot());
        }
    }

    function onMouseMove(event: MouseEvent) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;
    }

    function onMouseLeave() {
        mouse.active = false;
    }

    function normalizeToUnit(v: [number, number], fallback: [number, number] = [1, 0]): [number, number] {
        const magSq = v[0] * v[0] + v[1] * v[1];
        if (magSq === 0) return fallback;
        if (magSq === 1) return v;
        const mag = Math.sqrt(magSq);
        return [v[0] / mag, v[1] / mag];
    }

    function clamp(n: number, min: number, max: number) {
        return Math.max(min, Math.min(max, n));
    }

    function gridIndex(cx: number, cy: number, cellsX: number) {
        return cy * cellsX + cx;
    }

    function getGridShape() {
        const cellsX = Math.max(1, Math.ceil(WIDTH / CELL_SIZE));
        const cellsY = Math.max(1, Math.ceil(HEIGHT / CELL_SIZE));
        return { cellsX, cellsY, count: cellsX * cellsY };
    }

    function buildSpatialGrid(cellsX: number, cellsY: number) {
        const cellCount = cellsX * cellsY;
        const buckets: number[][] = bucketsPool;
        const occupancy = new Float32Array(cellCount);

        for (let i = 0; i < buckets.length; i++) buckets[i].length = 0;
        while (buckets.length < cellCount) buckets.push([]);

        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            if (dot.alpha <= 0.01) continue;
            const cx = clamp(Math.floor(dot.x / CELL_SIZE), 0, cellsX - 1);
            const cy = clamp(Math.floor(dot.y / CELL_SIZE), 0, cellsY - 1);
            const gi = gridIndex(cx, cy, cellsX);
            buckets[gi].push(i);
            occupancy[gi] += dot.alpha;
        }

        return { buckets, occupancy };
    }

    function rotateTowards(current: [number, number], target: [number, number], maxAngle: number): [number, number] {
        const dot = Math.max(-1, Math.min(1, current[0] * target[0] + current[1] * target[1]));
        if (dot >= Math.cos(maxAngle)) return target;
        const angle = Math.acos(dot);
        if (angle === 0) return target;
        const t = maxAngle / angle;
        return normalizeToUnit([
            current[0] + (target[0] - current[0]) * t,
            current[1] + (target[1] - current[1]) * t
        ], current);
    }

    function ensureTemporalGridSize(size: number) {
        if (temporalOccupancy.length !== size) {
            temporalOccupancy = new Float32Array(size);
        }
    }

    function updateTemporalGrid(occupancy: Float32Array) {
        for (let i = 0; i < occupancy.length; i++) {
            temporalOccupancy[i] =
                temporalOccupancy[i] * TEMPORAL_DECAY +
                occupancy[i] * (1 - TEMPORAL_DECAY);
        }
    }

    function countAliveNeighbors(cellX: number, cellY: number, cellsX: number, cellsY: number, occ: Float32Array) {
        let alive = 0;
        for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
                if (ox === 0 && oy === 0) continue;
                const nx = cellX + ox;
                const ny = cellY + oy;
                if (nx < 0 || nx >= cellsX || ny < 0 || ny >= cellsY) continue;
                const ni = gridIndex(nx, ny, cellsX);
                if (occ[ni] >= OCCUPIED_THRESHOLD) alive++;
            }
        }
        return alive;
    }

    function markDotDying(index: number) {
        if (index >= 0 && index < dots.length) {
            dots[index].dying = true;
        }
    }

    function averageBucketDirection(bucket: number[]): [number, number] | null {
        let sx = 0;
        let sy = 0;
        let n = 0;
        for (const idx of bucket) {
            const dot = dots[idx];
            if (!dot || dot.alpha <= 0.05 || dot.dying) continue;
            sx += dot.v[0];
            sy += dot.v[1];
            n++;
        }
        if (n === 0) return null;
        return normalizeToUnit([sx / n, sy / n], [1, 0]);
    }

    function collectParentDirection(cellX: number, cellY: number, cellsX: number, cellsY: number, buckets: number[][]): [number, number] | null {
        let sx = 0;
        let sy = 0;
        let n = 0;

        for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
                if (ox === 0 && oy === 0) continue;
                const nx = cellX + ox;
                const ny = cellY + oy;
                if (nx < 0 || nx >= cellsX || ny < 0 || ny >= cellsY) continue;
                const ni = gridIndex(nx, ny, cellsX);
                if (temporalOccupancy[ni] < OCCUPIED_THRESHOLD) continue;
                const dir = averageBucketDirection(buckets[ni]);
                if (!dir) continue;
                sx += dir[0];
                sy += dir[1];
                n++;
            }
        }

        if (n === 0) return null;
        return normalizeToUnit([sx / n, sy / n], [1, 0]);
    }

    function spawnDotInCell(cellX: number, cellY: number, parentDirection: [number, number] | null) {
        if (dots.length >= MAX_BOIDS) return;
        const dot = new Dot(parentDirection ?? undefined, true);
        dot.x = clamp((cellX + Math.random()) * CELL_SIZE, 0, Math.max(0, WIDTH - 1));
        dot.y = clamp((cellY + Math.random()) * CELL_SIZE, 0, Math.max(0, HEIGHT - 1));
        dots.push(dot);
    }

    function applyLifeRules(cellsX: number, cellsY: number, buckets: number[][]) {
        if (frameCounter % LIFE_TICK_FRAMES !== 0) return;

        const toSpawn: Array<{ cx: number; cy: number; parentDirection: [number, number] | null }> = [];
        const toCullIndices = new Set<number>();

        for (let cy = 0; cy < cellsY; cy++) {
            for (let cx = 0; cx < cellsX; cx++) {
                const gi = gridIndex(cx, cy, cellsX);
                const aliveNeighbors = countAliveNeighbors(cx, cy, cellsX, cellsY, temporalOccupancy);
                const currentDensity = temporalOccupancy[gi];
                const occupied = currentDensity >= OCCUPIED_THRESHOLD;

                if (occupied) {
                    if (aliveNeighbors < 2 || aliveNeighbors > 3 || currentDensity > CROWD_LIMIT) {
                        const bucket = buckets[gi];
                        if (bucket.length > 0) {
                            const pickedLocal = Math.floor(Math.random() * bucket.length);
                            toCullIndices.add(bucket[pickedLocal]);
                        }
                    }
                } else if (aliveNeighbors === 3 && currentDensity < 0.2) {
                    toSpawn.push({
                        cx,
                        cy,
                        parentDirection: collectParentDirection(cx, cy, cellsX, cellsY, buckets)
                    });
                }
            }
        }

        const cullArr = Array.from(toCullIndices).sort((a, b) => b - a);
        for (let i = 0; i < cullArr.length; i++) {
            if (dots.length <= MIN_BOIDS) break;
            markDotDying(cullArr[i]);
        }

        for (const spawn of toSpawn) {
            if (dots.length >= MAX_BOIDS) break;
            spawnDotInCell(spawn.cx, spawn.cy, spawn.parentDirection);
        }
    }

    function updateSimulation(deltaMs: number) {
        const deltaNorm = deltaMs / 16.666;
        const nextDirs = nextDirsPool;
        nextDirs.length = dots.length;
        const vrSq = VISUAL_RANGE * VISUAL_RANGE;
        const srSq = SEPARATION_RANGE * SEPARATION_RANGE;
        const { cellsX, cellsY, count } = getGridShape();
        ensureTemporalGridSize(count);
        const { buckets, occupancy } = buildSpatialGrid(cellsX, cellsY);
        updateTemporalGrid(occupancy);
        const cellRadius = Math.max(1, Math.ceil(VISUAL_RANGE / CELL_SIZE));

        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            if (dot.dying) {
                dot.alpha = Math.max(0, dot.alpha - FADE_OUT_RATE * deltaNorm);
            } else {
                dot.alpha = Math.min(1, dot.alpha + FADE_IN_RATE * deltaNorm);
            }

            if (dot.alpha <= 0.01) {
                nextDirs[i] = dot.v;
                continue;
            }

            let alignX = 0, alignY = 0;
            let cohX = 0, cohY = 0;
            let sepX = 0, sepY = 0;
            let count = 0;

            const cx = clamp(Math.floor(dot.x / CELL_SIZE), 0, cellsX - 1);
            const cy = clamp(Math.floor(dot.y / CELL_SIZE), 0, cellsY - 1);
            for (let oy = -cellRadius; oy <= cellRadius; oy++) {
                for (let ox = -cellRadius; ox <= cellRadius; ox++) {
                    const nx = cx + ox;
                    const ny = cy + oy;
                    if (nx < 0 || nx >= cellsX || ny < 0 || ny >= cellsY) continue;
                    const candidates = buckets[gridIndex(nx, ny, cellsX)];
                    for (const j of candidates) {
                        if (i === j) continue;
                        const other = dots[j];
                        if (!other || other.alpha <= 0.05 || other.dying) continue;

                        const dx = other.x - dot.x;
                        const dy = other.y - dot.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq > vrSq || distSq === 0) continue;

                        count++;
                        alignX += other.v[0];
                        alignY += other.v[1];
                        cohX += dx;
                        cohY += dy;

                        if (distSq < srSq) {
                            sepX -= dx / distSq;
                            sepY -= dy / distSq;
                        }
                    }
                }
            }

            const curr = normalizeToUnit(dot.v);
            let alignment: [number, number] = [0, 0];
            let coherence: [number, number] = [0, 0];
            let separation: [number, number] = [0, 0];
            if (count > 0) {
                alignment = normalizeToUnit([alignX / count, alignY / count], [0, 0]);
                coherence = normalizeToUnit([cohX / count, cohY / count], [0, 0]);
                separation = normalizeToUnit([sepX, sepY], [0, 0]);
            }
            let edgeX = 0, edgeY = 0;
            if (dot.x < EDGE_MARGIN) edgeX = (EDGE_MARGIN - dot.x) / EDGE_MARGIN;
            else if (dot.x > WIDTH - EDGE_MARGIN) edgeX = -(dot.x - (WIDTH - EDGE_MARGIN)) / EDGE_MARGIN;
            if (dot.y < EDGE_MARGIN) edgeY = (EDGE_MARGIN - dot.y) / EDGE_MARGIN;
            else if (dot.y > HEIGHT - EDGE_MARGIN) edgeY = -(dot.y - (HEIGHT - EDGE_MARGIN)) / EDGE_MARGIN;
            const edgeAvoidance = normalizeToUnit([edgeX, edgeY], [0, 0]);
            let mouseTend: [number, number] = [0, 0];
            if (mouse.active) {
                const mdx = mouse.x - dot.x;
                const mdy = mouse.y - dot.y;
                const mrSq = MOUSE_TEND_RANGE * MOUSE_TEND_RANGE;
                const md2 = mdx * mdx + mdy * mdy;
                if (md2 > 0 && md2 < mrSq) {
                    const md = Math.sqrt(md2);
                    mouseTend = [(mdx / md) * (1 - md / MOUSE_TEND_RANGE), (mdy / md) * (1 - md / MOUSE_TEND_RANGE)];
                }
            }

            const steer: [number, number] = [
                alignment[0] * ALIGNMENT_WEIGHT +
                coherence[0] * COHERENCE_WEIGHT +
                separation[0] * SEPARATION_WEIGHT +
                edgeAvoidance[0] * EDGE_AVOID_WEIGHT +
                mouseTend[0] * MOUSE_TEND_WEIGHT,
                alignment[1] * ALIGNMENT_WEIGHT +
                coherence[1] * COHERENCE_WEIGHT +
                separation[1] * SEPARATION_WEIGHT +
                edgeAvoidance[1] * EDGE_AVOID_WEIGHT +
                mouseTend[1] * MOUSE_TEND_WEIGHT
            ];
            const jitterAngle = Math.random() * Math.PI * 2;
            steer[0] += Math.cos(jitterAngle) * JITTER_WEIGHT;
            steer[1] += Math.sin(jitterAngle) * JITTER_WEIGHT;

            const desired = normalizeToUnit([
                curr[0] + steer[0] * deltaNorm,
                curr[1] + steer[1] * deltaNorm
            ], curr);

            nextDirs[i] = rotateTowards(curr, desired, MAX_TURN_PER_FRAME * deltaNorm);
        }

        const distance = deltaMs * STEP_SCALE * DOT_SPEED;
        for (let i = 0; i < dots.length; i++) {
            dots[i].v = normalizeToUnit(nextDirs[i], dots[i].v);
            dots[i].x += dots[i].v[0] * distance;
            dots[i].y += dots[i].v[1] * distance;

            if (dots[i].x < 0) {
                dots[i].x = 0;
                dots[i].v[0] = Math.abs(dots[i].v[0]);
            } else if (dots[i].x > WIDTH - 1) {
                dots[i].x = WIDTH - 1;
                dots[i].v[0] = -Math.abs(dots[i].v[0]);
            }

            if (dots[i].y < 0) {
                dots[i].y = 0;
                dots[i].v[1] = Math.abs(dots[i].v[1]);
            } else if (dots[i].y > HEIGHT - 1) {
                dots[i].y = HEIGHT - 1;
                dots[i].v[1] = -Math.abs(dots[i].v[1]);
            }
        }

        toRemoveIndices.length = 0;
        for (let i = 0; i < dots.length; i++) {
            if (dots[i].alpha <= 0.01 && dots[i].dying) {
                toRemoveIndices.push(i);
            }
        }
        for (let i = toRemoveIndices.length - 1; i >= 0; i--) {
            dots.splice(toRemoveIndices[i], 1);
        }

        applyLifeRules(cellsX, cellsY, buckets);
    }

    class Dot {
        x: number;
        y: number;
        v: [number, number];
        alpha: number;
        dying: boolean;

        constructor(direction?: [number, number], newborn: boolean = false) {
            this.x = Math.floor(Math.random() * WIDTH);
            this.y = Math.floor(Math.random() * HEIGHT);

            if (direction) {
                this.v = normalizeToUnit(direction);
            } else {
                const angle = Math.random() * Math.PI * 2;
                this.v = [Math.cos(angle), Math.sin(angle)];
            }
            this.alpha = newborn ? 0 : 1;
            this.dying = false;
        }
    }
</script>

<canvas bind:this={canvas} width={WIDTH} height={HEIGHT}></canvas>
<div class="boid-counter">{bufferedPopulation}</div>

<style>
    canvas {
        position: fixed;
        top: 0px;
        left: 0px;
        z-index: 0; /* above body background */
        pointer-events: none; /* never block scroll or clicks */
    }

    .boid-counter {
        position: fixed;
        top: 16px;
        right: 16px;
        font-size: 24px;
        font-weight: 300;
        color: black;
        opacity: 0.35;
        pointer-events: none;
        font-family: monospace;
        z-index: 1;
    }
</style>
