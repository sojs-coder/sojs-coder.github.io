<script lang="ts">
  import { Hamburger } from "svelte-hamburgers";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import AboutImage from "../assets/navigation/about.png";
  import ProjectImage from "../assets/navigation/projects.png";
  import FeaturedProjectsImage from "../assets/navigation/fprojects.png";
  let open = false;
  let navBackgroundImage1: HTMLImageElement;
  let navBackgroundImage2: HTMLImageElement;
  let navBackgoundContainer: HTMLDivElement;
  let navLinks: HTMLElement;
  let activeImageIndex = 1; // Track which image is currently active

  function toggleMenu() {
    open = !open;
  }

  function handleMouseEnter(image: string) {
    navLinks.style.color = "var(--text-white)";
    navBackgoundContainer.style.background = "black";
    // Determine which image to use for crossfade
    const currentImage =
      activeImageIndex === 1 ? navBackgroundImage1 : navBackgroundImage2;
    const nextImage =
      activeImageIndex === 1 ? navBackgroundImage2 : navBackgroundImage1;

    if (nextImage && currentImage) {
      // Set the new image
      nextImage.src = image;

      // Crossfade: fade out current, fade in next
      currentImage.style.opacity = "0";
      nextImage.style.opacity = "0.2";

      // Switch active image
      activeImageIndex = activeImageIndex === 1 ? 2 : 1;
    }
  }

  function handleMouseLeave() {
    if (navBackgroundImage1 && navBackgroundImage2 && navBackgoundContainer) {
      navBackgroundImage1.style.opacity = "0";
      navBackgroundImage2.style.opacity = "0";
      navLinks.style.color = "var(--text-primary)";
      navBackgoundContainer.style.background = "var(--background-overlay)";
    }
  }
  const links = [
    { name: "About", href: "#About", image: AboutImage },
    {
      name: "Featured Projects",
      href: "#FeaturedProjects",
      image: FeaturedProjectsImage,
    },
    { name: "Projects", href: "#Projects", image: ProjectImage },
  ];
  const footerLinks: { name: string; href: string }[] = [
    { name: "Email", href: "mailto:sojscoder" },
    { name: "Github", href: "https://github.com/sojscoder" },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/matthieu-fuller-4585012b4/",
    },
    { name: "Replit", href: "https://replit.com/@sojs" },
    {
      name: "Stackoverflow",
      href: "https://stackoverflow.com/users/10741611/sojs",
    },
    { name: "CCPorted", href: "https://ccported.click" },
    {
      name: "Join CCPorted Discord",
      href: "https://discord.com/invite/GDEFRBTT3Z",
    },
  ];
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      open = false;
    }
  };
  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
  });
  onMount(() => {
    return () => {
      document.body.style.overflow = "";
    };
  });
</script>

<!-- Hamburger Button -->
<Hamburger
  type="squeeze"
  bind:open
  --color="var(--text-primary)"
  ariaLabel="Open navigation"
  title="Open navigation"
/>

{#if open}
  <div class="menu-overlay" tabindex="-1" transition:fade={{ duration: 300 }}>
    <nav class="menu-links" bind:this={navLinks}>
      <div class="nav-background-container" bind:this={navBackgoundContainer}>
        <img
          class="nav-background-image"
          alt="Background"
          bind:this={navBackgroundImage1}
        />
        <img
          class="nav-background-image"
          alt="Background"
          bind:this={navBackgroundImage2}
        />
        <div class="nav-background-overlay"></div>
      </div>
      {#each links as link}
        <a
          class="menu-link"
          href={link.href}
          onclick={toggleMenu}
          onmouseenter={() => handleMouseEnter(link.image)}
          onmouseleave={handleMouseLeave}
        >
          <span class="menu-link-text">{link.name}</span>
        </a>
      {/each}
    </nav>
    <footer>
      {#each footerLinks as link}
        <a class="menu-link" href={link.href} onclick={toggleMenu}>
          <span class="menu-link-text">{link.name}</span>
        </a>
      {/each}
    </footer>
  </div>
{/if}

<style>
  .menu-overlay {
    position: fixed;
    top: 100px;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--background-overlay);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    border: 1px solid var(--border-color);
  }
  .nav-background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    transition: background var(--primary-transition) ease;
  }

  .nav-background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity var(--primary-transition) ease;
    opacity: 0;
  }

  .nav-background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .menu-links {
    display: flex;
    flex-direction: column;
    gap: 0px;
    height: 100%;
  }
  nav {
    padding: 40px 40px 0px 40px;
    background-color: var(--background-overlay);
    position: relative;
    overflow: hidden;
    transition: background-color 0.3s ease;
  }

  nav::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    object-fit: cover;
    opacity: 0;
    transition: opacity var(--primary-transition) ease;
    z-index: -1;
  }

  nav:has(.menu-link:hover)::before {
    opacity: 0.15;
  }

  nav .menu-link {
    font-size: 3.2rem;
    color: inherit;
    text-decoration: none;
    color: var(--text-primary);
    font-family: "Inria Serif", serif;
    font-weight: 500;
    transition: all var(--quick-transition) ease;
    padding: 8px 0;
    position: relative;
    display: block;
    width: 100%;
    z-index: 2;
  }

  .menu-link-text {
    position: relative;
    display: inline-block;
  }

  .menu-link-text::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--hover-color);
    transition: width var(--quick-transition) ease;
  }

  .menu-link:hover {
    color: var(--hover-color);
  }
  nav .menu-link:hover {
    transform: translateX(8px);
  }

  .menu-link:hover .menu-link-text::after {
    width: 100%;
  }

  nav a,
  .menu-links {
    width: 100%;
  }

  footer {
    border-top: 1px solid var(--border-color);
    margin-top: auto;
    padding: 24px;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 32px;
  }

  footer .menu-link {
    font-size: 1.4rem;
    color: var(--text-secondary);
  }
</style>
