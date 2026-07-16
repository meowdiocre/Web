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
    <label class="grid min-w-0 gap-2">
      <span class="font-mono text-2xs tracking-meta text-muted">quote text</span>
      <textarea bind:value={text} class="min-h-20 w-full resize-y rounded-none border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper focus:outline-2 focus:outline-offset-2 focus:outline-rose" rows="4"
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
