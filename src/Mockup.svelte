<script>
    import { onMount } from "svelte";
    import Panel1 from "./lib/Panel1.svelte";
    import ProjectSpinner from "./lib/ProjectSpinner.svelte";

    // Each section is one word on the picker drum plus the text box beside it. Add, remove or
    // reorder entries here; the scroll length and timeline follow automatically.
    // Optional `media` goes under the text: one { src, alt } is a photo, several are a slideshow
    // that advances every SLIDE_MS.
    // `body` paragraphs are HTML, so links work: 'I built <a href="https://signalor.app">Signalor</a>.'
    // (Only ever put your own text here; it is inserted as-is.)
    const sections = [
        {
            word: "think",
            heading: "Hello",
            body: [
                "I'm Matthieu. I am a student at <a href=\"https://ucsd.edu\">UC San Diego</a>, where I help lead <a href=\"https://sdx.community\">SDx</a> and <a href=\"https://trussforum.org\">Truss</a>.",
                "Previously, I've worked at <a href=\"https://trymeadow.xyz\">Meadow Cognition</a> and <a href=\"https://lawnly.com\">Lawnly</a>, and I am currently employed by <a href=\"https://parafi.com\">ParaFi Capital</a>."
            ],
        },
        {
            word: "dream",
            heading: "Currently,",
            body: [
                "I'm working on building <a href=\"https://signalor.app\">Signalor</a>, a platform for monitoring voices across the internet. What are people talking about, and how do they feel about it?"
            ],
            media: [{ src: "/images/signalor.png", alt: "Signalor" }, { src: "/images/signalor2.png", alt: "New Signalor homescreen" }],
        },
        {
            word: "explore",
            heading: "When not at my desk",
            body: [
                "If I'm not sitting at my desk working, you'll find me outside, probably at the beach.",
                "People spend so much time indoors, I think I would combust if I didn't spend enough time outside."
            ],
            media: [{ src: "/images/beach.jpg", alt: "Beach" }, { src: "/images/beach2.jpg", alt: "Also beach" }, { src: "/images/beach3.jpg", alt: "More beach" }],

        },
        {
            word: "build",
            heading: "Projects",
            body: [
                "I love building things, so I build often. Recent projects include <a href=\"https://forge.sojs.dev\">video game engines</a>, <a href=\"https://sojs.dev/ants\">ant behavior simulations</a>, and <a href=\"https://devpost.com/software/outcast-virus\">drone autonomy platforms</a>."
            ],
            media: [
                { src: "/images/forge.png", alt: "Forge Engine" },
                { src: "/images/ccported.png", alt: "CCPorted" },
                { src: "/images/ants.png", alt: "Ants" },
                { src: "/images/combatos.png", alt: "COMBATOS" },
            ],
        },
        {
            word: "research",
            heading: "Truss Forum",
            body: [
                "Recently, I have been working on forming <a href=\"https://trussforum.org\">a research coalition</a>. I wanted to do some research on LLMs and their creativity, but I could not find a lab that interested me. With Truss, each member provides credibility to the other members, as a whole much stronger than a single independent researcher."
            ],
            media: [
                {src: "/images/truss.png", alt: "Truss Forum"}
            ]
        }
    ];
    const SLIDE_MS = 3000;


    // Timeline, in vh of scroll from the top of the sequence
    const LEAD = 333;           // the flock + "And all there is left to do is" intro plays over this
    const MOVE = [166, 250];    // first word grows and slides to its side
    const FIRST = [250, 350];   // first text box rises in beside it
    const HOLD = 80;            // pause on each section
    const SWAP = 100;           // one turn of the drum
    const swapAt = (k) => 350 + HOLD + (k - 1) * (SWAP + HOLD); // when the turn to section k starts (k >= 1)
    const SCROLL = swapAt(sections.length); // = end of the last section's hold

    let sequence, canvas, para;
    let scrolled = $state(0), vw = $state(1), vh = $state(1), reduced = $state(false);
    let tick = $state(0); // slideshow clock, shared by every slideshow

    const clamp = (v) => Math.max(0, Math.min(1, v));
    const seg = (a, b) => clamp((scrolled - a) / (b - a));
    const smooth = (t) => t * t * (3 - 2 * t);
    const outQuint = (t) => 1 - (1 - t) ** 5;

    const portrait = $derived(vw < vh);
    const q = $derived(Math.min(1, scrolled / LEAD));
    // drum position: 0 = first word facing you, 1 = second word, ...
    const turned = $derived(reduced ? 0 : sections.slice(1).reduce((f, _, i) => f + smooth(seg(swapAt(i + 1), swapAt(i + 1) + SWAP)), 0));
    // each text box rises in during the second half of its turn and lifts away during the first half of the next
    const boxes = $derived(
        sections.map((_, k) => {
            if (reduced) return { o: 1, y: 0 };
            const start = swapAt(k);
            const inn = k ? smooth(seg(start + SWAP / 2, start + SWAP)) : smooth(seg(...FIRST));
            const out = k < sections.length - 1 ? smooth(seg(swapAt(k + 1), swapAt(k + 1) + SWAP / 2)) : 0;
            return { o: inn * (1 - out), y: (1 - inn - out) * 3 };
        }),
    );

    const draw = () => {
        const dpr = devicePixelRatio || 1, W = vw, H = vh;
        if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
        }
        const ctx = canvas.getContext("2d");
        const cs = getComputedStyle(para), fs = parseFloat(cs.fontSize), lh = fs * 0.98;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `italic 400 ${fs}px ${cs.fontFamily}`;
        ctx.letterSpacing = cs.letterSpacing;
        ctx.textAlign = "center";
        ctx.fillStyle = "#111";

        const m = ctx.measureText(sections[0].word);
        const mid = ctx.measureText("x").actualBoundingBoxAscent / 2; // x-height middle, above baseline
        const widest = Math.max(...sections.map((s) => ctx.measureText(s.word).width));
        // start: where the first word sat under "left to do is"; end: big, on its own side
        const startY = 0.65 * H - 0.2 * lh + (lh - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent - mid;
        const S = Math.min(((portrait ? 0.8 : 0.4) * W) / widest, ((portrait ? 0.3 : 0.5) * H) / fs);
        const tx = portrait ? W / 2 : 0.31 * W, ty = portrait ? 0.22 * H : 0.5 * H;

        const t = reduced ? 1 : outQuint(seg(...MOVE));
        const scale = 1 + (S - 1) * t;
        const ax = W / 2 + (tx - W / 2) * t, ay = startY + (ty - startY) * t; // word centre, screen space

        // Picker drum: words sit a quarter turn apart on a cylinder turning about a horizontal axis
        // through the x-height middle. A word at angle a is lifted r*sin(a), squashed and faded by cos(a).
        const r = 0.55 * fs * scale;
        sections.forEach(({ word }, k) => {
            const a = (k - turned) * (Math.PI / 2);
            if (Math.abs(a) >= Math.PI / 2 || Math.cos(a) < 0.01) return;
            ctx.globalAlpha = Math.cos(a);
            ctx.setTransform(dpr * scale, 0, 0, dpr * scale * Math.cos(a), dpr * ax, dpr * (ay + r * Math.sin(a)));
            ctx.fillText(word, 0, mid);
        });
        ctx.globalAlpha = 1;
    };

    onMount(() => {
        const mq = matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => {
            reduced = mq.matches;
            vw = canvas.clientWidth;
            vh = canvas.clientHeight;
            const distance = sequence.offsetHeight - window.innerHeight;
            scrolled = (Math.min(distance, Math.max(0, -sequence.getBoundingClientRect().top)) / window.innerHeight) * 100;
            draw();
        };
        update();
        document.fonts.ready.then(update);
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        mq.addEventListener("change", update);
        const slides = setInterval(() => reduced || tick++, SLIDE_MS); // reduced motion: slideshows hold still
        return () => {
            clearInterval(slides);
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            mq.removeEventListener("change", update);
        };
    });
