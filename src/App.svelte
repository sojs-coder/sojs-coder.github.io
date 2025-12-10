<script lang="ts">
  import { onMount } from "svelte";
  import Navigation from "./lib/Navigation.svelte";
  import Hero from "./lib/Hero.svelte";
  import SectionCardOverlay from "./lib/SectionCardOverlay.svelte";

  import SectionCard from "./lib/SectionCard.svelte";

  import ImageSlideshow from "./lib/ImageSlideshow.svelte";
  import Tags from "./lib/Tags.svelte";

  import CCPortedFeature from "./assets/ccportedfeature.png";
  import RomLibrary from "./assets/romlibrary.png";
  import SpriteBuilder from "./assets/spritebuilder.png";
  import AboutSectionImage from "./assets/forgeeditor.png";
  // import AboutContinued from "./assets/journal.png";
  import AboutContinued from "./assets/spritebuilder.png";

  import Ballz from "./assets/ballz.png";
  import Dragonball from "./assets/dragonball.png";
  import Minecraft from "./assets/minecraft.png";

  import ForgeEngineNodeEditor from "./assets/fe_ne.png";
  import FlappySprite from "./assets/flappy_sprite.png";
  import NodeLibrary from "./assets/node_library.png";
  import Physics from "./assets/physics.png";
  import Action from "./lib/Action.svelte";

  import AdhocHome from "./assets/adhoc_home.png";
  import AdhocAnalytics from "./assets/adhoc_analytics.png";
  import AdhocInventory from "./assets/adhoc_inventory.png";
  import AdhocCampaign from "./assets/adhoc_campaign.png";

  const featuredImages: [string, string][] = [
    [CCPortedFeature, "The CCPorted game library home page"],
    [Minecraft, "Playing minecraft on CCPorted"],
    [Ballz, "BallZ, a CCPorted original"],
    [
      RomLibrary,
      "The CCPorted ROM library, with well over 300 well-known titles",
    ],
    [Dragonball, "DragonBall, a popular anime-inspired game, on CCPorted"],
  ];
  const forgeEngineImages: [string, string][] = [
    [
      ForgeEngineNodeEditor,
      "Edit and create custom nodes to extend engine functionality",
    ],
    [
      FlappySprite,
      "Create and edit sprites with the sprite editor to use in your games",
    ],
    [
      NodeLibrary,
      "Publish your custom nodes for use in other people's projects, and import ones you find useful",
    ],
    [
      Physics,
      "Simulate realistic physics with rigidbody simulation using Matter.js + Forge",
    ],
    [
      SpriteBuilder,
      "Create animations easily that can quickly be imported into your project",
    ],
  ];

  const adhocImages: [string, string][] = [
    [AdhocHome, "AdHoc is a privacy-first advertising platform"],
    [
      AdhocAnalytics,
      "Easily track earnings, click through rates, and impressions",
    ],
    [
      AdhocInventory,
      "Manage inventory with ease using AdHoc's intuitive interface",
    ],
    [
      AdhocCampaign,
      "Create and manage advertising campaigns effortlessly",
    ],
  ];

  import Projects from "./lib/Projects.svelte";
  import Footer from "./lib/Footer.svelte";

  let mouseX = $state(0);
  let mouseY = $state(0);
  let cursorDot: HTMLElement | null = $state(null);
  let isHoveringClickable = $state(false);

  function isClickableElement(element: HTMLElement): boolean {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    return tagName === 'a' || 
           tagName === 'button' || 
           tagName === 'input' ||
           element.classList.contains('clickable');
  }

  function handleMouseMove(event: MouseEvent) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Find element under cursor (cursor dot has pointer-events: none, so it won't interfere)
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;

    if (!element || element === cursorDot) {
      isHoveringClickable = false;
      return;
    }

    // Check if element or any parent is clickable
    let currentElement: HTMLElement | null = element;
    let foundClickable = false;
    
    while (currentElement && currentElement !== document.body) {
      if (isClickableElement(currentElement)) {
        foundClickable = true;
        break;
      }
      currentElement = currentElement.parentElement;
    }

    isHoveringClickable = foundClickable;
  }

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  });
</script>

<main>
  <!-- Custom cursor dot -->
  <div 
    class="custom-cursor"
    class:clickable={isHoveringClickable}
    style="left: {mouseX}px; top: {mouseY}px;"
    bind:this={cursorDot}
  ></div>
