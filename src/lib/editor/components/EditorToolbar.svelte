<!--
  EditorToolbar — formatting strip above the canvas. Marks, headings,
  lists, and link buttons mutate the editor in place. Atom buttons
  delegate to the parent which owns dialog state. The parent passes
  `editorTick` (bumped on every selection/transaction) so `isActive()`
  re-evaluates and active-state highlighting follows the cursor.
-->
<script>
  import { tooltip } from '$lib/actions/tooltip.js';

  /**
   * @typedef {Object} Props
   * @property {import('@tiptap/core').Editor|null} editor
   * @property {boolean}                            [saving]
   * @property {number}                             [editorTick]
   * @property {() => void}                         openLink
   * @property {() => void}                         openCode
   * @property {() => void}                         openPull
   * @property {() => void}                         openSidenote
   * @property {() => void}                         openEnd
   * @property {() => void}                         save
   */

  /** @type {Props} */
  let { editor, saving = false, editorTick = 0, openLink, openCode, openPull, openSidenote, openEnd, save } = $props();

  /**
   * @param {string} name
   * @param {Record<string, any>} [attrs]
   */
  function isActive(name, attrs) {
    void editorTick;                                   // tracked: re-run on tick
    return !!editor?.isActive(name, attrs);
  }

  const chain = () => editor?.chain().focus();
</script>

{#if editor}
  <div class="toolbar mb-3" role="toolbar" aria-label="Editor formatting">
    <div class="toolbar__group">
      <button class="tb"        use:tooltip={'Bold · Ctrl+B'}        class:on={isActive('bold')}   onclick={() => chain()?.toggleBold().run()}>B</button>
      <button class="tb italic" use:tooltip={'Italic · Ctrl+I'}      class:on={isActive('italic')} onclick={() => chain()?.toggleItalic().run()}>i</button>
      <button class="tb"        use:tooltip={'Inline code · Ctrl+E'} class:on={isActive('code')}   onclick={() => chain()?.toggleCode().run()}>‹/›</button>
    </div>

    <span class="toolbar__divider" aria-hidden="true"></span>

    <div class="toolbar__group">
      <button class="tb" use:tooltip={'Heading 2 · Ctrl+Alt+2'} class:on={isActive('heading', { level: 2 })} onclick={() => chain()?.toggleHeading({ level: 2 }).run()}>H2</button>
      <button class="tb" use:tooltip={'Heading 3 · Ctrl+Alt+3'} class:on={isActive('heading', { level: 3 })} onclick={() => chain()?.toggleHeading({ level: 3 }).run()}>H3</button>
    </div>

    <span class="toolbar__divider" aria-hidden="true"></span>

    <div class="toolbar__group">
      <button class="tb" use:tooltip={'Bullet list · Ctrl+Shift+8'}  class:on={isActive('bulletList')}  onclick={() => chain()?.toggleBulletList().run()}>•</button>
      <button class="tb" use:tooltip={'Ordered list · Ctrl+Shift+7'} class:on={isActive('orderedList')} onclick={() => chain()?.toggleOrderedList().run()}>1.</button>
    </div>

    <span class="toolbar__divider" aria-hidden="true"></span>

    <div class="toolbar__group">
      <button class="tb" use:tooltip={'Link · Ctrl+K'} class:on={isActive('link')} onclick={openLink}>link</button>
    </div>

    <span class="toolbar__divider" aria-hidden="true"></span>

    <div class="toolbar__group">
      <button class="tb" use:tooltip={'Pull quote · Ctrl+Shift+Q'} class:on={isActive('pullQuote')} onclick={openPull}>pull-quote</button>
      <button class="tb" use:tooltip={'Code block · Ctrl+Shift+K'} class:on={isActive('codeBlock')} onclick={openCode}>code</button>
      <button class="tb" use:tooltip={'Sidenote'}                  class:on={isActive('sidenote')}  onclick={openSidenote}>sidenote</button>
      <button class="tb" use:tooltip={'End slug'}                  class:on={isActive('endSlug')}   onclick={openEnd}>end-slug</button>
    </div>

    <button
      class="tb-save"
      use:tooltip={'Save · Ctrl+S'}
      onclick={save}
      disabled={saving}
      aria-busy={saving}
    >
      <span class="tb-save__g" aria-hidden="true">↳</span>
      <span>{saving ? 'saving…' : 'save'}</span>
    </button>
  </div>
{/if}

<style>
  :global(.toolbar) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    padding: 8px 10px;
    background: var(--color-ink-2);
    border: 1px solid var(--line-soft);
    border-bottom: 2px dashed rgb(232 156 146 / 0.18);
  }
  :global(.toolbar__group) {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  :global(.toolbar__divider) {
    display: inline-block;
    width: 1px;
    height: 22px;
    background: var(--line-soft);
  }

  :global(.tb) {
    min-width: 32px;
    height: 28px;
    padding: 0 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: var(--color-paper);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  :global(.tb:hover) {
    color: var(--color-rose);
    border-color: var(--line-soft);
    background: rgb(255 255 255 / 0.02);
  }
  :global(.tb.on) {
    color: var(--color-crimson);
    border-color: var(--color-rose);
    background: rgb(232 156 146 / 0.06);
  }
  :global(.tb:focus-visible) {
    outline: 2px solid var(--color-rose);
    outline-offset: 1px;
  }

  :global(.tb-save) {
    margin-left: auto;
    height: 28px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--color-rose);
    border: 1px solid var(--color-rose);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  :global(.tb-save:hover) { background: var(--color-rose); color: var(--color-ink); }
  :global(.tb-save:disabled) { opacity: 0.6; cursor: progress; }
  :global(.tb-save__g) {
    color: var(--color-crimson);
    font-family: var(--font-display);
    font-size: 12px;
    line-height: 1;
  }
  :global(.tb-save:hover .tb-save__g) { color: var(--color-ink); }
</style>
