// Per-slug pages are server-rendered. Vercel edge caches the response
// for `s-maxage=300` (see the +page.server.js cache-control header); the
// admin publish action triggers explicit revalidation.
export const prerender = false;
