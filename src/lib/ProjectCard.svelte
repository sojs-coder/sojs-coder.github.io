<script lang="ts">
  import ImageSlideshow from "./ImageSlideshow.svelte";

  export let title: string;
  export let shortDescription: string;
  export let thumbnail: string;
  export let fullDescription: string;
  export let images: [string, string][];

  let showModal = false;

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  $: if (showModal) {
    document.body.classList.add("no-scroll");
  } else {
    document.body.classList.remove("no-scroll");
  }
</script>

<div
  class="project-card"
  role="button"
  tabindex="0"
  aria-label="Open project details"
  on:click={openModal}
  on:keydown={(e) => {
    if (e.key === "Enter" || e.key === " ") openModal();
  }}
>
  <img src={thumbnail} alt={title} class="thumbnail" />
  <h3>{title}</h3>
  <p>{shortDescription}</p>
</div>

{#if showModal}
  <div
    class="modal-overlay"
    role="button"
    tabindex="0"
    aria-label="Close modal"
    on:click={closeModal}
    on:keydown={(e) => {
      if (e.key === "Enter" || e.key === " ") closeModal();
    }}
  >
    <div
      class="modal-content"
      role="dialog"
      aria-modal="true"
      tabindex="0"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <button
        class="close-button"
        on:click={closeModal}
        aria-label="Close modal">&times;</button
      >
      <h2>{title}</h2>
      <ImageSlideshow {images} />
      <p>{fullDescription}</p>
    </div>
  </div>
{/if}

<style>
  .project-card {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    margin: 16px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .project-card:hover {
    transform: translateY(-5px);
  }

  .project-card .thumbnail {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--background-primary);
    padding: 40px;
    border-radius: var(--primary-radius);
    max-width: 800px;
    max-height: 80%;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .modal-content h2 {
    margin-top: 0;
  }

  .modal-content p {
    line-height: 1.6;
    text-align: left;
  }

  .modal-content :global(.slideshow-container) {
    width: 100%;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #333;
  }

  @media (max-width: 768px) {
    .project-card {
      padding: 12px;
      margin: 12px;
    }

    .modal-content {
      padding: 30px;
    }
  }

  @media (max-width: 480px) {
    .project-card {
      padding: 10px;
      margin: 10px;
    }

    .modal-content {
      padding: 20px;
      max-width: 95%; /* Allow modal to take more width on very small screens */
    }

    .modal-content h2 {
      font-size: 1.5rem; /* Adjust modal title size */
    }

    .modal-content p {
      font-size: 0.9rem; /* Adjust modal description size */
    }
  }
</style>