<script>
    import { onMount } from "svelte";
    import ProjectCard from "./ProjectCard.svelte";
    import { createFrameMetrics } from "./frameMetrics.js";

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
            title: "COMBATOS",
            description: "End-to-end drone signal-denied automation software.",
            category: "Hackathon",
            liveUrl: "https://devpost.com/software/outcast-virus",
            width: 1200,
            height: 900,
            slot: "rightMid",
            imageUrl: "/images/combatos.png",
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
            id: "rgtw4r3e",
            title: "WorldVis",
            description: "Timeline of all the worlds events",
            category: "Project",
            liveUrl: "https://worldvis.sojs.dev",
            width: 1200,
            height: 900,
            slot: "rightMid",
            imageUrl: "/images/worldvis.png",
        },
        {
            id: "hr-2",
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
    let root = $state(null);

    function toggle(id) {
        expandedId = expandedId === id ? null : id;
    }

    onMount(() => {
        const frameMetrics = createFrameMetrics("Panel 3");
        let raf = 0;
        let visible = false;

        function frame(now) {
            if (!visible) {
                raf = 0;
                return;
            }
            frameMetrics.record(now);
            raf = requestAnimationFrame(frame);
        }

        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !raf) {
                frameMetrics.reset();
                raf = requestAnimationFrame(frame);
            }
        });
        observer.observe(root);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    });
</script>

<section class="panel panel-3" bind:this={root} aria-label="Projects">
    <div class="hero-grid">
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
    </div>

    <div class="archive-grid">
        {#each archiveProjects as project (project.id)}
            <ProjectCard
                {project}
                expanded={expandedId === project.id}
                onToggle={() => toggle(project.id)}
                isFeature={false}
            />
        {/each}
    </div>
</section>

<style>
    .panel-3 {
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

    .archive-grid :global(.card) {
        content-visibility: auto;
        contain-intrinsic-size: auto 33.333vh;
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
    }
</style>
