<script lang="ts">
  import { fade } from "svelte/transition";

  let { images = [] }: { images: [string, string][] } = $props();
  let currentIndex = $state(0);

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  function goToImage(index: number) {
    currentIndex = index;
  }
</script>

<div class="slideshow-container">
  {#if images.length > 0}
    <div class="image-area">
      <div class="slides">
        {#key currentIndex}
          <div
            class="slide"
            in:fade={{ duration: 300, delay: 300 }}
            out:fade={{ duration: 300 }}
          >
            <img src={images[currentIndex][0]} alt={images[currentIndex][1]} />
          </div>
        {/key}
      </div>
      <button class="prev" on:click={prevImage} aria-label="Previous image"
        >&#10094;</button
      >
      <button class="next" on:click={nextImage} aria-label="Next image"
        >&#10095;</button
      >
    </div>

    <div class="info-area">
      <figcaption>{images[currentIndex][1]}</figcaption>
      <div class="dots">
        {#each images as _, i}
          <button
            class="dot"
            class:active={currentIndex === i}
            on:click={() => goToImage(i)}
            aria-label="Go to slide {i + 1}"
          ></button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .slideshow-container {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    border-radius: var(--primary-radius);
    background-color: var(--background-secondary);
    overflow: hidden;
  }

  .image-area {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background-color: #000; /* Fallback for images */
  }

  .slides {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .info-area {
    padding: 15px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  figcaption {
    font-size: 1.1em;
    font-weight: bold;
    color: var(--text-primary);
  }

  .dots {
    /* No special positioning needed now */
  }

  .dot {
    cursor: pointer;
    height: 13px;
    width: 13px;
    margin: 0 5px;
    background-color: #888;
    border-radius: 50%;
    display: inline-block;
    transition: background-color 0.6s ease;
    border: none;
    padding: 0;
  }

  .active,
  .dot:hover {
    background-color: var(--rose-gold);
  }

  .prev,
  .next {
      cursor: pointer;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: auto;
      padding: 16px;
      color: white;
      font-weight: bold;
      font-size: 18px;
      transition: 0.6s ease;
      user-select: none;
      background-color: rgba(0, 0, 0, 0.3);
      border: none;
      z-index: 10;
  }

  .prev {
      left: 0;
      border-radius: 0 3px 3px 0;
  }

  .next {
      right: 0;
      border-radius: 3px 0 0 3px;
  }

  .prev:hover,
  .next:hover {
      background-color: rgba(0, 0, 0, 0.6);
  }
</style>