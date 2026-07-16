<script>
  import '$lib/styles/article-content.css';

  /**
   * @typedef {Object} Props
   * @property {HTMLDivElement} [element]
   */

  /** @type {Props} */
  let { element = $bindable() } = $props();
</script>

<div
  class="article-content article-content--editor -mx-5 min-h-[calc(100vh-240px)] border-t border-[var(--line-soft)] bg-[var(--bg)] px-5 py-7 text-[var(--fg)] md:-mx-8 md:p-8"
>
  <div class="mx-auto max-w-[760px] bg-transparent p-0">
    <div bind:this={element} class="editor-canvas outline-none"></div>
  </div>
</div>
