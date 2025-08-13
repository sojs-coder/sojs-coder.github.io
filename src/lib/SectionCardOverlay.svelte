<script lang="ts">
  import { onDestroy, onMount, type Snippet } from "svelte";

  interface Props {
    backgroundImage: string;
    backgroundImageAlt?: string;
    cardBackgroundColor?: string;
    cardTextColor?: string;
    cardContent: Snippet;
    float?: "flex-start" | "flex-end" | "center";
  }

  const {
    backgroundImage,
    backgroundImageAlt = "Background Image",
    cardBackgroundColor = "var(--card-background, #ffffff)",
    cardTextColor = "var(--text-primary)",
    cardContent,
    float = "flex-end",
  }: Props = $props();

  let sectionRef: HTMLElement | null = $state(null);
  let cardRef: HTMLElement | null = $state(null);
  let isVisible = $state(false);
  let hasBeenVisible = $state(false);
  let parallaxOffset = $state(0);

  function handleScroll() {
    if (!cardRef || !sectionRef) return;
    const rect = cardRef.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;

    // Check if any part of the section is visible in the viewport
    const currentlyVisible =
      sectionTop < window.innerHeight && sectionBottom > 0;

    // Once visible, always stay visible (prevents stuttering)
    if (currentlyVisible && !hasBeenVisible) {
      isVisible = true;
      hasBeenVisible = true;
    }

    // Calculate parallax offset
    const sectionRect = sectionRef.getBoundingClientRect();
    const scrolled = window.pageYOffset;
    const sectionOffset = sectionRect.top + scrolled;
    const rate = (scrolled - sectionOffset) * -0.5; // Negative for opposite direction parallax
    parallaxOffset = rate;
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    // Use requestAnimationFrame to ensure the element is rendered before checking
    requestAnimationFrame(() => {
      handleScroll(); // Initial check on mount
    });
  });

  onDestroy(() => {
    window.removeEventListener("scroll", handleScroll);
  });
</script>

<section
  class="section"
  bind:this={sectionRef}
  style="background-image: url('{backgroundImage}'); justify-content: {float}; background-position: center calc(50% + {parallaxOffset}px);"
  role="img"
  aria-label={backgroundImageAlt}
>
  <div class="overlay"></div>
  <div
    class="floating-card"
    class:visible={isVisible}
    bind:this={cardRef}
    style="background-color: {cardBackgroundColor}; color: {cardTextColor};"
  >
    {@render cardContent()}
  </div>
</section>

<style>
  section {
    position: relative;
    min-height: 50vh;
    padding: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    overflow: hidden;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  .floating-card {
    position: relative;
    z-index: 2;
    max-width: 600px;
    padding: 48px;
    border-radius: var(--primary-radius);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transform: translateY(150px);
    transition:
      opacity var(--slow-transition) ease-in,
      transform var(--slow-transition),
      box-shadow var(--primary-transition);
  }

  /* Apply backdrop-filter only when there's a background image */
  section[style*="background-image"] .floating-card {
    backdrop-filter: blur(10px);
    transition:
      opacity var(--slow-transition) ease-in,
      transform var(--slow-transition),
      box-shadow var(--primary-transition),
      backdrop-filter var(--primary-transition);
  }

  section[style*="background-image"] .floating-card:hover {
    backdrop-filter: blur(15px);
  }

  .floating-card.visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    section {
      padding: 40px; /* Adjust padding for smaller screens */
      min-height: 40vh; /* Slightly reduce min-height */
    }

    .floating-card {
      max-width: 90%; /* Allow card to take more width on smaller screens */
      padding: 32px; /* Adjust padding for smaller screens */
    }
  }

  @media (max-width: 480px) {
    section {
      padding: 20px;
      min-height: 30vh;
    }

    .floating-card {
      max-width: 95%;
      padding: 24px;
    }
  }
</style>
