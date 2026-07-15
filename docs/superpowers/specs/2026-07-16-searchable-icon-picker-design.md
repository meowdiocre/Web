# Searchable Icon Picker Design

## Goal

Let editors search and select any icon shipped by the installed `pixelarticons` package. Keep category creation form-native, keyboard accessible, and reusable outside categories.

## Selected approach

Use an inline searchable SVG grid. The installed package contains 877 SVG files, while its bundled webfont exposes only 813 icons. SVG assets are the complete source of truth.

The picker shows recommended icons before the user searches. A search checks every installed icon name and renders at most 80 matches. The selected icon remains in the radio group even when it does not match the current query.

## Architecture

### Generated package registry

Add `scripts/generate-pixel-icon-registry.ts`. It reads `node_modules/pixelarticons/svg/*.svg`, sorts the filenames, and generates:

- `src/lib/icons/icon-names.generated.ts` with every available icon name;
- `src/lib/icons/pixel-icon-assets.generated.ts` with one `?url` import and a complete asset map.

Add `npm run icons:generate` so package upgrades have one explicit refresh step. Generated files carry a short header telling maintainers not to edit them by hand.

`src/lib/icons/icon-names.ts` stays handwritten. It imports the generated names and owns types, guards, labels, recommended category icons, and fallback behavior. `IconName` becomes the union of every installed icon name. `isCategoryIconName` remains as a compatibility alias that accepts any valid package icon.

`PixelIcon.svelte` uses the generated asset map. Existing callers keep the same API.

### Reusable picker

Add `src/lib/components/admin/IconPicker.svelte` with these props:

- `name`, default `icon`;
- `value`, default `book-open`;
- `label`, default `icon`;
- `disabled`, default `false`;
- `recommended`, default empty.

The component contains:

- a labeled search input;
- a result count;
- a native radio group;
- an empty-result message;
- a note when more than 80 results match.

Search is case-insensitive and matches the kebab-case icon name. Display labels replace hyphens with spaces. The selected icon is pinned into the rendered options so its checked radio remains present for native form submission.

`CategoryIconPicker.svelte` becomes a thin wrapper. It supplies `CATEGORY_ICON_OPTIONS` as the initial recommended set and keeps the current category form API. `CategoryForm.svelte` continues to use the wrapper.

## Data flow

1. The generated name registry defines valid package icons.
2. `IconPicker` searches those names and submits the selected value as `icon`.
3. `newCategorySchema` accepts values recognized by `isCategoryIconName`.
4. The existing workflow stores the name in `categories.icon`.
5. `normalizeCategoryIcon` preserves valid stored names and falls back to `book-open` for missing or stale values.
6. Admin and public components render the stored name through `PixelIcon`.

No database migration changes are required. The existing `varchar(64)` column fits the installed icon names.

## Performance limits

- Search indexes names only. It does not parse SVG content.
- Empty search renders recommended icons, not all 877 icons.
- Search renders at most 80 matches and asks for a narrower query when truncated.
- The generated asset map includes all package URLs, but browsers fetch only SVGs that are rendered.

## Accessibility

- The search input has a visible label.
- Options remain native radios with visible text labels.
- Keyboard users can tab to the group and use native radio controls.
- Focus, hover, active, selected, and disabled states use the existing admin tokens.
- Result counts use `aria-live="polite"`.
- Decorative icon previews remain hidden from assistive technology through `PixelIcon`.

## Error handling

- Empty searches show the recommended set.
- Searches with no matches show `No icons found.`
- Unknown submitted names fail server validation.
- Unknown stored names render `book-open`.
- Missing package SVG directories make the generator exit with a clear error.

## Testing

- Registry tests verify every generated name has an asset and known non-recommended icons are valid.
- Validation tests accept an icon outside the original curated set and reject unknown names.
- Component tests search for a non-recommended icon, select it, and verify its radio value.
- Component tests cover no matches, selected-value pinning, and the 80-result ceiling.
- Existing category form tests verify the selected value survives form rendering.

Run:

```bash
npm run check
npm run test
```

## Scope limits

- No fuzzy-search dependency. Substring matching is enough.
- No modal or popover.
- No virtualization library.
- No icon aliases, tags, or semantic metadata beyond package filenames.
- No category editing flow.
- No production files are deleted.
