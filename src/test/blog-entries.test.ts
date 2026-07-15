import { describe, expect, it } from 'vitest';
import { buildCategorySummaries, flattenEntryGroups, groupEntriesByYear } from '$lib/blog/entries';

describe('blog category icons', () => {
  const groups = [{
    year: 2026,
    entries: [{
      href: '/blog/reverse/a',
      date: 'Jul 15',
      title: 'A',
      desc: 'A post',
      category: 'Reverse',
      categoryIcon: 'bug' as const
    }]
  }];

  it('keeps the icon in summaries and regrouped entries', () => {
    const entries = flattenEntryGroups(groups);
    expect(buildCategorySummaries(entries)).toEqual([
      { key: 'reverse', label: 'Reverse', icon: 'bug', count: 1 }
    ]);
    expect(groupEntriesByYear(entries)[0].entries[0].categoryIcon).toBe('bug');
  });
});
