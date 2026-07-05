<script>
  import Modal from '$lib/components/Modal.svelte';
  import DialogFooter from './DialogFooter.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean}                 open
   * @property {'insert'|'edit'}         [mode]
   * @property {string}                  [initialText]
   * @property {(text: string) => void}  onsubmit
   * @property {() => void}              onclose
   * @property {() => void}              [onremove]
   */

  /** @type {Props} */
  let { open = false, mode = 'insert', initialText = '', onsubmit, onclose, onremove } = $props();

  let text = $state('');

  $effect(() => { if (open) text = initialText ?? ''; });

  const canSubmit = $derived(!!text.trim());
  const commit    = () => { if (canSubmit) onsubmit(text.trim()); };
</script>

<Modal {open} {onclose} title={mode === 'edit' ? 'edit pull quote' : 'insert pull quote'}>
  <form onsubmit={(e) => { e.preventDefault(); commit(); }} class="grid gap-3">
    <label class="field">
      <span class="lbl">quote text</span>
      <textarea bind:value={text} class="inp" rows="4"
                placeholder="the line worth pulling out"></textarea>
    </label>
  </form>

  {#snippet footer()}
    <DialogFooter
      {mode}
      removeLabel="delete quote"
      {canSubmit}
      onCancel={onclose}
      onRemove={onremove}
      onSubmit={commit}
    />
  {/snippet}
</Modal>
