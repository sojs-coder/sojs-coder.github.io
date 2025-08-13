<script lang="ts">
  let { tags = [] }: { tags: string[] } = $props();
</script>

<div class="tags-container">
  {#each tags as tag}
    <span class="tag">{tag}</span>
  {/each}
</div>

<style>
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0;
  }

  .tag {
    background-color: var(--background-secondary);
    color: var(--text-primary);
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.9em;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
