import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe.runIf(process.env.CHECK_PROD_DIST === '1')('production dist', () => {
  const LIVE = ['stackhealth', 'self-hosted-assistant', 'mcp-sampling-tools-tokens', 'recon-fleets', 'public-qa-bot'];
  it('is indexable and publishes every approved piece', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).not.toContain('noindex');
    const rss = readFileSync('dist/rss.xml', 'utf8');
    for (const id of LIVE) {
      expect(existsSync(`dist/lab/${id}/index.html`), id).toBe(true);
      expect(rss, id).toContain(`/lab/${id}/`);
    }
  });
  it('never renders an empty parts list', () => {
    expect(readFileSync('dist/index.html', 'utf8')).not.toContain('<div class="bom"></div>');
  });
});
