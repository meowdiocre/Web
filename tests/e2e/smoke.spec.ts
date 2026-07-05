import { test, expect } from '@playwright/test';

/**
 * Smoke pass against the static landing pages. The DB-backed routes
 * (/blog, /article/[slug]) need a configured DATABASE_URL to be
 * exercised; the full happy-path flow (login → create → edit →
 * publish → public render) is documented in docs/EDITING.md and
 * gated behind `E2E_FULL=1`.
 */
test.describe('static surface', () => {
  test('/ renders the landing hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/meowdiocre/i);
    await expect(page.getByRole('heading', { name: /Take it/i })).toBeVisible();
  });

  test('/about renders', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('main')).toBeVisible();
  });

  test('admin redirects to login', async ({ page }) => {
    await page.goto('/admin');
    const url = new URL(page.url());

    expect(
      url.pathname === '/admin/login' ||
      url.hostname === 'github.com'
    ).toBe(true);
  });
});
