import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('every sheet is readable without JavaScript', async ({ page }) => {
  await page.goto('/');
  for (const text of [
    "What's actually running underneath.",
    'Where people touch the system.',
    'Models wired to tools, and where the wiring fails quietly.',
    'The part everyone ships and nobody measures the same way twice.',
    'Containers, tunnels, the box under the desk.',
    'built by Santosh Jha',
  ]) {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }
});

test('no horizontal overflow without JavaScript', async ({ page }) => {
  await page.goto('/');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(over).toBeLessThanOrEqual(0);
});
