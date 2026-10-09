import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lab = defineCollection({
  loader: glob({ base: './src/content/lab', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    layer: z.enum(['interface', 'agents', 'code', 'infra']),
    track: z.enum(['ai-agents', 'code-health']),
    order: z.number().int().positive(),
    published: z.coerce.date(),
    readMinutes: z.number().int().positive(),
    status: z.enum(['live', 'draft']),
    external: z.url().optional(),
    spec: z.array(z.tuple([z.string(), z.string()])).optional(),
  }),
});

export const collections = { lab };
