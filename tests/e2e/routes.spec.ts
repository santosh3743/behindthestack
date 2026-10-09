import { test, expect } from '@playwright/test';
import { leakRegex } from '../leak-terms';

const ROUTES = ['/', '/about/', '/layers/agents/', '/lab/stackhealth/'];

for (const path of ROUTES) {
  test(`GET ${path} returns 200 with header and credit`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('.site-header .wm')).toHaveText('behindthestack');
  });
}

test('preview build is not indexable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('home has six sheets in order', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section.scene')).toHaveCount(6);
  const ids = await page.locator('section.scene').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(['s0', 's1', 's2', 's3', 's4', 's5']);
});

test('rss lists experiments', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain('<title>behindthestack</title>');
  expect(xml).toContain('/lab/stackhealth/');
});

test('unknown path shows the empty-layer 404', async ({ page }) => {
  const res = await page.goto('/no-such-layer/');
  expect(res?.status()).toBe(404);
  await expect(page.getByText('empty layer').first()).toBeVisible();
});

test('about credits Santosh', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByText('built by Santosh Jha').first()).toBeVisible();
});

const SITE_BANNED = leakRegex('site');
for (const path of ['/', '/about/', '/layers/agents/', '/lab/stackhealth/', '/rss.xml']) {
  test(`${path} has no private terms`, async ({ request }) => {
    test.skip(!SITE_BANNED, 'no local .leakcheck.json');
    expect(await (await request.get(path)).text()).not.toMatch(SITE_BANNED!);
  });
}
