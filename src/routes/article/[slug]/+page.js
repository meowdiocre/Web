// Per-slug pages are server-rendered. Vercel edge caches the response
// for `s-maxage=300` (see the +page.server.js cache-control header) and
// the admin publish action triggers an explicit revalidation (Task 10).
export const prerender = false;
