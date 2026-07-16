<script>
  import { tagPath } from '$lib/blog/urls';

  /** @type {{ tags: Array<{ slug: string, label: string }> }} */
  let { tags } = $props();
</script>

{#if tags.length > 0}
  <nav class="px-[var(--gutter)] pb-8" aria-label="Article tags">
    <div class="mx-auto flex max-w-[760px] flex-wrap gap-2 border-t border-[var(--rule)] pt-4">
      {#each tags as tag (tag.slug)}
        <a
          href={tagPath(tag.slug)}
          class="inline-flex min-h-10 items-center border border-[var(--rule)] px-3 py-2 font-mono text-[10px] tracking-[0.1em] uppercase text-muted transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >{tag.label}</a>
      {/each}
    </div>
  </nav>
{/if}
