<script>
  import Field         from '$lib/components/Field.svelte';
  import AdminButton   from '$lib/components/admin/AdminButton.svelte';
  import AdminSectionLegend from '$lib/components/admin/AdminSectionLegend.svelte';
  import FormAlert     from '$lib/components/admin/FormAlert.svelte';
  import PageHeader    from '$lib/components/admin/PageHeader.svelte';
  import PostSeoFields from '$lib/components/admin/PostSeoFields.svelte';
  import ThumbnailField from '$lib/components/admin/ThumbnailField.svelte';
  import TagMultiSelect from '$lib/components/admin/TagMultiSelect.svelte';
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
  let deleting = $state(false);

  const v = $derived({
    /** @param {string} key @param {string} [fallback] */
    get: (key, fallback = '') => form?.ok === false ? form.values?.[key] ?? fallback : fallback
  });
  const seoValues = $derived({
    seoTitle: v.get('seoTitle', p.seoTitle ?? ''),
    seoDescription: v.get('seoDescription', p.seoDescription ?? ''),
    canonicalUrl: v.get('canonicalUrl', p.canonicalUrl ?? ''),
    socialImageUrl: v.get('socialImageUrl', p.socialImageUrl ?? ''),
    socialImageAlt: v.get('socialImageAlt', p.socialImageAlt ?? ''),
    noIndex: v.get('noIndex', String(p.noIndex))
  });

  function runDelete() {
    if (!formEl || !deleteSubmitter) return;
    deleting = true;
    formEl.requestSubmit(deleteSubmitter);
  }
</script>

<svelte:head><title>{postTitle} | Admin</title></svelte:head>

<PageHeader icon="article" eyebrow={`~/admin/posts/${p.slug}`} title={postTitle}>
  {#snippet actions()}
    <AdminButton href="/admin/posts/{p.id}/edit" icon="pencil" label="edit body" />
  {/snippet}
</PageHeader>

<div class="mb-8 flex flex-wrap items-center gap-2 border-b border-[var(--line-soft)] pb-4">
  <span class="mr-2 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-muted">
    status <StatusPill value={p.status} />
  </span>

  {#if p.status === 'draft'}
    <form method="POST" action="?/publish">
      <AdminButton
        type="submit"
        icon="send"
        label="publish now"
        loadingLabel="publishing..."
        variant="primary"
      />
    </form>
  {:else}
    <form method="POST" action="?/unpublish">
      <AdminButton
        type="submit"
        icon="archive"
        label="unpublish"
        loadingLabel="updating..."
      />
    </form>
  {/if}

  <form method="POST" action="?/preview">
    <AdminButton
      type="submit"
      icon="eye"
      label="make preview link"
      loadingLabel="creating..."
    />
  </form>

  {#if form?.ok === true && form.previewUrl}
    <a
      href={form.previewUrl}
      target="_blank"
      rel="noopener"
      class="basis-full break-all pt-2 font-mono text-[11px] tracking-[0.03em] text-rose underline underline-offset-4 md:ml-2 md:basis-auto md:pt-0"
    >
      {form.previewUrl}
    </a>
  {/if}
</div>

<form
  bind:this={formEl}
  method="POST"
  action="?/update"
  class="grid max-w-[820px] gap-8 pb-20 2xl:max-w-[1200px] 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:items-start 2xl:gap-x-10"
>
  {#if form?.ok === true && form.message}
    <div class="2xl:col-span-2">
      <FormAlert tone="success" message={form.message} />
    </div>
  {/if}
  {#if form?.ok === false}
    <div class="2xl:col-span-2">
      <FormAlert message={form.message} />
    </div>
  {/if}

  <fieldset class="grid gap-5 border-t border-[var(--line-soft)] pt-5 2xl:col-start-1 2xl:row-span-3">
    <AdminSectionLegend title="content" />
    <p class="-mt-2 max-w-[65ch] text-[13px] leading-5 text-muted">
      Control the public URL, title treatment, author, and article summary.
    </p>

    <div class="grid gap-4 sm:grid-cols-2">
      <Field name="slug" label="slug" value={v.get('slug', p.slug)} required />

      <Field
        name="category"
        label="category"
        kind="select"
        value={form?.ok === false ? form.values?.category : p.category}
        options={data.categories.map((category) => ({
          value: category.slug,
          label: category.label
        }))}
        required
      />
    </div>

    <div class="grid gap-4 md:grid-cols-[1fr_1.6fr_1fr]">
      <Field name="titlePre" label="title pre" value={v.get('titlePre', p.titlePre)} />
      <Field name="titleEm" label="title emphasis" value={v.get('titleEm', p.titleEm)} />
      <Field name="titlePost" label="title post" value={v.get('titlePost', p.titlePost)} />
    </div>

    <Field
      name="dek"
      label="dek (subtitle)"
      kind="textarea"
      rows={3}
      value={v.get('dek', p.dek)}
    />

    <div class="max-w-[360px]">
      <Field name="author" label="author" value={v.get('author', p.author)} />
    </div>

    <TagMultiSelect
      tags={data.tags}
      selected={form?.ok === false ? form.tagSlugs ?? data.postTagSlugs : data.postTagSlugs}
    />
  </fieldset>

  <fieldset class="grid gap-4 border-t border-[var(--line-soft)] pt-5 2xl:col-start-2">
    <AdminSectionLegend title="media" />
    <p class="-mt-2 max-w-[65ch] text-[13px] leading-5 text-muted">
      The thumbnail is used on article lists and as the default social preview image.
    </p>
    <ThumbnailField value={v.get('coverImageUrl', p.coverImageUrl ?? '')} />
  </fieldset>

  <div class="2xl:col-start-2">
    <PostSeoFields
      values={seoValues}
      fallbackTitle={postTitle}
      fallbackDescription={p.dek}
      fallbackImageUrl={p.coverImageUrl ?? ''}
    />
  </div>

  <fieldset class="grid gap-4 border-t border-[var(--line-soft)] pt-5 2xl:col-start-2">
    <AdminSectionLegend title="publishing" />
    <p class="-mt-2 max-w-[65ch] text-[13px] leading-5 text-muted">
      Leave the schedule empty to publish manually.
    </p>
    <Field
      name="publishAt"
      label="scheduled publish time (UTC)"
      kind="datetime"
      value={v.get('publishAt', toDatetimeLocalValue(p.publishAt))}
    />
  </fieldset>

  <div class="-mx-3 flex flex-wrap items-center gap-2 border-y border-[var(--line-soft)] bg-ink/95 px-3 py-3 backdrop-blur-sm md:sticky md:bottom-0 md:z-20 2xl:col-span-2">
    <AdminButton
      type="submit"
      icon="save"
      label="save metadata"
      loadingLabel="saving..."
      variant="primary"
    />
    <AdminButton href="/admin" icon="article" label="back to posts" />

    <button
      type="submit"
      formaction="?/delete"
      formnovalidate
      bind:this={deleteSubmitter}
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
    >submit delete</button>

    <div class="ml-auto">
      <AdminButton icon="trash" label="delete" variant="danger" onclick={() => (confirmingDelete = true)} />
    </div>
  </div>
</form>

<ConfirmDialog
  open={confirmingDelete}
  title="delete post?"
  message="This permanently removes the post and its body. There is no undo."
  confirmLabel="delete permanently"
  pending={deleting}
  pendingLabel="deleting..."
  tone="danger"
  onconfirm={runDelete}
  onclose={() => {
    deleting = false;
    confirmingDelete = false;
  }}
/>
