<script>
  import AdminButton from '$lib/components/admin/AdminButton.svelte';

  /**
   * @typedef {Object} TagRow
   * @property {string} slug
   * @property {string} label
   * @property {number} postCount
   * @typedef {Object} Props
   * @property {TagRow[]} tags
   * @property {(tag: TagRow) => void} ondelete
   */
  /** @type {Props} */
  let { tags, ondelete } = $props();
</script>

<ul class="grid border-t border-[var(--line-soft)]">
  {#each tags as tag (tag.slug)}
    <li class="grid gap-3 border-b border-[var(--line-soft)] py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <form method="POST" action="?/update" class="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <input type="hidden" name="slug" value={tag.slug} />
        <label class="grid min-w-0 gap-1.5">
          <span class="font-mono text-[10px] tracking-[0.06em] text-muted">/{tag.slug} · {tag.postCount} {tag.postCount === 1 ? 'post' : 'posts'}</span>
          <input
            class="min-h-11 w-full border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper outline outline-2 outline-transparent outline-offset-1 hover:border-[var(--line-strong)] focus-visible:border-rose focus-visible:outline-rose"
            name="label"
            value={tag.label}
            aria-label={`label for ${tag.label}`}
            required
          />
        </label>
        <AdminButton
          type="submit"
          icon="save"
          label="save"
          ariaLabel={`save ${tag.label}`}
          loadingLabel="saving..."
        />
      </form>

      <AdminButton
        icon="trash"
        label="delete"
        ariaLabel={`delete ${tag.label}`}
        variant="danger"
        onclick={() => ondelete(tag)}
      />
    </li>
  {/each}
</ul>
