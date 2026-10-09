import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getLab } from '../lib/lab';
import { SITE } from '../data/site';

export async function GET(context: APIContext) {
  const lab = await getLab();
  return rss({
    title: SITE.name,
    description: SITE.lede,
    site: context.site!,
    items: lab.map((e) => ({ title: e.data.title, description: e.data.dek, pubDate: e.data.published, link: `/lab/${e.id}/` })),
  });
}
