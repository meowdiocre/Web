<script>
  import { tooltip } from '$lib/actions/tooltip.js';

  /**
   * @typedef {Object} Props
   * @property {import('@tiptap/core').Editor|null} editor
   * @property {boolean} [saving]
   * @property {number} [editorTick]
   * @property {() => void} openLink
   * @property {() => void} openCode
   * @property {() => void} openPull
   * @property {() => void} openSidenote
   * @property {() => void} openEnd
   * @property {() => void} save
   */

  /** @type {Props} */
  let { editor, saving = false, editorTick = 0, openLink, openCode, openPull, openSidenote, openEnd, save } = $props();

  /**
   * @param {string} name
   * @param {Record<string, any>} [attrs]
   */
  function isActive(name, attrs) {
    void editorTick;
    return !!editor?.isActive(name, attrs);
  }

  const chain = () => editor?.chain().focus();

  const toolbarButtonClass = 'tb inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 border-b-2 border-transparent bg-transparent px-2 font-mono text-[11px] tracking-[0.04em] text-paper transition-[background-color,border-color,color] duration-150 hover:bg-white/[0.04] hover:text-rose focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose [&.on]:border-rose [&.on]:bg-rose/[0.08] [&.on]:text-rose';
</script>

{#if editor}
  <div
    class="toolbar sticky top-[69px] z-20 mb-3 flex items-center border-y border-[var(--line-soft)] bg-ink-2/95 px-1.5 py-1.5 backdrop-blur-sm md:top-0"
    role="toolbar"
    aria-label="Editor formatting"
  >
    <div class="min-w-0 flex-1 overflow-x-auto">
      <div class="flex w-max items-center gap-1" role="group" aria-label="Formatting controls">
    <div class="toolbar__group inline-flex items-center gap-0.5">
      <button type="button" class={toolbarButtonClass} use:tooltip={'Bold · Ctrl+B'} class:on={isActive('bold')} aria-pressed={isActive('bold')} onclick={() => chain()?.toggleBold().run()}>B</button>
      <button type="button" class={`${toolbarButtonClass} italic`} use:tooltip={'Italic · Ctrl+I'} class:on={isActive('italic')} aria-pressed={isActive('italic')} onclick={() => chain()?.toggleItalic().run()}>i</button>
      <button type="button" class={toolbarButtonClass} use:tooltip={'Inline code · Ctrl+E'} class:on={isActive('code')} aria-pressed={isActive('code')} onclick={() => chain()?.toggleCode().run()}>‹/›</button>
    </div>

    <span class="toolbar__divider inline-block h-[22px] w-px bg-[var(--line-soft)]" aria-hidden="true"></span>

    <div class="toolbar__group inline-flex items-center gap-0.5">
      <button type="button" class={toolbarButtonClass} use:tooltip={'Heading 2 · Ctrl+Alt+2'} class:on={isActive('heading', { level: 2 })} aria-pressed={isActive('heading', { level: 2 })} onclick={() => chain()?.toggleHeading({ level: 2 }).run()}>H2</button>
      <button type="button" class={toolbarButtonClass} use:tooltip={'Heading 3 · Ctrl+Alt+3'} class:on={isActive('heading', { level: 3 })} aria-pressed={isActive('heading', { level: 3 })} onclick={() => chain()?.toggleHeading({ level: 3 }).run()}>H3</button>
    </div>

    <span class="toolbar__divider inline-block h-[22px] w-px bg-[var(--line-soft)]" aria-hidden="true"></span>

    <div class="toolbar__group inline-flex items-center gap-0.5">
      <button type="button" class={toolbarButtonClass} use:tooltip={'Bullet list · Ctrl+Shift+8'} class:on={isActive('bulletList')} aria-pressed={isActive('bulletList')} onclick={() => chain()?.toggleBulletList().run()}>•</button>
      <button type="button" class={toolbarButtonClass} use:tooltip={'Ordered list · Ctrl+Shift+7'} class:on={isActive('orderedList')} aria-pressed={isActive('orderedList')} onclick={() => chain()?.toggleOrderedList().run()}>1.</button>
    </div>

    <span class="toolbar__divider inline-block h-[22px] w-px bg-[var(--line-soft)]" aria-hidden="true"></span>

    <div class="toolbar__group inline-flex items-center gap-0.5">
      <button type="button" class={toolbarButtonClass} use:tooltip={'Link · Ctrl+K'} class:on={isActive('link')} aria-pressed={isActive('link')} onclick={openLink}>link</button>
    </div>

    <span class="toolbar__divider inline-block h-[22px] w-px bg-[var(--line-soft)]" aria-hidden="true"></span>

    <div class="toolbar__group inline-flex items-center gap-0.5">
      <button type="button" class={toolbarButtonClass} use:tooltip={'Pull quote · Ctrl+Shift+Q'} class:on={isActive('pullQuote')} aria-pressed={isActive('pullQuote')} onclick={openPull}>pull-quote</button>
      <button type="button" class={toolbarButtonClass} use:tooltip={'Code block · Ctrl+Shift+K'} class:on={isActive('codeBlock')} aria-pressed={isActive('codeBlock')} onclick={openCode}>code</button>
      <button type="button" class={toolbarButtonClass} use:tooltip={'Sidenote'} class:on={isActive('sidenote')} aria-pressed={isActive('sidenote')} onclick={openSidenote}>sidenote</button>
      <button type="button" class={toolbarButtonClass} use:tooltip={'End slug'} class:on={isActive('endSlug')} aria-pressed={isActive('endSlug')} onclick={openEnd}>end-slug</button>
    </div>

      </div>
    </div>

    <button
      type="button"
      class="tb-save group ml-2 inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 border border-rose bg-transparent px-3 font-mono text-[11px] tracking-[0.08em] text-rose transition-[background-color,color,border-color] duration-150 hover:bg-rose hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose disabled:cursor-progress disabled:opacity-60"
      use:tooltip={'Save · Ctrl+S'}
      onclick={save}
      disabled={saving}
      aria-busy={saving}
    >
      <span class="tb-save__g font-display text-xs leading-none text-crimson group-hover:text-ink" aria-hidden="true">↳</span>
      <span>{saving ? 'saving...' : 'save'}</span>
    </button>
  </div>
{/if}
