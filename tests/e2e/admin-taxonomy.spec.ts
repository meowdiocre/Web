import { expect, test, type Page } from '@playwright/test';

const session = process.env.E2E_AUTH_SESSION;
const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:4173';

test.skip(!session, 'E2E_AUTH_SESSION is required for admin taxonomy tests.');

test.beforeEach(async ({ context }) => {
  if (!session) return;
  await context.addCookies([{ name: 'auth_session', value: session, url: new URL(baseUrl).origin }]);
});

async function setSelect(page: Page, formSelector: string, name: string, value: string) {
  await page.locator(`${formSelector} select[name="${name}"]`).evaluate((node, nextValue) => {
    const select = node as HTMLSelectElement;
    select.value = String(nextValue);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function createCategory(page: Page, label: string, slug: string) {
  await page.goto('/admin/categories');
  const form = page.locator('form[action="?/create"]');
  await form.locator('input[name="label"]').fill(label);
  await form.locator('summary').click();
  await form.locator('input[name="slug"]').fill(slug);
  await form.getByRole('button', { name: 'create category' }).click();
  await expect(page.getByText(new RegExp(`${slug} · 0 posts`))).toBeVisible();
}

async function createTag(page: Page, label: string, slug: string) {
  await page.goto('/admin/tags');
  const form = page.locator('form[action="?/create"]');
  await form.locator('input[name="label"]').fill(label);
  await form.locator('summary').click();
  await form.locator('input[name="slug"]').fill(slug);
  await form.getByRole('button', { name: 'create tag' }).click();
  await expect(page.getByText(new RegExp(`/${slug} · 0 posts`))).toBeVisible();
}

async function createDraft(page: Page, title: string, slug: string, category: string) {
  await page.goto('/admin/posts/new');
  const form = page.locator('form').filter({ has: page.locator('input[name="title"]') });
  await form.locator('input[name="title"]').fill(title);
  await setSelect(page, 'form', 'category', category);
  await form.locator('summary').click();
  await form.locator('input[name="slug"]').fill(slug);
  await form.getByRole('button', { name: 'create draft' }).click();
  await page.waitForURL(/\/admin\/posts\/[^/]+\/edit$/);
  return page.url().replace(/\/edit$/, '');
}

async function deletePost(page: Page, metadataUrl: string | undefined) {
  if (!metadataUrl) return;
  await page.goto(metadataUrl);
  const button = page.getByRole('button', { name: 'delete', exact: true });
  if (await button.count() === 0) return;
  await button.click();
  await page.getByRole('button', { name: 'delete permanently' }).click();
  await page.waitForURL('/admin');
}

async function deleteTag(page: Page, label: string) {
  await page.goto('/admin/tags');
  const button = page.getByRole('button', { name: `delete ${label}` });
  if (await button.count() === 0) return;
  await button.click();
  await page.getByRole('button', { name: 'delete tag' }).click();
  await expect(page.getByRole('button', { name: `delete ${label}` })).toHaveCount(0);
}

async function deleteCategory(page: Page, label: string) {
  await page.goto('/admin/categories');
  const button = page.getByRole('button', { name: `delete ${label}` });
  if (await button.count() === 0) return;
  await button.click();

  const destructive = page.getByRole('radio', { name: /permanently delete posts/i });
  if (await destructive.count() > 0) {
    await destructive.check();
    const confirmation = page.getByLabel(/^type DELETE \d+$/);
    await confirmation.fill(await confirmation.getAttribute('placeholder') ?? '');
    await page.getByRole('button', { name: 'delete posts and category' }).click();
  } else {
    await page.getByRole('button', { name: 'delete category' }).click();
  }

  await expect(page.getByRole('button', { name: `delete ${label}` })).toHaveCount(0);
}

test('manages public tags and both category deletion strategies', async ({ page }) => {
  const suffix = Date.now().toString(36);
  const sourceLabel = `Source ${suffix}`;
  const sourceSlug = `source-${suffix}`;
  const targetLabel = `Target ${suffix}`;
  const targetSlug = `target-${suffix}`;
  const deleteLabel = `Delete ${suffix}`;
  const deleteSlug = `delete-${suffix}`;
  const tagLabel = `Tag ${suffix}`;
  const tagSlug = `tag-${suffix}`;
  const postSlug = `post-${suffix}`;
  let metadataUrl: string | undefined;

  try {
    await createCategory(page, sourceLabel, sourceSlug);
    await createCategory(page, targetLabel, targetSlug);
    await createCategory(page, deleteLabel, deleteSlug);
    await createTag(page, tagLabel, tagSlug);

    metadataUrl = await createDraft(page, `Post ${suffix}`, postSlug, sourceSlug);
    await page.goto(metadataUrl);
    await page.getByRole('checkbox', { name: tagLabel }).check();
    await page.getByRole('button', { name: 'save metadata' }).click();
    await expect(page.getByText('saved.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'publish now' }).click();
    await expect(page.getByRole('button', { name: 'unpublish' })).toBeVisible();

    await page.goto(`/blog/${sourceSlug}/${postSlug}`);
    await expect(page.getByRole('link', { name: tagLabel })).toHaveAttribute('href', `/blog/tag/${tagSlug}`);
    await page.goto(`/blog/tag/${tagSlug}`);
    await expect(page.getByRole('link', { name: new RegExp(`Post ${suffix}`, 'i') })).toBeVisible();

    await page.goto(metadataUrl);
    await setSelect(page, 'form[action="?/update"]', 'category', targetSlug);
    await page.getByRole('button', { name: 'save metadata' }).click();
    await expect(page.getByText('saved.', { exact: true })).toBeVisible();
    await page.goto(`/blog/${sourceSlug}/${postSlug}`);
    await expect(page).toHaveURL(new RegExp(`/blog/${targetSlug}/${postSlug}$`));

    await deleteCategory(page, sourceLabel);
    await createDraft(page, `Delete post ${suffix}`, `delete-post-${suffix}`, deleteSlug);
    await deleteCategory(page, deleteLabel);
  } finally {
    await deletePost(page, metadataUrl).catch(() => undefined);
    await deleteTag(page, tagLabel).catch(() => undefined);
    await deleteCategory(page, sourceLabel).catch(() => undefined);
    await deleteCategory(page, targetLabel).catch(() => undefined);
    await deleteCategory(page, deleteLabel).catch(() => undefined);
  }
});