<!--
  <Navigation />
  <Hero />
  <section id="About">
    <SectionCard image={AboutSectionImage} order={-1}>
      {#snippet leftcontent()}
        <h2>About</h2>
        <blockquote>
          <p>I do not write code- I write poetry...</p>
          <cite>Me, 2024</cite>
        </blockquote>
        <p>
          Since 2017, every project I have made has begun as a dream. The music
          I hear comes from the orchestra I conduct in the cloud. Each project
          is a chance to create something that I can truly be proud of,
          something that, even if it fails, I can learn from and grow.
        </p>
      {/snippet}
    </SectionCard>
    <SectionCardOverlay backgroundImage={AboutContinued} float="flex-start">
      {#snippet cardContent()}
        <h2>About, continued...</h2>
        <blockquote>
          <p>
            The most important property of a program is whether it accomplishes
            the intention of its user
          </p>
          <cite>
            C.A.R. Hoare, 1969, "An Axiomatic Basis for Computer Programming"
          </cite>
        </blockquote>
        <p>
          I write with a sense of purpose and a desire to create something
          beautiful. I want the user to be awestruck by what they create with my
          tool. By bringing beautiful things into the world, I hope to inspire
          others in their own pursuit of beauty.
        </p>
        <p>
          So who am I?
          <br />
          I am a web developer, a cloud orchestrator, a CI/CD specialist, a DevOps
          Engineer, a frontend developer, a UX designer, a backend architect, a database
          administrator, a systems engineer, a software engineer, a programmer, a
          coder, a creator, and a dreamer.
        </p>
      {/snippet}
    </SectionCardOverlay>
  </section>
  <section id="FeaturedProjects">
    <SectionCard>
      {#snippet leftcontent()}
        <ImageSlideshow images={featuredImages} />
      {/snippet}
      {#snippet rightcontent()}
        <h2>Featured Projects</h2>
        <blockquote>
          <p>
            Any sufficiently advanced technology is indistinguishable from
            magic.
          </p>
          <cite>
            Arthur C. Clarke, 1973, "Profiles of the Future: An Inquiry into
            the Limits of the Possible""</cite>
        </blockquote>
        <h3>Project 0</h3>
        <h4>CCPorted</h4>
        <Tags tags={["Docker", "AWS", "HTML", "CSS", "JS"]} />
        <p>
          Arguably my greatest and most successful achievement, CCPorted was
          created one day during a slow high school english class. Through this
          bordem, a muse came to me in vision. "What if I could play some games
          on my computer right now?"
        </p>
        <p>
          Blocked, however, by the school administration's view on what
          constitutes acceptable use of technology, I decided that enough was
          enough, and built CCPorted, which deploys hundreds of games to many
          different domains to specifically target students.
        </p>
        <Action type="primary" href="https://ccported.click" target="_blank">
          Visit CCPorted
        </Action>
      {/snippet}
    </SectionCard>
    <SectionCard order={-1}>
      {#snippet leftcontent()}
        <ImageSlideshow images={forgeEngineImages} />
      {/snippet}
      {#snippet rightcontent()}
        <h2>Featured Projects, Continued...</h2>
        <h3>Project 1</h3>
        <h4>Forge Engine</h4>
        <Tags tags={["GCP", "Supabase", "TS", "HTML", "CSS", "JS"]} />
        <p>
          When building CCPorted, I struggled to quickly develop original games.
          I tried many different game engines, but I found that for most HTML
          games, the quickest way to quickly get up and running was to use my
          own custom engines.
        </p>
        <p>
          This, however, got tiresome, as I had to rewrite the same base
          functionality over and over again for many games. Thus, Forge Engine
          was born, for quickly "Forge" HTML games. The engine is based on the
          concept of a node tree, where each node represents a piece of
          functionality. Tying these nodes together allows you to quickly create
          any number of games with very little code or time.
        </p>
        <Action
          type="primary"
          href="https://sojs-coder.github.io/forge"
          target="_blank"
        >
          Visit Forge Engine
        </Action>
      {/snippet}
    </SectionCard>
    <SectionCard order={1}>
      {#snippet leftcontent()}
        <ImageSlideshow images={adhocImages} />
      {/snippet}
      {#snippet rightcontent()}
        <h2>Featured Projects, Continued...</h2>
        <h3>Project 2</h3>
        <h4>AdHoc</h4>
        <p>
          In my struggle to monetize my projects and my desire to create a
          platform where publishers and advertisers could easily advertise and
          monetize their content, I created AdHoc, a privacy-first advertising
          platform, built on the principles of user consent and data protection.
        </p>
        <p>
          In fact, user consent is not even implemented, because there is
          nothing for the user to consent to! No tracking scripts, no cookies,
          no data collection. Just pure advertising based on the content of the
          site and the content of the ad.
        </p>
        <p>
          AdHoc is still under development, and multiple clients are lined up to
          start using the platform as soon as it is completed.
        </p>
      {/snippet}
    </SectionCard>
  </section>
  <section id="Projects">
    <Projects />
  </section>
-->
  <Footer  />
</main>
