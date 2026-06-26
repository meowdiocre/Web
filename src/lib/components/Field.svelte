<!--
  Field — unified form field for the admin forms.

  Wraps the `.field` / `.lbl` / `.inp` markup so every admin form gets
  the same label-on-top layout, the same focus ring, and the same
  consistent textarea/select/datetime variants without re-typing the
  boilerplate.

  Inputs are uncontrolled (plain `name` + `value`) because SvelteKit's
  form actions read FormData straight off the submitted form — no JS
  binding required.

  ```svelte
  <Field name="slug" label="slug" value={p.slug} required />
  <Field name="dek"  label="dek (subtitle)" kind="textarea" rows={3} value={p.dek} />
  <Field name="category" label="category" kind="select" required>
    {#each categories as c}
      <option value={c.slug} selected={c.slug === current}>{c.label}</option>
    {/each}
  </Field>
  <Field name="publishAt" label="publish at (UTC)" kind="datetime" value={…} />
  ```
-->
<script>
  /**
   * @typedef {'input'|'textarea'|'select'|'datetime'} FieldKind
   *
   * @typedef {Object} Props
   * @property {string}                    name
   * @property {string}                    label
   * @property {string}                    [value]
   * @property {FieldKind}                 [kind]         default 'input'
   * @property {string}                    [type]         <input type> when kind='input'
   * @property {number}                    [rows]         <textarea rows>
   * @property {boolean}                   [required]
   * @property {string}                    [placeholder]
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
    children
  } = $props();
</script>

<label class="field">
  <span class="lbl">{label}</span>

  {#if kind === 'textarea'}
    <textarea class="inp" {name} {rows} {required} {placeholder}>{value}</textarea>

  {:else if kind === 'select'}
    <select class="inp" {name} {required}>
      {@render children?.()}
    </select>

  {:else if kind === 'datetime'}
    <input class="inp" type="datetime-local" {name} {value} {required} />

  {:else}
    <input class="inp" {name} {value} {type} {required} {placeholder} />
  {/if}
</label>
