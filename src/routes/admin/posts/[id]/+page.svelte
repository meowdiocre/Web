<script>
  import Field         from '$lib/components/Field.svelte';
  import StatusPill    from '$lib/components/StatusPill.svelte';
  import ConfirmDialog from '$lib/editor/dialogs/ConfirmDialog.svelte';

  /** @type {{
   *    data: {
   *      post: any,
   *      categories: { slug: string, label: string }[]
   *    },
   *    form: {
   *      saved?: boolean,
   *      error?: string,
   *      previewUrl?: string,
   *      values?: Record<string,string>
   *    }|null
   *  }} */
  let { data, form } = $props();
  const p = $derived(data.post);

  /** @type {HTMLFormElement|undefined}   */ let formEl = $state();
  /** @type {HTMLButtonElement|undefined} */ let deleteSubmitter = $state();

  let confirmingDelete = $state(false);

  /** Format a Date for <input type="datetime-local"> in UTC. @param {Date|null} d */
  function asLocalInput(d) {
    if (!d) return '';
    const dt  = new Date(d);
    const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
    return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}` +
           `T${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}`;
  }

  /** Convenience accessor: prefer form values (post-failure repaint) over post values. */
  const v = $derived({
    /** @param {string} key @param {string} [fallback] */
    get: (key, fallback = '') => form?.values?.[key] ?? fallback
  });

  /**
   * Submit the metadata form against the `?/delete` action by
   * triggering the hidden submitter. `requestSubmit(submitter)`
   * preserves the submitter's `formaction` so SvelteKit routes to
   * the correct named action.
   */
  function runDelete() {
    confirmingDelete = false;
    if (formEl && deleteSubmitter) formEl.requestSubmit(deleteSubmitter);
  }
</script>

<svelte:head><title>{p.titlePre}{p.titleEm}{p.titlePost} — Admin</title></svelte:head>

<header class="flex items-baseline justify-between flex-wrap gap-4 mb-8">
  <div class="min-w-0">
    <p class="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-warm mb-1 truncate">
      ~/admin/posts/{p.slug}
    </p>
    <h1 class="font-display text-[clamp(24px,3vw,38px)] uppercase tracking-[-0.015em] leading-[1.05]">
      {p.titlePre}<em class="text-rose">{p.titleEm}</em>{p.titlePost}
    </h1>
    <p class="mt-2 font-mono text-[11px] tracking-[0.18em] uppercase">
      status: <StatusPill value={p.status} />
    </p>
  </div>

  <a
    href="/admin/posts/{p.id}/edit"
    class="shrink-0 font-mono text-[11px] tracking-[0.18em] uppercase
           border border-rose px-4 py-2 text-rose hover:bg-rose hover:text-ink"
  >
    edit body →
  </a>
</header>

<!-- Workflow actions ---------------------------------------------- -->
<div class="flex items-center flex-wrap gap-2 mb-6">
  {#if p.status === 'draft'}
    <form method="POST" action="?/publish">
      <button class="btn-primary">publish now</button>
    </form>
  {:else}
    <form method="POST" action="?/unpublish">
      <button class="btn-ghost">unpublish</button>
    </form>
  {/if}

  <form method="POST" action="?/preview">
    <button class="btn-ghost">make preview link</button>
  </form>

  {#if form?.previewUrl}
    <a
      href={form.previewUrl}
      target="_blank"
      rel="noopener"
      class="basis-full md:basis-auto md:ml-2 font-mono text-[11px] tracking-[0.1em]
             text-rose underline break-all"
    >
      {form.previewUrl}
    </a>
  {/if}
</div>

<!-- Metadata form -------------------------------------------------- -->
<form bind:this={formEl} method="POST" action="?/update" class="grid gap-5 max-w-[720px]">
  {#if form?.saved}
    <p class="border border-rose text-rose px-3 py-2 font-mono text-[12px]">saved.</p>
  {/if}
  {#if form?.error}
    <p class="border border-crimson text-crimson px-3 py-2 font-mono text-[12px]">{form.error}</p>
  {/if}

  <div class="grid gap-4 sm:grid-cols-2">
    <Field name="slug" label="slug" value={v.get('slug', p.slug)} required />

    <Field name="category" label="category" kind="select" required>
      {#each data.categories as c (c.slug)}
        <option
          value={c.slug}
          selected={(form?.values?.category ?? p.category) === c.slug}
        >{c.label}</option>
      {/each}
    </Field>
  </div>

  <div class="grid gap-4 md:grid-cols-[1fr_1.6fr_1fr]">
    <Field name="titlePre"  label="title — pre"             value={v.get('titlePre',  p.titlePre)} />
    <Field name="titleEm"   label="title — italic emphasis" value={v.get('titleEm',   p.titleEm)} />
    <Field name="titlePost" label="title — post"            value={v.get('titlePost', p.titlePost)} />
  </div>

  <Field
    name="dek"
    label="dek (subtitle)"
    kind="textarea"
    rows={3}
    value={v.get('dek', p.dek)}
  />

  <div class="grid gap-4 sm:grid-cols-2">
    <Field name="readTime" label="read time"
           value={v.get('readTime', p.readTime)} placeholder="e.g. 22 min read" />
    <Field name="author" label="author"
           value={v.get('author', p.author)} />
  </div>

  <Field
    name="coverImageUrl"
    label="cover image url (optional)"
    value={v.get('coverImageUrl', p.coverImageUrl ?? '')}
    placeholder="https://…"
  />

  <Field
    name="publishAt"
    label="publish at (UTC, optional — used by scheduled publish)"
    kind="datetime"
    value={v.get('publishAt', asLocalInput(p.publishAt))}
  />

  <!-- Action bar: save | back ............... delete -->
  <div class="flex flex-wrap items-center gap-2 mt-2">
    <button class="btn-primary">save metadata</button>
    <a href="/admin" class="btn-ghost">back</a>

    <!-- Hidden submitter — visible "delete" is type=button so it opens
         the confirm modal instead of submitting. The modal then calls
         formEl.requestSubmit(deleteSubmitter), preserving formaction. -->
    <button
      type="submit"
      formaction="?/delete"
      formnovalidate
      bind:this={deleteSubmitter}
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
    >submit delete</button>

    <button
      type="button"
      class="btn-danger sm:ml-auto"
      onclick={() => (confirmingDelete = true)}
    >delete</button>
  </div>
</form>

<ConfirmDialog
  open={confirmingDelete}
  title="delete post?"
  message="This permanently removes the post and its body. There is no undo."
  confirmLabel="delete permanently"
  tone="danger"
  onconfirm={runDelete}
  onclose={() => (confirmingDelete = false)}
/>

<style>
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
