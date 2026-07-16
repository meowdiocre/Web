<script>
  import Field from '$lib/components/Field.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import AdminSectionLegend from '$lib/components/admin/AdminSectionLegend.svelte';

  /**
   * @typedef {{ slug: string, label: string }} CategoryOption
   * @typedef {{ slug: string, label: string, postCount: number }} DeleteCategory
   * @typedef {Object} Props
   * @property {boolean} open
   * @property {DeleteCategory} category
   * @property {CategoryOption[]} categories
   * @property {() => void} onclose
   */

  /** @type {Props} */
  let { open, category, categories, onclose } = $props();

  const alternatives = $derived(categories.filter((item) => item.slug !== category.slug));
  let strategy = $state(/** @type {'move'|'delete-posts'} */ ('move'));
  let previousCategory = $state('');

  $effect(() => {
    if (previousCategory === category.slug) return;
    previousCategory = category.slug;
    strategy = category.postCount > 0 && alternatives.length > 0 ? 'move' : 'delete-posts';
  });

  const submitLabel = $derived(
    category.postCount === 0
      ? 'delete category'
      : strategy === 'move'
        ? 'move posts and delete'
        : 'delete posts and category'
  );
</script>

<Modal {open} {onclose} size="sm" title="delete category?">
  <form method="POST" action="?/delete" class="grid gap-5">
    <input type="hidden" name="categorySlug" value={category.slug} />
    <input type="hidden" name="expectedCount" value={category.postCount} />

    <div class="grid gap-1.5">
      <p class="font-serif text-[18px] text-paper">{category.label}</p>
      <p class="font-mono text-[11px] tracking-[0.04em] text-muted">
        {category.postCount} {category.postCount === 1 ? 'post' : 'posts'} assigned
      </p>
    </div>

    {#if category.postCount === 0}
      <input type="hidden" name="strategy" value="delete-posts" />
      <input type="hidden" name="confirmation" value="DELETE 0" />
      <p class="text-[13px] leading-5 text-muted">This category is unused and can be deleted safely.</p>
    {:else}
      <fieldset class="grid gap-2 border-t border-[var(--line-soft)] pt-4">
        <AdminSectionLegend title="resolve assigned posts" class="mb-2" />

        <label class="flex min-h-11 cursor-pointer items-start gap-3 border border-[var(--line-soft)] p-3 has-[:checked]:border-rose has-[:checked]:bg-accent-wash">
          <input
            type="radio"
            name="strategy"
            value="move"
            bind:group={strategy}
            disabled={alternatives.length === 0}
            class="mt-1 accent-[var(--accent)]"
          />
          <span>
            <b class="block font-sans text-sm font-medium text-paper">move {category.postCount} posts</b>
            <span class="mt-1 block text-[12px] leading-5 text-muted">Keep every post and move it to another category.</span>
          </span>
        </label>

        <label class="flex min-h-11 cursor-pointer items-start gap-3 border border-[var(--line-soft)] p-3 has-[:checked]:border-crimson has-[:checked]:bg-crimson-deep/20">
          <input
            type="radio"
            name="strategy"
            value="delete-posts"
            bind:group={strategy}
            class="mt-1 accent-[var(--accent)]"
          />
          <span>
            <b class="block font-sans text-sm font-medium text-rose">permanently delete posts</b>
            <span class="mt-1 block text-[12px] leading-5 text-muted">This requires <span class="font-mono text-paper">DELETE {category.postCount}</span>.</span>
          </span>
        </label>
      </fieldset>

      {#if strategy === 'move'}
        <Field
          name="replacementSlug"
          label="replacement category"
          kind="select"
          value={alternatives[0]?.slug ?? ''}
          options={alternatives.map((item) => ({ value: item.slug, label: item.label }))}
          required
        />
      {:else}
        <Field
          name="confirmation"
          label={`type DELETE ${category.postCount}`}
          placeholder={`DELETE ${category.postCount}`}
          required
        />
      {/if}
    {/if}

    <div class="flex flex-wrap gap-2 border-t border-[var(--line-soft)] pt-4">
      <AdminButton icon="close" label="cancel" onclick={onclose} />
      <div class="ml-auto">
        <AdminButton
          type="submit"
          icon="trash"
          label={submitLabel}
          loadingLabel="deleting..."
          variant="danger"
        />
      </div>
    </div>
  </form>
</Modal>
