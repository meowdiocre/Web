import { ALL_ICON_NAMES } from './icon-names.generated';

export const ICON_NAMES = ALL_ICON_NAMES;
export type IconName = (typeof ICON_NAMES)[number];

// ponytail: recommendations only; search covers the complete generated registry.
export const CATEGORY_ICON_OPTIONS = [
  { value: 'book-open', label: 'Book' },
  { value: 'bug', label: 'Bug' },
  { value: 'cpu', label: 'CPU' },
  { value: 'terminal', label: 'Terminal' },
  { value: 'script', label: 'Script' },
  { value: 'radio', label: 'Radio' },
  { value: 'skull', label: 'Skull' },
  { value: 'folder', label: 'Folder' }
] as const satisfies ReadonlyArray<{ value: IconName; label: string }>;

export type CategoryIconName = IconName;
export const DEFAULT_CATEGORY_ICON = 'book-open' satisfies CategoryIconName;

const iconNames = new Set<string>(ICON_NAMES);

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && iconNames.has(value);
}

export function isCategoryIconName(value: unknown): value is CategoryIconName {
  return isIconName(value);
}

export function normalizeIconName(value: unknown): IconName {
  return isIconName(value) ? value : DEFAULT_CATEGORY_ICON;
}

export function normalizeCategoryIcon(value: unknown): CategoryIconName {
  return normalizeIconName(value);
}

export function formatIconLabel(value: IconName): string {
  return value.replaceAll('-', ' ');
}
