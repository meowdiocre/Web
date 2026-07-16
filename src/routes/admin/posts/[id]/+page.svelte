<script>
  import Field         from '$lib/components/Field.svelte';
  import AdminButton   from '$lib/components/admin/AdminButton.svelte';
  import FormAlert     from '$lib/components/admin/FormAlert.svelte';
  import ThumbnailField from '$lib/components/admin/ThumbnailField.svelte';
  import PixelIcon     from '$lib/components/PixelIcon.svelte';
  import StatusPill    from '$lib/components/StatusPill.svelte';
  import ConfirmDialog from '$lib/editor/dialogs/ConfirmDialog.svelte';
  import { toDatetimeLocalValue } from '$lib/util/dates';
  import { composeTitle } from '$lib/util/strings';

  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();
  const p = $derived(data.post);
  const postTitle = $derived(composeTitle({ pre: p.titlePre, em: p.titleEm, post: p.titlePost }));

  /** @type {HTMLFormElement|undefined}   */ let formEl = $state();
  /** @type {HTMLButtonElement|undefined} */ let deleteSubmitter = $state();

  let confirmingDelete = $state(false);

  const v = $derived({
    /** @param {string} key @param {string} [fallback] */
    get: (key, fallback = '') => form?.ok === false ? form.values?.[key] ?? fallback : fallback
  });

  function runDelete() {
    confirmingDelete = false;
    if (formEl && deleteSubmitter) formEl.requestSubmit(deleteSubmitter);
  }
</script>

<svelte:head><title>{postTitle} | Admin</title></svelte:head>

<header class="flex items-baseline justify-between flex-wrap gap-4 mb-8">
  <div class="min-w-0">
    <p class="font-mono text-[10px] tracking-[0.12em] text-muted mb-1 truncate">
      ~/admin/posts/{p.slug}
    </p>
    <div class="flex items-center gap-3">
      <PixelIcon name="article" size={22} />
      <h1 class="min-w-0 [overflow-wrap:anywhere] font-display text-[clamp(24px,3vw,38px)] tracking-[-0.015em] leading-[1.05]">
        {p.titlePre}<em class="not-italic text-rose">{p.titleEm}</em>{p.titlePost}
      </h1>
    </div>
    <p class="mt-2 font-mono text-[11px] tracking-[0.08em]">
      status: <StatusPill value={p.status} />
    </p>
  </div>

  <AdminButton href="/admin/posts/{p.id}/edit" icon="pencil" label="edit body" />
</header>

<div class="flex items-center flex-wrap gap-2 mb-6">
  {#if p.status === 'draft'}
    <form method="POST" action="?/publish">
      <AdminButton type="submit" icon="send" label="publish now" variant="primary" />
    </form>
  {:else}
    <form method="POST" action="?/unpublish">
      <AdminButton type="submit" icon="archive" label="unpublish" />
    </form>
  {/if}

  <form method="POST" action="?/preview">
    <AdminButton type="submit" icon="eye" label="make preview link" />
  </form>

  {#if form?.ok === true && form.previewUrl}
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

<form bind:this={formEl} method="POST" action="?/update" class="grid gap-5 max-w-[720px]">
  {#if form?.ok === true && form.message}
    <FormAlert tone="success" message={form.message} />
  {/if}
  {#if form?.ok === false}
    <FormAlert message={form.message} />
  {/if}

  <div class="grid gap-4 sm:grid-cols-2">
    <Field name="slug" label="slug" value={v.get('slug', p.slug)} required />

    <Field name="category" label="category" kind="select" required>
      {#each data.categories as c (c.slug)}
        <option
          value={c.slug}
          selected={(form?.ok === false ? form.values?.category : p.category) === c.slug}
        >{c.label}</option>
      {/each}
    </Field>
  </div>

  <div class="grid gap-4 md:grid-cols-[1fr_1.6fr_1fr]">
    <Field name="titlePre"  label="title pre"    value={v.get('titlePre',  p.titlePre)} />
    <Field name="titleEm"   label="title emphasis" value={v.get('titleEm',   p.titleEm)} />
    <Field name="titlePost" label="title post"   value={v.get('titlePost', p.titlePost)} />
  </div>

  <Field
    name="dek"
    label="dek (subtitle)"
    kind="textarea"
    rows={3}
    value={v.get('dek', p.dek)}
  />

  <div>
    <Field name="author" label="author"
           value={v.get('author', p.author)} />
  </div>

  <ThumbnailField value={v.get('coverImageUrl', p.coverImageUrl ?? '')} />

  <Field
    name="publishAt"
    label="publish at (UTC, optional, used by scheduled publish)"
    kind="datetime"
    value={v.get('publishAt', toDatetimeLocalValue(p.publishAt))}
  />

  <div class="flex flex-wrap items-center gap-2 mt-2">
    <AdminButton type="submit" icon="save" label="save metadata" variant="primary" />
    <AdminButton href="/admin" icon="article" label="back" />

    <button
      type="submit"
      formaction="?/delete"
      formnovalidate
      bind:this={deleteSubmitter}
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
    >submit delete</button>

    <div class="sm:ml-auto">
      <AdminButton icon="trash" label="delete" variant="danger" onclick={() => (confirmingDelete = true)} />
    </div>
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
