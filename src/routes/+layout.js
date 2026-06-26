// Per-route opt-in: each public page declares its own `prerender` /
// `trailingSlash` settings. Routes under /admin and /admin/api stay
// dynamic (server-only). Public /, /about, /blog, /article/[slug],
// /feed.xml each set their own values.
export const trailingSlash = 'never';
