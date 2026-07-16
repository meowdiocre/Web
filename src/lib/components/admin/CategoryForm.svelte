<script>
  import Field from '$lib/components/Field.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import CategoryIconPicker from '$lib/components/admin/CategoryIconPicker.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} [action]
   * @property {string} [submitLabel]
   * @property {Record<string, string>} [values]
   * @property {string} [message]
   * @property {import('svelte').Snippet} [footer]
   */

  /** @type {Props} */
  let {
    action = '',
    submitLabel = 'create category',
    values = {},
    message = '',
    footer
  } = $props();
</script>

<form method="POST" action={action} class="grid gap-6">
  <FormAlert {message} />

  <Field
    name="label"
    label="label"
    value={values.label ?? ''}
    placeholder="What editors and readers see"
    required
  />

  <details class="group border-t border-[var(--line-soft)] pt-3" open={Boolean(values.slug?.trim())}>
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
        help="Category slugs should stay short and stable."
      />
    </div>
  </details>

  <CategoryIconPicker value={values.icon ?? 'book-open'} />

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
