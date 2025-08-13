<script lang="ts">
  import { slide } from "svelte/transition";
  import { onDestroy, onMount, type Snippet } from "svelte";
  interface Props {
    order?: number;
    backgroundColor?: string;
    textColor?: string;
    image?: string;
    imageAlt?: string;
    leftcontent: Snippet;
    rightcontent?: Snippet;
  }
  const {
    order = 1,
    backgroundColor = "var(--section-background)",
    textColor = "var(--text-primary)",
    image = "",
    imageAlt = "Section Image",
    leftcontent,
    rightcontent,
  }: Props = $props();
  let sectionRef: HTMLElement | null = $state(null);
  let firstContent: HTMLElement | null = $state(null);
  function handleScroll() {
    if (!firstContent || !sectionRef) return;
    const rect = firstContent.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;

    // Check if any part of the section is visible in the viewport
    if (sectionTop < window.innerHeight && sectionBottom > 0) {
      sectionRef.classList.add("visible");
      window.removeEventListener("scroll", handleScroll);
    }
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
  style="background-color: {backgroundColor}; color: {textColor};"
  class="section"
  bind:this={sectionRef}
  class:visible={firstContent && firstContent.classList.contains("visible")}
>
  {#if order == 1}
    <div class="section-left" bind:this={firstContent}>
      {@render leftcontent()}
    </div>
    <div class="section-right">
      {#if image}
        <img src={image} alt={imageAlt} />
      {/if}
      {#if rightcontent}
        <div class="right-content">
          {@render rightcontent()}
        </div>
      {:else}
        <!-- empty -->
      {/if}
    </div>
  {:else}
    <div class="section-right" bind:this={firstContent}>
      {#if image}
        <img src={image} alt={imageAlt} />
      {/if}
      {#if rightcontent}
        <div class="right-content">
          {@render rightcontent()}
        </div>
      {:else}
        <!-- empty -->
      {/if}
    </div>
    <div class="section-left">
      {@render leftcontent()}
    </div>
  {/if}
</section>

<style>
  section {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 56px;
    box-sizing: border-box;
  }
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    max-height: 500px;
    border-radius: var(--primary-radius);
  }
  .section-left,
  .section-right {
    display: flex;
    flex-direction: column;
    padding: 56px;
    box-sizing: border-box;
    gap: 10px;
    justify-content: center;
    text-align: left;
    width: 50%;
    height: 100%;
    color: inherit;
    opacity: 0;
    transform: translateY(150px);
    transition:
      opacity var(--slow-transition) ease-in,
      transform var(--slow-transition);
  }

  .visible .section-left,
  .visible .section-right {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    section {
      flex-direction: column; /* Stack columns on smaller screens */
      padding: 24px; /* Adjust padding for smaller screens */
    }

    .section-left,
    .section-right {
      width: 100%; /* Full width for columns */
      padding: 24px; /* Adjust padding for smaller screens */
    }

    /* Ensure image is not too large when stacked */
    img {
      max-height: 300px;
    }
  }

  @media (max-width: 480px) {
    section {
      padding: 16px;
    }

    .section-left,
    .section-right {
      padding: 16px;
    }

    img {
      max-height: 200px;
    }
  }
</style>