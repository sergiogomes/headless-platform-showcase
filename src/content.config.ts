import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const projectSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  summary: z.string(),
  description: z.string(),

  coverImage: z.string().optional(),
  thumbnail: z.string().optional(),
  thumbnailDark: z.string().optional(),
  thumbnailAlt: z.string().optional(),

  stack: z.array(z.string()).default([]),
  domain: z.enum([
    'media',
    'fintech',
    'privacy',
    'enterprise',
    'ecommerce',
    'saas',
    'developer-tools',
    'other',
  ]),
  tags: z.array(z.string()).default([]),

  githubUrl: z.url().optional(),
  liveUrl: z.url().optional(),
  externalUrl: z.url().optional(),

  featured: z.boolean().default(false),
  status: z.enum(['completed', 'in-progress', 'archived']).default('completed'),

  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),

  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),

  order: z.number().default(0),
});

export type ProjectData = z.infer<typeof projectSchema>;

const projectsCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
    generateId: ({ data, entry }) => {
      if (
        data &&
        typeof data === 'object' &&
        'slug' in data &&
        typeof (data as { slug?: string }).slug === 'string'
      ) {
        return (data as { slug: string }).slug;
      }
      return entry.replace(/\.(md|mdx)$/, '').replace(/\//g, '-');
    },
  }),
  schema: projectSchema,
});

export const collections = {
  projects: projectsCollection,
};
