<script>
  import { onMount } from 'svelte';

  /**
   * @typedef {Object} Props
   * @property {string} [label]
   * @property {'left'|'right'} [align]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { label = 'Open actions', align = 'right', children } = $props();

  /** @type {HTMLDivElement|undefined} */
  let root = $state();
  let open = $state(false);

  function close() {
    open = false;
  }

  function toggle() {
    open = !open;
  }

  /** @param {PointerEvent} event */
  function onPointerDown(event) {
    if (open && root && !root.contains(/** @type {Node} */ (event.target))) {
      close();
    }
  }

  /** @param {KeyboardEvent} event */
  function onKeyDown(event) {
    if (event.key === 'Escape') close();
  }

  onMount(() => {
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<div bind:this={root} class="relative inline-flex">
  <button
    type="button"
    aria-label={label}
    aria-expanded={open}
    onclick={toggle}
    class="menu-trigger"
  >
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  </button>

  {#if open}
    <div
      class="menu-items menu-items--{align}"
      role="menu"
      tabindex="-1"
      onclick={close}
      onkeydown={(event) => {
        if (event.key === 'Escape') close();
      }}
    >
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .menu-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 36px;
    height: 36px;
    border: 1px solid var(--line-soft);
    background: transparent;
    color: var(--color-paper);
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
  }
  .menu-trigger:hover,
  .menu-trigger[aria-expanded='true'] {
    border-color: var(--color-rose);
    background: rgb(232 156 146 / 0.06);
  }
  .dot {
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: currentColor;
  }
  .menu-items {
    position: absolute;
    top: calc(100% + 8px);
    z-index: 20;
    min-width: 220px;
    border: 1px solid rgb(232 156 146 / 0.25);
    background: var(--color-ink-2);
    box-shadow: 0 16px 32px rgb(0 0 0 / 0.35);
    padding: 6px;
  }
  .menu-items--right { right: 0; }
  .menu-items--left { left: 0; }
</style>
