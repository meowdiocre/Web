<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import { SITE } from '$lib/config/site.js';

  /** @type {{ close?: () => void }} */
  let { close = () => {} } = $props();

  let copied = $state(false);
  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let timer;

  async function copyDiscord() {
    try {
      await navigator.clipboard.writeText(SITE.discord);
      copied = true;
      clearTimeout(timer);
      timer = setTimeout(() => { copied = false; }, 1800);
    } catch {
      copied = false;
    }
  }
</script>

<nav
  id="mobile-menu"
  aria-label="Mobile menu"
  class="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-50
         border-y border-rose/[0.22] bg-overlay-strong px-3 py-3 font-terminal text-bone
         shadow-menu backdrop-blur-[18px] backdrop-saturate-150"
>
  <p class="px-2 pb-2 font-mono text-[10px] tracking-[0.12em] text-muted">connect</p>

  <div class="grid gap-px overflow-hidden border border-rose/[0.18] bg-rose/[0.18]">
    <a
      href={`https://github.com/${SITE.github}`}
      target="_blank"
      rel="noreferrer"
      onclick={close}
      class="group flex min-h-14 items-center gap-3 bg-overlay-strong px-3 no-underline
             transition-colors duration-150 hover:bg-accent-wash-strong focus-visible:bg-accent-wash-strong
             active:bg-accent-wash-strong motion-reduce:duration-0"
    >
      <span class="grid size-9 shrink-0 place-items-center bg-accent-wash text-rose">
        <PixelIcon name="terminal" size={18} />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-sm text-bone group-hover:text-rose group-focus-visible:text-rose">GitHub</span>
        <span class="block truncate font-mono text-[10px] tracking-[0.04em] text-muted">@{SITE.github}</span>
      </span>
      <PixelIcon name="external-link" size={16} class="text-muted group-hover:text-rose group-focus-visible:text-rose" />
    </a>

    <button
      type="button"
      aria-label={`Copy Discord username @${SITE.discord}`}
      onclick={copyDiscord}
      class="group flex min-h-14 w-full items-center gap-3 bg-overlay-strong px-3 text-left
             transition-colors duration-150 hover:bg-accent-wash-strong focus-visible:bg-accent-wash-strong
             active:bg-accent-wash-strong motion-reduce:duration-0"
    >
      <span class="grid size-9 shrink-0 place-items-center bg-accent-wash text-rose">
        <PixelIcon name="message" size={18} />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-sm text-bone group-hover:text-rose group-focus-visible:text-rose">Discord</span>
        <span aria-live="polite" class="block truncate font-mono text-[10px] tracking-[0.04em] text-muted">
          {copied ? 'Copied' : `@${SITE.discord}`}
        </span>
      </span>
      <PixelIcon name={copied ? 'check' : 'copy'} size={16} class={copied ? 'text-rose' : 'text-muted group-hover:text-rose group-focus-visible:text-rose'} />
    </button>
  </div>
</nav>
