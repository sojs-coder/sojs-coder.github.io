<script>
  import PlaceholderImage from "./PlaceholderImage.svelte";
  import { parseMarkdownToHtml } from "./markdown.js";

  let {
    project,
    expanded = false,
    onToggle = () => {},
    isFeature = false,
  } = $props();

  function closeModal(event) {
    event.stopPropagation();
    onToggle();
  }

  function handleKeydown(event) {
    if (expanded && event.key === "Escape") onToggle();
  }

  const markdownCache = new Map();
  let markdownHtml = $state("");
  let markdownLoading = $state(false);
  let markdownError = $state("");
  const hasPostContent = $derived(Boolean(project.postTitle || project.postBody));
  const hasLiveUrl = $derived(Boolean(project.liveUrl));

  $effect(() => {
    if (!expanded || !project.postMarkdownPath) return;

    let cancelled = false;
    async function loadMarkdown() {
      markdownError = "";
      markdownLoading = true;
      if (markdownCache.has(project.postMarkdownPath)) {
        markdownHtml = markdownCache.get(project.postMarkdownPath);
        markdownLoading = false;
        return;
      }

      try {
        const res = await fetch(project.postMarkdownPath);
        if (!res.ok) {
          throw new Error(`Could not load ${project.postMarkdownPath}`);
        }
        const text = await res.text();
        const parsed = parseMarkdownToHtml(text);
        markdownCache.set(project.postMarkdownPath, parsed);
        if (!cancelled) markdownHtml = parsed;
      } catch (err) {
        if (!cancelled) markdownError = err?.message ?? "Failed to load post markdown.";
      } finally {
        if (!cancelled) markdownLoading = false;
      }
    }

    loadMarkdown();
    return () => {
      cancelled = true;
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<article
  class:feature-card={isFeature}
  class:modal-enabled={hasPostContent}
  class:link-enabled={!hasPostContent && hasLiveUrl}
  class="card"
>
  {#if hasPostContent}
    <button class="card-hit" type="button" onclick={onToggle} aria-expanded={expanded}>
      <div class="image-wrap">
        <PlaceholderImage
          width={project.width}
          height={project.height}
          alt={project.title}
          src={project.imageUrl}
        />
        <div class="hover-layer">
          <p class="hover-category">{project.category}</p>
          <div class="hover-copy">
            <p class="title">{project.title}</p>
            <p>{project.description}</p>
          </div>
        </div>
      </div>
    </button>
  {:else if hasLiveUrl}
    <a class="card-hit card-link" href={project.liveUrl} target="_blank" rel="noreferrer">
      <div class="image-wrap">
        <span class="outbound-pill" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" focusable="false">
            <path d="M7 13L13 7M8 7H13V12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </span>
        <PlaceholderImage
          width={project.width}
          height={project.height}
          alt={project.title}
          src={project.imageUrl}
        />
        <div class="hover-layer">
          <p class="hover-category">{project.category}</p>
          <div class="hover-copy">
            <p class="title">{project.title}</p>
            <p>{project.description}</p>
          </div>
        </div>
      </div>
    </a>
  {:else}
    <div class="card-hit card-static">
      <div class="image-wrap">
        <PlaceholderImage
          width={project.width}
          height={project.height}
          alt={project.title}
          src={project.imageUrl}
        />
        <div class="hover-layer">
          <p class="hover-category">{project.category}</p>
          <div class="hover-copy">
            <p class="title">{project.title}</p>
            <p>{project.description}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if expanded && hasPostContent}
    <div class="modal-backdrop" role="presentation" onclick={onToggle}>
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        tabindex="-1"
        onclick={(event) => event.stopPropagation()}
        onkeydown={(event) => {
          if (event.key === "Escape") onToggle();
        }}
      >
        <button class="close" type="button" onclick={closeModal} aria-label="Close">
          x
        </button>
        <div class="modal-image">
          <PlaceholderImage
            width={project.width}
            height={project.height}
            alt={project.title}
            src={project.imageUrl}
          />
        </div>
        <div class="post">
          <p class="meta">{project.category}</p>
          <p class="post-title">{project.postTitle}</p>
          {#if project.postMarkdownPath}
            {#if markdownLoading}
              <p class="md-status">Loading post...</p>
            {:else if markdownError}
              <p class="md-status">{markdownError}</p>
            {:else}
              <div class="md-content">
                {@html markdownHtml}
              </div>
            {/if}
          {:else}
            <p>{project.postBody}</p>
          {/if}
          {#if project.liveUrl}
            <a href={project.liveUrl} target="_blank" rel="noreferrer">View Live</a>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</article>

<style>
  .card {
    position: relative;
    background: #fdfdfb;
    overflow: hidden;
    cursor: default;
    min-height: 0;
    height: 100%;
    transition: background 0.15s ease;
    --hover-title-size: clamp(1rem, 1.4vw, 1.45rem);
    --hover-body-size: clamp(0.78rem, 1.05vw, 0.95rem);
  }

  .card.modal-enabled,
  .card.link-enabled {
    cursor: pointer;
  }

  .card:hover {
    background: #f2f2ed;
  }

  .card-hit {
    all: unset;
    display: block;
    width: 100%;
    height: 100%;
    cursor: inherit;
  }

  .image-wrap {
    position: relative;
    height: 100%;
    min-height: 0;
  }

  .image-wrap :global(img),
  .image-wrap :global(.placeholder) {
    transition: filter 0.22s ease;
  }

  .image-wrap::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.52);
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
    z-index: 1;
  }

  .card:hover .image-wrap::after {
    opacity: 1;
  }

  .card:hover .image-wrap :global(img),
  .card:hover .image-wrap :global(.placeholder) {
    filter: grayscale(1) brightness(0.86);
  }

  .hover-layer {
    position: absolute;
    inset: 0;
    padding: 2.2rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.9rem;
    background: rgba(0, 0, 0, 0.36);
    opacity: 0;
    transition: opacity 0.22s ease;
    z-index: 2;
  }

  .hover-category {
    margin: 0;
    width: fit-content;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.88);
  }

  .hover-copy {
    display: grid;
    gap: 0.9rem;
  }

  .outbound-pill {
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    z-index: 3;
    width: 1rem;
    height: 1rem;
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.96);
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }

  .outbound-pill svg {
    width: 1rem;
    height: 1rem;
    display: block;
  }

  .card.link-enabled:hover .outbound-pill {
    opacity: 1;
  }

  .card:hover .hover-layer {
    opacity: 1;
  }

  @media (hover: none), (pointer: coarse) {
    .card .image-wrap::after {
      opacity: 1;
    }

    .card .image-wrap :global(img),
    .card .image-wrap :global(.placeholder) {
      filter: grayscale(1) brightness(0.86);
    }

    .card .hover-layer {
      opacity: 1;
    }
  }

  .title {
    margin: 0 0 0.3rem;
    font-size: var(--hover-title-size);
    color: #fff;
    font-weight: 600;
    line-height: 1.15;
    max-width: 16ch;
  }

  .hover-copy p:not(.title) {
    margin: 0;
    color: rgba(255, 255, 255, 0.95);
    font-size: var(--hover-body-size);
    line-height: 1.5;
    max-width: 28ch;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgba(0, 0, 0, 0.24);
    display: grid;
    place-items: center;
    padding: 1.25rem;
  }

  .modal {
    width: min(920px, 96vw);
    max-height: 92vh;
    overflow: auto;
    background: #ffffff;
    border: 1px solid #bdbdb6;
    box-shadow: 0 14px 48px rgba(0, 0, 0, 0.14);
    position: relative;
  }

  .close {
    all: unset;
    cursor: pointer;
    position: sticky;
    top: 0.5rem;
    left: calc(100% - 2rem);
    z-index: 2;
    width: 1.5rem;
    height: 1.5rem;
    text-align: center;
    line-height: 1.5rem;
    color: rgba(17, 17, 17, 0.78);
    font-size: 1.1rem;
    font-weight: 500;
  }

  .modal-image {
    width: 100%;
    aspect-ratio: 16 / 9;
  }

  .post {
    padding: 1.5rem 1.6rem 1.7rem;
    border-top: 1px solid #c8c8c2;
    display: grid;
    gap: 0.9rem;
    background: #fff;
  }

  .meta {
    margin: 0;
    font-size: 0.92rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(17, 17, 17, 0.5);
  }

  .post-title {
    margin: 0;
    color: #111;
    font-size: 1.8rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .post p {
    margin: 0;
    color: rgba(17, 17, 17, 0.83);
    font-size: 1.2rem;
    line-height: 1.58;
  }

  .md-status {
    color: rgba(17, 17, 17, 0.62);
  }

  .md-content {
    display: grid;
    gap: 0.85rem;
    color: rgba(17, 17, 17, 0.9);
  }

  .md-content :global(h1),
  .md-content :global(h2),
  .md-content :global(h3) {
    margin: 0.5rem 0 0.1rem;
    font-size: 1.6rem;
    font-weight: 600;
    line-height: 1.22;
  }

  .md-content :global(p) {
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.62;
  }

  .md-content :global(ul) {
    margin: 0;
    padding-left: 1.2rem;
    display: grid;
    gap: 0.35rem;
    font-size: 1.15rem;
  }

  .md-content :global(figure) {
    margin: 0.25rem 0 0.4rem;
    display: grid;
    gap: 0.4rem;
  }

  .md-content :global(figure img) {
    width: 100%;
    height: auto;
    display: block;
    border: 1px solid #c8c8c2;
  }

  .md-content :global(figcaption) {
    font-size: 1rem;
    color: rgba(17, 17, 17, 0.56);
  }

  .md-content :global(pre) {
    margin: 0.2rem 0;
    padding: 0.8rem 0.9rem;
    border: 1px solid #d2d2cb;
    background: #f3f3ef;
    overflow: auto;
  }

  .md-content :global(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 0.85em;
  }

  a {
    color: #0055cc;
    text-decoration: none;
    width: fit-content;
    font-weight: 600;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