</script>

<main>
    <section class="sequence" bind:this={sequence} aria-label="Introduction" style:height={reduced ? null : `${SCROLL + 100}vh`}>
        <div class="stage">
            <div class="flock" style:transform={`translateY(${q * 160}vh)`} style:opacity={Math.max(0, 1 - q * 3)}>
                <Panel1 />
            </div>
            <div class="statement" style:opacity={clamp((q - 0.12) * 7)}>
                <p bind:this={para} aria-label={`And all there is left to do is ${sections[0].word}`}>
                    <span class="other-words" style:transform={`translateY(${-Math.max(0, q - 0.48) * 180}vh)`} style:opacity={Math.max(0, 1 - Math.max(0, q - 0.48) * 5)}>And all there is<br />left to do is</span>
                </p>
                <canvas bind:this={canvas} aria-hidden="true"></canvas>
            </div>
            {#each sections as { heading, body, media }, k}
                <div class="intro" class:portrait style:opacity={boxes[k].o} style:transform={`translateY(calc(${portrait ? 0 : -50}% + ${boxes[k].y}rem))`} style:visibility={boxes[k].o ? null : "hidden"}>
                    <h2>{heading}</h2>
                    {#each body as text}<p>{@html text}</p>{/each}
                    {#if media?.length}
                        <figure class="media">
                            {#each media as { src, alt }, i}
                                {@const shown = i === tick % media.length}
                                <img {src} {alt} class:shown aria-hidden={!shown} loading="lazy" />
                            {/each}
                        </figure>
                    {/if}
                </div>
            {/each}
            <span class="scroll-note" aria-hidden="true" style:opacity={Math.max(0, 1 - q * 8)}>Scroll to continue</span>
        </div>
    </section>
    <section class="afterword" aria-labelledby="afterword-title">
        <h2 id="afterword-title">Since you've scrolled this far</h2>
        <p>I'd love to hear from you, reach out at matthieu fuller [at] gmail. Open to ideas, projects and conversation.</p>
        <p>Or, <a href="/resume.html">take a peek my resume</a></p>
    </section>
    <ProjectSpinner />
    <nav class="outro" aria-label="Links">
        <a href="https://trussforum.org">Visit Truss Forum</a>
        <a href="https://signalor.app">Visit Signalor</a>
        <a href="https://www.linkedin.com/in/matthieu-fuller">LinkedIn</a>
        <a href="https://github.com/sojs-coder">GitHub</a>
    </nav>
    <footer class="signoff">
        <p>Thanks for stopping by</p>
        <p class="sig">- Matthieu</p>
    </footer>
</main>

<style>
    :global(*) { box-sizing: border-box; }
    :global(html, body) { margin: 0; width: 100%; background: #f6f6f3; color: #111; font-family: "Cormorant Garamond", "Iowan Old Style", "Times New Roman", serif; }
    :global(body) { overflow-x: hidden; }
    .sequence { position: relative; }
    .stage { position: sticky; top: 0; height: 100vh; overflow: hidden; background: #f6f6f3; }
    .flock { position: absolute; inset: 0; will-change: transform, opacity; }
    .statement { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; text-align: center; }
    .statement p { margin: 0; font-size: clamp(3.3rem, 8vw, 8rem); line-height: .98; letter-spacing: -.045em; font-weight: 400; }
    .other-words { display: block; will-change: transform, opacity; }
    .statement canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
    .intro { position: absolute; top: 50%; left: 62%; right: 6%; max-width: 30rem; will-change: transform, opacity; }
    .intro.portrait { top: 34%; left: 1.5rem; right: 1.5rem; }
    .media { position: relative; margin: 1.5rem 0 0; aspect-ratio: 16 / 10; max-height: 32vh; overflow: hidden; border-radius: 4px; background: #e9e9e4; }
    .portrait .media { max-height: 24vh; }
    .media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .8s ease; }
    .media img.shown { opacity: 1; }
    .intro h2 { margin: 0 0 1.25rem; font-size: clamp(2rem, 3.6vw, 3.4rem); font-weight: 400; letter-spacing: -.03em; line-height: 1; }
    .intro p { margin: 0 0 1rem; font-size: clamp(1.05rem, 1.35vw, 1.3rem); line-height: 1.55; color: #444; }
    .intro p :global(a) { color: #111; text-decoration-color: #bbb; text-underline-offset: .15em; }
    .intro p :global(a:hover), .intro p :global(a:focus-visible) { text-decoration-color: currentColor; }
    .scroll-note { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); font-size: .8rem; letter-spacing: .08em; white-space: nowrap; color: #777; }
    .afterword { max-width: 45rem; margin: 0 auto; padding: clamp(6rem, 12vw, 10rem) 1.5rem; }
    .afterword h2 { margin: 0 0 1.25rem; font-size: clamp(2rem, 3.6vw, 3.4rem); font-weight: 400; letter-spacing: -.03em; line-height: 1; }
    .afterword p { margin: 0 0 1rem; font-size: clamp(1.05rem, 1.35vw, 1.3rem); line-height: 1.55; color: #444; }
    .afterword a { color: #111; text-decoration-color: #bbb; text-underline-offset: .15em; }
    .afterword a:hover, .afterword a:focus-visible { text-decoration-color: currentColor; }
    .outro { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; gap: clamp(.5rem, 2vw, 1.5rem); padding: 4rem 1.5rem; max-width: 45rem; margin: 0 auto; }
    .outro a { width: fit-content; font-size: clamp(2.4rem, 6vw, 5rem); line-height: 1.05; letter-spacing: -.035em; color: #111; text-decoration-color: #bbb; text-decoration-thickness: .04em; text-underline-offset: .12em; }
    .outro a:hover, .outro a:focus-visible { text-decoration-color: currentColor; }
    .signoff { max-width: 45rem; margin: 0 auto; padding: 0 1.5rem 4rem; font-size: clamp(1.05rem, 1.35vw, 1.3rem); color: #444; }
    .signoff p { margin: 0; }
    .signoff .sig { margin-top: .25rem; font-style: italic; }
    @media (prefers-reduced-motion: reduce) {
        .sequence { height: auto; }
        .stage { position: relative; height: auto; overflow: visible; }
        .flock { position: relative; transform: none !important; opacity: 1 !important; }
        .statement { position: relative; height: 100vh; opacity: 1 !important; }
        .other-words { display: none; }
        .intro, .intro.portrait { position: static; margin: 0 auto; padding: 0 1.5rem 4rem; transform: none !important; }
        .media img { transition: none; }
        .scroll-note { display: none; }
    }
</style>
