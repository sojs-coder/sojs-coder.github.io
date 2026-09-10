<script>
  import { onMount, tick } from 'svelte';
  import { projects } from './lib/projects.js';
  import Reader from './lib/Reader.svelte';
  import './style.css';

  let route = $state(window.location.hash);
  let mode = $state('list');
  let FlightScene = $state(null), flight = $state(null), ready = $state(false), active = $state(false);
  let flightError = $state(false), loadingScene = $state(false), mounted = $state(false);
  let entered = $state(false), returnFocus = null, resumeButton = $state(null);
  const navigationId = crypto.randomUUID();
  const isArticle = $derived(route.startsWith('#/projects/'));
  const isAbout = $derived(route === '#/about');
  const readerOpen = $derived(isArticle || isAbout);
  const selected = $derived(projects.find(project => route === `#/projects/${project.slug}`));

  onMount(() => {
    const simple = matchMedia('(max-width: 760px), (pointer: coarse), (prefers-reduced-motion: reduce)').matches;
    mode = !simple && (!route || route === '#/fly') ? 'flight' : 'list';
    mounted = true;
    function changed() {
      route = window.location.hash;
      if (route === '#/projects') mode = 'list';
      if (!route || route === '#/fly') mode = simple && !entered ? 'list' : 'flight';
      if (!readerOpen) restoreFocus();
    }
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  });
  $effect(() => {
    document.title = selected ? `${selected.title} — Matthieu Fuller` : 'Matthieu Fuller';
  });
  $effect(() => {
    if (!mounted || mode !== 'flight' || FlightScene || loadingScene || flightError) return;
    loadingScene = true;
    import('./lib/FlightScene.svelte').then(module => { FlightScene = module.default; })
      .catch(failFlight).finally(() => { loadingScene = false; });
  });
  function failFlight() { flightError = true; active = false; mode = 'list'; }
  function navigate(hash) { window.location.hash = hash; }
  function open(project) {
    flight?.pause(); returnFocus = document.activeElement;
    navigate(`#/projects/${project.slug}`);
    history.replaceState({ portfolioReader: navigationId }, '');
  }
  function about() {
    flight?.pause(); returnFocus = document.activeElement; navigate('#/about');
    history.replaceState({ portfolioReader: navigationId }, '');
  }
  async function restoreFocus() {
    await tick();
    if (returnFocus?.isConnected && returnFocus.tagName !== 'CANVAS') returnFocus.focus();
    else if (mode === 'flight') flight?.focus();
    else document.getElementById('projects-heading')?.focus();
    returnFocus = null;
  }
  function closeReader() {
    if (history.state?.portfolioReader === navigationId) {
      if (mode === 'flight') flight?.captureMouse();
      history.back();
    }
    else { history.replaceState(null, '', '#/projects'); route = '#/projects'; mode = 'list'; restoreFocus(); }
  }
  function chooseFlight() { entered = true; mode = 'flight'; navigate('#/fly'); }

</script>

<svelte:window onkeydown={(event) => { if (event.key === 'Escape' && active && !readerOpen) flight?.pause(); }} />
<main class:in-flight={mode === 'flight'}>
  <header class="site-header">
    <a class="identity" href="#/projects" aria-label="Matthieu Fuller, projects">Matthieu Fuller<span>UCSD CS &amp; Math · Engineer</span></a>
    <nav aria-label="Main navigation">
      <button class:current={mode === 'list'} onclick={() => { flight?.pause(); mode = 'list'; navigate('#/projects'); }}>Projects <span class="count">{projects.length}</span></button>
      <button onclick={about}>About</button><a href="/resume.html">Resume</a>
    </nav>
  </header>
  {#if FlightScene && !flightError}
    <div class="world" class:concealed={mode !== 'flight'}>
      <FlightScene bind:this={flight} enabled={mode === 'flight' && !readerOpen} onOpen={open} onActive={(value) => active = value} onReady={() => ready = true} onError={failFlight} />
    </div>
  {/if}
  {#if mode === 'flight'}
    {#if !active && ready}<button class="resume" bind:this={resumeButton} onclick={() => flight?.startFlight()}>Start</button>{/if}
    <div class="flight-bottom">
        <p class="controls"><span>Mouse / arrows pitch &amp; bank</span><span><kbd>Q E</kbd> roll</span><span><kbd>A D</kbd> yaw</span><span><kbd>W S</kbd> throttle</span><span><kbd>Shift</kbd> afterburner · 100%</span><span><kbd>Esc</kbd> pause</span></p>
      <button class="reset" onclick={() => flight?.reset()} disabled={!ready}>Reset</button>
    </div>
  {:else}
    <section class="project-index" aria-labelledby="projects-heading">
      <div class="index-heading">
        <h1 id="projects-heading" tabindex="-1">Projects</h1>
        {#if !flightError}<button class="flight-switch" onclick={chooseFlight}>Fly</button>{/if}
      </div>
      {#if flightError}<p role="status" class="fallback-message">Flight unavailable.</p>{/if}
      <div class="project-grid">
        {#each projects as project, i}
          <a class="project" href={`#/projects/${project.slug}`} onclick={(event) => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); open(project); } }}>
            <div class="project-image"><img src={project.imageUrl} alt={project.title} loading="lazy" /><span class="project-arrow" aria-hidden="true">↗</span></div>
            <div class="project-meta eyebrow"><span>{String(i + 1).padStart(2, '0')} / {project.category}</span></div>
            <h2>{project.title}</h2><p>{project.description}</p>
          </a>
        {/each}
      </div>
    </section>
  {/if}
  <footer class="site-footer">
    <div><a href="mailto:sojscoder@gmail.com">sojscoder@gmail.com</a><a href="https://github.com/sojs-coder" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/matthieu-fuller" target="_blank" rel="noreferrer">LinkedIn</a><a class="mobile-resume" href="/resume.html">Resume</a></div>
  </footer>
</main>
{#if readerOpen}
  {#key route}<Reader project={selected} about={isAbout} onClose={closeReader} />{/key}
{/if}
