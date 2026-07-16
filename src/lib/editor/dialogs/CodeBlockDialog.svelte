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
      <label class="grid min-w-0 gap-2">
        <span class="font-mono text-2xs tracking-meta text-muted">language</span>
        <select
          bind:value={lang}
          class="w-full rounded-none border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper focus:outline-2 focus:outline-offset-2 focus:outline-rose"
        >
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

    <label class="grid min-w-0 gap-2">
      <span class="font-mono text-2xs tracking-meta text-muted">source</span>
      <textarea
        bind:value={source}
        class="code-area min-h-[220px] w-full resize-y whitespace-pre rounded-none border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-mono text-[13px] leading-[1.55] text-paper focus:outline-2 focus:outline-offset-2 focus:outline-rose [tab-size:2]"
        rows="14"
        spellcheck="false"
        autocomplete="off"
        placeholder="paste your code here"
      ></textarea>
    </label>

    <label class="grid min-w-0 gap-2">
      <span class="font-mono text-2xs tracking-meta text-muted">caption (optional)</span>
      <input
        bind:value={caption}
        class="w-full rounded-none border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper focus:outline-2 focus:outline-offset-2 focus:outline-rose"
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
