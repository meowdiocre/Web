import type { EntryGroup as PublicEntryGroup, PublicEntry } from '$lib/server/db/queries';

export type BlogEntry = PublicEntry & { year: number };
export type BlogEntryGroup = PublicEntryGroup;

export interface BlogCategorySummary {
  key: string;
  label: string;
  count: number;
}

export function categoryKey(label: string): string {
  return label.trim().toLowerCase();
}

export function flattenEntryGroups(groups: BlogEntryGroup[]): BlogEntry[] {
  return groups.flatMap((group) =>
    group.entries.map((entry) => ({
      ...entry,
      year: group.year
    }))
  );
}

export function buildCategorySummaries(entries: BlogEntry[]): BlogCategorySummary[] {
  const byKey = new Map<string, BlogCategorySummary>();

  for (const entry of entries) {
    const label = entry.category.trim();
    if (!label) continue;

    const key = categoryKey(label);
    const current = byKey.get(key);
    if (current) current.count += 1;
    else byKey.set(key, { key, label, count: 1 });
  }

  return [...byKey.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label);
  });
}

export function filterEntries(entries: BlogEntry[], query: string, category: string): BlogEntry[] {
  const needle = query.trim().toLowerCase();
  const categoryFilter = category.trim().toLowerCase();

  return entries.filter((entry) => {
    if (categoryFilter && categoryFilter !== 'all' && categoryKey(entry.category) !== categoryFilter) {
      return false;
    }

    if (!needle) return true;

    const haystack = `${entry.title} ${entry.desc} ${entry.category}`.toLowerCase();
    return haystack.includes(needle);
  });
}

export function groupEntriesByYear(entries: BlogEntry[]): BlogEntryGroup[] {
  const byYear = new Map<number, BlogEntryGroup['entries']>();

  for (const entry of entries) {
    const item = {
      href: entry.href,
      date: entry.date,
      title: entry.title,
      desc: entry.desc,
      category: entry.category,
      readTime: entry.readTime
    };

    const current = byYear.get(entry.year);
    if (current) current.push(item);
    else byYear.set(entry.year, [item]);
  }

  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, yearEntries]) => ({ year, entries: yearEntries }));
}
