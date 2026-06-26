// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      /** The signed-in admin user (or null). Populated in hooks.server.js. */
      user:    import('$lib/server/db/schema').User | null;
      /** The session row (or null) if a valid cookie was presented. */
      session: import('$lib/server/db/schema').Session | null;
    }
  }
}

export {};
