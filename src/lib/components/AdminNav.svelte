<script>
  import { page } from '$app/stores';

  /**
   * @typedef {Object} NavLink
   * @property {string}                  href
   * @property {string}                  label
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
          match: (p) => p === '/admin' || (p.startsWith('/admin/posts/') && p !== '/admin/posts/new')
        },
        {
          href: '/admin/posts/new',
          label: 'new post',
          match: (p) => p === '/admin/posts/new'
        },
        {
          href: '/admin/categories',
          label: 'categories',
          match: (p) => p === '/admin/categories'
        }
      ]
    },
    {
      label: 'external',
      links: [
        { href: '/', label: 'view site', external: true }
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
  {#each sections as section (section.label)}
    <div class="nav-section">
      <p class="nav-section__label">{section.label}</p>
      <ul class="nav-section__list">
        {#each section.links as link (link.href)}
          {@const active = isActive(link)}
          <li>
            <a
              href={link.href}
              data-sveltekit-preload-data="tap"
              data-sveltekit-preload-code="hover"
              class="nav-item"
              class:nav-item--active={active}
              class:nav-item--ext={link.external}
              aria-current={active ? 'page' : undefined}
            >
              <span class="nav-item__caret" aria-hidden="true">
                {#if link.external}↗{:else if active}▸{:else}·{/if}
              </span>
              <span class="nav-item__text">{link.label}</span>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
{/snippet}

{#snippet brand(small = false)}
  <a
    href="/admin"
    data-sveltekit-preload-data="tap"
    data-sveltekit-preload-code="hover"
    class="block leading-tight no-underline"
  >
    <p class="font-mono tracking-[0.22em] uppercase text-muted-warm
              {small ? 'text-[9px]' : 'text-[10px] mb-1'}">~/admin</p>
    <h2 class="font-display uppercase tracking-[-0.01em] text-paper
               {small ? 'text-[15px]' : 'text-[18px]'}">meowdiocre</h2>
  </a>
{/snippet}

{#snippet account()}
  {#if user}
    <div class="account">
      <p class="account__handle">@{user.githubLogin}</p>
      <form method="POST" action="/admin/logout">
        <button class="account__signout" type="submit">sign out</button>
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
    class="font-mono text-[11px] tracking-[0.18em] uppercase
           border border-[var(--line-soft)] px-3 py-2 text-paper
           hover:text-rose hover:border-rose transition-colors"
  >
    {open ? 'close ×' : 'menu ≡'}
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

<style>
  :global(.account__handle) {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
    margin: 0 0 8px;
  }
  :global(.account__signout) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: transparent;
    color: var(--color-rose);
    border: 1px solid rgb(232 156 146 / 0.30);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  :global(.account__signout:hover) {
    background: var(--color-crimson-deep);
    color: var(--color-paper);
    border-color: var(--color-crimson-deep);
  }
</style>
