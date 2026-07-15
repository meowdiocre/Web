<script>
  import Modal from '$lib/components/Modal.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import DialogFooter from './DialogFooter.svelte';
  import { LANG_OPTIONS, detectLang, normaliseLang } from '$lib/editor/lang';

  /**
   * @typedef {{ source: string; lang: string; caption: string }} CodeBlockAttrs
   *
   * @typedef {Object} Props
   * @property {boolean}                            open
   * @property {'insert'|'edit'}                    [mode]
   * @property {CodeBlockAttrs}                     [initial]
   * @property {(attrs: CodeBlockAttrs) => void}    onsubmit
   * @property {() => void}                         onclose
   * @property {() => void}                         [onremove]
   */

  /** @type {Props} */
  let {
    open = false,
    mode = 'insert',
    initial = { source: '', lang: 'plaintext', caption: '' },
    onsubmit,
    onclose,
    onremove
  } = $props();

  let source  = $state('');
  let lang    = $state('plaintext');
  let caption = $state('');

  $effect(() => {
    if (open) {
      source  = initial.source ?? '';
      lang    = normaliseLang(initial.lang);
      caption = initial.caption ?? '';
    }
  });

  function autoDetect() { lang = detectLang(source); }

  function commit() {
    onsubmit({ source, lang: normaliseLang(lang), caption });
  }
</script>

<Modal {open} {onclose} size="lg" title={mode === 'edit' ? 'edit code block' : 'insert code block'}>
  <form onsubmit={(e) => { e.preventDefault(); commit(); }} class="grid gap-3">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
      <label class="field">
        <span class="lbl">language</span>
        <select bind:value={lang} class="inp">
          {#each LANG_OPTIONS as opt (opt.value)}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </label>

      <div class="self-end">
        <AdminButton
          icon="cpu"
          label="auto-detect"
          disabled={!source.trim()}
          onclick={autoDetect}
        />
      </div>
    </div>

    <label class="field">
      <span class="lbl">source</span>
      <textarea
        bind:value={source}
        class="inp code-area"
        rows="14"
        spellcheck="false"
        autocomplete="off"
        placeholder="paste your code here"
      ></textarea>
    </label>

    <label class="field">
      <span class="lbl">caption (optional)</span>
      <input
        bind:value={caption}
        class="inp"
        placeholder="figure: e.g. core.py · main entry point"
      />
    </label>
  </form>

  {#snippet footer()}
    <DialogFooter
      {mode}
      removeLabel="delete block"
      onCancel={onclose}
      onRemove={onremove}
      onSubmit={commit}
    />
  {/snippet}
</Modal>

<style>
  .code-area {
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.55;
    min-height: 220px;
    tab-size: 2;
    white-space: pre;
  }
</style>
