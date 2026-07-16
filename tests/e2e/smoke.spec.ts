import { test, expect } from '@playwright/test';

/**
 * Smoke pass against the static landing pages. The DB-backed routes
 * (/blog, /blog/[category]/[slug]) need a configured DATABASE_URL to be
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

  test('error pages keep the footer at the viewport bottom', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto('/this-page-does-not-exist');

    const footer = await page.locator('footer').boundingBox();
    expect(footer).not.toBeNull();
    expect(Math.round(footer!.y + footer!.height)).toBe(1080);
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
