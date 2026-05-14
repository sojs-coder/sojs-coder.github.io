<script>
  let { width = 1200, height = 800, alt = "Project screenshot placeholder", src = "" } = $props();
</script>

{#if src}
  <img src={src} alt={alt} loading="lazy" />
{:else}
  <div class="placeholder" role="img" aria-label={alt}>
    <span>Suggested screenshot size: {width} x {height}</span>
  </div>

  <!--
  <img src="/images/your-image.jpg" alt={alt} />
  -->
{/if}

<style>
  .placeholder {
    height: 100%;
    width: 100%;
    border-radius: 0;
    border: 1px dashed rgba(0, 0, 0, 0.2);
    background:
      linear-gradient(120deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0)),
      repeating-linear-gradient(
        -45deg,
        rgba(0, 0, 0, 0.03) 0,
        rgba(0, 0, 0, 0.03) 12px,
        transparent 12px,
        transparent 24px
      ),
      #ecece7;
    display: grid;
    place-items: center;
    padding: 1rem;
    text-align: center;
  }

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  span {
    font-size: 0.8rem;
    color: rgba(0, 0, 0, 0.56);
    letter-spacing: 0.04em;
  }
</style>
