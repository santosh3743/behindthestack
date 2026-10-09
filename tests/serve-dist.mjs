// Minimal static server for e2e: serves dist/ the way Cloudflare Pages does
// (dir → index.html, unknown path → 404.html with status 404).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'dist');
const PORT = Number(process.env.PORT ?? 4321);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.xml': 'application/xml',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain' };

async function resolve(urlPath) {
  const p = normalize(join(ROOT, decodeURIComponent(urlPath.split('?')[0])));
  if (!p.startsWith(ROOT)) return null;
  for (const c of [p, join(p, 'index.html'), `${p}.html`]) {
    try { if ((await stat(c)).isFile()) return c; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolve(req.url ?? '/');
  if (file) {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    return res.end(await readFile(file));
  }
  res.writeHead(404, { 'content-type': TYPES['.html'] });
  res.end(await readFile(join(ROOT, '404.html')).catch(() => 'not found'));
}).listen(PORT, () => console.log(`serving dist on http://localhost:${PORT}`));
