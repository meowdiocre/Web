<script>
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} [message]
   */

  /** @type {Props} */
  let { message = '' } = $props();
</script>

<form method="POST" action="?/import" enctype="multipart/form-data" class="grid gap-6">
  <FormAlert {message} />

  <label class="grid min-w-0 gap-1.5" for="post-file">
    <span class="font-mono text-[11px] tracking-[0.05em] text-muted">Markdown file</span>
    <input
      id="post-file"
      name="postFile"
      type="file"
      accept=".md,text/markdown"
      required
      class="min-h-11 w-full cursor-pointer rounded-none border border-[var(--line-soft)] bg-ink-2
             font-sans text-[13px] text-muted outline outline-2 outline-transparent outline-offset-1
             file:mr-3 file:min-h-11 file:cursor-pointer file:border-0 file:border-r
             file:border-[var(--line-soft)] file:bg-ink-3 file:px-3 file:font-mono file:text-[11px]
             file:tracking-[0.04em] file:text-paper hover:border-[var(--line-strong)]
             focus-visible:border-rose focus-visible:outline-rose"
    />
  </label>

  <p class="text-sm leading-5 text-muted">
    The file becomes a draft. Category and tag slugs must already exist.
  </p>

  <details class="group border-t border-[var(--line-soft)] pt-4">
    <summary
      class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-mono
             text-[11px] tracking-[0.04em] text-muted hover:text-rose focus-visible:outline-2
             focus-visible:outline-offset-2 focus-visible:outline-rose"
    >
      <span>format reference</span>
      <span class="text-[10px] group-open:hidden" aria-hidden="true">show</span>
      <span class="hidden text-[10px] group-open:inline" aria-hidden="true">hide</span>
    </summary>

    <div class="grid gap-3 pb-1 pt-2 text-[13px] leading-5 text-muted">
      <p>Frontmatter requires version, title, slug, category, dek, and author.</p>
      <p>Optional fields include emphasis, tags, cover, and SEO overrides.</p>
      <p>
        Use <code class="text-paper">[^id]</code> for sidenotes,
        <code class="text-paper">:::pull</code> for pull quotes,
        <code class="text-paper">:::end</code> for the closing slug, and
        <code class="text-paper">caption="Text"</code> after a code fence language.
      </p>
      <p>An image title becomes its visible caption. Raw HTML stays inert.</p>
    </div>
  </details>

  <div class="flex flex-wrap items-center gap-2 border-t border-[var(--line-soft)] pt-4">
    <AdminButton
      type="submit"
      icon="upload"
      label="import draft"
      loadingLabel="importing..."
      variant="primary"
    />
  </div>
</form>
