// Private terms live in a git-ignored .leakcheck.json so the public repo never lists them.
// Without that file the leak tests are skipped (e.g. in a fresh public clone).
import { existsSync, readFileSync } from 'node:fs';

type Kind = 'figures' | 'content' | 'site';
const FILE = new URL('../.leakcheck.json', import.meta.url);

export function leakTerms(kind: Kind): string[] | null {
  if (!existsSync(FILE)) return null;
  return (JSON.parse(readFileSync(FILE, 'utf8')) as Record<Kind, string[]>)[kind] ?? null;
}

export function leakRegex(kind: Kind, extra: string[] = []): RegExp | null {
  const t = leakTerms(kind);
  return t ? new RegExp([...t, ...extra].join('|'), 'i') : null;
}
