<script>
  import IconPicker from '$lib/components/admin/IconPicker.svelte';
  import { CATEGORY_ICON_OPTIONS, DEFAULT_CATEGORY_ICON } from '$lib/icons/icon-names';

  /**
   * @typedef {Object} Props
   * @property {string} [name]
   * @property {string} [value]
   * @property {boolean} [disabled]
   */

  /** @type {Props} */
  let { name = 'icon', value = DEFAULT_CATEGORY_ICON, disabled = false } = $props();
</script>

<IconPicker
  {name}
  {value}
  label="icon"
  {disabled}
  recommended={CATEGORY_ICON_OPTIONS}
/>
