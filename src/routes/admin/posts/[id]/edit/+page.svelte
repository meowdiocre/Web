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
  import { BRAND_GLYPH } from '$lib/config/motif.js';
  import { isDoc } from '$lib/editor/types';
  import { composeTitle } from '$lib/util/strings';

  import {
    createDialogSpecs,
    DEFAULT_CODE_BLOCK,
    DEFAULT_END_SLUG,
    DEFAULT_SIDENOTE,
    resolveDialogState
  } from '$lib/editor/dialog-specs.js';
  import { mergeRehighlightedHtml } from '$lib/editor/merge-rehighlight.js';

  /** @typedef {import('@tiptap/core').Editor} TiptapEditor */
  /** @typedef {{ source: string; lang: string; caption: string }} CodeAttrs */
  /** @typedef {{ ref: string; bodyHtml: string }} SidenoteAttrs */
  /** @typedef {'link'|'codeBlock'|'pullQuote'|'sidenote'|'endSlug'} DialogName */
  /** @typedef {{ tag: string; glyph: string; message: string }} ToastPayload */

  /** @type {import('./$types').PageProps} */
  let { data } = $props();
  const post = $derived(data.post);
  const postTitle = $derived(composeTitle({ pre: post.titlePre, em: post.titleEm, post: post.titlePost }));

  /** @type {HTMLDivElement|undefined} */
  let canvas = $state();
  /** @type {TiptapEditor|null} */
  let editor = $state(null);
  let editorTick = $state(0);

  let wordCount = $state(0);
  let charCount = $state(0);

  const AUTOSAVE_MS = 3000;

  let dirty       = $state(false);
  let saving      = $state(false);
  let lastSavedAt = $state(/** @type {Date|null} */(null));
  let saveError   = $state(/** @type {string|null} */(null));

  let pendingSave = false;

  let suppressNextUpdate = false;

  /** @type {ReturnType<typeof setTimeout>|null} */
  let saveTimer = null;

  async function save() {
    if (!editor) return;
    if (saving) { pendingSave = true; return; }

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
      try {
        const body = await res.json();
        if (body?.doc && mergeRehighlightedHtml(editor, body.doc)) {
          suppressNextUpdate = true;
        }
      } catch {}
      lastSavedAt = new Date();
      dirty = false;
    } catch (err) {
      saveError = (err instanceof Error ? err.message : String(err)).slice(0, 200);
    } finally {
      saving = false;
      if (pendingSave) { pendingSave = false; save(); }
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

  /** @type {DialogName|null} */
  let dialog        = $state(null);
  /** @type {'insert'|'edit'} */
  let dialogMode    = $state('insert');
  /** @type {any} */
  let dialogInitial = $state(null);

  const dialogSpecs = createDialogSpecs(() => editor);

  /** @param {DialogName} name */
  function openDialog(name) {
    if (!editor) return;
    const state = resolveDialogState(editor, dialogSpecs[name]);
    dialogMode = state.mode;
    dialogInitial = state.initial;
    dialog = name;
  }

  /** @param {any} value */
  function applyDialog(value) {
    if (!dialog) return;
    dialogSpecs[dialog].apply(value, dialogMode);
    closeDialog();
  }

  function deleteSelectedNode() {
    editor?.chain().focus().deleteSelection().run();
    closeDialog();
  }

  const closeDialog = () => (dialog = null);

  /** @type {ToastPayload|null} */
  let toast = $state(null);

  /** @param {string} message  @param {string} [tag]  @param {string} [glyph] */
  const notify = (message, tag = 'tip', glyph = BRAND_GLYPH) => { toast = { tag, glyph, message }; };

  /** @param {KeyboardEvent} e */
  function onKey(e) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if      (k === 's')                { e.preventDefault(); saveNow(); }
    else if (k === 'k' && !e.shiftKey) { e.preventDefault(); openDialog('link'); }
    else if (k === 'k' &&  e.shiftKey) { e.preventDefault(); openDialog('codeBlock'); }
    else if (k === 'q' &&  e.shiftKey) { e.preventDefault(); openDialog('pullQuote'); }
  }

  function recomputeStats() {
    if (!editor) { wordCount = 0; charCount = 0; return; }
    const text = editor.state.doc.textContent;
    charCount = text.length;
    wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  onMount(async () => {
    if (!canvas) return;
    const { createEditor } = await import('$lib/editor');
    const initialDoc = isDoc(post.docJson)
      ? post.docJson
      : /** @type {import('$lib/editor/types').Doc} */ ({ type: 'doc', content: [{ type: 'paragraph' }] });

    editor = createEditor({
      element:  canvas,
      content:  initialDoc,
      onUpdate: () => {
        if (suppressNextUpdate) { suppressNextUpdate = false; return; }
        scheduleSave();
        editorTick++;
        recomputeStats();
      },
      onImageStatus(s) {
        if (s.kind === 'uploading')     notify(`uploading ${s.file.name}...`,   'upload', BRAND_GLYPH);
        else if (s.kind === 'uploaded') notify(`${s.file.name} uploaded`,      'upload', BRAND_GLYPH);
        else                            notify(`upload failed: ${s.reason}`,   'error',  '!!');
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

  const openLink     = () => openDialog('link');
  const openCode     = () => openDialog('codeBlock');
  const openPull     = () => openDialog('pullQuote');
  const openSidenote = () => openDialog('sidenote');
  const openEnd      = () => openDialog('endSlug');
</script>

<svelte:window onkeydown={onKey} />
<svelte:head><title>Edit | {postTitle}</title></svelte:head>

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
      <span class="text-muted-warm">saving...</span>
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

<LinkDialog
  open={dialog === 'link'}
  initialHref={dialog === 'link' ? /** @type {string} */ (dialogInitial) : ''}
  onsubmit={applyDialog}
  onclose={closeDialog}
/>

<CodeBlockDialog
  open={dialog === 'codeBlock'}
  mode={dialogMode}
  initial={dialog === 'codeBlock'
    ? /** @type {CodeAttrs} */ (dialogInitial)
    : DEFAULT_CODE_BLOCK}
  onsubmit={applyDialog}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<PullQuoteDialog
  open={dialog === 'pullQuote'}
  mode={dialogMode}
  initialText={dialog === 'pullQuote' ? /** @type {string} */ (dialogInitial) : ''}
  onsubmit={applyDialog}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<SidenoteDialog
  open={dialog === 'sidenote'}
  mode={dialogMode}
  initial={dialog === 'sidenote'
    ? /** @type {SidenoteAttrs} */ (dialogInitial)
    : DEFAULT_SIDENOTE}
  onsubmit={applyDialog}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<EndSlugDialog
  open={dialog === 'endSlug'}
  mode={dialogMode}
  initialText={dialog === 'endSlug' ? /** @type {string} */ (dialogInitial) : DEFAULT_END_SLUG}
  onsubmit={applyDialog}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<Toast
  open={toast !== null}
  tag={toast?.tag ?? 'tip'}
  glyph={toast?.glyph ?? BRAND_GLYPH}
  autoCloseMs={3500}
  onclose={() => (toast = null)}
>
  {toast?.message ?? ''}
</Toast>
