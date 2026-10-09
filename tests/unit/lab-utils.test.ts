import { describe, it, expect } from 'vitest';
import { isVisible, partNumber, sortLab, neighbors } from '../../src/lib/lab-utils';
import { leakRegex } from '../leak-terms';

type E = { id: string; data: { layer: string; order: number } };
const e = (id: string, layer: string, order: number): E => ({ id, data: { layer, order } });
const IDS = ['interface', 'agents', 'code', 'infra'];

describe('isVisible', () => {
  it('shows live always', () => expect(isVisible('live', false)).toBe(true));
  it('hides drafts in production', () => expect(isVisible('draft', false)).toBe(false));
  it('shows drafts in preview', () => expect(isVisible('draft', true)).toBe(true));
});

describe('partNumber', () => {
  it('joins layer number and order', () => expect(partNumber('02', 3)).toBe('02.3'));
});

describe('sortLab', () => {
  it('orders by layer position, then order', () => {
    const xs = [e('c', 'code', 1), e('b', 'agents', 2), e('a', 'agents', 1)];
    expect(sortLab(xs, IDS).map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
  it('does not mutate input', () => {
    const xs = [e('b', 'agents', 2), e('a', 'agents', 1)];
    sortLab(xs, IDS);
    expect(xs[0].id).toBe('b');
  });
});

describe('neighbors', () => {
  const xs = [e('a', 'agents', 1), e('b', 'agents', 2), e('c', 'agents', 3), e('z', 'code', 1)];
  it('finds prev and next within the same layer', () => {
    const n = neighbors(xs, 'b');
    expect(n.prev?.id).toBe('a');
    expect(n.next?.id).toBe('c');
  });
  it('does not cross layers', () => {
    expect(neighbors(xs, 'c').next).toBeUndefined();
    expect(neighbors(xs, 'z').prev).toBeUndefined();
  });
  it('returns empty for unknown id', () => expect(neighbors(xs, 'nope')).toEqual({}));
});

import { readFileSync, readdirSync } from 'node:fs';
const FIG_BANNED = leakRegex('figures');
describe.skipIf(!FIG_BANNED)('figures use generic labels', () => {
  const dir = 'src/components/figures';
  const banned = FIG_BANNED!;
  const files = readdirSync(dir);
  it('has all five figures plus the picker', () => {
    for (const f of ['Fig00Stack.astro', 'Fig01Interface.astro', 'Fig02Agents.astro', 'Fig03Code.astro', 'Fig04Infra.astro', 'LayerFigure.astro'])
      expect(files).toContain(f);
  });
  for (const f of files) {
    it(`${f} has no specific vendor/stack labels`, () => {
      expect(readFileSync(`${dir}/${f}`, 'utf8')).not.toMatch(banned);
    });
  }
});

const CONTENT_BANNED = leakRegex('content', [String.raw`@[a-z0-9_]+_bot`, String.raw`gpt-\d`, String.raw`\b\d{1,3}(\.\d{1,3}){3}\b`, String.raw`[0-9a-f]{32}`, '/Users/']);
describe.skipIf(!CONTENT_BANNED)('content never leaks private details', () => {
  const dir = 'src/content/lab';
  const banned = CONTENT_BANNED!;
  const files = readdirSync(dir);
  it('has the five v1 pieces', () => {
    for (const f of ['stackhealth.mdx', 'self-hosted-assistant.mdx', 'mcp-sampling-tools-tokens.mdx', 'recon-fleets.mdx', 'public-qa-bot.mdx'])
      expect(files).toContain(f);
  });
  for (const f of files) {
    it(`${f} is clean`, () => expect(readFileSync(`${dir}/${f}`, 'utf8')).not.toMatch(banned));
  }
  for (const f of files) {
    it(`${f} is live (approved 2026-10-09)`, () => expect(readFileSync(`${dir}/${f}`, 'utf8')).toMatch(/^status: live$/m));
  }
});
