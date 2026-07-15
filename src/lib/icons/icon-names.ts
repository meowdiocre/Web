export const ICON_NAMES = [
  'skull',
  'book-open',
  'mail',
  'terminal',
  'cpu',
  'script',
  'bug',
  'arrow-right',
  'moon',
  'radio',
  'rss',
  'article',
  'plus',
  'folder',
  'external-link',
  'logout',
  'menu',
  'close',
  'more-vertical',
  'pencil',
  'send',
  'archive',
  'trash',
  'eye',
  'check',
  'save'
] as const;

export type IconName = (typeof ICON_NAMES)[number];

// ponytail: curated category icons only; add an option and asset import when editors need another choice.
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

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number]['value'];
export const DEFAULT_CATEGORY_ICON: CategoryIconName = 'book-open';

const categoryIconNames = new Set<string>(CATEGORY_ICON_OPTIONS.map((option) => option.value));

export function isCategoryIconName(value: unknown): value is CategoryIconName {
  return typeof value === 'string' && categoryIconNames.has(value);
}

export function normalizeCategoryIcon(value: unknown): CategoryIconName {
  return isCategoryIconName(value) ? value : DEFAULT_CATEGORY_ICON;
}
