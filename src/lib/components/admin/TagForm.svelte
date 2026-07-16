<script>
  import Field from '$lib/components/Field.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';

  /** @type {{ values?: Record<string, string>, message?: string }} */
  let { values = {}, message = '' } = $props();
</script>

<form method="POST" action="?/create" class="grid gap-6">
  <FormAlert {message} />
  <Field
    name="label"
    label="label"
    value={values.label ?? ''}
    placeholder="What readers see"
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
        help="Tag URLs stay stable after creation."
      />
    </div>
  </details>

  <div class="border-t border-[var(--line-soft)] pt-4">
    <AdminButton
      type="submit"
      icon="plus"
      label="create tag"
      loadingLabel="creating..."
      variant="primary"
    />
  </div>
</form>
