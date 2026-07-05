<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { NAV_WINDOWS, findWindowByPath, STORAGE_KEYS } from '$lib/config/site.js';
  import Toast from './Toast.svelte';

  const PREFIX_TIMEOUT_MS = 2000;
  const HINT_AUTOCLOSE_MS = 9000;
  const HELP_AUTOCLOSE_MS = 6500;

  let memSeen = false;
  function hasSeenHint() {
    try { return sessionStorage.getItem(STORAGE_KEYS.tmuxHint) === '1'; }
    catch (_) { return memSeen; }
  }
  function markHintSeen() {
    memSeen = true;
    try { sessionStorage.setItem(STORAGE_KEYS.tmuxHint, '1'); } catch (_) {}
  }

  let prefixActive = $state(false);
  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let prefixTimer;

  let hintOpen = $state(false);
  let helpOpen = $state(false);

  function startPrefix() {
    prefixActive = true;
    clearTimeout(prefixTimer);
    prefixTimer = setTimeout(() => { prefixActive = false; }, PREFIX_TIMEOUT_MS);
  }
  function endPrefix() {
    prefixActive = false;
    clearTimeout(prefixTimer);
  }

  function dispatchKey(key) {
    if (/^[0-9]$/.test(key)) {
      const win = NAV_WINDOWS[parseInt(key, 10)];
      if (win) goto(win.path);
      return Boolean(win);
    }

    if (key === 'n' || key === 'N' || key === 'p' || key === 'P') {
      const cur  = findWindowByPath($page.url.pathname).idx;
      const step = key === 'n' || key === 'N' ? 1 : -1;
      const next = (cur + step + NAV_WINDOWS.length) % NAV_WINDOWS.length;
      goto(NAV_WINDOWS[next].path);
      return true;
    }

    if (key === '?' || key === '/') {
      hintOpen = false;
      helpOpen = true;
      return true;
    }

    return false;
  }

  /** @param {KeyboardEvent} e */
  function onKey(e) {
    const t = /** @type {HTMLElement} */ (e.target);
    if (t?.matches?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;

    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B') && !e.altKey) {
      e.preventDefault();
      startPrefix();
      return;
    }

    if (!prefixActive) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      endPrefix();
      return;
    }

    if (e.key === 'Control' || e.key === 'Meta' || e.key === 'Shift' || e.key === 'Alt') return;

    if (dispatchKey(e.key)) e.preventDefault();
    endPrefix();
  }

  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let hintTimer;

  onMount(() => {
    if (!hasSeenHint()) {
      hintTimer = setTimeout(() => { hintOpen = true; }, 700);
    }
  });

  onDestroy(() => {
    clearTimeout(prefixTimer);
    clearTimeout(hintTimer);
  });
</script>

<svelte:window onkeydown={onKey} />

{#if prefixActive}
  <div class="prefix" role="status" aria-live="polite" transition:fade={{ duration: 120 }}>
    <span class="key">C-b</span>
    <span class="state">prefix</span>
    <span class="cur" aria-hidden="true">_</span>
  </div>
{/if}

<Toast
  open={hintOpen}
  tag="tmux"
  autoCloseMs={HINT_AUTOCLOSE_MS}
  onclose={() => { hintOpen = false; markHintSeen(); }}
>
  <p>this site responds to <b>tmux keys</b>:</p>
  <ul>
    <li><code>C-b 0</code> · <code>1</code> · <code>2</code> &nbsp;jump to index / writing / about</li>
    <li><code>C-b n</code> / <code>p</code> &nbsp;next / previous window</li>
    <li><code>C-b ?</code> &nbsp;show all bindings</li>
  </ul>
</Toast>

<Toast
  open={helpOpen}
  tag="bindings"
  autoCloseMs={HELP_AUTOCLOSE_MS}
  onclose={() => { helpOpen = false; }}
>
  <ul>
    <li><code>C-b 0</code> &nbsp;index</li>
    <li><code>C-b 1</code> &nbsp;writing</li>
    <li><code>C-b 2</code> &nbsp;about</li>
    <li><code>C-b n</code> &nbsp;next window</li>
    <li><code>C-b p</code> &nbsp;previous window</li>
    <li><code>Esc</code> &nbsp;cancel prefix</li>
  </ul>
</Toast>

<style>
  .prefix {
    position: fixed;
    bottom: clamp(14px, 2.4vw, 24px);
    left:   clamp(14px, 2.4vw, 24px);
    z-index: 70;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--color-rose);
    color: var(--color-ink);
    font-family: var(--font-terminal);
    font-size: 12px;
    letter-spacing: 0.10em;
    text-transform: lowercase;
    box-shadow: 4px 4px 0 rgb(0 0 0 / 0.45);
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
  }
  .prefix .key {
    background: var(--color-ink);
    color: var(--color-rose);
    font-family: var(--font-mono);
    padding: 1px 6px;
    letter-spacing: 0.02em;
  }
  .prefix .state { opacity: 0.85; }
  .prefix .cur {
    display: inline-block;
    width: 0.6ch;
    color: var(--color-crimson);
    animation: var(--animate-blink);
  }

  @media (max-width: 460px) {
    .prefix { font-size: 11px; padding: 5px 8px; bottom: 10px; left: 10px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .prefix .cur { animation: none; opacity: 1; }
  }
</style>
