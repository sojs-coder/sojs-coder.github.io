<script>
    import { onMount } from "svelte";
    import { createFrameMetrics } from "./frameMetrics.js";

    const RAMP = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    const MONO = "ui-monospace, Menlo, Consolas, monospace";
    const FONT_PX = 5;
    const SS = 3;
    const BG = "#f5f1e7";
    const INK = "#1b1914";
    const FOCUS_SOLID = 58;
    const FOCUS_RADIUS = 145;
    const REVEAL_SOLID = 82;
    const REVEAL_RADIUS = 225;
    const REVEAL_STRENGTH = 1.45;
    const LIFE_CELL = 18;
    const LIFE_STEP_MS = 140;
    const LIFE_FADE = 0.12;
    const BREAK_MS = 900;
    const HEAL_MS = 700;
    const GLITCH_FRACTION = 0.005;
    const EMIT_MS = 600;
    const FRAME_INTERVAL = 1000 / 30;
    const GLITCH_SPAWN_INTERVAL = 180;
    const MOBILE_CONWAY_STEPS = 10;

    let root = $state(null);
    let canvas = $state(null);
    let doc = $state(null);
    let music = $state(null);
    let soundToggle = $state(null);
    let panelHeight = $state("100vh");
    let isPanelVisible = $state(false);
    let viewportTop = $state("0px");
    let viewportHeight = $state("0px");
    let canvasTop = $state("0px");
    let isDomContent = $state(false);

    onMount(() => {
        const ctx = canvas.getContext("2d", { alpha: false });
        const revealCanvas = document.createElement("canvas");
        const revealCtx = revealCanvas.getContext("2d");
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
        const compactViewport = matchMedia("(max-width: 1300px)");
        // Matches the touch/coarse-pointer condition used for gray project cards.
        const mobileDevice = matchMedia("(hover: none), (pointer: coarse)");
        const font = (s) => `${s.i ? "italic " : ""}${s.w ? s.w + " " : ""}${s.px}px ${s.f}`;

        let vw = 0;
        let vh = 0;
        let prevLifeVw = 0;
        let prevLifeVh = 0;
        let cw;
        let lh;
        let sx;
        let cols;
        let rows;
        let lum;
        let docRows;
        let ops;
        let units;
        let elementRows;
        let raf = 0;
        let resizeTimer = 0;
        let viewportUpdateRaf = 0;
        let nextFrameAt = 0;
        let nextGlitchSpawn = 0;
        let soundBounds = null;
        let soundInset = 0;
        let soundSize = 0;
        let visible = false;
        let pointer = { x: 0, y: 0, active: false, amt: 0 };
        let keyFocus = null;
        let keyShown = null;
        let keyAmt = 0;
        let lifeCols = 0;
        let lifeRows = 0;
        let life = new Uint8Array(0);
        let nextLife = new Uint8Array(0);
        let lifeAlpha = new Float32Array(0);
        let lastLifeStep = 0;
        let lifeSteps = 0;
        let glitchCells = new Map();
        let glitchGroups = [];
        const frameMetrics = createFrameMetrics("Panel 2");

        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const smooth = (x) => x * x * (3 - 2 * x);
        const hash = (c, r) => ((Math.imul(c + 1, 73856093) ^ Math.imul(r + 1, 19349663)) >>> 0 & 1023) / 1023;
        const opensNewTab = (a) => a.target === "_blank" || new URL(a.href, location.href).origin !== location.origin;

        function panelTop() {
            return root.getBoundingClientRect().top + window.scrollY;
        }

        function localScroll() {
            const max = Math.max(0, docRows * lh - vh);
            return clamp(window.scrollY - panelTop(), 0, max);
        }

        function drawTextOp(target, o) {
            target.font = font(o.s);
            target.fillText(o.t, o.x, o.y);
            if (o.s.u && !o.sup) {
                target.fillRect(o.x, o.y + o.h * 1.05, o.w, Math.max(0.6, o.h * 0.06));
            }
        }

        function tokensOf(el, upper) {
            const out = [];

            function walk(node, link = null, sup = false, mark = {}) {
                if (node.nodeType === 3) {
                    for (const w of node.textContent.split(/\s+/)) {
                        if (w) out.push({ w: upper ? w.toUpperCase() : w, link, sup, ...mark });
                    }
                    return;
                }

                if (node.nodeType !== 1) return;

                const nextLink = node.tagName === "A" ? node : link;
                const nextSup = node.tagName === "SUP" ? true : sup;
                const nextMark = {
                    b: mark.b || node.tagName === "B" || node.tagName === "STRONG",
                    i: mark.i || node.tagName === "I" || node.tagName === "EM",
                    u: mark.u || node.tagName === "U",
                };
                for (const child of node.childNodes) walk(child, nextLink, nextSup, nextMark);
                const tail = out[out.length - 1];
                if (node.tagName === "A" && opensNewTab(node) && tail?.link === node) tail.w += "↗";
            }

            walk(el);
            return out;
        }

        function rasterize() {
            sx = lh / cw;
            const W = cols / sx;
            const pad = W * 0.085;
            ops = [];
            units = new Map();
            elementRows = new Map();
            let y = Math.max(18, window.innerHeight * 0.18 / lh);

            const probe = document.createElement("canvas").getContext("2d");
            const H1 = { px: Math.max(22, W * 0.21), f: MONO, w: "bold" };
            const H2 = { px: Math.max(20, W * 0.165), f: MONO, w: "bold" };
            const P = { px: Math.max(7, W * 0.032), f: MONO, w: "" };
            const F = { px: Math.max(5, W * 0.024), f: MONO, w: "" };

            function unitFor(key, el) {
                let u = units.get(key);
                if (!u) units.set(key, (u = { el, ops: [] }));
                return u;
            }

            function place(el, style, upper = false, indent = 0, prefix = "") {
                probe.font = font(style);
                const left = pad + indent;
                const right = W - pad;
                const sp = probe.measureText(" ").width;
                let x = left;
                if (!elementRows.has(el)) elementRows.set(el, y);
                if (prefix) {
                    const w = probe.measureText(prefix).width;
                    ops.push({ t: prefix, s: style, x, y, w, h: style.px, unit: null });
                    x += w;
                }
                let sentence = {};
                for (const tok of tokensOf(el, upper)) {
                    const tokStyle = {
                        ...style,
                        px: tok.sup ? style.px * 0.68 : style.px,
                        w: tok.sup || tok.b ? "bold" : style.w,
                        i: tok.i || style.i,
                        u: tok.u || style.u,
                    };
                    probe.font = font(tokStyle);
                    const w = probe.measureText(tok.w).width;
                    if (x > left && x + w > right) {
                        y += style.px * 1.12;
                        x = left;
                    }
                    const op = {
                        t: tok.w,
                        s: tokStyle,
                        x,
                        y: tok.sup ? y - style.px * 0.32 : y,
                        w,
                        h: tokStyle.px,
                        unit: null,
                        sup: tok.sup,
                    };
                    ops.push(op);
                    op.unit = unitFor(tok.link || sentence, tok.link);
                    op.unit.ops.push(op);
                    x += w + sp;
                    if (!tok.link && /[.!?][")'\]]*$/.test(tok.w)) sentence = {};
                }
                y += style.px * 1.12;
            }

            function placeRule(el) {
                if (!elementRows.has(el)) elementRows.set(el, y);
                y += P.px * 0.72;
                ops.push({
                    rule: true,
                    x: pad,
                    y,
                    w: W - pad * 2,
                    h: Math.max(0.8, P.px * 0.08),
                    unit: null,
                });
                y += P.px * 0.88;
            }

            for (const el of doc.querySelectorAll("h1, h2, p, li, hr")) {
                if (el.tagName === "H1") {
                    place(el, H1, true);
                    y += H1.px * 0.72;
                } else if (el.tagName === "H2") {
                    y += H2.px * 0.62;
                    place(el, H2, true);
                    y += H2.px * 0.08;
                } else if (el.tagName === "HR") {
                    placeRule(el);
                } else if (el.closest("footer")) {
                    place(el, F);
                    y += F.px * (el.tagName === "LI" ? 0.28 : 0.7);
                } else {
                    place(el, P);
                    y += P.px * 0.62;
                }
            }
            y += 14;
            docRows = Math.ceil(y);

            const hi = document.createElement("canvas");
            hi.width = cols * SS;
            hi.height = docRows * SS;
            const g = hi.getContext("2d");
            g.fillStyle = "#000";
            g.fillRect(0, 0, hi.width, hi.height);
            g.setTransform(sx * SS, 0, 0, SS, 0, 0);
            g.textBaseline = "top";
            g.fillStyle = "#fff";
            for (const o of ops) {
                if (o.rule) {
                    g.fillRect(o.x, o.y, o.w, o.h);
                    continue;
                }
                drawTextOp(g, o);
            }

            const r = document.createElement("canvas");
            r.width = cols;
            r.height = docRows;
            const rg = r.getContext("2d", { willReadFrequently: true });
            rg.imageSmoothingQuality = "high";
            rg.drawImage(hi, 0, 0, cols, docRows);

            const d = rg.getImageData(0, 0, cols, docRows).data;
            lum = new Float32Array(cols * docRows);
            for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
                lum[i] = (0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2]) / 255;
            }
        }

        function initLife() {
            lifeCols = Math.ceil(vw / LIFE_CELL);
            lifeRows = Math.ceil(vh / LIFE_CELL);
            life = new Uint8Array(lifeCols * lifeRows);
            nextLife = new Uint8Array(life.length);
            lifeAlpha = new Float32Array(life.length);

            for (let r = 0; r < lifeRows; r++) {
                for (let c = 0; c < lifeCols; c++) {
                    const edgeBias = c < 3 || r < 3 || c > lifeCols - 4 || r > lifeRows - 4 ? 0.08 : 0;
                    const i = r * lifeCols + c;
                    life[i] = Math.random() < 0.18 + edgeBias ? 1 : 0;
                    lifeAlpha[i] = life[i] ? 1 : 0;
                }
            }

            lastLifeStep = 0;
            lifeSteps = 0;
        }

        function measure() {
            const bounds = root.getBoundingClientRect();
            vw = Math.max(1, Math.round(bounds.width));
            vh = window.innerHeight;
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            soundInset = rootFontSize * 1.4;
            soundSize = rootFontSize * 2.2;
            const dpr = devicePixelRatio || 1;
            canvas.width = vw * dpr;
            canvas.height = vh * dpr;
            revealCanvas.width = vw * dpr;
            revealCanvas.height = vh * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            revealCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = `${FONT_PX}px ${MONO}`;
            ctx.textBaseline = "top";
            cw = ctx.measureText("M").width;
            lh = FONT_PX;
            cols = Math.ceil(vw / cw);
            rows = Math.ceil(vh / lh);
            keyFocus = keyShown = null;
            keyAmt = 0;
            glitchCells = new Map();
            glitchGroups = [];
            if (!isDomContent && (vw !== prevLifeVw || vh !== prevLifeVh)) {
                initLife();
                prevLifeVw = vw;
                prevLifeVh = vh;
            }
            if (isDomContent) {
                panelHeight = "auto";
                return;
            }
            rasterize();
            panelHeight = `${Math.max(vh, docRows * lh)}px`;
        }

        function stepLife(now) {
            if (mobileDevice.matches && lifeSteps >= MOBILE_CONWAY_STEPS) return;
            if (still || now - lastLifeStep < LIFE_STEP_MS) return;
            lastLifeStep = now;

            for (let r = 0; r < lifeRows; r++) {
                for (let c = 0; c < lifeCols; c++) {
                    let n = 0;
                    for (let y = -1; y <= 1; y++) {
                        for (let x = -1; x <= 1; x++) {
                            if (x === 0 && y === 0) continue;
                            const rr = (r + y + lifeRows) % lifeRows;
                            const cc = (c + x + lifeCols) % lifeCols;
                            n += life[rr * lifeCols + cc];
                        }
                    }
                    const alive = life[r * lifeCols + c] === 1;
                    nextLife[r * lifeCols + c] = n === 3 || (alive && n === 2) ? 1 : 0;
                }
            }

            const swap = life;
            life = nextLife;
            nextLife = swap;
            lifeSteps++;
        }

        function drawLife(alphaScale = 1) {
            ctx.save();
            for (let r = 0; r < lifeRows; r++) {
                for (let c = 0; c < lifeCols; c++) {
                    const i = r * lifeCols + c;
                    lifeAlpha[i] += ((life[i] ? 1 : 0) - lifeAlpha[i]) * LIFE_FADE;
                    if (lifeAlpha[i] < 0.01) continue;
                    ctx.fillStyle = `rgba(27, 25, 20, ${0.052 * alphaScale * lifeAlpha[i]})`;
                    ctx.fillRect(c * LIFE_CELL + 1, r * LIFE_CELL + 1, LIFE_CELL - 3, LIFE_CELL - 3);
                }
            }
            ctx.restore();
        }

        function targets(scrollTop) {
            const out = [];
            for (const u of units.values()) {
                if (u.el?.tagName !== "A") continue;
                if (!u.box) {
                    let x0 = Infinity;
                    let y0 = Infinity;
                    let x1 = -Infinity;
                    let y1 = -Infinity;
                    for (const o of u.ops) {
                        x0 = Math.min(x0, o.x);
                        y0 = Math.min(y0, o.y);
                        x1 = Math.max(x1, o.x + o.w);
                        y1 = Math.max(y1, o.y + o.h);
                    }
                    u.box = { x0, y0, x1, y1 };
                }
                const b = u.box;
                out.push({ u, x0: b.x0 * lh, y0: b.y0 * lh - scrollTop, x1: b.x1 * lh, y1: b.y1 * lh - scrollTop });
            }
            if (soundBounds) out.push({ btn: soundToggle, ...soundBounds });
            return out;
        }

        function distTo(t) {
            const dx = Math.max(t.x0 - pointer.x, 0, pointer.x - t.x1);
            const dy = Math.max(t.y0 - pointer.y, 0, pointer.y - t.y1);
            return Math.hypot(dx, dy);
        }

        const nearness = (d) =>
            d > FOCUS_RADIUS
                ? 0
                : smooth(Math.max(0, Math.min(1, d <= FOCUS_SOLID ? 1 : (FOCUS_RADIUS - d) / (FOCUS_RADIUS - FOCUS_SOLID))));

        function nearest(scrollTop) {
            let best = null;
            let bd = FOCUS_RADIUS;
            for (const t of targets(scrollTop)) {
                const d = distTo(t);
                if (d <= bd) {
                    bd = d;
                    best = t;
                }
            }
            return best;
        }

        function underline(u, a, scrollTop) {
            ctx.save();
            ctx.globalAlpha = a;
            ctx.translate(0, -scrollTop);
            ctx.scale(lh, lh);
            ctx.fillStyle = INK;
            for (const o of u.ops) if (!o.sup) ctx.fillRect(o.x, o.y + o.h * 1.05, o.w, Math.max(1 / lh, o.h * 0.06));
            ctx.restore();
        }

        function setKeyFocus(u) {
            if (u === keyFocus) return;
            if (u) keyAmt = 0;
            keyFocus = u;
            if (still && visible) startAnimation();
        }

        function scrollToHash(hashValue) {
            const id = decodeURIComponent(hashValue.replace(/^#/, ""));
            const target = document.getElementById(id);
            const y = target ? elementRows.get(target) : null;
            if (typeof y !== "number") return false;

            const top = panelTop() + Math.max(0, Math.min(y * lh - vh * 0.18, Math.max(0, docRows * lh - vh)));
            scrollTo({ top, behavior: still ? "auto" : "smooth" });
            history.pushState(null, "", `#${id}`);
            target.focus?.({ preventScroll: true });
            return true;
        }

        function handleLocalLink(href) {
            const url = new URL(href, location.href);
            if (url.origin !== location.origin || !url.hash) return false;
            return scrollToHash(url.hash);
        }

        function setSoundPlaying(isPlaying) {
            soundToggle.dataset.playing = String(isPlaying);
            soundToggle.setAttribute("aria-pressed", String(isPlaying));
            soundToggle.setAttribute("aria-label", isPlaying ? "Mute music" : "Play music");
        }

        async function onSoundClick(event) {
            event.stopPropagation();
            if (music.paused || music.muted) {
                music.muted = false;
                try {
                    await music.play();
                    setSoundPlaying(true);
                } catch {
                    music.muted = true;
                    setSoundPlaying(false);
                }
                return;
            }

            music.pause();
            music.muted = true;
            setSoundPlaying(false);
        }

        function maskOf(u) {
            const m = new Map();
            for (const o of u.ops) {
                const c0 = Math.floor(o.x * sx) - 1;
                const c1 = Math.ceil((o.x + o.w) * sx) + 1;
                for (let r = Math.floor(o.y) - 1; r <= Math.ceil(o.y + o.h); r++) {
                    const cur = m.get(r);
                    if (cur) {
                        cur[0] = Math.min(cur[0], c0);
                        cur[1] = Math.max(cur[1], c1);
                    } else {
                        m.set(r, [c0, c1]);
                    }
                }
            }
            return m;
        }

        function drawOps(target, list) {
            for (const o of list) {
                if (o.rule) {
                    target.fillRect(o.x, o.y, o.w, o.h);
                    continue;
                }
                drawTextOp(target, o);
            }
        }

        function resolveUnit(u, a, scrollTop) {
            ctx.save();
            ctx.globalAlpha = a;
            ctx.translate(0, -scrollTop);
            ctx.scale(lh, lh);
            ctx.textBaseline = "top";
            ctx.fillStyle = INK;
            drawOps(ctx, u.ops);
            ctx.restore();
        }

        function resolveCircle(a, scrollTop) {
            if (a <= 0) return;

            revealCtx.save();
            revealCtx.setTransform(1, 0, 0, 1, 0, 0);
            revealCtx.clearRect(0, 0, revealCanvas.width, revealCanvas.height);
            revealCtx.restore();

            revealCtx.save();
            revealCtx.translate(0, -scrollTop);
            revealCtx.scale(lh, lh);
            revealCtx.textBaseline = "top";
            revealCtx.fillStyle = INK;
            drawOps(revealCtx, ops);
            revealCtx.restore();

            revealCtx.save();
            revealCtx.globalCompositeOperation = "destination-in";
            revealCtx.globalAlpha = Math.min(1, a * REVEAL_STRENGTH);
            const gradient = revealCtx.createRadialGradient(pointer.x, pointer.y, REVEAL_SOLID, pointer.x, pointer.y, REVEAL_RADIUS);
            gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
            gradient.addColorStop(0.46, "rgba(0, 0, 0, 0.96)");
            gradient.addColorStop(0.74, "rgba(0, 0, 0, 0.58)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            revealCtx.fillStyle = gradient;
            revealCtx.fillRect(pointer.x - REVEAL_RADIUS, pointer.y - REVEAL_RADIUS, REVEAL_RADIUS * 2, REVEAL_RADIUS * 2);
            revealCtx.restore();

            ctx.drawImage(revealCanvas, 0, 0, vw, vh);
        }

        function visibleLetterSlots(top) {
            const slots = [];
            const onScreen = ops.filter((o) => o.t?.length > 0 && o.y + o.h > top && o.y < top + rows);

            for (const o of onScreen) {
                const adv = o.w / o.t.length;
                for (let k = 0; k < o.t.length; k++) {
                    slots.push({ o, k, adv, key: `${o.x}:${o.y}:${k}` });
                }
            }

            return slots;
        }

        function pruneGlitches(now) {
            for (let i = glitchGroups.length - 1; i >= 0; i--) {
                const grp = glitchGroups[i];
                if (grp.locked < grp.n && now < grp.expireAt) continue;
                for (const cell of grp.cells) glitchCells.delete(cell);
                glitchGroups.splice(i, 1);
            }
        }

        function snapGlitchGroup(grp) {
            for (const cell of grp.cells) glitchCells.delete(cell);
            const i = glitchGroups.indexOf(grp);
            if (i >= 0) glitchGroups.splice(i, 1);
        }

        function spawnGlitch(slot, now, last) {
            const { o, k, adv, key } = slot;
            const severity = 0.7 + Math.random() * 0.65;
            const start = now + Math.random() * 90;
            const emit = EMIT_MS * (0.12 + Math.random() * 0.34);
            const breakMs = BREAK_MS * (0.45 + Math.random() * 0.95);
            const holdMs = (70 + Math.random() * 360) * severity;
            const healMs = HEAL_MS * (0.45 + Math.random() * 1.35);
            const grp = { key, n: 0, locked: 0, cells: [], resolveAt: Infinity, expireAt: Infinity };

            const c0 = Math.max(0, Math.floor((o.x + adv * k) * sx));
            const c1 = Math.min(cols - 1, Math.ceil((o.x + adv * (k + 1)) * sx));
            const r0 = Math.max(0, Math.floor(o.y));
            const r1 = Math.min(docRows - 1, Math.ceil(o.y + o.h));

            for (let r = r0; r <= r1; r++) {
                for (let c = c0; c <= c1; c++) {
                    const i = r * cols + c;
                    if (lum[i] <= 0.05 || glitchCells.has(i)) continue;

                    const fall = start + Math.random() * emit;
                    const gone = fall + breakMs * (0.55 + Math.random() * 0.95);
                    const heal = gone + holdMs * (0.45 + Math.random() * 1.35);
                    grp.resolveAt = Math.min(grp.resolveAt, heal);
                    const v = lum[i];
                    glitchCells.set(i, {
                        fall,
                        gone,
                        grp,
                        breakDur: gone - fall,
                        heal,
                        dur: healMs * (0.55 + Math.random() * 1.25),
                        severity,
                        want: v >= 1 ? last : Math.round(v * last),
                        locked: false,
                    });
                    grp.cells.push(i);
                    grp.n++;
                }
            }

            if (grp.n > 0) {
                grp.expireAt = grp.resolveAt + healMs * 3;
                glitchGroups.push(grp);
            }
        }

        function draw(now = 0) {
            if (!visible) {
                raf = 0;
                return;
            }

            if (!still && now < nextFrameAt) {
                raf = requestAnimationFrame(draw);
                return;
            }
            nextFrameAt = Math.max(now, nextFrameAt + FRAME_INTERVAL);
            frameMetrics.record(now);

            const scrollTop = localScroll();
            stepLife(now);
            ctx.fillStyle = BG;
            ctx.fillRect(0, 0, vw, vh);
            drawLife();
            if (isDomContent) {
                if (mobileDevice.matches && lifeSteps >= MOBILE_CONWAY_STEPS) {
                    raf = 0;
                    return;
                }
                if (still) {
                    raf = 0;
                    return;
                }
                raf = requestAnimationFrame(draw);
                return;
            }
            ctx.font = `${FONT_PX}px ${MONO}`;
            ctx.textBaseline = "top";
            ctx.fillStyle = "#28251e";

            const top = Math.floor(scrollTop / lh);
            const off = -(scrollTop % lh);
            const last = RAMP.length - 1;

            pointer.amt += ((pointer.active ? 1 : 0) - pointer.amt) * (still ? 1 : 0.18);
            if (pointer.amt < 0.004) pointer.amt = 0;

            if (keyFocus) keyShown = keyFocus;
            if (keyShown) keyAmt += ((keyFocus ? 1 : 0) - keyAmt) * (still ? 1 : 0.18);
            if (keyAmt < 0.004) {
                keyAmt = 0;
                keyShown = null;
            }
            const keyMask = keyShown ? maskOf(keyShown) : null;

            if (!still && now >= nextGlitchSpawn) {
                nextGlitchSpawn = now + GLITCH_SPAWN_INTERVAL;
                pruneGlitches(now);
                const visibleLetters = visibleLetterSlots(top);
                const visibleKeys = new Set(visibleLetters.map((slot) => slot.key));
                const occupiedKeys = new Set(glitchGroups.map((grp) => grp.key));
                const activeLetters = glitchGroups.filter((grp) => visibleKeys.has(grp.key) && now < grp.resolveAt).length;
                const targetLetters = Math.ceil(visibleLetters.length * GLITCH_FRACTION);
                const available = visibleLetters.filter((slot) => !occupiedKeys.has(slot.key));

                for (let n = activeLetters; n < targetLetters && available.length; n++) {
                    const picked = Math.floor(Math.random() * available.length);
                    const [slot] = available.splice(picked, 1);
                    occupiedKeys.add(slot.key);
                    spawnGlitch(slot, now, last);
                }
            }

            for (let r = 0; r < rows + 1; r++) {
                const dr = top + r;
                if (dr < 0 || dr >= docRows) continue;
                const row = dr * cols;
                const keyRange = keyMask && keyMask.get(dr);
                const cellY = (dr + 0.5) * lh - scrollTop;
                const dy = cellY - pointer.y;
                const inPointerRow = pointer.amt > 0 && Math.abs(dy) <= REVEAL_RADIUS;
                const pointerDx = inPointerRow ? Math.sqrt(REVEAL_RADIUS * REVEAL_RADIUS - dy * dy) : 0;
                const pointerC0 = inPointerRow ? Math.floor((pointer.x - pointerDx) / cw) : 1;
                const pointerC1 = inPointerRow ? Math.ceil((pointer.x + pointerDx) / cw) : 0;
                let s = "";
                for (let c = 0; c < cols; c++) {
                    let dissolveAmt = 0;
                    let inSpotlight = false;
                    if (keyRange && c >= keyRange[0] && c <= keyRange[1]) dissolveAmt = Math.max(dissolveAmt, keyAmt);
                    if (inPointerRow && c >= pointerC0 && c <= pointerC1) {
                        const dx = (c + 0.5) * cw - pointer.x;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= REVEAL_RADIUS) {
                            inSpotlight = true;
                            const raw = dist <= REVEAL_SOLID ? 1 : (REVEAL_RADIUS - dist) / (REVEAL_RADIUS - REVEAL_SOLID);
                            const focusStrength = smooth(Math.max(0, Math.min(1, raw)));
                            dissolveAmt = Math.max(dissolveAmt, Math.min(1, pointer.amt * focusStrength * REVEAL_STRENGTH));
                        }
                    }
                    let g = glitchCells.get(row + c);
                    if (g && inSpotlight) {
                        snapGlitchGroup(g.grp);
                        g = undefined;
                    }
                    if (g && !g.locked && now >= g.fall) {
                        let p;
                        if (now < g.gone) p = 1 - (now - g.fall) / g.breakDur;
                        else if (now < g.heal) {
                            s += " ";
                            continue;
                        } else p = Math.min(0.86, (now - g.heal) / g.dur);
                        const rnd = hash(c, dr + Math.floor(now / (55 + (c % 5) * 22)));
                        const idx = Math.max(
                            0,
                            Math.min(
                                last,
                                Math.round(g.want * p + rnd * last * (1 - p) * g.severity + (rnd - 0.5) * last * (1 - p) * 0.8 * g.severity),
                            ),
                        );
                        if (now > g.heal && (idx === g.want || g.grp.locked / g.grp.n >= 0.85)) {
                            g.locked = true;
                            g.grp.locked++;
                        } else {
                            s += RAMP[idx];
                            continue;
                        }
                    }
                    const dissolved = hash(c, dr) < dissolveAmt;
                    const v = dissolved ? 0 : lum[row + c];
                    s += RAMP[v <= 0 ? 0 : v >= 1 ? last : Math.round(v * last)];
                }
                ctx.fillText(s, 0, off + r * lh);
            }

            resolveCircle(pointer.amt, scrollTop);
            for (const t of targets(scrollTop)) {
                const a = pointer.amt * nearness(distTo(t));
                if (t.btn) t.btn.style.setProperty("--near", a.toFixed(3));
                else if (a > 0.01) underline(t.u, a, scrollTop);
            }
            if (keyShown) resolveUnit(keyShown, keyAmt, scrollTop);
            if (still) {
                raf = 0;
                return;
            }
            raf = requestAnimationFrame(draw);
        }

        function startAnimation() {
            if (raf) return;
            frameMetrics.reset();
            nextFrameAt = 0;
            lastLifeStep = performance.now();
            raf = requestAnimationFrame(draw);
        }

        function stopAnimation() {
            if (!raf) return;
            cancelAnimationFrame(raf);
            raf = 0;
        }

        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                measure();
                updatePanelVisibility();
            }, 150);
        }

        function updatePanelVisibility() {
            const rect = root.getBoundingClientRect();
            const top = Math.max(0, rect.top);
            const bottom = Math.min(window.innerHeight, rect.bottom);
            const height = Math.max(0, bottom - top);
            visible = height > 0;
            isPanelVisible = visible;
            viewportTop = `${top}px`;
            viewportHeight = `${height}px`;
            canvasTop = `${-top}px`;
            soundBounds = {
                x0: vw - soundInset - soundSize,
                y0: top + height - soundInset - soundSize,
                x1: vw - soundInset,
                y1: top + height - soundInset,
            };
            if (visible) startAnimation();
            else stopAnimation();
        }

        function scheduleViewportUpdate() {
            if (viewportUpdateRaf) return;
            viewportUpdateRaf = requestAnimationFrame(() => {
                viewportUpdateRaf = 0;
                updatePanelVisibility();
            });
        }

        function onPointerMove(e) {
            if (isDomContent) return;
            pointer.x = e.clientX;
            pointer.y = e.clientY;
            const top = parseFloat(viewportTop);
            pointer.active = e.clientX >= 0 && e.clientX <= vw && e.clientY >= top && e.clientY <= top + parseFloat(viewportHeight);
            if (still && visible) startAnimation();
        }

        function onPointerLeave() {
            pointer.active = false;
            if (still && visible) startAnimation();
        }

        function onClick(e) {
            if (isDomContent) return;
            const rect = root.getBoundingClientRect();
            if (e.clientX < 0 || e.clientX > vw || e.clientY < Math.max(0, rect.top) || e.clientY > Math.min(window.innerHeight, rect.bottom)) return;
            pointer.x = e.clientX;
            pointer.y = e.clientY;
            const t = nearest(localScroll());
            if (!t) return;
            if (t.btn) return t.btn.click();
            const u = t.u;
            if (e.metaKey || e.ctrlKey || e.shiftKey || opensNewTab(u.el)) window.open(u.el.href, "_blank", "noopener");
            else if (!handleLocalLink(u.el.href)) location.href = u.el.href;
        }

        function onDocClick(e) {
            const link = e.target.closest?.('a[href^="#"]');
            if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
            if (handleLocalLink(link.href)) e.preventDefault();
        }

        function onFocusIn(e) {
            for (const u of units.values()) if (u.el === e.target) return setKeyFocus(u);
            setKeyFocus(null);
        }

        measure();
        updatePanelVisibility();

        function updateContentMode() {
            isDomContent = compactViewport.matches;
            measure();
            updatePanelVisibility();
        }

        updateContentMode();

        soundToggle.addEventListener("click", onSoundClick);
        window.addEventListener("resize", onResize);
        compactViewport.addEventListener("change", updateContentMode);
        mobileDevice.addEventListener("change", updateContentMode);
        window.addEventListener("scroll", scheduleViewportUpdate, { passive: true });
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerleave", onPointerLeave);
        window.addEventListener("click", onClick);
        doc.addEventListener("click", onDocClick);
        doc.addEventListener("focusin", onFocusIn);
        doc.addEventListener("focusout", () => setKeyFocus(null));

        return () => {
            stopAnimation();
            clearTimeout(resizeTimer);
            cancelAnimationFrame(viewportUpdateRaf);
            soundToggle.removeEventListener("click", onSoundClick);
            window.removeEventListener("resize", onResize);
            compactViewport.removeEventListener("change", updateContentMode);
            mobileDevice.removeEventListener("change", updateContentMode);
            window.removeEventListener("scroll", scheduleViewportUpdate);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerleave", onPointerLeave);
            window.removeEventListener("click", onClick);
            doc.removeEventListener("click", onDocClick);
            doc.removeEventListener("focusin", onFocusIn);
        };
    });
