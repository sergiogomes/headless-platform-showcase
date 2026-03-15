import { defineCollection, z } from 'astro:content';

export const projectSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  summary: z.string(),
  description: z.string(),

  coverImage: z.string().optional(),
  thumbnail: z.string().optional(),
  thumbnailDark: z.string().optional(),

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

  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),

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
  type: 'content',
  schema: projectSchema,
});

export const collections = {
  projects: projectsCollection,
};
