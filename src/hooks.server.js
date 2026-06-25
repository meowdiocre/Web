/**
 * Server hook — fill in %body-page% in app.html so the prerendered/SSR
 * body has the correct data-page attribute before client hydration.
 * The +layout.svelte $effect keeps it in sync after client navigation.
 */

/** @param {string} pathname */
function pageKey(pathname) {
  if (pathname.startsWith('/blog'))    return 'blog';
  if (pathname.startsWith('/about'))   return 'about';
  if (pathname.startsWith('/article')) return 'article';
  return 'home';
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const key = pageKey(event.url.pathname);
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%body-page%', key)
  });
}