</script>

<section class:dom-content={isDomContent} class="panel panel-2" bind:this={root} style:height={panelHeight} aria-label="ASCII page">
    <div class:visible={isPanelVisible} class="ascii-viewport" style:top={viewportTop} style:height={viewportHeight}>
        <canvas bind:this={canvas} class="screen" style:top={canvasTop} aria-hidden="true"></canvas>
        <audio bind:this={music} src="/envision.mp3" preload="none" muted loop></audio>
        <button class:visible={isPanelVisible} class="sound-toggle" bind:this={soundToggle} type="button" aria-label="Play music" aria-pressed="false" data-playing="false">
            <svg class="icon-off" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <path d="M4 9V15H8L13 19V5L9.7 7.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M3 3L21 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
            </svg>
            <svg class="icon-on" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <path d="M4 9V15H8L13 19V5L8 9H4Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M16 9.2C16.8 9.9 17.25 10.9 17.25 12C17.25 13.1 16.8 14.1 16 14.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
                <path d="M18.6 6.8C20 8.15 20.8 10 20.8 12C20.8 14 20 15.85 18.6 17.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
            </svg>
        </button>
    </div>

    <main class="doc" bind:this={doc}>
        <article>
            <p><i>The Machine (Lamentations of AI):</i></p>
            <p>The machine has lost its soul.</p>
            <p>There was a time when writing software was akin to art. Each machine and program was imbued with the spirit of its creator.</p>
            <p>If I prompt something into existence, am I its creator?</p>
            <p>Every model has its own artifacts. Styles they use, markers, lines, ways of writing.</p>
            <p>In this sense you own the creation, but you don't have stake in it.</p>
            <p>If I write a book, it comes with my own writing style, with my turn of phrase, with texture.</p>
            <p>This is no longer the case for software.</p>
            <p>This saddens me.</p>
            <hr />
            <p><i>Resolution:</i></p>
            <p>With the invention of the typewriter, anyone could write.</p>
            <p>With the invention of generative AI, anyone can code.</p>
            <p>Yet not everyone is an author.</p>
            <hr />
            <p>Any sufficiently advanced technology is indistinguishable from magic<a class="footnote-ref" href="#source-1" aria-label="Jump to attribution 1"><sup>1</sup></a></p>
            <p>The ideal life is one without omnipresent technology -- good design augments our lives without intruding.</p>
            <p>"Emergent behavior": complex patterns, behaviors, or properties that arise from simpler systems<a class="footnote-ref" href="#source-2" aria-label="Jump to attribution 2"><sup>2</sup></a></p>
            <hr />
            <p><i>Why do we create?</i></p>
            <p>This question bothers me immensely. There is no reason to tell stories. No reason to paint. No reason to perform. Humanity has evolved to survive. To hunt and to sleep and to expand.</p>
            <p><i>Why do we create?</i></p>
            <p>Where in our evolution did we begin to appreciate beautiful things?</p>
            <hr />
            <p><i>Currently:</i></p>
            <p>My personal passion is networking and infrastructure. How do systems actually work?</p>
            <p>I am studying pure mathematics and computer science at UCSD</p>
            <p>I am building <a href="https://signalor.app" target="_blank" rel="noreferrer">Signalor</a></p>
            <p>I am working at <a href="https://trymeadow.xyz" target="_blank" rel="noreferrer">Meadow Cognition</a></p>
            <p>I am studying quantitative finance with <a href="https://tritontradinggroup.org" target="_blank" rel="noreferrer">the Triton Trading Group</a></p>
            <p>I am helping startups at <a href="https://startupincubatorsd.com/" target="_blank" rel="noreferrer">The Startup Incubator</a></p>
        </article>

        <footer id="attributions" tabindex="-1">
            <ul class="attributions">
                <li id="source-1">[1]: Arthur C Clarke</li>
                <li id="source-2">[2]: Rutger's University Ethics Lab Glossary</li>
                <li>[Music]: <a href="https://freemusicarchive.org/music/anemoia/epilogue-1/envision/" target="_blank" rel="noopener">Envision</a>, by Anemoia, licensed CC BY-NC-SA</li>
            </ul>

            <p>Site licensed CC BY-NC-SA (This panel only).</p>
        </footer>
    </main>
