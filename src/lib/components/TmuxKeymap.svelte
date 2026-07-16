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
  <div class="fixed bottom-[clamp(14px,2.4vw,24px)] left-[clamp(14px,2.4vw,24px)] z-[70] inline-flex items-center gap-2 bg-rose px-2.5 py-1.5 font-terminal text-xs tracking-[0.1em] text-ink lowercase shadow-hard-sm [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_8px),calc(100%_-_8px)_100%,0_100%)] max-[460px]:bottom-2.5 max-[460px]:left-2.5 max-[460px]:px-2 max-[460px]:py-[5px] max-[460px]:text-xs-plus" role="status" aria-live="polite" transition:fade={{ duration: 120 }}>
    <span class="bg-ink px-1.5 py-px font-mono tracking-[0.02em] text-rose">C-b</span>
    <span class="opacity-85">prefix</span>
    <span class="inline-block w-[0.6ch] animate-blink text-crimson motion-reduce:animate-none motion-reduce:opacity-100" aria-hidden="true">_</span>
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
    <li><code>C-b r</code> &nbsp;reader panel</li>
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
    <li><code>C-b r</code> &nbsp;reader panel</li>
    <li><code>C-b n</code> &nbsp;next window</li>
    <li><code>C-b p</code> &nbsp;previous window</li>
    <li><code>Esc</code> &nbsp;cancel prefix</li>
  </ul>
</Toast>
