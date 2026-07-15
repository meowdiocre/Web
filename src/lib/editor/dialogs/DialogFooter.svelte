<script>
  import AdminButton from '$lib/components/admin/AdminButton.svelte';

  /**
   * @typedef {Object} Props
   * @property {'insert'|'edit'} [mode]
   * @property {string} [insertLabel]
   * @property {string} [saveLabel]
   * @property {string} [removeLabel]
   * @property {string} [cancelLabel]
   * @property {boolean} [canSubmit]
   * @property {() => void} onCancel
   * @property {() => void} onSubmit
   * @property {() => void} [onRemove]
   */

  /** @type {Props} */
  let {
    mode = 'insert',
    insertLabel = 'insert',
    saveLabel   = 'save',
    removeLabel = 'delete',
    cancelLabel = 'cancel',
    canSubmit   = true,
    onCancel,
    onSubmit,
    onRemove
  } = $props();

  const confirmLabel = $derived(mode === 'edit' ? saveLabel : insertLabel);
</script>

<AdminButton icon="close" label={cancelLabel} onclick={onCancel} />

{#if mode === 'edit' && onRemove}
  <AdminButton icon="trash" label={removeLabel} variant="danger" onclick={onRemove} />
{/if}

<div class="ml-auto">
  <AdminButton
    icon={mode === 'edit' ? 'save' : 'plus'}
    label={confirmLabel}
    variant="primary"
    disabled={!canSubmit}
    onclick={onSubmit}
  />
</div>
