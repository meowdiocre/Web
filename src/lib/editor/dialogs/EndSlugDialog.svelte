<!--
  EndSlugDialog edits the article's terminal slug (`· · ·`).
-->
<script>
  import Modal from '$lib/components/Modal.svelte';
  import DialogFooter from './DialogFooter.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean}                  open
   * @property {'insert'|'edit'}          [mode]
   * @property {string}                   [initialText]
   * @property {(text: string) => void}   onsubmit
   * @property {() => void}               onclose
   * @property {() => void}               [onremove]
   */

  /** @type {Props} */
  let { open = false, mode = 'insert', initialText = '· · ·', onsubmit, onclose, onremove } = $props();

  let text = $state('· · ·');
  $effect(() => { if (open) text = initialText || '· · ·'; });

  const commit = () => onsubmit(text.trim() || '· · ·');
</script>

<Modal {open} {onclose} size="sm" title={mode === 'edit' ? 'edit end slug' : 'insert end slug'}>
  <form onsubmit={(e) => { e.preventDefault(); commit(); }} class="grid gap-3">
    <label class="field">
      <span class="lbl">text</span>
      <input bind:value={text} class="inp" />
    </label>
  </form>

  {#snippet footer()}
    <DialogFooter
      {mode}
      removeLabel="remove"
      onCancel={onclose}
      onRemove={onremove}
      onSubmit={commit}
    />
  {/snippet}
</Modal>
