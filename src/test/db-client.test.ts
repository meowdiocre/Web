import { describe, expect, it, vi } from 'vitest';

describe('db client', () => {
  it('throws a friendly error when DATABASE_URL is missing', async () => {
    vi.resetModules();
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const { getDb } = await import('../lib/server/db/client');
      expect(() => getDb()).toThrowError(/DATABASE_URL is not set/);
    } finally {
      if (original !== undefined) process.env.DATABASE_URL = original;
    }
  });
});
