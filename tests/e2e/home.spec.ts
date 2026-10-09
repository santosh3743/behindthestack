import { test, expect, type Page } from '@playwright/test';

const sheet = (page: Page) => page.evaluate(() => document.documentElement.dataset.sheet);
const shown = (page: Page) => page.locator('section.scene.show');

test.describe('desktop stage', () => {
  test('starts on sheet 0 and advances one sheet per ArrowDown', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/');
    await expect.poll(() => sheet(page)).toBe('0');
    for (let n = 1; n <= 5; n++) {
      await page.keyboard.press('ArrowDown');
      await expect.poll(() => sheet(page)).toBe(String(n));
    }
    await expect(shown(page)).toHaveCount(1, { timeout: 3000 });
    expect(errors).toEqual([]);
  });

  test('rapid key presses settle on exactly one sheet', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => sheet(page)).toBe('0');
    for (let k = 0; k < 4; k++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(2500);
    await expect(shown(page)).toHaveCount(1);
    const visible = await shown(page).getAttribute('id');
    expect(visible).toBe(`s${await sheet(page)}`);
  });

  test('deep link /#s2 opens the agents sheet', async ({ page }) => {
    await page.goto('/#s2');
    await expect.poll(() => sheet(page)).toBe('2');
    await expect(page.locator('#s2 h2')).toBeVisible();
  });

  test('header lab link from another page lands on sheet 2', async ({ page }) => {
    await page.goto('/about/');
    await page.locator('.site-header nav a', { hasText: 'lab' }).click();
    await expect.poll(() => sheet(page)).toBe('2');
  });

  test('clicking a stack part jumps to its sheet', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    await page.locator('#stack a.slab[data-go="3"]').click();
    await expect.poll(() => sheet(page)).toBe('3');
  });

  test('reduced motion still navigates', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => sheet(page)).toBe('1');
    await expect(shown(page)).toHaveCount(1, { timeout: 1500 });
    await ctx.close();
  });
});

for (const width of [375, 1280, 1920]) {
  test(`no horizontal overflow and wordmark fits at ${width}px`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/#s5');
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({
      over: document.documentElement.scrollWidth - innerWidth,
      wmRight: document.querySelector('.endwm')!.getBoundingClientRect().right,
      vw: innerWidth,
    }));
    expect(r.over).toBeLessThanOrEqual(0);
    expect(r.wmRight).toBeLessThanOrEqual(r.vw);
    await ctx.close();
  });
}

test('wordmark refits after resize', async ({ page }) => {
  await page.goto('/#s5');
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => ({ right: document.querySelector('.endwm')!.getBoundingClientRect().right, vw: innerWidth }));
  expect(r.right).toBeLessThanOrEqual(r.vw);
});
