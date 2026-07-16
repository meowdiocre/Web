<script>
  import Field from '$lib/components/Field.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';

  /**
   * @typedef {{ slug: string, label: string }} CategoryOption
   *
   * @typedef {Object} Props
   * @property {CategoryOption[]} categories
   * @property {string} [action]
   * @property {string} [submitLabel]
   * @property {Record<string, string>} [values]
   * @property {string} [message]
   * @property {import('svelte').Snippet} [footer]
   */

  /** @type {Props} */
  let {
    categories,
    action = '',
    submitLabel = 'create draft',
    values = {},
    message = '',
    footer
  } = $props();
</script>

<form method="POST" action={action} class="grid gap-6">
  <FormAlert {message} />

  <Field
    name="title"
    label="title"
    value={values.title ?? ''}
    placeholder="Post title"
    required
  />

  <Field
    name="category"
    label="category"
    kind="select"
    value={values.category ?? ''}
    options={[
      { value: '', label: 'pick a category' },
      ...categories.map((category) => ({ value: category.slug, label: category.label }))
    ]}
    required
  />

  <a
    href="/admin/categories"
    class="-mt-3 w-fit font-mono text-[11px] tracking-[0.04em] text-muted underline decoration-[var(--line-strong)] underline-offset-4 hover:text-rose"
  >manage categories</a>

  <details class="group border-t border-[var(--line-soft)] pt-4" open={Boolean(values.slug?.trim())}>
    <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-mono text-[11px] tracking-[0.04em] text-muted hover:text-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose">
      <span>custom slug</span>
      <span class="text-[10px] group-open:hidden" aria-hidden="true">show</span>
      <span class="hidden text-[10px] group-open:inline" aria-hidden="true">hide</span>
    </summary>
    <div class="mt-2">
      <Field
        name="slug"
        label="slug"
        value={values.slug ?? ''}
        placeholder="leave blank to generate"
        help="Use lowercase letters, digits, and hyphens."
      />
    </div>
  </details>

  <div class="flex flex-wrap items-center gap-2 border-t border-[var(--line-soft)] pt-4">
    <AdminButton
      type="submit"
      icon="plus"
      label={submitLabel}
      loadingLabel="creating..."
      variant="primary"
    />
    {@render footer?.()}
  </div>
</form>
