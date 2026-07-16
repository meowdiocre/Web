<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {'default'|'danger'} ActionTone
   * @typedef {'idle'|'loading'|'error'|'success'} ActionState
   *
   * @typedef {Object} Props
   * @property {string} label
   * @property {import('$lib/icons/icon-names').IconName} icon
   * @property {string} [href]
   * @property {ActionTone} [tone]
   * @property {'button'|'submit'|'reset'} [type]
   * @property {boolean} [disabled]
   * @property {ActionState} [state]
   * @property {(event: MouseEvent) => void} [onclick]
   */

  /** @type {Props} */
  let {
    label,
    icon,
    href = '',
    tone = 'default',
    type = 'button',
    disabled = false,
    state = 'idle',
    onclick
  } = $props();

  const inactive = $derived(disabled || state === 'loading');
  const stateIcon = $derived(state === 'success' ? 'check' : state === 'error' ? 'close' : icon);

  /** @param {MouseEvent} event */
  function handleClick(event) {
    if (inactive) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }
</script>

{#if href}
  <a
    href={inactive ? undefined : href}
    class="action-menu-item flex min-h-11 w-full cursor-pointer items-center gap-[9px] whitespace-nowrap
           border-0 bg-transparent px-3 py-2.5 text-left font-mono text-[11px] tracking-[0.06em]
           no-underline transition-[background-color,color,transform] duration-[120ms]
           hover:bg-accent-wash-medium hover:text-rose
           focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose
           [&:active:not([aria-disabled='true'])]:translate-y-px
           aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:translate-y-0
           data-[state=error]:text-rose data-[state=success]:text-paper-2 motion-reduce:duration-0
           {tone === 'danger' ? 'text-rose' : 'text-paper'}"
    class:action-menu-item--danger={tone === 'danger'}
    data-state={state}
    aria-disabled={inactive ? 'true' : undefined}
    onclick={handleClick}
  >
    <PixelIcon name={stateIcon} size={14} />
    <span>{label}</span>
  </a>
{:else}
  <button
    {type}
    disabled={inactive}
    class="action-menu-item flex min-h-11 w-full cursor-pointer items-center gap-[9px] whitespace-nowrap
           border-0 bg-transparent px-3 py-2.5 text-left font-mono text-[11px] tracking-[0.06em]
           no-underline transition-[background-color,color,transform] duration-[120ms]
           hover:bg-accent-wash-medium hover:text-rose
           focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose
           [&:active:not(:disabled)]:translate-y-px disabled:cursor-not-allowed disabled:opacity-50
           disabled:active:translate-y-0 data-[state=error]:text-rose data-[state=success]:text-paper-2
           motion-reduce:duration-0 {tone === 'danger' ? 'text-rose' : 'text-paper'}"
    class:action-menu-item--danger={tone === 'danger'}
    data-state={state}
    aria-busy={state === 'loading' ? 'true' : undefined}
    onclick={handleClick}
  >
    <PixelIcon name={stateIcon} size={14} />
    <span>{label}</span>
  </button>
{/if}
