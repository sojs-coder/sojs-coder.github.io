<script>
  import ProjectCard from "./lib/ProjectCard.svelte";

  const heroProjects = [
    {
      id: "hero-feature",
      title: "Signalor",
      description: "Signalor is redefining the breadth of market analysis investors can perform.",
      category: "Featured",
      postTitle: "Consumer Intelligence for Capital Markets",
      postBody:
        "Signalor aggregates millions of consumer reviews across 17 platforms into institutional-grade brand intelligence, built for equity analysts, portfolio managers, and VC diligence teams.",
      // postMarkdownPath: "/posts/atlas-commerce.md",
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
      postTitle: "Hugely Avaialable Video Game Distribution",
      postBody: "Deployed across over 30 domains, >10 servers, and hundreds of edge regions. Built using Svelte, deployed at edge using S3, Cloudfront, and Cloudflare",
      liveUrl: "https://ccported.web.app",
      width: 1200,
      height: 900,
      slot: "rightTop",
      imageUrl: "/images/ccported.png"
    },
    {
      id: "hero-right-2",
      title: "Forge Engine",
      description: "From-scratch HTML Game Engine",
      category: "Internal Tool",
      postTitle: "Develop Games Faster",
      postBody: "CCPorted's internal game engine, used for making custom titles. Built in raw HTML, CSS, and TS.",
      liveUrl: "https://forge.sojs.dev",
      width: 1200,
      height: 900,
      slot: "rightMid",
      imageUrl: "/images/forge.png"
    },
    {
      id: "hero-corner",
      title: "Interceptor",
      description: "Clone any webpage.",
      category: "Internal Tool",
      postTitle: "Circumventing anti-bot guards",
      postBody: "A single command spins up headless browsers, blocks scripts designed to stop scraping and effectively creates a perfect clone of the site locally. Used for phishing demonstrations with ACM UCSD Cyber workshops.",
      liveUrl: "https://example.com/demo-signal",
      width: 1200,
      height: 900,
      slot: "corner",
      imageUrl: "/images/interceptor.png"
    },
    {
      id: "hero-bottom-1",
      title: "Mural",
      description: "Collaborative online painting.",
      category: "Project",
      postBody: "Every user gets a single color and a brush. They must communicate through voice chat to build something magnificent.",
      width: 1200,
      height: 900,
      slot: "bottomLeft",
      imageUrl: "/images/mural.png"
    },
    {
      id: "hero-bottom-2",
      title: "AdHoc",
      description: "Privacy-first custom ad-network",
      category: "Project",
      postTitle: "Privacy First Advertising is not an Oxymoron",
      postBody: "A Q-Learning table evolves recommendations based on signals purely from general user engagement with the inventory and the parnter site itself, never based on individual user information.",
      liveUrl: "",
      width: 1200,
      height: 900,
      slot: "bottomMid",
      imageUrl: "/images/adhoc.png"
    },
  ];

  const archiveProjects = [
    {
      id: "g1",
      title: "Startub Incubator Website",
      description: "UCSD's startup scene, in website form.",
      category: "Work",
      postBody: "Built with a small team, the website manages startups within each batch, member attendance/management, and each startup's blog.",
      liveUrl: "https://startupincubatorsd.com",
      width: 1200,
      height: 900,
      imageUrl: "/images/startupincubatorsd.png"
    },
    {
      id: "g2",
      title: "Triton Trading Group Website",
      description: "Everyone needs a website these days.",
      category: "Work",
      postTitle: "Mobile Views are More Important",
      postBody: "Built and designed landing pages for Triton Trading Group's organization, including Asset Management, Financial Planning and Advisory, and Quantitative Trading pages.",
      liveUrl: "https://tritontradinggroup.org",
      width: 1200,
      height: 900,
      imageUrl: "/images/tritontradinggroup.png"
    },
    {
      id: "g3",
      title: "Ghost Device",
      description: "Geospatial security.",
      category: "Work",
      postTitle: "VPNs, but for location",
      postBody: "CTO for a startup that builds a small hardware device. It attaches to your phone and fiddles with it so that all apps reading from native location APIs will see custom routes.",
      liveUrl: "https://ghostdevice.xyz",
      width: 1200,
      height: 900,
      imageUrl: "/images/ghostdevice.png"
    },
    {
      id: "g4",
      title: "WorldHacks",
      description: "Breaking world records (in the works)",
      category: "Project",
      postTitle: "The World's Largest Hackathon",
      postBody: "In partnership with the Startup Incubator Club, we are trying to create the worlds biggest tech tradition.",
      liveUrl: "https://worldhacks.xyz",
      width: 1200,
      height: 900,
      imageUrl: "/images/worldhacks.png"
    },
    {
      id: "g5",
      title: "Thead Mover Bot",
      description: "Discord server management",
      category: "Project",
      postTitle: "Move Messages around",
      postBody: "Installed to ~150 servers, this bot allows the user to move messages into threads, helping to keep main channels clear.",
      width: 1200,
      height: 900,
      imageUrl: "/images/threadmoverbot.png"
    },
    {
      id: "g6",
      title: "BallZ",
      description: "Don't let the bricks touch the floor.",
      category: "Video Game",
      postTitle: "LH-Certified",
      postBody: "Bounce the balls around to break bricks that come down. Over 60K plays on CCPorted.",
      liveUrl: "https://ccported.github.io/play?gameID=game_a1a3_7ed8bf533bbdd",
      width: 1200,
      height: 900,
      imageUrl: "/images/ballz.png"
    },
    {
      id: "g7",
      title: "TSFGOKT",
      description: "Don't let the little green guys touch you.",
      category: "Video Game",
      postTitle: "The So Fun Game Of Killing Things",
      postBody: "About 10k plays on CCPorted, mild success on ReplTalk, back when that existed.",
      liveUrl: "https://ccported.github.io/play?gameID=game_15f9_3ab4c653b68958",
      width: 1200,
      height: 900,
      imageUrl: "/images/tsfgokt.png"
    },
    {
      id: "g8",
      title: "Sisyphian Game",
      description: "You are Sisyphus, hunting for berries.",
      category: "Video Game",
      postTitle: "Code X Philosophy",
      postBody: "Get lost in this game for hours completing menial tasks. Submitted for an english project back in high school.",
      liveUrl: "https://sojs.dev/Sisyphian_Game/",
      width: 1200,
      height: 900,
      imageUrl: "/images/sisyphian.png"
    }
  ];

  let expandedId = $state(null);

  function toggle(id) {
    expandedId = expandedId === id ? null : id;
  }
