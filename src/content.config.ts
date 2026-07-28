import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const insights = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/insights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(80),
      category: z.enum(['Policy', 'Municipal', 'Technology', 'ESG', 'Industry', 'Advertising']),
      excerpt: z.string().min(60).max(260),
      hero: image(),
      publishedAt: z.coerce.date(),
      /** Higher shows first within the same date. */
      featured: z.boolean().default(false),
      /** Optional SEO override; falls back to excerpt. */
      metaDescription: z.string().max(160).optional(),
    }),
});

export const collections = { insights };
