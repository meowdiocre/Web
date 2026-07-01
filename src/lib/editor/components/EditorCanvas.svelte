<!--
  EditorCanvas is the paper canvas TipTap mounts into. It owns the
  bleed-past-the-gutter `.paper-wrap` chrome and the ProseMirror
  styling that mirrors the public essay component.

  Exposes `element` via `$bindable()` so the page can mount TipTap into it:

  ```svelte
  <EditorCanvas bind:element={canvas} />
  ```
-->
<script>
  /**
   * @typedef {Object} Props
   * @property {HTMLDivElement} [element]   $bindable mount target
   */

  /** @type {Props} */
  let { element = $bindable() } = $props();
</script>

<!-- data-page="article" makes app.css apply the cream-paper theme. -->
<div class="paper-wrap" data-page="article">
  <div class="paper essay">
    <div bind:this={element} class="canvas"></div>
  </div>
</div>

<style>
  .paper-wrap {
    /* Bleed past the layout's content gutter (px-5 mobile, px-8 md+). */
    margin: 0 -20px -24px;
    padding: 24px 20px;
    background: var(--bg, #ebd8be);
    color: var(--fg, #241814);
    min-height: 70vh;
    border-top: 1px solid var(--line-soft);
  }
  @media (min-width: 768px) {
    .paper-wrap { margin: 0 -32px 0; padding: 32px; }
  }
  .paper { max-width: 760px; margin: 0 auto; background: transparent; padding: 0; }
  .canvas { outline: none; }

  /* ProseMirror styles mirror the public essay component so what
     the author sees is what ships. */
  .canvas :global(.ProseMirror) { outline: none; min-height: 60vh; }
  .canvas :global(.ProseMirror > * + *) { margin-top: 1.1em; }

  .canvas :global(p),
  .canvas :global(ol),
  .canvas :global(ul) {
    font-family: var(--font-serif);
    font-size: var(--read-size, 18px);
    line-height: 1.78;
    color: var(--fg);
    text-wrap: pretty;
    hyphens: auto;
  }

  .canvas :global(ul),
  .canvas :global(ol) {
    padding-left: 1.6em;
    list-style-position: outside;
  }
  .canvas :global(ul)       { list-style-type: disc; }
  .canvas :global(ul ul)    { list-style-type: circle; }
  .canvas :global(ul ul ul) { list-style-type: square; }
  .canvas :global(ol)       { list-style-type: decimal; }
  .canvas :global(ol ol)    { list-style-type: lower-alpha; }
  .canvas :global(ol ol ol) { list-style-type: lower-roman; }
  .canvas :global(li)       { margin-bottom: 6px; }
  /* TipTap wraps each <li>'s content in a <p>; collapse the default
     margin so list items don't gain a blank line above each row. */
  .canvas :global(li > p) { margin: 0; }
  .canvas :global(.ProseMirror > p:first-of-type::first-letter) {
    font-family: var(--font-display);
    font-size: 4em;
    float: left;
    line-height: 0.85;
    margin: 0.04em 0.12em 0 0;
    color: var(--accent);
  }
  .canvas :global(h2) {
    font-family: var(--font-display);
    font-size: clamp(28px, 3.2vw, 38px);
    line-height: 1.05;
    letter-spacing: -0.015em;
    text-transform: uppercase;
    color: var(--fg);
    margin: 40px 0 14px;
    padding-top: 18px;
    border-top: 1px solid var(--rule);
  }
  .canvas :global(h3) {
    font-family: var(--font-display);
    font-size: 20px;
    letter-spacing: -0.01em;
    text-transform: uppercase;
    color: var(--fg);
    margin: 32px 0 12px;
  }
  .canvas :global(strong) { color: var(--fg); font-weight: 600; }
  .canvas :global(em)     { color: var(--fg); font-style: italic; }
  .canvas :global(a) {
    color: var(--accent);
    border-bottom: 1px solid currentColor;
  }
  .canvas :global(code) {
    font-family: var(--font-mono);
    font-size: 0.88em;
    background: var(--bg-2);
    padding: 1px 6px;
    border: 1px solid var(--rule-soft);
  }
  .canvas :global(pre) {
    margin: 24px 0;
    padding: 18px 20px;
    background: var(--code-bg);
    color: var(--code-fg);
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.6;
    overflow-x: auto;
    clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
  }
  .canvas :global(pre code) { background: transparent; padding: 0; border: 0; }
  .canvas :global(.kw)  { color: var(--code-kw); }
  .canvas :global(.fn)  { color: var(--code-fn); }
  .canvas :global(.str) { color: var(--code-str); }
  .canvas :global(.com) { color: var(--code-com); font-style: italic; }
  .canvas :global(.num) { color: var(--code-num); }

  /* codeBlock NodeView wrapper. `display: contents` lifts the inner
     <pre> and <span.figure-cap> out of the wrapper so they act as siblings
     under .ProseMirror, matching the public essay component. */
  .canvas :global(.cb-view) { display: contents; }
  .canvas :global(.figure-cap) {
    display: block;
    margin: -16px 0 28px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--color-muted);
    text-transform: uppercase;
  }

  .canvas :global(blockquote.pull) {
    margin: 36px 0;
    padding: 24px 22px;
    border-block: 2px solid var(--fg);
    font-family: var(--font-italic);
    font-style: italic;
    font-size: clamp(22px, 3vw, 30px);
    line-height: 1.2;
    color: var(--quote);
    text-align: center;
  }
  .canvas :global(blockquote.pull::before) { content: '«'; color: var(--accent); margin-right: 6px; }
  .canvas :global(blockquote.pull::after)  { content: '»'; color: var(--accent); margin-left: 6px; }

  .canvas :global(.end) {
    display: flex; align-items: center; gap: 18px;
    margin: 48px 0 0; padding-top: 22px;
    border-top: 2px solid var(--fg);
  }
  .canvas :global(.end .glyph) {
    font-family: var(--font-display); font-size: 34px; color: var(--accent);
    transform: rotate(-8deg); line-height: 1;
  }
  .canvas :global(.end > span:last-child) {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 0.12em; color: var(--color-muted); text-transform: uppercase;
  }

  .canvas :global(.sidenote-chip) {
    display: inline-block;
    margin: 0 2px;
    padding: 0 6px;
    background: var(--accent);
    color: var(--bg);
    font-family: var(--font-mono);
    font-size: 0.72em;
    border-radius: 2px;
    cursor: help;
  }
</style>
