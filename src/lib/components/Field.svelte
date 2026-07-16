<script>
  /**
   * @typedef {'input'|'textarea'|'select'|'datetime'} FieldKind
   *
   * @typedef {Object} Props
   * @property {string}                    name
   * @property {string}                    label
   * @property {string}                    [value]
   * @property {FieldKind}                 [kind]
   * @property {string}                    [type]         <input type> when kind='input'
   * @property {number}                    [rows]         <textarea rows>
   * @property {boolean}                   [required]
   * @property {string}                    [placeholder]
   * @property {string}                    [help]
   * @property {import('svelte').Snippet}  [children]     <option>s for kind='select'
   */

  /** @type {Props} */
  let {
    name,
    label,
    value = '',
    kind  = 'input',
    type  = 'text',
    rows  = 3,
    required    = false,
    placeholder = '',
    help = '',
    children
  } = $props();

  const inputClass = `min-h-11 w-full rounded-none border border-[var(--line-soft)] bg-ink-2
    px-3 py-2.5 font-sans text-[15px] text-paper outline outline-2 outline-transparent
    outline-offset-1 focus-visible:outline-rose disabled:cursor-not-allowed disabled:opacity-[0.55]`;
</script>

<label class="grid min-w-0 gap-2">
  <span class="font-mono text-2xs tracking-meta text-muted">{label}</span>

  {#if kind === 'textarea'}
    <textarea class="{inputClass} min-h-20 resize-y" {name} {rows} {required} {placeholder}>{value}</textarea>

  {:else if kind === 'select'}
    <select class={inputClass} {name} {required}>
      {@render children?.()}
    </select>

  {:else if kind === 'datetime'}
    <input class={inputClass} type="datetime-local" {name} {value} {required} />

  {:else}
    <input class={inputClass} {name} {value} {type} {required} {placeholder} />
  {/if}
</label>

{#if help}
  <p class="-mt-0.5 font-sans text-[12px] leading-6 text-muted">{help}</p>
{/if}
