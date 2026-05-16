<script>
    import { onMount } from "svelte";
    import ProjectCard from "./lib/ProjectCard.svelte";
    import Canvas from "./Canvas.svelte";

    const heroProjects = [
        {
            id: "hero-feature",
            title: "Signalor",
            description:
                "Signalor is redefining the breadth of market analysis investors can perform.",
            category: "Featured",
            liveUrl: "https://signalor.app/",
            imageUrl: "/images/signalor.png",
            width: 1920,
            height: 1280,
            slot: "feature",
        },
        {
            id: "hero-right-1",
            title: "CCPorted",
            description: "Play video games.",
            category: "Featured",
            liveUrl: "https://ccported.web.app",
            width: 1200,
            height: 900,
            slot: "rightTop",
            imageUrl: "/images/ccported.png",
        },
        {
            id: "hero-right-2",
            title: "Forge Engine",
            description: "From-scratch HTML Game Engine",
            category: "Internal Tool",
            liveUrl: "https://forge.sojs.dev",
            width: 1200,
            height: 900,
            slot: "rightMid",
            imageUrl: "/images/forge.png",
        },
        {
            id: "hero-corner",
            title: "SODIUM",
            description: "Personal care assistant robot.",
            category: "Hackathon",
            liveUrl: "https://devpost.com/software/sodium",
            width: 1200,
            height: 900,
            slot: "corner",
            imageUrl: "/images/sodium.jpg",
        },
        {
            id: "hero-bottom-1",
            title: "Sawjess",
            category: "Hackathon",
            description: "Sea-level rise prediction model and visualization.",
            liveUrl: "https://devpost.com/software/sawjess",
            width: 1200,
            height: 900,
            slot: "bottomLeft",
            imageUrl: "/images/sojs.jpg",
        },
        {
            id: "hero-bottom-2",
            title: "Ants",
            description: "Pretty neat ant simulation",
            category: "Project",
            liveUrl: "https://sojs.dev/ants",
            width: 1200,
            height: 900,
            slot: "bottomMid",
            imageUrl: "/images/ants.png",
        },
 
    ];

    const archiveProjects = [
        {
            id: "asdf",
            title: "sojs.dev",
            description: "This very website",
            category: "Project",
            liveUrl: "https://sojs.dev",
            width: 1200,
            height: 900,
            imageUrl: "/images/sojs.png",
        },
        {
            id: "hb-2",
            title: "AdHoc",
            description: "Privacy-first custom ad-network",
            category: "Project",
            liveUrl: "",
            width: 1200,
            height: 900,
            imageUrl: "/images/adhoc.png",
        },
        {
            id: "o1",
            title: "Bullish Forge",
            category: "Project",
            description:
                "Ship social noise. Scrapes twitter, finds trends, build MVPs. (AI Slop Factory)",
            width: 1200,
            height: 900,
            imageUrl: "/images/bullishforge.jpg",
        },
        {
            id: "hb1",
            title: "Mural",
            category: "Project",
            description: "Collaborative painting.",
            width: 1200,
            height: 900,
            imageUrl: "/images/mural.png",
        },
        {
            id: "h1",
            title: "Interceptor",
            description: "Clone any webpage.",
            category: "Internal Tool",
            liveUrl: "https://github.com/sojs-coder/interceptor",
            width: 1200,
            height: 900,
            imageUrl: "/images/interceptor.png",
        },
        {
            id: "g1",
            title: "Startup Incubator Website",
            description: "UCSD's startup scene, in website form.",
            category: "Work",
            liveUrl: "https://startupincubatorsd.com",
            width: 1200,
            height: 900,
            imageUrl: "/images/startupincubatorsd.png",
        },
        {
            id: "g2",
            title: "Triton Trading Group Website",
            description: "Everyone needs a website these days.",
            category: "Work",
            liveUrl: "https://tritontradinggroup.org",
            width: 1200,
            height: 900,
            imageUrl: "/images/tritontradinggroup.png",
        },
        {
            id: "g3",
            title: "Ghost Device",
            description: "Geospatial security.",
            category: "Work",
            liveUrl: "https://ghostdevice.xyz",
            width: 1200,
            height: 900,
            imageUrl: "/images/ghostdevice.png",
        },
        {
            id: "g4",
            title: "WorldHacks",
            description: "Breaking world records (in the works)",
            category: "Project",
            liveUrl: "https://worldhacks.xyz",
            width: 1200,
            height: 900,
            imageUrl: "/images/worldhacks.png",
        },
        {
            id: "g5",
            title: "Thead Mover Bot",
            description: "Discord server management",
            category: "Project",
            width: 1200,
            height: 900,
            imageUrl: "/images/threadmoverbot.png",
        },
        {
            id: "g6",
            title: "BallZ",
            description: "Don't let the bricks touch the floor.",
            category: "Video Game",
            liveUrl:
                "https://ccported.github.io/play?gameID=game_a1a3_7ed8bf533bbdd",
            width: 1200,
            height: 900,
            imageUrl: "/images/ballz.png",
        },
        {
            id: "g7",
            title: "TSFGOKT",
            description: "Don't let the little green guys touch you.",
            category: "Video Game",
            liveUrl:
                "https://ccported.github.io/play?gameID=game_15f9_3ab4c653b68958",
            width: 1200,
            height: 900,
            imageUrl: "/images/tsfgokt.png",
        },
        {
            id: "g8",
            title: "Sisyphian Game",
            description: "You are Sisyphus, hunting for berries.",
            category: "Video Game",
            liveUrl: "https://sojs.dev/Sisyphian_Game/",
            width: 1200,
            height: 900,
            imageUrl: "/images/sisyphian.png",
        },
        {
            id: "g9",
            title: "Lawnly",
            description: "Mobile app for lawn care professionals.",
            category: "Internship",
            liveUrl: "https://lawnly.com/",
            width: 1200,
            height: 900,
            imageUrl: "/images/lawnly.png",
        },
    ];

    let expandedId = $state(null);
    let showScrollHint = $state(false);
    let hasScrolled = $state(false);

    function toggle(id) {
        expandedId = expandedId === id ? null : id;
    }

    function dismissScrollHint() {
        if (window.scrollY > 0 || showScrollHint) {
            hasScrolled = true;
            showScrollHint = false;
        }
    }

    function scrollDownFromHint() {
        dismissScrollHint();
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
    }

    onMount(() => {
        if (window.scrollY > 0) {
            hasScrolled = true;
            showScrollHint = false;
        }

        const hintTimeout = window.setTimeout(() => {
            if (!hasScrolled && window.scrollY < 8) {
                showScrollHint = true;
            }
        }, 5000);

        return () => {
            window.clearTimeout(hintTimeout);
        };
    });
