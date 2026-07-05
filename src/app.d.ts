declare global {
  namespace App {
    interface Locals {
      user:    import('$lib/server/db/schema').User | null;
      session: import('$lib/server/db/schema').Session | null;
    }
  }
}

export {};