</script>

<main>
  <section class="hero-grid">
    {#each heroProjects as project (project.id)}
      <div class={`slot ${project.slot}`}>
        <ProjectCard
          project={project}
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
        project={project}
        expanded={expandedId === project.id}
        onToggle={() => toggle(project.id)}
        isFeature={false}
      />
    {/each}
  </section>
</main>

<footer>
  <div class="footer-identity">
    <span class="name">Matthieu Fuller</span>
    <span class="footer-desc">UCSD CS &amp; Math &middot; Building <a href="https://signalor.app" target="_blank" rel="noreferrer">Signalor</a> &middot; Engineer</span>
  </div>
  <nav>
    <a href="mailto:sojscoder@gmail.com">sojscoder@gmail.com</a>
    <a href="https://www.linkedin.com/in/matthieu-fuller" target="_blank" rel="noreferrer">LinkedIn</a>
    <a href="https://github.com/sojs-coder" target="_blank" rel="noreferrer">GitHub</a>
    <a href="/resume.pdf" download>Resume</a>
  </nav>
</footer>

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
    font-family: "Cormorant Garamond", "Iowan Old Style", "Times New Roman", serif;
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
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .hero-grid,
  .archive-grid {
    width: 100%;
    height: 100vh;
    display: grid;
    gap: 0;
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
    grid-template-rows: repeat(3, minmax(0, 1fr));
  }

  footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: end;
    gap: 3rem;
    padding: 4rem 2rem 3rem;
    border-top: 1px solid #c8c8c2;
    border-left: 1px solid #c8c8c2;
  }

  .footer-identity {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  footer .name {
    font-size: 1.45rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: #111;
  }

  .footer-desc {
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    color: rgba(17, 17, 17, 0.5);
    line-height: 1.5;
  }

  .footer-desc a {
    color: rgba(17, 17, 17, 0.7);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .footer-desc a:hover {
    color: #111;
  }

  footer nav {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }

  footer nav a {
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    color: rgba(17, 17, 17, 0.55);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  footer nav a:hover {
    color: #111;
  }

  @media (max-width: 900px) {
    .hero-grid,
    .archive-grid {
      height: auto;
      min-height: 100vh;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: none;
      grid-auto-rows: minmax(40vh, 1fr);
    }

    .hero-grid .slot {
      grid-column: auto;
      grid-row: auto;
    }
  }
</style>
