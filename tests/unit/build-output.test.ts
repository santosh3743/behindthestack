import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe.runIf(process.env.CHECK_PROD_DIST === '1')('production dist', () => {
  it('has no noindex and no draft lab pages', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).not.toContain('noindex');
    expect(existsSync('dist/lab/stackhealth/index.html')).toBe(false); // still draft
    expect(readFileSync('dist/rss.xml', 'utf8')).not.toContain('/lab/');
  });
  it('active layers with nothing published say so instead of an empty parts list', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).not.toContain('<div class="bom"></div>');
    expect(html).not.toMatch(/sheet 0[23] of 04 · flagship/);
    expect(html).toContain('nothing published on this layer yet');
  });
});
