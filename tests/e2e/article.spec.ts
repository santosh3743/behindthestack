import { test, expect } from '@playwright/test';

test('stackhealth write-up renders header, spec row and body measure', async ({ page }) => {
  const res = await page.goto('/lab/stackhealth/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('StackHealth');
  await expect(page.locator('.art-spec')).toContainText('code');
  const ch = await page.evaluate(() => {
    const p = document.querySelector('.prose p')!; const w = p.getBoundingClientRect().width;
    const s = document.createElement('span'); s.textContent = '0'; s.style.font = getComputedStyle(p).font; document.body.append(s);
    const r = w / s.getBoundingClientRect().width; s.remove(); return r;
  });
  expect(ch).toBeLessThanOrEqual(70);
});

for (const id of ['interface', 'agents', 'code', 'infra']) {
  test(`/layers/${id}/ renders its figure`, async ({ page }) => {
    const res = await page.goto(`/layers/${id}/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('.fig svg')).toBeVisible();
  });
}
