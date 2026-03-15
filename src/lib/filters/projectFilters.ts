import { z } from 'zod';
import type { FilterCriteria } from '../../types/filters';

const ProjectDataSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  stack: z.array(z.string()),
  domain: z.string(),
  tags: z.array(z.string()),
  featured: z.boolean(),
});

export type ProjectData = z.infer<typeof ProjectDataSchema>;

/**
 * Filters projects by search query (title, summary, description, stack, tags), selected stacks,
 * domains, and tags. Invalid items are stripped via Zod safeParse; only valid ProjectData are included.
 * Search is case-insensitive substring; stack/domain/tag filters use OR logic.
 */
export function filterProjects(projects: unknown[], criteria: FilterCriteria): ProjectData[] {
  const validProjects = projects
    .map((p) => ProjectDataSchema.safeParse(p))
    .filter((result): result is z.SafeParseSuccess<ProjectData> => result.success)
    .map((r) => r.data);

  return validProjects.filter((project) => {
    if (criteria.searchQuery) {
      const query = criteria.searchQuery.toLowerCase();
      const searchableText = [
        project.title,
        project.summary,
        project.description ?? '',
        ...project.stack,
        ...project.tags,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchableText.includes(query)) return false;
    }
    if (criteria.selectedStacks.length > 0) {
      const hasStack = criteria.selectedStacks.some((s) => project.stack.includes(s));
      if (!hasStack) return false;
    }
    if (criteria.selectedDomains.length > 0) {
      if (!criteria.selectedDomains.includes(project.domain)) return false;
    }
    if (criteria.selectedTags.length > 0) {
      const hasTag = criteria.selectedTags.some((t) => project.tags.includes(t));
      if (!hasTag) return false;
    }
    return true;
  });
}

/**
 * Counts occurrences: for array fields (e.g. stack) counts each value; for scalar fields counts by value.
 */
function countByKey(items: ProjectData[], key: keyof ProjectData): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = item[key];
    if (Array.isArray(value)) {
      value.forEach((v) => {
        acc[String(v)] = (acc[String(v)] ?? 0) + 1;
      });
    } else {
      const k = String(value);
      acc[k] = (acc[k] ?? 0) + 1;
    }
    return acc;
  }, {});
}

/**
 * Returns total count, filtered count, and counts by domain and by stack for the filtered list.
 * Useful for filter dropdowns and result summaries.
 */
export function getFilterStats(
  projects: ProjectData[],
  criteria: FilterCriteria
): { total: number; filtered: number; byDomain: Record<string, number>; byStack: Record<string, number> } {
  const filtered = filterProjects(projects, criteria);
  return {
    total: projects.length,
    filtered: filtered.length,
    byDomain: countByKey(filtered, 'domain'),
    byStack: filtered.reduce<Record<string, number>>((acc, p) => {
      p.stack.forEach((s) => {
        acc[s] = (acc[s] ?? 0) + 1;
      });
      return acc;
    }, {}),
  };
}
