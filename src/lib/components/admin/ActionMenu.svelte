<script>
  import { onMount } from 'svelte';
  import PixelIcon from '$lib/components/PixelIcon.svelte';

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
  /** @type {HTMLButtonElement|undefined} */
  let trigger = $state();
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

  /** @param {MouseEvent} event */
  function onClick(event) {
    if (!open || !root || !(event.target instanceof Node)) return;

    const trigger = root.querySelector('.menu-trigger');
    if (root.contains(event.target) && !trigger?.contains(event.target)) close();
  }

  /** @param {KeyboardEvent} event */
  function onKeyDown(event) {
    if (event.key === 'Escape' && open) {
      close();
      trigger?.focus();
    }
  }

  onMount(() => {
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<div bind:this={root} class="relative inline-flex">
  <button
    bind:this={trigger}
    type="button"
    aria-label={label}
    aria-expanded={open}
    onclick={toggle}
    class="menu-trigger"
  >
    <PixelIcon name="more-vertical" size={18} />
  </button>

  {#if open}
    <div class="menu-items menu-items--{align}">
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
    width: 44px;
    height: 44px;
    border: 1px solid var(--line-soft);
    background: transparent;
    color: var(--color-paper);
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
  }
  .menu-trigger:hover,
  .menu-trigger[aria-expanded='true'] {
    border-color: var(--color-rose);
    background: var(--admin-accent-wash);
  }
  .menu-items {
    position: absolute;
    top: calc(100% + 8px);
    z-index: 20;
    min-width: 220px;
    max-width: calc(100vw - 24px);
    border: 1px solid var(--admin-accent-line);
    background: var(--color-ink-2);
    box-shadow: var(--admin-menu-shadow);
    padding: 6px;
  }
  .menu-items--right { right: 0; }
  .menu-items--left { left: 0; }
</style>
