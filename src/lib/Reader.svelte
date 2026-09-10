<script module>
  const cache = new Map();
</script>
<script>
  import { onMount } from 'svelte';
  import { parseMarkdownToHtml } from './markdown.js';
  import About from './About.svelte';
  let { project = null, about = false, onClose } = $props();
  let dialog, html = $state(''), loading = $state(false), error = $state(false), attempt = $state(0);
  $effect(() => {
    attempt;
    if (!project) return;
    const controller = new AbortController();
    html = ''; error = false; loading = true;
    async function load() {
      try {
        if (!cache.has(project.postMarkdownPath)) {
          const response = await fetch(project.postMarkdownPath, { signal: controller.signal });
          if (!response.ok || response.headers.get('content-type')?.includes('text/html')) throw new Error('Post unavailable');
          const text = await response.text();
          if (controller.signal.aborted) return;
          cache.set(project.postMarkdownPath, parseMarkdownToHtml(text));
        }
        if (!controller.signal.aborted) html = cache.get(project.postMarkdownPath);
      } catch (err) { if (err.name !== 'AbortError') error = true; }
      finally { if (!controller.signal.aborted) loading = false; }
    }
    load();
    return () => controller.abort();
  });
  onMount(() => { dialog.showModal(); return () => dialog.close(); });
  function close() {
    dialog.close();
    onClose();
  }
</script>

<dialog bind:this={dialog} aria-label={about ? 'About Matthieu' : project?.title || 'Project not found'} oncancel={(event) => { event.preventDefault(); close(); }}>
  <header class="reader-header">
    <span>Matthieu Fuller</span>
    <button class="close-button" onclick={close}>Close <span aria-hidden="true">×</span></button>
  </header>
  <div class="article-wrap">
    {#if about}
      <h1>About</h1>
      <div class="prose"><About /></div>
    {:else if project}
      
      {#if loading}
        <h1>{project.title}</h1><p role="status">Loading…</p>
      {:else if error}
        <h1>{project.title}</h1><p role="alert">This post couldn’t be loaded.</p>
        <button onclick={() => attempt++}>Try again</button>
      {:else}
        <article class="prose">{@html html}</article>
      {/if}
    {:else}
      <h1>Project not found.</h1><p></p>
    {/if}
    <footer class="reader-footer"><button onclick={close}>Close</button></footer>
  </div>
</dialog>

<style>
  dialog { position: fixed; inset: 0; width: 100%; height: 100%; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; color: #111; background: #f6f6f3; overflow-y: auto; overscroll-behavior: contain; }
  dialog::backdrop { background: #f6f6f3; }
  dialog[open] { animation: arrive 280ms ease-out; }
  .reader-header { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; padding: 20px 4vw; border-bottom: 1px solid #c8c8c2; background: #f6f6f3; }
  .close-button { display: flex; gap: 22px; align-items: center; }
  .close-button span { font-size: 24px; line-height: 1; }
  .article-wrap { width: min(100% - 44px, 740px); margin: 70px auto; }
  h1, .prose :global(h1) { font-size: clamp(42px, 7vw, 76px); line-height: 1.02; font-weight: 400; letter-spacing: -0.045em; margin: 25px 0 40px; }
  .prose { font-size: 20px; line-height: 1.7; overflow-wrap: anywhere; }
  .prose :global(p) { margin: 0 0 1.25em; }
  .prose :global(h2), .prose :global(h3) { font-weight: 400; line-height: 1.2; margin-top: 2em; }
  .prose :global(a) { text-decoration: underline; text-underline-offset: 4px; }
  .prose :global(figure) { margin: 36px 0; }
  .prose :global(img) { display: block; width: 100%; height: auto; border: 1px solid #c8c8c2; }
  .prose :global(figcaption) { font: 11px/1.5 monospace; margin-top: 10px; color: #666; }
  .prose :global(pre) { overflow-x: auto; padding: 24px; background: #eee; font-size: 14px; }
  .prose :global(code) { font-size: 0.8em; }
  .prose :global(hr) { border: 0; border-top: 1px solid #c8c8c2; margin: 2em 0; }
  .prose :global(footer) { font: 12px/1.7 monospace; margin-top: 50px; }
  .reader-footer { display: flex; gap: 24px; align-items: center; justify-content: space-between; margin-top: 80px; padding-top: 24px; border-top: 1px solid #c8c8c2; font-size: 15px; }
  @keyframes arrive { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
  @media (max-width: 600px) { .reader-header { padding: 15px 22px; } .article-wrap { margin-top: 40px; } .prose { font-size: 18px; } }
  @media (prefers-reduced-motion: reduce) { dialog[open] { animation: none; } }
</style>
