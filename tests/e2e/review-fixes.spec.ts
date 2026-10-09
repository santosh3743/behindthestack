import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const visibleScenes = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll('.scene')].filter((s) => getComputedStyle(s).visibility === 'visible').length);

test('home is not blank when the script fails to load', async ({ page }) => {
  await page.route('**/_astro/*.js', (r) => r.abort());
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(await visibleScenes(page)).toBeGreaterThan(0);
});

test('home shows a sheet before slow web fonts arrive', async ({ page }) => {
  await page.route('**/*.woff2', async (r) => { await new Promise((f) => setTimeout(f, 4000)); await r.continue(); });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForTimeout(1500);
  expect(await visibleScenes(page)).toBeGreaterThan(0);
});

for (const [w, h] of [[1366, 640], [1280, 720], [1440, 760], [1024, 700]]) {
  test(`every sheet's copy fits above the bottom bar at ${w}x${h}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    for (let n = 0; n <= 5; n++) {
      await page.goto(`/#s${n}`);
      await page.waitForTimeout(400);
      const r = await page.evaluate((i) => {
        const s = document.getElementById(`s${i}`)!;
        const copy = s.querySelector('.copy')!.getBoundingClientRect();
        const bot = s.querySelector('.bar.bot')!.getBoundingClientRect();
        return { copyBottom: Math.round(copy.bottom), barTop: Math.round(bot.top) };
      }, n);
      expect(r.copyBottom, `sheet ${n}`).toBeLessThanOrEqual(r.barTop);
    }
    await ctx.close();
  });
}

for (const path of ['/', '/about/', '/lab/self-hosted-assistant/', '/layers/agents/']) {
  test(`${path} has no color-contrast violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(2500);
    const res = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(res.violations.flatMap((v) => v.nodes.map((n) => n.target.join(' ')))).toEqual([]);
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const width of [320, 375, 900, 1000]) {
    test(`end wordmark fits its box at ${width}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 800 } });
      const page = await ctx.newPage();
      await page.goto('/');
      const r = await page.evaluate(() => {
        const wm = document.querySelector('.endwm')!.getBoundingClientRect();
        const box = document.querySelector('.end .copy')!.getBoundingClientRect();
        return { wm: wm.right, box: box.right };
      });
      expect(r.wm).toBeLessThanOrEqual(r.box + 0.5);
      await ctx.close();
    });
  }
});

for (const path of ['/', '/about/', '/layers/agents/', '/lab/recon-fleets/', '/nope/']) {
  test(`no sideways scroll and nav reachable at 320px on ${path}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 } });
    const page = await ctx.newPage();
    await page.goto(path);
    const r = await page.evaluate(() => ({
      over: document.documentElement.scrollWidth - innerWidth,
      navRight: Math.max(...[...document.querySelectorAll('.site-header nav a')].map((a) => a.getBoundingClientRect().right)),
      vw: innerWidth,
    }));
    expect(r.over).toBeLessThanOrEqual(0);
    expect(r.navRight).toBeLessThanOrEqual(r.vw);
    await ctx.close();
  });
}
