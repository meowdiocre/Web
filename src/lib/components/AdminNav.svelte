<script>
  import { page } from '$app/stores';
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {Object} NavLink
   * @property {string}                  href
   * @property {string}                  label
   * @property {import('$lib/icons/icon-names').IconName} icon
   * @property {boolean}                 [external]   external/site link
   * @property {(path: string)=>boolean} [match]      custom active matcher
   *
   * @typedef {Object} NavSection
   * @property {string}    label
   * @property {NavLink[]} links
   */

  /** @type {{ user: { githubLogin: string, name: string|null }|null }} */
  let { user } = $props();

  let open = $state(false);

  $effect(() => { void $page.url.pathname; open = false; });

  /** @type {NavSection[]} */
  const sections = [
    {
      label: 'workspace',
      links: [
        {
          href: '/admin',
          label: 'posts',
          icon: 'article',
          match: (p) => p === '/admin' || (p.startsWith('/admin/posts/') && p !== '/admin/posts/new')
        },
        {
          href: '/admin/posts/new',
          label: 'new post',
          icon: 'plus',
          match: (p) => p === '/admin/posts/new'
        },
        {
          href: '/admin/categories',
          label: 'categories',
          icon: 'folder',
          match: (p) => p === '/admin/categories'
        }
      ]
    },
    {
      label: 'external',
      links: [
        { href: '/', label: 'view site', icon: 'external-link', external: true }
      ]
    }
  ];

  /** @param {NavLink} link */
  function isActive(link) {
    if (link.external) return false;
    const p = $page.url.pathname;
    return link.match ? link.match(p) : p === link.href;
  }
</script>

{#snippet navList()}
  <div class="space-y-[18px]">
    {#each sections as section (section.label)}
      <div>
        <p
          class="mb-1.5 flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] text-muted
                 after:h-px after:flex-1 after:bg-[var(--line-soft)] after:content-['']"
        >{section.label}</p>
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
        {#each section.links as link (link.href)}
          {@const active = isActive(link)}
          <li>
            <a
              href={link.href}
              data-sveltekit-preload-data="tap"
              data-sveltekit-preload-code="hover"
              class="group relative grid min-h-11 grid-cols-[16px_1fr] items-center gap-2
                     py-2 pr-2.5 pl-3 font-mono text-[12px] tracking-[0.06em] no-underline
                     transition-[color,background-color] duration-[120ms]
                     hover:bg-accent-wash hover:text-rose
                     focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2
                     focus-visible:outline-rose motion-reduce:duration-0
                     {active
                       ? `bg-accent-wash text-rose before:absolute before:inset-y-1
                          before:left-0 before:w-0.5 before:bg-crimson before:content-['']`
                       : 'text-muted'}"
              aria-current={active ? 'page' : undefined}
            >
              <span class="inline-flex items-center leading-none group-hover:text-rose" aria-hidden="true">
                <PixelIcon name={link.icon} size={14} />
              </span>
              <span>{link.label}</span>
            </a>
          </li>
        {/each}
        </ul>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet brand(small = false)}
  <a
    href="/admin"
    data-sveltekit-preload-data="tap"
    data-sveltekit-preload-code="hover"
    class="block leading-tight no-underline"
  >
    <p class="font-mono tracking-[0.1em] text-muted
              {small ? 'text-[9px]' : 'text-[10px] mb-1'}">~/admin</p>
    <h2 class="font-display tracking-[-0.01em] text-paper
               {small ? 'text-[15px]' : 'text-[18px]'}">meowdiocre</h2>
  </a>
{/snippet}

{#snippet account()}
  {#if user}
    <div>
      <p class="mb-2 font-mono text-[10px] tracking-[0.1em] text-muted">@{user.githubLogin}</p>
      <form method="POST" action="/admin/logout">
        <button
          class="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-accent-line
                 bg-transparent px-2.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-rose
                 transition-[background-color,border-color,color] duration-[120ms]
                 hover:border-crimson-deep hover:bg-crimson-deep hover:text-paper
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose
                 motion-reduce:duration-0"
          type="submit"
        >
          <PixelIcon name="logout" size={14} />
          <span>sign out</span>
        </button>
      </form>
    </div>
  {/if}
{/snippet}

<header
  class="md:hidden sticky top-0 z-30 flex items-center justify-between
         border-b border-[var(--line-soft)] bg-ink-2 px-5 py-3"
>
  {@render brand(true)}

  <button
    type="button"
    aria-expanded={open}
    aria-controls="admin-menu"
    aria-label={open ? 'Close menu' : 'Open menu'}
    onclick={() => (open = !open)}
    class="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] tracking-[0.08em]
           border border-[var(--line-soft)] px-3 py-2 text-paper
           hover:text-rose hover:border-rose transition-colors duration-[120ms]
           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose
           motion-reduce:duration-0"
  >
    <PixelIcon name={open ? 'close' : 'menu'} size={16} />
    <span>{open ? 'close' : 'menu'}</span>
  </button>
</header>

{#if open}
  <div
    id="admin-menu"
    class="md:hidden border-b border-[var(--line-soft)] bg-ink-2 px-3 py-4"
  >
    {@render navList()}
    <div class="px-3 pt-4 mt-4 border-t border-[var(--line-soft)]">
      {@render account()}
    </div>
  </div>
{/if}

<aside
  class="hidden md:flex md:flex-col relative
         border-r border-[var(--line-soft)] bg-ink-2"
>
  <div class="px-6 pt-8 pb-6">
    {@render brand(false)}
  </div>

  <div class="flex-1 px-3 overflow-y-auto">
    {@render navList()}
  </div>

  <div class="border-t border-[var(--line-soft)] px-6 py-5">
    {@render account()}
  </div>
</aside>
