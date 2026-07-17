<script>
  import BlogSearchBar from './BlogSearchBar.svelte';
  import BlogCategoryFilters from './BlogCategoryFilters.svelte';
  import BlogEntryFeed from './BlogEntryFeed.svelte';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import { reveal } from '$lib/motion/reveal';
  import {
    buildCategorySummaries,
    categoryKey,
    filterEntries,
    flattenEntryGroups,
    groupEntriesByYear
  } from '$lib/blog/entries';

  /** @typedef {import('$lib/server/db/queries').EntryGroup} EntryGroup */
  /** @typedef {{ entryGroups?: EntryGroup[], query?: string, selectedCategory?: string }} Props */

  const PAGE_SIZE = 12;

  /** @type {Props} */
  let {
    entryGroups = [],
    query = $bindable(''),
    selectedCategory = $bindable('all')
  } = $props();

  let visibleCount = $state(PAGE_SIZE);
  let lastFilterKey = '';

  const entries = $derived(flattenEntryGroups(entryGroups));
  const categories = $derived(buildCategorySummaries(entries));
  const totalCount = $derived(entries.length);
  const normalizedCategory = $derived(categoryKey(selectedCategory || 'all') || 'all');
  const categoryIsValid = $derived(
    normalizedCategory === 'all' || categories.some((category) => category.key === normalizedCategory)
  );
  const activeCategory = $derived(categoryIsValid ? normalizedCategory : 'all');
  const filteredEntries = $derived(filterEntries(entries, query, activeCategory));
  const visibleEntries = $derived(filteredEntries.slice(0, visibleCount));
  const visibleGroups = $derived(groupEntriesByYear(visibleEntries));
  const filteredCount = $derived(filteredEntries.length);
  const remainingCount = $derived(Math.max(filteredCount - visibleEntries.length, 0));
  const filterKey = $derived(`${activeCategory}::${query.trim().toLowerCase()}`);

  $effect(() => {
    if (!categoryIsValid) selectedCategory = 'all';
  });

  $effect(() => {
    if (filterKey === lastFilterKey) return;
    lastFilterKey = filterKey;
    visibleCount = PAGE_SIZE;
  });

  $effect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const nextQuery = query.trim();

    if (nextQuery) url.searchParams.set('q', nextQuery);
    else url.searchParams.delete('q');

    if (activeCategory !== 'all') url.searchParams.set('category', activeCategory);
    else url.searchParams.delete('category');

    window.history.replaceState(window.history.state, '', url);
  });

  function showMore() {
    visibleCount += PAGE_SIZE;
  }
</script>

<section class="px-[var(--gutter)] pt-2.5" aria-label="Filter entries">
  <div class="mx-auto grid max-w-[880px] gap-2.5" use:reveal={{ y: 12 }}>
    <a
      class="group inline-flex min-h-11 w-fit items-center gap-2 justify-self-end border-b border-paper-ink-strong font-mono text-[11px] text-paper-ink-strong transition-colors duration-150 hover:border-crimson-deep hover:text-crimson-deep max-[600px]:justify-self-start max-[600px]:text-[12px]"
      href="/blog/graph"
    >
      <PixelIcon name="git-branch" size={14} />
      explore knowledge graph
      <PixelIcon name="arrow-right" size={12} class="transition-transform duration-150 group-hover:translate-x-0.5" />
    </a>

    <BlogSearchBar
      bind:query
      resultCount={filteredCount}
      {totalCount}
    />

    <BlogCategoryFilters bind:selected={selectedCategory} {categories} />
  </div>
</section>

<BlogEntryFeed
  entryGroups={visibleGroups}
  {filteredCount}
  visibleCount={visibleEntries.length}
  {remainingCount}
  onShowMore={showMore}
/>
