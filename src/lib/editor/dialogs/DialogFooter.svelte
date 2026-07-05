<script>
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

<button type="button" class="btn-ghost" onclick={onCancel}>{cancelLabel}</button>

{#if mode === 'edit' && onRemove}
  <button type="button" class="btn-danger" onclick={onRemove}>{removeLabel}</button>
{/if}

<button
  type="button"
  class="btn-primary ml-auto"
  disabled={!canSubmit}
  onclick={onSubmit}
>
  {confirmLabel}
</button>
