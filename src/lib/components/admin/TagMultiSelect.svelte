<script>
  import AdminSectionLegend from '$lib/components/admin/AdminSectionLegend.svelte';

  /**
   * @typedef {{ slug: string, label: string }} TagOption
   * @typedef {Object} Props
   * @property {TagOption[]} tags
   * @property {string[]} [selected]
   */

  /** @type {Props} */
  let { tags, selected = [] } = $props();

  let query = $state('');
  let selectedSlugs = $state(/** @type {string[]} */ ([]));
  let selectedKey = $state('');

  $effect(() => {
    const nextKey = [...selected].sort().join('\u0000');
    if (selectedKey === nextKey) return;
    selectedKey = nextKey;
    selectedSlugs = [...new Set(selected)];
  });

  const selectedTags = $derived(tags.filter((tag) => selectedSlugs.includes(tag.slug)));
  const availableTags = $derived.by(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return tags.filter((tag) => (
      !selectedSlugs.includes(tag.slug)
      && (!normalized
        || tag.label.toLocaleLowerCase().includes(normalized)
        || tag.slug.toLocaleLowerCase().includes(normalized))
    ));
  });

  /** @param {string} slug @param {boolean} checked */
  function toggle(slug, checked) {
    selectedSlugs = checked
      ? [...selectedSlugs, slug]
      : selectedSlugs.filter((selectedSlug) => selectedSlug !== slug);
  }
</script>

<fieldset class="grid gap-3 border-t border-[var(--line-soft)] pt-4">
  <AdminSectionLegend title="tags" />

  {#each selectedSlugs as slug (slug)}
    <input type="hidden" name="tags" value={slug} />
  {/each}

  <label class="grid gap-1.5">
    <span class="font-mono text-[11px] tracking-[0.05em] text-muted">search tags</span>
    <input
      type="search"
      bind:value={query}
      aria-label="search tags"
      placeholder="Filter by label or slug"
      class="min-h-11 w-full border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper outline outline-2 outline-transparent outline-offset-1 placeholder:text-muted hover:border-[var(--line-strong)] focus-visible:border-rose focus-visible:outline-rose"
    />
  </label>

  {#if selectedTags.length > 0}
    <div class="grid gap-1.5" aria-label="selected tags">
      <p class="font-mono text-[10px] tracking-[0.06em] text-muted">selected</p>
      {#each selectedTags as tag (tag.slug)}
        <label class="flex min-h-11 cursor-pointer items-center gap-3 border border-rose bg-accent-wash px-3 py-2">
          <input
            type="checkbox"
            checked
            aria-label={tag.label}
            class="accent-[var(--accent)]"
            onchange={(event) => toggle(tag.slug, event.currentTarget.checked)}
          />
          <span class="min-w-0 flex-1 font-sans text-[14px] text-paper">{tag.label}</span>
          <span class="font-mono text-[10px] text-muted">/{tag.slug}</span>
        </label>
      {/each}
    </div>
  {/if}

  <div class="grid max-h-64 gap-1 overflow-y-auto" aria-label="available tags">
    {#each availableTags as tag (tag.slug)}
      <label class="flex min-h-11 cursor-pointer items-center gap-3 border border-[var(--line-soft)] px-3 py-2 hover:border-rose hover:bg-accent-wash">
        <input
          type="checkbox"
          aria-label={tag.label}
          disabled={selectedSlugs.length >= 24}
          class="accent-[var(--accent)]"
          onchange={(event) => toggle(tag.slug, event.currentTarget.checked)}
        />
        <span class="min-w-0 flex-1 font-sans text-[14px] text-paper">{tag.label}</span>
        <span class="font-mono text-[10px] text-muted">/{tag.slug}</span>
      </label>
    {:else}
      <p class="py-3 font-mono text-[11px] text-muted">
        {tags.length === 0 ? 'Create tags before assigning them.' : 'No matching tags.'}
      </p>
    {/each}
  </div>

  <p class="font-sans text-[12px] leading-5 text-muted">Choose up to 24 tags.</p>
</fieldset>
