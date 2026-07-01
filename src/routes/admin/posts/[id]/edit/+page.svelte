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

  import { mergeRehighlightedHtml } from '$lib/editor/merge-rehighlight.js';

  /* Types */

  /** @typedef {import('@tiptap/core').Editor} TiptapEditor */
  /** @typedef {{ source: string; lang: string; caption: string }} CodeAttrs */
  /** @typedef {{ ref: string; bodyHtml: string }} SidenoteAttrs */
  /** @typedef {'link'|'codeBlock'|'pullQuote'|'sidenote'|'endSlug'} DialogName */
  /** @typedef {{ tag: string; glyph: string; message: string }} ToastPayload */

  /** @type {{ data: { post: any } }} */
  let { data } = $props();
  const post = $derived(data.post);

  /* Editor state */

  /** @type {HTMLDivElement|undefined} */
  let canvas = $state();
  /** @type {TiptapEditor|null} */
  let editor = $state(null);
  /** Bumped on every selection/transaction so toolbar isActive() re-evaluates. */
  let editorTick = $state(0);

  let wordCount = $state(0);
  let charCount = $state(0);

  /* Save state (autosave + Ctrl-S) */

  const AUTOSAVE_MS = 3000;

  let dirty       = $state(false);
  let saving      = $state(false);
  let lastSavedAt = $state(/** @type {Date|null} */(null));
  let saveError   = $state(/** @type {string|null} */(null));

  /** Coalesce a follow-up save that arrives while one is in flight. */
  let pendingSave = false;

  /** Set during the rehighlight merge so onUpdate doesn't treat the
   *  synthetic transaction as a user edit (would re-schedule autosave
   *  and loop forever). */
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
      } catch {/* tolerate missing/non-JSON body */}
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

  /* Dialog plumbing
   * --------------
   * One spec per dialog so adding a new atom means adding one entry.
   * `read(node)` collects initial state from the selected node (or null
   * for marks like 'link'). `apply(value, mode)` writes back via the
   * editor's command API.
   */

  /** @type {DialogName|null} */
  let dialog        = $state(null);
  /** @type {'insert'|'edit'} */
  let dialogMode    = $state('insert');
  /** @type {any} */
  let dialogInitial = $state(null);

  /**
   * @typedef {Object} DialogSpec
   * @property {string|null}                   nodeType   ProseMirror node name, or null for marks
   * @property {() => any}                     defaults   factory for fresh "insert" state
   * @property {(node: any) => any}            read       extract state from an existing node
   * @property {(value: any, mode: 'insert'|'edit') => void} apply
   */

  /** @type {Record<DialogName, DialogSpec>} */
  const DIALOG_SPECS = {
    link: {
      nodeType: null,
      defaults: () => '',
      read:     () => editor?.getAttributes('link')?.href ?? '',
      apply: (href) => {
        if (!editor) return;
        const chain = editor.chain().focus().extendMarkRange('link');
        if (href) chain.setLink({ href }).run();
        else      chain.unsetLink().run();
      }
    },
    codeBlock: {
      nodeType: 'codeBlock',
      defaults: () => ({ source: '', lang: 'plaintext', caption: '' }),
      read: (n) => ({
        source:  n.attrs.source  ?? '',
        lang:    n.attrs.lang    ?? 'plaintext',
        caption: n.attrs.caption ?? ''
      }),
      apply: (attrs, mode) => {
        const c = editor?.chain().focus();
        mode === 'edit'
          ? c?.updateSelectedCodeBlock(attrs).run()
          : c?.insertCodeBlock(attrs).run();
      }
    },
    pullQuote: {
      nodeType: 'pullQuote',
      defaults: () => '',
      read:     (n) => n.attrs.text ?? '',
      apply: (text, mode) => {
        const c = editor?.chain().focus();
        mode === 'edit'
          ? c?.updateSelectedPullQuote(text).run()
          : c?.insertPullQuote(text).run();
      }
    },
    sidenote: {
      nodeType: 'sidenote',
      defaults: () => ({ ref: '¹', bodyHtml: '' }),
      read: (n) => ({ ref: n.attrs.ref ?? '¹', bodyHtml: n.attrs.bodyHtml ?? '' }),
      apply: (attrs, mode) => {
        const c = editor?.chain().focus();
        mode === 'edit'
          ? c?.updateSelectedSidenote(attrs).run()
          : c?.insertSidenote(attrs).run();
      }
    },
    endSlug: {
      nodeType: 'endSlug',
      defaults: () => '· · ·',
      read:     (n) => n.attrs.text ?? '· · ·',
      apply: (text, mode) => {
        const c = editor?.chain().focus();
        mode === 'edit'
          ? c?.updateSelectedEndSlug(text).run()
          : c?.insertEndSlug(text).run();
      }
    }
  };

  /**
   * Return the node + position when the current selection is inside (or
   * is) a node of the given type. Block atoms expose it as `$from.nodeAfter`;
   * inline atoms expose it as `selection.node` on a NodeSelection.
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

  /** @param {DialogName} name */
  function openDialog(name) {
    if (!editor) return;
    const spec = DIALOG_SPECS[name];
    if (spec.nodeType) {
      const sel = selectedNode(spec.nodeType);
      dialogMode    = sel ? 'edit' : 'insert';
      dialogInitial = sel ? spec.read(sel.node) : spec.defaults();
    } else {
      dialogMode    = 'insert';
      dialogInitial = spec.read(null);
    }
    dialog = name;
  }

  /** @param {any} value */
  function applyDialog(value) {
    if (!dialog) return;
    DIALOG_SPECS[dialog].apply(value, dialogMode);
    closeDialog();
  }

  function deleteSelectedNode() {
    editor?.chain().focus().deleteSelection().run();
    closeDialog();
  }

  const closeDialog = () => (dialog = null);

  /* Toast (image upload + general feedback) */

  /** @type {ToastPayload|null} */
  let toast = $state(null);

  /** @param {string} message  @param {string} [tag]  @param {string} [glyph] */
  const notify = (message, tag = 'tip', glyph = '∅') => { toast = { tag, glyph, message }; };

  /* Keyboard shortcuts */

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

  /* Editor lifecycle */

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
      onUpdate: () => {
        if (suppressNextUpdate) { suppressNextUpdate = false; return; }
        scheduleSave();
        editorTick++;
        recomputeStats();
      },
      onImageStatus(s) {
        if (s.kind === 'uploading')     notify(`uploading ${s.file.name}…`,    'upload', '∅');
        else if (s.kind === 'uploaded') notify(`${s.file.name} uploaded`,      'upload', '∅');
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

  /* Toolbar callbacks — thin wrappers so the toolbar API stays simple. */
  const openLink     = () => openDialog('link');
  const openCode     = () => openDialog('codeBlock');
  const openPull     = () => openDialog('pullQuote');
  const openSidenote = () => openDialog('sidenote');
  const openEnd      = () => openDialog('endSlug');
</script>

<svelte:window onkeydown={onKey} />
<svelte:head><title>Edit — {post.titlePre}{post.titleEm}{post.titlePost}</title></svelte:head>

<!-- Header -->
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

<!-- Dialogs.
     Each dialog only reads its `initial*` prop while `open=true`, but we
     still guard each prop with the discriminant so the values stay
     type-correct and svelte-check is happy. -->
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
    : { source: '', lang: 'plaintext', caption: '' }}
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
    : { ref: '¹', bodyHtml: '' }}
  onsubmit={applyDialog}
  onremove={deleteSelectedNode}
  onclose={closeDialog}
/>

<EndSlugDialog
  open={dialog === 'endSlug'}
  mode={dialogMode}
  initialText={dialog === 'endSlug' ? /** @type {string} */ (dialogInitial) : '· · ·'}
  onsubmit={applyDialog}
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
