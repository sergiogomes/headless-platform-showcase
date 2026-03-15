import { describe, it, expect } from 'vitest';
import { filterProjects, getFilterStats } from './projectFilters';

const validProjects = [
  {
    slug: 'a',
    title: 'React Dashboard',
    summary: 'A dashboard built with React',
    description: 'Uses TypeScript and Tailwind',
    stack: ['React', 'TypeScript'],
    domain: 'saas',
    tags: ['dashboard'],
    featured: true,
  },
  {
    slug: 'b',
    title: 'API Gateway',
    summary: 'Node.js API gateway',
    description: 'Enterprise API',
    stack: ['Node.js', 'TypeScript'],
    domain: 'enterprise',
    tags: ['api'],
    featured: false,
  },
  {
    slug: 'c',
    title: 'Media CMS',
    summary: 'Headless CMS for media',
    description: 'Contentful and React',
    stack: ['React', 'Contentful'],
    domain: 'media',
    tags: ['cms'],
    featured: false,
  },
];

describe('filterProjects', () => {
  it('returns all projects when criteria are empty', () => {
    const result = filterProjects(validProjects, {
      searchQuery: '',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: [],
    });
    expect(result).toHaveLength(3);
  });

  it('filters by search query (title)', () => {
    const result = filterProjects(validProjects, {
      searchQuery: 'React',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: [],
    });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.slug)).toContain('a');
    expect(result.map((p) => p.slug)).toContain('c');
  });

  it('filters by search query (case insensitive)', () => {
    const result = filterProjects(validProjects, {
      searchQuery: 'dashboard',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('a');
  });

  it('filters by stack (OR)', () => {
    const result = filterProjects(validProjects, {
      searchQuery: '',
      selectedStacks: ['React'],
      selectedDomains: [],
      selectedTags: [],
    });
    expect(result).toHaveLength(2);
  });

  it('filters by domain', () => {
    const result = filterProjects(validProjects, {
      searchQuery: '',
      selectedStacks: [],
      selectedDomains: ['media'],
      selectedTags: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0].domain).toBe('media');
  });

  it('filters by tag', () => {
    const result = filterProjects(validProjects, {
      searchQuery: '',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: ['api'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('b');
  });

  it('combines multiple criteria', () => {
    const result = filterProjects(validProjects, {
      searchQuery: 'React',
      selectedStacks: ['TypeScript'],
      selectedDomains: [],
      selectedTags: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('a');
  });

  it('skips invalid project entries', () => {
    const withInvalid = [
      ...validProjects,
      { invalid: true },
      { slug: 'x', title: 'X', summary: 'X', stack: [], domain: 'other', tags: [], featured: false },
    ];
    const result = filterProjects(withInvalid, {
      searchQuery: '',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: [],
    });
    expect(result).toHaveLength(4);
  });
});

describe('getFilterStats', () => {
  it('returns total and filtered counts', () => {
    const stats = getFilterStats(validProjects, {
      searchQuery: 'React',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: [],
    });
    expect(stats.total).toBe(3);
    expect(stats.filtered).toBe(2);
    expect(stats.byDomain).toBeDefined();
    expect(stats.byStack).toBeDefined();
  });
});
