export const prerender = false;
export const ssr       = true;

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
  return {
    user: locals.user
      ? { githubLogin: locals.user.githubLogin, name: locals.user.name }
      : null
  };
}
