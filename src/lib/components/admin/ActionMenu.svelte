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
    if (!root.contains(event.target) || trigger?.contains(event.target)) return;

    const action = event.target instanceof Element
      ? event.target.closest('button, a')
      : null;
    if (action instanceof HTMLButtonElement && action.type === 'submit') return;

    queueMicrotask(close);
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
    class="menu-trigger inline-flex size-11 cursor-pointer items-center justify-center gap-1
           border border-[var(--line-soft)] bg-transparent text-paper
           transition-[border-color,background-color] duration-150
           hover:border-rose hover:bg-accent-wash
           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose
           aria-expanded:border-rose aria-expanded:bg-accent-wash
           motion-reduce:duration-0"
  >
    <PixelIcon name="more-vertical" size={18} />
  </button>

  {#if open}
    <div
      class="absolute top-[calc(100%+8px)] z-20 min-w-[220px] max-w-[calc(100vw-24px)]
             border border-accent-line bg-ink-2 p-1.5 shadow-menu
             {align === 'right' ? 'right-0' : 'left-0'}"
    >
      {@render children?.()}
    </div>
  {/if}
</div>
