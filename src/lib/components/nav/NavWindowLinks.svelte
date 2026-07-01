<script>
  import { NAV_WINDOWS } from '$lib/config/site.js';

  /** @typedef {'home'|'writing'|'about'} Current */

  /** @type {{ current: Current, mobile?: boolean, close?: () => void }} */
  let {
    current,
    mobile = false,
    close = () => {}
  } = $props();
</script>

{#each NAV_WINDOWS as window (window.key)}
  <a
    class:nav-window={true}
    class:nav-window-mobile={mobile}
    class:nav-window-desktop={!mobile}
    class:is-current={current === window.key}
    href={window.path}
    data-sveltekit-preload-data="tap"
    data-sveltekit-preload-code="hover"
    aria-current={current === window.key ? 'page' : undefined}
    onclick={close}
  >
    {#if mobile}
      <span class="prompt" aria-hidden="true">$</span>
    {:else}
      <span class="idx">{window.idx}:</span>
    {/if}
    <span>{window.name}</span>
    {#if current === window.key}
      <span class="mark-active" aria-hidden="true">*</span>
    {/if}
  </a>
{/each}

<style>
  .nav-window {
    color: var(--color-bone);
    transition: color 0.12s, background 0.12s, border-left-color 0.12s;
  }

  .nav-window-desktop {
    display: inline-flex;
    align-items: baseline;
    height: 24px;
    padding: 0 7px;
    letter-spacing: 0.04em;
    line-height: 24px;
    white-space: nowrap;
  }

  .nav-window-desktop .idx {
    color: var(--color-muted);
    margin-right: 5px;
  }

  .nav-window-desktop .mark-active {
    color: var(--color-ink);
    margin-left: 3px;
    font-weight: 700;
  }

  .nav-window-desktop:hover {
    color: var(--color-rose);
    background: rgb(232 156 146 / 0.08);
  }

  .nav-window-desktop:hover .idx {
    color: var(--color-rose);
  }

  .nav-window-desktop.is-current {
    background: var(--color-rose);
    color: var(--color-ink);
  }

  .nav-window-desktop.is-current .idx {
    color: var(--color-ink);
    opacity: 0.55;
  }

  .nav-window-mobile {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 18px;
    width: 100%;
    border-left: 3px solid transparent;
    font-size: 14px;
    letter-spacing: 0.04em;
  }

  .nav-window-mobile .prompt {
    color: var(--color-muted);
    opacity: 0.55;
    font-family: var(--font-terminal);
    flex-shrink: 0;
  }

  .nav-window-mobile .mark-active {
    margin-left: auto;
    color: var(--color-crimson);
    font-family: var(--font-terminal);
    font-weight: 700;
  }

  .nav-window-mobile:hover,
  .nav-window-mobile:focus-visible {
    background: rgb(232 156 146 / 0.06);
    color: var(--color-rose);
    border-left-color: var(--color-rose);
  }

  .nav-window-mobile:hover .prompt,
  .nav-window-mobile:focus-visible .prompt {
    color: var(--color-rose);
    opacity: 0.85;
  }

  .nav-window-mobile.is-current {
    background: rgb(232 156 146 / 0.09);
    color: var(--color-rose);
    border-left-color: var(--color-rose);
  }

  .nav-window-mobile.is-current .prompt {
    color: var(--color-rose);
    opacity: 0.85;
  }
</style>