</script>

<svelte:window
    onscroll={dismissScrollHint}
    onwheel={dismissScrollHint}
    ontouchmove={dismissScrollHint}
/>

<header>
    <Canvas />
    <div class="header-identity">
        <span class="name">Matthieu Fuller</span>
        <span class="header-desc"
            >UCSD CS &amp; Math &middot; Building <a
                href="https://signalor.app"
                target="_blank"
                rel="noreferrer">Signalor</a
            > &middot; Engineer</span
        >
    </div>
    <nav>
        <a href="mailto:sojscoder@gmail.com">sojscoder@gmail.com</a>
        <a
            href="https://www.linkedin.com/in/matthieu-fuller"
            target="_blank"
            rel="noreferrer">LinkedIn</a
        >
        <a href="https://github.com/sojs-coder" target="_blank" rel="noreferrer"
            >GitHub</a
        >
        <a href="/resume.html">Resume</a>
    </nav>
</header>

<main>
    <section class="hero-grid">
        {#each heroProjects as project (project.id)}
            <div class={`slot ${project.slot}`}>
                <ProjectCard
                    {project}
                    expanded={expandedId === project.id}
                    onToggle={() => toggle(project.id)}
                    isFeature={project.slot === "feature"}
                />
            </div>
        {/each}
    </section>

    <section class="archive-grid">
        {#each archiveProjects as project (project.id)}
            <ProjectCard
                {project}
                expanded={expandedId === project.id}
                onToggle={() => toggle(project.id)}
                isFeature={false}
            />
        {/each}
    </section>
</main>

{#if showScrollHint}
    <button
        class="scroll-hint"
        type="button"
        onclick={scrollDownFromHint}
        aria-label="Scroll down"
    >
        <span class="chevron"></span>
    </button>
{/if}

<style>
    :global(*) {
        box-sizing: border-box;
    }

    :global(html, body) {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        background: #f6f6f3;
        color: #111;
        font-family:
            "Cormorant Garamond", "Iowan Old Style", "Times New Roman", serif;
    }

    :global(#app) {
        width: 100%;
        height: 100%;
        overflow-x: hidden;
    }

    :global(*) {
        scrollbar-width: thin;
        scrollbar-color: #b7b7b0 transparent;
    }

    :global(*::-webkit-scrollbar) {
        width: 8px;
        height: 8px;
    }

    :global(*::-webkit-scrollbar-track) {
        background: transparent;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: #b7b7b0;
        border-radius: 0;
    }

    :global(*::-webkit-scrollbar-corner) {
        background: transparent;
    }

    main {
        position: relative;
        z-index: 1;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    .hero-grid,
    .archive-grid {
        width: 100%;
        display: grid;
        gap: 0;
    }

    .hero-grid {
        height: 100vh;
    }

    .hero-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: repeat(3, minmax(0, 1fr));
    }

    .slot.feature {
        grid-column: 1 / 3;
        grid-row: 1 / 3;
    }

    .slot.rightTop {
        grid-column: 3;
        grid-row: 1;
    }

    .slot.rightMid {
        grid-column: 3;
        grid-row: 2;
    }

    .slot.corner {
        grid-column: 3;
        grid-row: 3;
    }

    .slot.bottomLeft {
        grid-column: 1;
        grid-row: 3;
    }

    .slot.bottomMid {
        grid-column: 2;
        grid-row: 3;
    }

    .archive-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: none;
        grid-auto-rows: minmax(33.333vh, auto);
    }

    header {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: end;
        gap: 3rem;
        padding: 4rem 2rem 3rem;
        border-top: 1px solid #c8c8c2;
        border-left: 1px solid #c8c8c2;
        height: 100vh;
    }

    
    .header-identity {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1;
    }

    header .name {
        font-size: 1.45rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: #111;
    }

    .header-desc {
        font-size: 0.85rem;
        letter-spacing: 0.02em;
        color: rgba(17, 17, 17, 0.5);
        line-height: 1.5;
    }

    .header-desc a {
        color: rgba(17, 17, 17, 0.7);
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .header-desc a:hover {
        color: #111;
    }

    header nav {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.75rem;
        z-index: 2;
    }

    header nav a {
        font-size: 0.85rem;
        letter-spacing: 0.04em;
        color: rgba(17, 17, 17, 0.55);
        text-decoration: none;
        transition: color 0.15s ease;
    }

    header nav a:hover {
        color: #111;
    }

    @media (max-width: 900px) {
        .hero-grid,
        .archive-grid {
            height: auto;
            min-height: 0;
            grid-template-columns: 1fr;
            grid-template-rows: none;
            grid-auto-rows: minmax(33.333vh, auto);
        }

        .hero-grid .slot {
            grid-column: auto;
            grid-row: auto;
        }

        .hero-grid .slot.feature {
            min-height: 100vh;
        }

        header {
            grid-template-columns: 1fr;
            gap: 1.8rem;
            padding: 2.4rem 1.2rem 2rem;
        }

        header nav {
            align-items: flex-start;
        }
    }

    .scroll-hint {
        all: unset;
        position: fixed;
        left: 50%;
        bottom: 1rem;
        transform: translateX(-50%);
        z-index: 40;
        width: 2.1rem;
        height: 2.1rem;
        cursor: pointer;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: rgba(17, 17, 17, 0.36);
        animation:
            hintFadeIn 0.5s ease forwards,
            hintBob 1.8s ease-in-out infinite 0.55s;
    }

    .chevron {
        width: 0.7rem;
        height: 0.7rem;
        border-right: 2px solid rgba(255, 255, 255, 0.95);
        border-bottom: 2px solid rgba(255, 255, 255, 0.95);
        transform: rotate(45deg) translate(-1px, -1px);
    }

    @keyframes hintFadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes hintBob {
        0%,
        100% {
            transform: translateX(-50%) translateY(0);
        }
        50% {
            transform: translateX(-50%) translateY(6px);
        }
    }
</style>
