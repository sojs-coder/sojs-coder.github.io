<script>
    import { onMount } from "svelte";
    import { heroProjects, archiveProjects } from "./Panel3.svelte";

    // A closed ring of photos on a cylinder turning about a vertical axis, driven by page scroll:
    // the section is tall, the stage sticks, and scrolling through it turns the ring once.
    // The full library lives in Panel3.svelte (heroProjects + archiveProjects). Pick what shows here by
    // title, in order; swap names in or out to change the lineup.
    const SHOW = ["Signalor", "COMBATOS", "Company Evidence Index", "Forge Engine", "SODIUM", "CCPorted", "Ants", "Sawjess", "WorldVis", "Mural"];
    const library = [...heroProjects, ...archiveProjects];
    const projects = SHOW.map((title) => library.find((p) => p.title === title) ?? (() => { throw new Error(`No project titled "${title}" in Panel3.svelte`); })());
    const N = projects.length;
    const STEP = 360 / N;
    // radius in card widths: half a card over tan(half the step), plus a little gap
    const R = 0.5 / Math.tan(Math.PI / N) + 0.15;
    const PER = 25; // vh of scroll per project

    let section, pos = $state(0);
    const current = $derived(projects[((Math.round(pos) % N) + N) % N]);
    // angle of card i, wrapped to [-180, 180)
    const angle = (i) => ((((i - pos) * STEP) % 360) + 540) % 360 - 180;

    onMount(() => {
        const update = () => {
            const distance = section.offsetHeight - innerHeight;
            const p = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / distance));
            pos = p * (N - 1); // ends with the last project facing you
        };
        update();
        addEventListener("scroll", update, { passive: true });
        addEventListener("resize", update);
        return () => {
            removeEventListener("scroll", update);
            removeEventListener("resize", update);
        };
    });
</script>

<section class="spinner" bind:this={section} aria-label="Projects" style:height={`${N * PER + 100}vh`}>
    <div class="stage">
        <h2 class="heading">Projects...</h2>
        <div class="ring" style:transform={`translateZ(calc(var(--w) * ${-R}))`}>
            {#each projects as p, i (p.id)}
                {@const a = angle(i)}
                {#if Math.abs(a) < 90}
                    <svelte:element
                        this={p.liveUrl ? "a" : "div"}
                        class="card"
                        href={p.liveUrl || undefined}
                        target={p.liveUrl ? "_blank" : undefined}
                        rel={p.liveUrl ? "noopener" : undefined}
                        aria-label={p.title}
                        style:transform={`rotateY(${a}deg) translateZ(calc(var(--w) * ${R}))`}
                        style:opacity={Math.cos((a * Math.PI) / 180) ** 2}
                    >
                        <img src={p.imageUrl} alt="" loading="lazy" />
                    </svelte:element>
                {/if}
            {/each}
        </div>
        <div class="name" aria-live="polite">
            <h3>{current.title}</h3>
            {#if current.award}<p class="award">{current.award}</p>{/if}
        </div>
    </div>
</section>

<style>
    .spinner { --w: min(62vw, 440px); position: relative; }
    .stage { position: sticky; top: 0; height: 100vh; overflow: hidden; perspective: calc(var(--w) * 4); }
    .ring { position: absolute; inset: 0; transform-style: preserve-3d; }
    .card { position: absolute; top: calc(50% - var(--w) * .3125 - 2rem); left: calc(50% - var(--w) / 2); width: var(--w); aspect-ratio: 16 / 10; border-radius: 6px; overflow: hidden; background: #e9e9e4; backface-visibility: hidden; box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, .12); }
    .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    a.card:focus-visible { outline: 2px solid #111; outline-offset: 4px; }
    .name { position: absolute; left: 0; right: 0; top: calc(50% + var(--w) * .3125 + 1rem); margin: 0; padding: 0 1.5rem; text-align: center; }
    .heading { position: absolute; left: 0; right: 0; bottom: calc(50% + var(--w) * .3125 + 4.5rem); margin: 0; padding: 0 1.5rem; text-align: center; font-size: clamp(2rem, 3.6vw, 3.4rem); font-weight: 400; letter-spacing: -.03em; line-height: 1; }
    .name h3 { margin: 0; font-size: clamp(1.6rem, 2.4vw, 2.2rem); font-weight: 400; letter-spacing: -.02em; }
    .award { margin: .4rem 0 0; font-size: .85rem; letter-spacing: .08em; text-transform: uppercase; color: #777; }
</style>