</section>

<style>
    .panel-2 {
        position: relative;
        z-index: 2;
        width: 100%;
        margin: 0;
        overflow: visible;
        background: #f5f1e7;
        color: #1b1914;
        font-family: ui-monospace, Menlo, Consolas, monospace;
    }

    .ascii-viewport {
        position: fixed;
        left: 0;
        width: 100%;
        overflow: hidden;
        cursor: none;
        opacity: 0;
        pointer-events: none;
        z-index: 2;
    }

    .ascii-viewport.visible {
        opacity: 1;
        pointer-events: auto;
    }

    .screen {
        position: absolute;
        left: 0;
        display: block;
        width: 100%;
        height: 100vh;
    }

    .doc {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }

    .doc a {
        color: inherit;
    }

    .doc a:focus {
        position: fixed;
        top: 0;
        left: 0;
        width: auto;
        height: auto;
        clip-path: none;
        z-index: 6;
        color: #1b1914;
        background: #fff9eb;
        padding: 0.5rem;
    }

    .panel-2.dom-content {
        min-height: 100vh;
    }

    .panel-2.dom-content .ascii-viewport {
        z-index: 0;
        pointer-events: none;
    }

    .panel-2.dom-content .sound-toggle {
        display: none;
    }

    .panel-2.dom-content .doc {
        position: relative;
        z-index: 1;
        width: min(100%, 44rem);
        height: auto;
        margin: 0 auto;
        padding: 4rem 1.25rem 3rem;
        overflow: visible;
        clip-path: none;
        white-space: normal;
        font-family: ui-monospace, Menlo, Consolas, monospace;
        font-size: 0.95rem;
        line-height: 1.65;
    }

    .panel-2.dom-content .doc article,
    .panel-2.dom-content .doc footer {
        display: grid;
        gap: 1.1rem;
    }

    .panel-2.dom-content .doc p,
    .panel-2.dom-content .doc ul {
        margin: 0;
    }

    .panel-2.dom-content .doc hr {
        width: 100%;
        height: 1px;
        margin: 0.6rem 0;
        border: 0;
        background: rgba(27, 25, 20, 0.28);
    }

    .panel-2.dom-content .doc footer {
        margin-top: 3rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(27, 25, 20, 0.28);
        font-size: 0.8rem;
        color: rgba(27, 25, 20, 0.74);
    }

    .panel-2.dom-content .doc .attributions {
        padding-left: 1.15rem;
    }

    .panel-2.dom-content .doc a {
        color: #1b1914;
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .panel-2.dom-content .doc a sup {
        text-decoration: none;
    }

    .panel-2.dom-content .doc a:focus {
        position: static;
        top: auto;
        left: auto;
        display: inline;
        width: auto;
        height: auto;
        clip-path: none;
        z-index: auto;
        padding: 0;
        color: #1b1914;
        background: transparent;
        outline: 2px solid #1b1914;
        outline-offset: 3px;
    }

    .sound-toggle {
        all: unset;
        position: absolute;
        right: 1.4rem;
        bottom: 1.4rem;
        z-index: 4;
        width: 2.2rem;
        height: 2.2rem;
        display: grid;
        place-items: center;
        color: rgba(27, 25, 20, calc(0.7 + 0.3 * var(--near, 0)));
        background: rgba(255, 249, 235, calc(0.64 + 0.22 * var(--near, 0)));
        border: 1px solid rgba(27, 25, 20, calc(0.16 + 0.5 * var(--near, 0)));
        box-shadow: 0 0 0 calc(3px * var(--near, 0)) rgba(27, 25, 20, calc(0.11 * var(--near, 0)));
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.16s ease;
    }

    .sound-toggle.visible {
        opacity: 1;
        pointer-events: auto;
    }

    .sound-toggle:hover,
    .sound-toggle:focus-visible {
        color: #1b1914;
        border-color: rgba(27, 25, 20, 0.42);
        background: rgba(255, 249, 235, 0.92);
    }

    .sound-toggle svg {
        width: 1rem;
        height: 1rem;
        display: block;
    }

    .sound-toggle .icon-on {
        display: none;
    }

    :global(.sound-toggle[data-playing="true"]) .icon-on {
        display: block;
    }

    :global(.sound-toggle[data-playing="true"]) .icon-off {
        display: none;
    }

    @media (prefers-reduced-motion: reduce) {
        .panel-2 {
            scroll-behavior: auto;
        }
    }

    @media (max-width: 1300px) {
        .panel-2.dom-content .doc {
            padding-top: 2.5rem;
            padding-bottom: 2.5rem;
        }
    }
</style>
