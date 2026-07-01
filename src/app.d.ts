// See https://svelte.dev/docs/kit/types#app for these interfaces.
declare global {
  namespace App {
    interface Locals {
      /** Signed-in admin user (or null). Populated by hooks.server.js. */
      user:    import('$lib/server/db/schema').User | null;
      /** Session row (or null) if a valid cookie was presented. */
      session: import('$lib/server/db/schema').Session | null;
    }
  }
}

export {};
