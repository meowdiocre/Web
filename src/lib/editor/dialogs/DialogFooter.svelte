<!--
  DialogFooter — shared cancel | [delete] | confirm action row for
  every atom-authoring dialog (Link, Code, PullQuote, Sidenote, EndSlug).

  Used inside a Modal's `{#snippet footer()}` slot:

  ```svelte
  <Modal {open} {onclose} title="…">
    <form>…</form>
    {#snippet footer()}
      <DialogFooter
        mode={dialogMode}
        canSubmit={!!text.trim()}
        onCancel={onclose}
        onRemove={onremove}
        onSubmit={apply}
      />
    {/snippet}
  </Modal>
  ```
-->
<script>
  /**
   * @typedef {Object} Props
   * @property {'insert'|'edit'}      [mode]          drives the confirm label
   * @property {string}               [insertLabel]   override 'insert'
   * @property {string}               [saveLabel]     override 'save'
   * @property {string}               [removeLabel]   override 'delete'
   * @property {string}               [cancelLabel]   override 'cancel'
   * @property {boolean}              [canSubmit]     gates the confirm button
   * @property {() => void}           onCancel
   * @property {() => void}           onSubmit
   * @property {() => void}           [onRemove]      shown only when mode==='edit'
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
