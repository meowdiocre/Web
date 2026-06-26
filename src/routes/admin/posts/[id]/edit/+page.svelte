<script>
  import { onMount, onDestroy } from 'svelte';

  import Toast            from '$lib/components/Toast.svelte';
  import EditorToolbar    from '$lib/editor/components/EditorToolbar.svelte';
  import EditorCanvas     from '$lib/editor/components/EditorCanvas.svelte';
  import EditorStatusBar  from '$lib/editor/components/EditorStatusBar.svelte';

  import LinkDialog      from '$lib/editor/dialogs/LinkDialog.svelte';
  import CodeBlockDialog from '$lib/editor/dialogs/CodeBlockDialog.svelte';
  import PullQuoteDialog from '$lib/editor/dialogs/PullQuoteDialog.svelte';
  import SidenoteDialog  from '$lib/editor/dialogs/SidenoteDialog.svelte';
  import EndSlugDialog   from '$lib/editor/dialogs/EndSlugDialog.svelte';

  /* -----------------------------------------------------------------
   * Types
   * --------------------------------------------------------------- */

  /** @typedef {import('@tiptap/core').Editor} TiptapEditor */
  /** @typedef {{ source: string; lang: string; caption: string }} CodeAttrs */
  /** @typedef {{ ref: string; bodyHtml: string }} SidenoteAttrs */
  /** @typedef {null | 'link' | 'codeBlock' | 'pullQuote' | 'sidenote' | 'endSlug'} DialogName */
  /** @typedef {{ tag: string; glyph: string; message: string }} ToastPayload */

  /** @type {{ data: { post: any } }} */
  let { data } = $props();
  const post = $derived(data.post);

  /* -----------------------------------------------------------------
   * Editor state
   * --------------------------------------------------------------- */

  /** @type {HTMLDivElement|undefined} */
  let canvas = $state();
  /** @type {TiptapEditor|null} */
  let editor = $state(null);
  /** Bumped on every selection/transaction so toolbar isActive() re-evaluates. */
  let editorTick = $state(0);

  let wordCount = $state(0);
  let charCount = $state(0);

  /* -----------------------------------------------------------------
   * Save state (autosave + Ctrl-S)
   * --------------------------------------------------------------- */

  const AUTOSAVE_MS = 3000;

  let dirty       = $state(false);
  let saving      = $state(false);
  let lastSavedAt = $state(/** @type {Date|null} */(null));
  let saveError   = $state(/** @type {string|null} */(null));

  /** @type {ReturnType<typeof setTimeout>|null} */
  let saveTimer = null;

  async function save() {
    if (!editor) return;
    saving = true;
    saveError = null;
    try {
      const res = await fetch(`/admin/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ docJson: editor.getJSON() })
      });
      if (!res.ok) {
        saveError = `${res.status} ${(await res.text()).slice(0, 180)}`.trim();
        return;
      }
      lastSavedAt = new Date();
      dirty = false;
    } catch (err) {
      saveError = (err instanceof Error ? err.message : String(err)).slice(0, 200);
    } finally {
      saving = false;
    }
  }

  function scheduleSave() {
    dirty = true;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, AUTOSAVE_MS);
  }

  function saveNow() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    save();
  }

  /* -----------------------------------------------------------------
   * Dialog state
   * --------------------------------------------------------------- */

  /** @type {DialogName} */                 let dialog          = $state(null);
  /** @type {'insert'|'edit'} */             let dialogMode      = $state('insert');
  /** @type {string} */                      let linkInitial     = $state('');
  /** @type {CodeAttrs} */                   let codeInitial     = $state({ source: '', lang: 'plaintext', caption: '' });
  /** @type {string} */                      let pullInitial     = $state('');
  /** @type {SidenoteAttrs} */               let sidenoteInitial = $state({ ref: '¹', bodyHtml: '' });
  /** @type {string} */                      let endInitial      = $state('· · ·');

  const closeDialog = () => (dialog = null);

  /* -----------------------------------------------------------------
   * Toast (image upload + general feedback)
   * --------------------------------------------------------------- */

  /** @type {ToastPayload|null} */
  let toast = $state(null);

  /** @param {string} message  @param {string} [tag]  @param {string} [glyph] */
  const notify = (message, tag = 'tip', glyph = '∅') => { toast = { tag, glyph, message }; };

  /* -----------------------------------------------------------------
   * Selection helpers
   * --------------------------------------------------------------- */

  /**
   * Return the node + position when the current selection is inside (or
   * is) a node of the given type — block-atoms expose it as the next
   * node from `$from`, inline atoms expose it as `selection.node` on a
   * NodeSelection.
   *
   * @param {string} type
   */
  function selectedNode(type) {
    if (!editor) return null;
    const sel = editor.state.selection;
    const after = sel.$from.nodeAfter;
    if (after && after.type.name === type) {
      return { node: after, pos: sel.$from.pos };
    }
    const ns = /** @type {any} */ (sel);
    if (ns.node && ns.node.type.name === type) {
      return { node: ns.node, pos: sel.from };
    }
    return null;
  }

  /* -----------------------------------------------------------------
   * Atom-dialog openers — pre-fill from the current selection when
   * the cursor is on an existing atom; otherwise open in 'insert' mode.
   * --------------------------------------------------------------- */

  function openLink() {
    if (!editor) return;
    linkInitial = editor.getAttributes('link')?.href ?? '';
    dialog = 'link';
  }

  function openCode() {
    const sel = selectedNode('codeBlock');
    if (sel) {
      dialogMode = 'edit';
      codeInitial = {
        source:  sel.node.attrs.source  ?? '',
        lang:    sel.node.attrs.lang    ?? 'plaintext',
        caption: sel.node.attrs.caption ?? ''
      };
    } else {
      dialogMode = 'insert';
      codeInitial = { source: '', lang: 'plaintext', caption: '' };
    }
    dialog = 'codeBlock';
  }

  function openPull() {
    const sel = selectedNode('pullQuote');
    dialogMode  = sel ? 'edit' : 'insert';
    pullInitial = sel ? (sel.node.attrs.text ?? '') : '';
    dialog = 'pullQuote';
  }

  function openSidenote() {
    const sel = selectedNode('sidenote');
    dialogMode = sel ? 'edit' : 'insert';
    sidenoteInitial = sel
      ? { ref: sel.node.attrs.ref ?? '¹', bodyHtml: sel.node.attrs.bodyHtml ?? '' }
      : { ref: '¹', bodyHtml: '' };
    dialog = 'sidenote';
  }

  function openEnd() {
    const sel = selectedNode('endSlug');
    dialogMode = sel ? 'edit' : 'insert';
    endInitial = sel ? (sel.node.attrs.text ?? '· · ·') : '· · ·';
    dialog = 'endSlug';
  }

  /* -----------------------------------------------------------------
   * Apply / remove
   * --------------------------------------------------------------- */

  /** @param {string|null} href */
  function applyLink(href) {
    if (!editor) return;
    const chain = editor.chain().focus().extendMarkRange('link');
    if (href) chain.setLink({ href }).run();
    else      chain.unsetLink().run();
    closeDialog();
  }

  /** @param {CodeAttrs} attrs */
  function applyCode(attrs) {
    if (!editor) return;
    if (dialogMode === 'edit') editor.chain().focus().updateSelectedCodeBlock(attrs).run();
    else                       editor.chain().focus().insertCodeBlock(attrs).run();
    closeDialog();
  }

  /** @param {string} text */
  function applyPull(text) {
    if (!editor) return;
    if (dialogMode === 'edit') editor.chain().focus().updateSelectedPullQuote(text).run();
    else                       editor.chain().focus().insertPullQuote(text).run();
    closeDialog();
  }

  /** @param {SidenoteAttrs} attrs */
  function applySidenote(attrs) {
    if (!editor) return;
    if (dialogMode === 'edit') editor.chain().focus().updateSelectedSidenote(attrs).run();
    else                       editor.chain().focus().insertSidenote(attrs).run();
    closeDialog();
  }

  /** @param {string} text */
  function applyEnd(text) {
    if (!editor) return;
    if (dialogMode === 'edit') editor.chain().focus().updateSelectedEndSlug(text).run();
    else                       editor.chain().focus().insertEndSlug(text).run();
    closeDialog();
  }

  function deleteSelectedNode() {
    editor?.chain().focus().deleteSelection().run();
    closeDialog();
  }

  /* -----------------------------------------------------------------
   * Keyboard shortcuts
   * --------------------------------------------------------------- */

  /** @param {KeyboardEvent} e */
  function onKey(e) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === 's')                     { e.preventDefault(); saveNow(); }
    else if (k === 'k' && !e.shiftKey) { e.preventDefault(); openLink(); }
    else if (k === 'k' &&  e.shiftKey) { e.preventDefault(); openCode(); }
    else if (k === 'q' &&  e.shiftKey) { e.preventDefault(); openPull(); }
  }

  /* -----------------------------------------------------------------
   * Editor lifecycle
   * --------------------------------------------------------------- */

  function recomputeStats() {
    if (!editor) { wordCount = 0; charCount = 0; return; }
    const text = editor.state.doc.textContent;
    charCount = text.length;
    wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  onMount(async () => {
    if (!canvas) return;
    const { createEditor } = await import('$lib/editor');
    const initialDoc = post.docJson?.type === 'doc'
      ? post.docJson
      : { type: 'doc', content: [{ type: 'paragraph' }] };

    editor = createEditor({
      element:  canvas,
      content:  initialDoc,
      onUpdate: () => { scheduleSave(); editorTick++; recomputeStats(); },
      onImageStatus(s) {
        if (s.kind === 'uploading')      notify(`uploading ${s.file.name}…`, 'upload', '∅');
        else if (s.kind === 'uploaded')  notify(`${s.file.name} uploaded`,   'upload', '∅');
        else                              notify(`upload failed: ${s.reason}`, 'error',  '!!');
      }
    });

    editor.on('selectionUpdate', () => { editorTick++; });
    editor.on('transaction',     () => { editorTick++; });

    recomputeStats();
  });

  onDestroy(() => {
    if (saveTimer) clearTimeout(saveTimer);
    editor?.destroy();
  });
</script>

<svelte:window onkeydown={onKey} />
<svelte:head><title>Edit — {post.titlePre}{post.titleEm}{post.titlePost}</title></svelte:head>

<!-- ===== Header ============================================ -->
<header class="flex items-baseline justify-between flex-wrap gap-x-6 gap-y-3 mb-4">
  <div class="min-w-0">
    <p class="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-warm mb-1 truncate">
      ~/admin/posts/{post.slug}/edit
    </p>
    <h1 class="font-display text-[clamp(22px,2.6vw,32px)] uppercase tracking-[-0.015em] leading-[1.05]">
      {post.titlePre}<em class="text-rose">{post.titleEm}</em>{post.titlePost}
    </h1>
  </div>

  <div class="flex items-center flex-wrap gap-x-3 gap-y-1
              font-mono text-[11px] tracking-[0.12em] uppercase">
    {#if saveError}
      <span class="text-crimson">!! {saveError}</span>
    {:else if saving}
      <span class="text-muted-warm">saving…</span>
    {:else if dirty}
      <span class="text-muted-warm">unsaved</span>
    {:else if lastSavedAt}
      <span class="text-rose">saved {lastSavedAt.toLocaleTimeString()}</span>
    {/if}
    <a href="/admin/posts/{post.id}" class="text-paper hover:text-rose">metadata →</a>
  </div>
</header>

<EditorToolbar
  {editor}
  {saving}
  {editorTick}
  {openLink} {openCode} {openPull} {openSidenote} {openEnd}
  save={saveNow}
/>

<EditorCanvas bind:element={canvas} />

<EditorStatusBar
  words={wordCount}
  chars={charCount}
  autosaveSeconds={AUTOSAVE_MS / 1000}
/>

<!-- ===== Dialogs =========================================== -->
<LinkDialog
  open={dialog === 'link'}
  initialHref={linkInitial}
  onsubmit={applyLink}
  onclose={closeDialog}
/>

<CodeBlockDialog
  open={dialog === 'codeBlock'}
  mode={dialogMode}
  initial={codeInitial}
  onsubmit={applyCode}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<PullQuoteDialog
  open={dialog === 'pullQuote'}
  mode={dialogMode}
  initialText={pullInitial}
  onsubmit={applyPull}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<SidenoteDialog
  open={dialog === 'sidenote'}
  mode={dialogMode}
  initial={sidenoteInitial}
  onsubmit={applySidenote}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<EndSlugDialog
  open={dialog === 'endSlug'}
  mode={dialogMode}
  initialText={endInitial}
  onsubmit={applyEnd}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<Toast
  open={toast !== null}
  tag={toast?.tag ?? 'tip'}
  glyph={toast?.glyph ?? '∅'}
  autoCloseMs={3500}
  onclose={() => (toast = null)}
>
  {toast?.message ?? ''}
</Toast>
