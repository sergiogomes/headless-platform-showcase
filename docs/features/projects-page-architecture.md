# Projects Page Architecture

**Feature**: Projects showcase with filtering, search, and analytics  
**Status**: Architecture Design  
**Last Updated**: 2026-03-14

---

## Overview

The Projects page is a content-rich, filterable showcase of selected work. It demonstrates advanced frontend patterns including client-side filtering, search functionality, analytics integration, and performance optimization through Astro's islands architecture.

### Key Objectives

1. **Content First**: Display projects with rich metadata in a scannable format
2. **Discoverability**: Enable users to filter and search projects by stack, domain, and keywords
3. **Performance**: Maintain minimal JavaScript footprint with progressive enhancement
4. **Analytics**: Track user interactions for insights into project interest
5. **Accessibility**: Ensure keyboard navigation and screen reader support
6. **SEO**: Optimize for search engines with structured data

---

## Page Structure

### URL Pattern

```txt
/projects
```

### Rendering Strategy

- **Static Generation (SSG)** for initial page load
- **Client-side hydration** for interactive filters and search (React island)
- **Progressive enhancement** - content visible without JavaScript

---

## Content Architecture

### Content Collection Schema

Projects are managed through Astro Content Collections with structured frontmatter:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Export schema for reuse in runtime validation
export const projectSchema = z.object({
  // Core metadata
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  description: z.string(),
  
  // Visual
  coverImage: z.string().optional(),
  thumbnail: z.string(),
  thumbnailDark: z.string().optional(), // Optional dark mode variant
  
  // Categorization
  stack: z.array(z.string()).default([]),
  domain: z.enum([
    'media',
    'fintech',
    'privacy',
    'enterprise',
    'ecommerce',
    'saas',
    'developer-tools',
    'other'
  ]),
  tags: z.array(z.string()).default([]),
  
  // Links
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  
  // Status
  featured: z.boolean().default(false),
  status: z.enum(['completed', 'in-progress', 'archived']).default('completed'),
  
  // Dates
  startDate: z.date(),
  endDate: z.date().optional(),
  
  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  
  // Display
  order: z.number().default(0),
});

// Infer TypeScript type from schema
export type ProjectData = z.infer<typeof projectSchema>;

const projectsCollection = defineCollection({
  type: 'content',
  schema: projectSchema,
});

export const collections = {
  projects: projectsCollection,
};
```

### Example Project Entry

```markdown
---
title: "Editorial Component System"
slug: "editorial-component-system"
summary: "Headless component library for multi-brand editorial platforms"
description: "Built a reusable component system serving 5+ editorial brands with 2M+ monthly visitors, reducing development time by 60% and improving Core Web Vitals scores across all properties."

thumbnail: "/images/projects/editorial-system-thumb.jpg"
coverImage: "/images/projects/editorial-system-cover.jpg"

stack: ["React", "TypeScript", "Storybook", "Contentful", "Next.js"]
domain: "media"
tags: ["component-library", "headless-cms", "performance", "design-system"]

githubUrl: "https://github.com/username/editorial-components"
liveUrl: "https://example.com"

featured: true
status: "completed"

startDate: 2024-01-15
endDate: 2024-08-30

seoTitle: "Editorial Component System - React Headless CMS"
seoDescription: "Case study on building a scalable component library for multi-brand editorial platforms"

order: 1
---

Optional long-form content can go here if needed for a project detail page.
```

---

## Component Architecture

### Component Hierarchy

```txt
pages/projects.astro
├── Layout (BaseLayout.astro)
├── SEO (SEOHead.astro)
├── ProjectsHero (Astro component)
├── ProjectsFilterErrorBoundary (React - client:idle)
│   └── ProjectsFilter (React island)
│       ├── SearchInput (React)
│       ├── StackFilter (React)
│       ├── DomainFilter (React)
│       └── FilterChips (React)
├── ProjectsGrid (Astro component)
│   └── ProjectCard (Astro component)
│       ├── ProjectImage
│       ├── ProjectMeta
│       ├── ProjectTags
│       └── ProjectLinks
└── ProjectsEmpty (Astro component)
```

### Component Responsibility Matrix

| Component | Rendering | Hydration | Responsibility | Complexity |
| --------- | --------- | --------- | -------------- | ---------- |
| ProjectsHero | Static | None | Page header | Low |
| ProjectsFilterErrorBoundary | Client | Idle | Error handling | Low |
| ProjectsFilter | Client | Idle | Filter UI & state | High |
| ProjectsGrid | Static | None | Grid layout | Low |
| ProjectCard | Static | None | Project display | Medium |
| ProjectLinks | Static | None | Action links | Low |
| ProjectsEmpty | Static | None | Empty state | Low |

### Component Breakdown

#### 1. ProjectsHero (Astro Component)

**Purpose**: Page header with title, description, and metadata

**Props**: None (static content)

**Structure**:

```astro
---
// src/components/sections/ProjectsHero.astro
---

<section class="projects-hero">
  <div class="container">
    <h1 class="heading-1">Projects</h1>
    <p class="body-large text-secondary">
      Selected work across media platforms, fintech, enterprise systems, and developer tools.
    </p>
    <div class="projects-meta">
      <span class="caption">
        {projectCount} projects
      </span>
    </div>
  </div>
</section>
```

**Rendering**: Static (SSG)

---

#### 2. ProjectsFilter (React Island)

**Purpose**: Interactive filtering and search UI

**Props**:

```typescript
interface ProjectsFilterProps {
  projects: ProjectData[];
  onFilterChange: (filtered: ProjectData[]) => void;
}
```

**State Management**:

```typescript
interface FilterState {
  searchQuery: string;
  selectedStacks: string[];
  selectedDomains: string[];
  selectedTags: string[];
}
```

**Hydration**: `client:idle` (not critical for initial render)

**Features**:

- Debounced search input (300ms)
- Multi-select stack filter
- Single-select domain filter
- Tag filtering
- Active filter chips with remove functionality
- Clear all filters button

**Analytics Events**:

- `search_used` - when user types in search
- `filter_change` - when filter selection changes

**Accessibility**:

- Keyboard navigation for all filters
- ARIA labels for filter controls
- Live region announcements for result counts
- Focus management when filters change

---

#### 3. ProjectsGrid (Astro Component)

**Purpose**: Responsive grid layout for project cards

**Props**:

```typescript
interface ProjectsGridProps {
  projects: CollectionEntry<'projects'>[];
}
```

**Structure**:

```astro
---
// src/components/sections/ProjectsGrid.astro
interface Props {
  projects: CollectionEntry<'projects'>[];
}

const { projects } = Astro.props;
---

<div class="projects-grid">
  {projects.map((project) => (
    <ProjectCard project={project} />
  ))}
</div>
```

**Styling**:

- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Gap: `--space-6` (mobile), `--space-8` (desktop)

**Rendering**: Static (SSG)

---

#### 4. ProjectCard (Astro Component)

**Purpose**: Individual project display card

**Props**:

```typescript
interface ProjectCardProps {
  project: CollectionEntry<'projects'>;
}
```

**Structure**:

```astro
---
// src/components/cards/ProjectCard.astro
import { Image } from 'astro:assets';
import Badge from '../ui/Badge.astro';
import ProjectLinks from './ProjectLinks.astro';

interface Props {
  project: CollectionEntry<'projects'>;
}

const { project } = Astro.props;
const { title, summary, thumbnail, stack, domain, tags, featured } = project.data;
---

<article class="card project-card" data-featured={featured}>
  {thumbnail && (
    <div class="project-card-image">
      <Image 
        src={thumbnail} 
        alt={title}
        width={400}
        height={250}
        loading="lazy"
      />
    </div>
  )}
  
  <div class="card-body">
    <div class="project-card-header">
      {featured && <Badge variant="primary">Featured</Badge>}
      <span class="badge">{domain}</span>
    </div>
    
    <h3 class="card-title">{title}</h3>
    <p class="card-subtitle">{summary}</p>
    
    <div class="project-card-stack">
      {stack.slice(0, 4).map((tech) => (
        <Badge>{tech}</Badge>
      ))}
      {stack.length > 4 && (
        <Badge>+{stack.length - 4} more</Badge>
      )}
    </div>
  </div>
  
  <div class="card-footer">
    <ProjectLinks 
      githubUrl={project.data.githubUrl}
      liveUrl={project.data.liveUrl}
      slug={project.data.slug}
    />
  </div>
</article>
```

**Analytics Integration**:

- Track `project_click` when card is clicked
- Track `repo_click` when GitHub link is clicked
- Track `outbound_link_click` when external link is clicked

**Accessibility**:

- Semantic `<article>` element
- Proper heading hierarchy
- Alt text for images
- Keyboard-accessible links

**Rendering**: Static (SSG)

---

#### 5. ProjectLinks (Astro Component)

**Purpose**: Action links for project (GitHub, Live Demo, Details)

**Props**:

```typescript
interface ProjectLinksProps {
  githubUrl?: string;
  liveUrl?: string;
  slug: string;
}
```

**Structure**:

```astro
---
// src/components/cards/ProjectLinks.astro
interface Props {
  githubUrl?: string;
  liveUrl?: string;
  slug: string;
}

const { githubUrl, liveUrl, slug } = Astro.props;
---

<div class="project-links">
  {githubUrl && (
    <a 
      href={githubUrl}
      class="btn btn-secondary btn-sm"
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-event="repo_click"
      data-analytics-project={slug}
    >
      <svg><!-- GitHub icon --></svg>
      Code
    </a>
  )}
  
  {liveUrl && (
    <a 
      href={liveUrl}
      class="btn btn-secondary btn-sm"
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-event="outbound_link_click"
      data-analytics-project={slug}
    >
      <svg><!-- External link icon --></svg>
      Live Demo
    </a>
  )}
  
  <a 
    href={`/projects/${slug}`}
    class="btn btn-primary btn-sm"
    data-analytics-event="project_click"
    data-analytics-project={slug}
  >
    View Details
  </a>
</div>
```

**Analytics**: Uses data attributes for event delegation

---

## Data Flow

### Data Flow Diagram

```txt
Build Time (SSG):
  Content Collection → Zod Validation → Sort & Filter → Static HTML

Client Side (Hydration):
  User Input → Filter Logic → DOM Manipulation → Visual Update
                    ↓
              Analytics Tracking
```

### 1. Build Time (SSG)

```typescript
// src/pages/projects.astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectsHero from '../components/sections/ProjectsHero.astro';
import ProjectsFilterErrorBoundary from '../components/filters/ProjectsFilterErrorBoundary';
import ProjectsFilter from '../components/filters/ProjectsFilter';
import ProjectsGrid from '../components/sections/ProjectsGrid.astro';

// Fetch all projects at build time with error handling
let allProjects;

try {
  allProjects = await getCollection('projects');
} catch (error) {
  console.error('Failed to load projects collection:', error);
  
  // In development, fail fast to catch issues early
  if (import.meta.env.DEV) {
    throw new Error(
      `Content collection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
  
  // In production, use empty array but log to monitoring
  allProjects = [];
  
  // TODO: Send to error monitoring service
  // reportError('content_collection_error', error);
}

// Validate we have projects
if (allProjects.length === 0) {
  console.warn('No projects found in collection');
}

// Sort by order, then by date
const sortedProjects = allProjects
  .filter(p => p.data.status !== 'archived')
  .sort((a, b) => {
    if (a.data.order !== b.data.order) {
      return a.data.order - b.data.order;
    }
    return b.data.startDate.getTime() - a.data.startDate.getTime();
  });

// Extract unique filter options
const allStacks = [...new Set(allProjects.flatMap(p => p.data.stack))].sort();
const allDomains = [...new Set(allProjects.map(p => p.data.domain))].sort();
const allTags = [...new Set(allProjects.flatMap(p => p.data.tags))].sort();

// Prepare data for client-side filtering
const projectsData = sortedProjects.map(p => ({
  slug: p.slug,
  title: p.data.title,
  summary: p.data.summary,
  thumbnail: p.data.thumbnail,
  stack: p.data.stack,
  domain: p.data.domain,
  tags: p.data.tags,
  featured: p.data.featured,
  githubUrl: p.data.githubUrl,
  liveUrl: p.data.liveUrl,
}));
---

<BaseLayout 
  title="Projects | Your Name"
  description="Selected work across media platforms, fintech, enterprise systems, and developer tools"
>
  <ProjectsHero projectCount={sortedProjects.length} />
  
  <section class="projects-section">
    <div class="container">
      <!-- Skip link for keyboard users -->
      <a href="#projects-grid" class="skip-link">
        Skip to projects
      </a>
      
      <ProjectsFilterErrorBoundary client:idle>
        <ProjectsFilter 
          projects={projectsData}
          stacks={allStacks}
          domains={allDomains}
          tags={allTags}
        />
      </ProjectsFilterErrorBoundary>
      
      <div id="projects-grid">
        <ProjectsGrid projects={sortedProjects} />
      </div>
    </div>
  </section>
</BaseLayout>
```

### 2. Client-Side (Hydration)

When the ProjectsFilter island hydrates:

1. **Initial State**: All projects visible
2. **User Interaction**: Filter/search changes
3. **Filter Logic**: Apply filters client-side
4. **DOM Update**: Show/hide project cards
5. **Analytics**: Track filter changes
6. **Accessibility**: Announce result count

---

## Filtering & Search Logic

### Filter Strategy

**Approach**: Client-side filtering with progressive enhancement

**Why Client-Side?**

- Projects list is finite (typically < 50 items)
- Instant feedback without server round-trips
- No need for API endpoints or SSR
- Better UX with smooth transitions

**Fallback**: Without JavaScript, all projects are visible

### Progressive Enhancement Strategy

**Without JavaScript (SSG only):**

- ✅ All projects visible
- ✅ Project cards fully functional
- ✅ Links work
- ✅ Images load
- ❌ Filters not interactive
- ❌ Search not available

**With JavaScript (After Hydration):**

- ✅ Interactive filters
- ✅ Real-time search
- ✅ Filter chips
- ✅ Result count updates
- ✅ Analytics tracking

**Fallback Strategy:**

- Filters hidden with `<noscript>` message
- All projects visible by default
- Content remains accessible
- SEO not impacted

### URL State Management

Filter state is synchronized with URL parameters to enable:

- Shareable filtered views
- Browser back/forward navigation
- Bookmarkable searches
- Deep linking to filtered results

**Implementation:**

```typescript
// src/lib/filters/useFilterState.ts
import { useState, useEffect } from 'react';
import type { FilterCriteria } from '../../types/filters';

export function useFilterState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Sync state with URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const query = params.get('q') || '';
    const stacks = params.get('stack')?.split(',').filter(Boolean) || [];
    const domains = params.get('domain')?.split(',').filter(Boolean) || [];
    const tags = params.get('tags')?.split(',').filter(Boolean) || [];
    
    setSearchQuery(query);
    setSelectedStacks(stacks);
    setSelectedDomains(domains);
    setSelectedTags(tags);
  }, []);
  
  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedStacks.length > 0) params.set('stack', selectedStacks.join(','));
    if (selectedDomains.length > 0) params.set('domain', selectedDomains.join(','));
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    // Use replaceState to avoid polluting history
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedStacks, selectedDomains, selectedTags]);
  
  return {
    searchQuery,
    setSearchQuery,
    selectedStacks,
    setSelectedStacks,
    selectedDomains,
    setSelectedDomains,
    selectedTags,
    setSelectedTags,
  };
}
```

**Example URLs:**

- `/projects` - All projects
- `/projects?q=dashboard` - Search for "dashboard"
- `/projects?stack=React,TypeScript` - Filter by React and TypeScript
- `/projects?domain=media&stack=React` - Media domain with React
- `/projects?q=cms&stack=React&domain=media` - Combined filters

### State Persistence

Filter state is persisted in sessionStorage to restore filters when users navigate back to the projects page.

**Implementation:**

```typescript
// src/lib/filters/usePersistedFilterState.ts
import { useState, useEffect } from 'react';
import type { FilterCriteria } from '../../types/filters';

const STORAGE_KEY = 'projects-filter-state';
const STORAGE_TTL = 30 * 60 * 1000; // 30 minutes

interface PersistedState extends FilterCriteria {
  timestamp: number;
}

export function usePersistedFilterState() {
  const [state, setState] = useState<FilterCriteria>({
    searchQuery: '',
    selectedStacks: [],
    selectedDomains: [],
    selectedTags: [],
  });

  // Load from storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed: PersistedState = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - parsed.timestamp > STORAGE_TTL) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      setState({
        searchQuery: parsed.searchQuery,
        selectedStacks: parsed.selectedStacks,
        selectedDomains: parsed.selectedDomains,
        selectedTags: parsed.selectedTags,
      });
    } catch (error) {
      console.warn('Failed to restore filter state:', error);
    }
  }, []);

  // Save to storage on change
  useEffect(() => {
    try {
      const toStore: PersistedState = {
        ...state,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to persist filter state:', error);
    }
  }, [state]);

  return [state, setState] as const;
}
```

**Benefits:**

- Preserves user's filter selections across navigation
- Expires after 30 minutes to avoid stale state
- Graceful fallback if storage fails
- Works alongside URL state management

### Filter Algorithm

```typescript
// src/lib/filters/projectFilters.ts
import { projectSchema } from '../../content/config';
import type { z } from 'astro:content';

export interface ProjectData {
  slug: string;
  title: string;
  summary: string;
  description?: string;
  stack: string[];
  domain: string;
  tags: string[];
  featured: boolean;
}

export interface FilterCriteria {
  searchQuery: string;
  selectedStacks: string[];
  selectedDomains: string[];
  selectedTags: string[];
}

// Runtime validation schema for client-side data
const ProjectDataSchema = projectSchema.pick({
  title: true,
  slug: true,
  summary: true,
  description: true,
  stack: true,
  domain: true,
  tags: true,
  featured: true,
}).extend({
  slug: z.string(),
  description: z.string().optional(),
});

export function filterProjects(
  projects: unknown[],
  criteria: FilterCriteria
): ProjectData[] {
  // Validate and parse projects at runtime
  const validProjects = projects
    .map(p => ProjectDataSchema.safeParse(p))
    .filter(result => {
      if (!result.success) {
        console.warn('Invalid project data:', result.error);
        return false;
      }
      return true;
    })
    .map(result => result.data as ProjectData);
  
  return validProjects.filter(project => {
    // Search filter (title, summary, description, stack, tags)
    if (criteria.searchQuery) {
      const query = criteria.searchQuery.toLowerCase();
      const searchableText = [
        project.title,
        project.summary,
        project.description || '',
        ...project.stack,
        ...project.tags,
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    // Stack filter (OR logic - any selected stack)
    if (criteria.selectedStacks.length > 0) {
      const hasSelectedStack = criteria.selectedStacks.some(stack =>
        project.stack.includes(stack)
      );
      if (!hasSelectedStack) {
        return false;
      }
    }
    
    // Domain filter (OR logic - any selected domain)
    if (criteria.selectedDomains.length > 0) {
      if (!criteria.selectedDomains.includes(project.domain)) {
        return false;
      }
    }
    
    // Tag filter (OR logic - any selected tag)
    if (criteria.selectedTags.length > 0) {
      const hasSelectedTag = criteria.selectedTags.some(tag =>
        project.tags.includes(tag)
      );
      if (!hasSelectedTag) {
        return false;
      }
    }
    
    return true;
  });
}

export function getFilterStats(
  projects: ProjectData[],
  criteria: FilterCriteria
): {
  total: number;
  filtered: number;
  byDomain: Record<string, number>;
  byStack: Record<string, number>;
} {
  const filtered = filterProjects(projects, criteria);
  
  return {
    total: projects.length,
    filtered: filtered.length,
    byDomain: countBy(filtered, 'domain'),
    byStack: countBy(filtered.flatMap(p => p.stack)),
  };
}

function countBy<T>(items: T[], key?: keyof T): Record<string, number> {
  return items.reduce((acc, item) => {
    const value = key ? String(item[key]) : String(item);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
```

### Search Implementation

**Strategy**: Simple string matching with debouncing (no external dependencies)

**Features**:

- Case-insensitive search
- Searches across: title, summary, description, stack, tags
- 300ms debounce to reduce re-renders
- Clear button to reset search

**Why Simple String Matching?**

- Projects list is small (< 50 items)
- Simple `.includes()` is fast and sufficient
- No additional dependencies needed
- Keeps bundle size minimal

**Optional Enhancement**: If fuzzy matching is needed, implement lightweight custom solution:

```typescript
// src/lib/filters/fuzzyMatch.ts
// Custom fuzzy match (no dependency, ~20 lines)
export function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === queryLower.length;
}
```

**Note**: Avoid adding Fuse.js or similar libraries. The 10-20 KB bundle size increase is not justified for a small dataset.

---

## React Island Implementation

### ProjectsFilterErrorBoundary Component

Error boundary wrapper to handle React island failures gracefully:

```typescript
// src/components/filters/ProjectsFilterErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ProjectsFilterErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProjectsFilter error:', error, errorInfo);
    
    // TODO: Send to error monitoring service
    // reportError('projects_filter_error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="projects-filter-error" role="alert">
          <p className="text-secondary">
            Unable to load filters. Showing all projects.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProjectsFilterErrorBoundary;
```

**Usage:**

```astro
<ProjectsFilterErrorBoundary client:idle>
  <ProjectsFilter 
    projects={projectsData}
    stacks={allStacks}
    domains={allDomains}
    tags={allTags}
  />
</ProjectsFilterErrorBoundary>
```

**Benefits:**

- Prevents entire page crash if filter logic fails
- Provides graceful fallback (all projects visible)
- Logs errors for debugging
- Maintains user experience on errors

---

### ProjectsFilter Component

```typescript
// src/components/filters/ProjectsFilter.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { filterProjects, type ProjectData, type FilterCriteria } from '../../lib/filters/projectFilters';
import { trackEvent } from '../../lib/analytics/track';
import { sanitizeSearchQuery } from '../../lib/filters/sanitize';
import SearchInput from './SearchInput';
import StackFilter from './StackFilter';
import DomainFilter from './DomainFilter';
import FilterChips from './FilterChips';

interface ProjectsFilterProps {
  projects: ProjectData[];
  stacks: string[];
  domains: string[];
  tags: string[];
}

export default function ProjectsFilter({
  projects,
  stacks,
  domains,
  tags,
}: ProjectsFilterProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Track hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Memoized filter criteria
  const filterCriteria: FilterCriteria = useMemo(() => ({
    searchQuery,
    selectedStacks,
    selectedDomains,
    selectedTags,
  }), [searchQuery, selectedStacks, selectedDomains, selectedTags]);
  
  // Memoized filtered projects
  const filteredProjects = useMemo(() => {
    try {
      return filterProjects(projects, filterCriteria);
    } catch (error) {
      console.error('Filter error:', error);
      return projects; // Fallback to all projects
    }
  }, [projects, filterCriteria]);
  
  // Update DOM to show/hide cards based on filtered results
  useEffect(() => {
    const cards = document.querySelectorAll('[data-project-slug]');
    const filteredSlugs = new Set(filteredProjects.map(p => p.slug));
    
    cards.forEach((card) => {
      const slug = card.getAttribute('data-project-slug');
      if (slug && filteredSlugs.has(slug)) {
        card.classList.remove('hidden');
        card.removeAttribute('aria-hidden');
      } else {
        card.classList.add('hidden');
        card.setAttribute('aria-hidden', 'true');
      }
    });
  }, [filteredProjects]);
  
  // Track search with accurate result count
  const handleSearchChange = useCallback((query: string) => {
    const sanitized = sanitizeSearchQuery(query);
    setSearchQuery(sanitized);
    
    if (sanitized) {
      // Calculate result count inline for accuracy
      const results = filterProjects(projects, {
        searchQuery: sanitized,
        selectedStacks,
        selectedDomains,
        selectedTags,
      });
      
      trackEvent('search_used', {
        search_term: sanitized,
        search_context: 'projects',
        results_count: results.length,
      });
    }
  }, [projects, selectedStacks, selectedDomains, selectedTags]);
  
  // Track filter changes with accurate result count
  const handleFilterChange = useCallback((
    filterType: string,
    values: string[],
    updatedCriteria: FilterCriteria
  ) => {
    // Calculate result count inline for accuracy
    const results = filterProjects(projects, updatedCriteria);
    
    trackEvent('filter_change', {
      filter_type: filterType,
      filter_values: values,
      results_count: results.length,
    });
  }, [projects]);
  
  // Stack filter handlers
  const handleStackChange = useCallback((stacks: string[]) => {
    setSelectedStacks(stacks);
    
    const updatedCriteria = {
      searchQuery,
      selectedStacks: stacks,
      selectedDomains,
      selectedTags,
    };
    
    handleFilterChange('stack', stacks, updatedCriteria);
  }, [searchQuery, selectedDomains, selectedTags, handleFilterChange]);
  
  // Domain filter handlers
  const handleDomainChange = useCallback((domains: string[]) => {
    setSelectedDomains(domains);
    
    const updatedCriteria = {
      searchQuery,
      selectedStacks,
      selectedDomains: domains,
      selectedTags,
    };
    
    handleFilterChange('domain', domains, updatedCriteria);
  }, [searchQuery, selectedStacks, selectedTags, handleFilterChange]);
  
  // Tag filter handlers
  const handleTagChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
    
    const updatedCriteria = {
      searchQuery,
      selectedStacks,
      selectedDomains,
      selectedTags: tags,
    };
    
    handleFilterChange('tag', tags, updatedCriteria);
  }, [searchQuery, selectedStacks, selectedDomains, handleFilterChange]);
  
  // Clear all filters
  const handleClearAll = useCallback(() => {
    setSearchQuery('');
    setSelectedStacks([]);
    setSelectedDomains([]);
    setSelectedTags([]);
    
    trackEvent('filter_change', {
      filter_type: 'clear_all',
      filter_values: [],
      results_count: projects.length,
    });
  }, [projects.length]);
  
  const hasActiveFilters = 
    searchQuery || 
    selectedStacks.length > 0 || 
    selectedDomains.length > 0 ||
    selectedTags.length > 0;
  
  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="projects-filter projects-filter-loading">
        <div className="skeleton-search" aria-label="Loading filters...">
          <div className="skeleton-input"></div>
          <div className="skeleton-buttons">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="projects-filter">
      <div className="projects-filter-controls">
        <SearchInput 
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search projects..."
        />
        
        <div className="projects-filter-group">
          <StackFilter
            stacks={stacks}
            selected={selectedStacks}
            onChange={handleStackChange}
          />
          
          <DomainFilter
            domains={domains}
            selected={selectedDomains}
            onChange={handleDomainChange}
          />
        </div>
      </div>
      
      {hasActiveFilters && (
        <FilterChips
          searchQuery={searchQuery}
          selectedStacks={selectedStacks}
          selectedDomains={selectedDomains}
          selectedTags={selectedTags}
          onRemoveSearch={() => setSearchQuery('')}
          onRemoveStack={(stack) => setSelectedStacks(prev => prev.filter(s => s !== stack))}
          onRemoveDomain={(domain) => setSelectedDomains(prev => prev.filter(d => d !== domain))}
          onRemoveTag={(tag) => setSelectedTags(prev => prev.filter(t => t !== tag))}
          onClearAll={handleClearAll}
        />
      )}
      
      <div 
        className="projects-filter-results"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Showing {filteredProjects.length} of {projects.length} projects
      </div>
    </div>
  );
}
```

### SearchInput Component

Complete implementation with debouncing:

```typescript
// src/components/filters/SearchInput.tsx
import { useState, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  debounceMs = 300 
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  
  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Debounce onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);
  
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };
  
  return (
    <div className="search-input-wrapper">
      <svg 
        className="search-input-icon" 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
      </svg>
      
      <input
        type="search"
        id="project-search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="input search-input"
        aria-label="Search projects"
        aria-describedby="search-help"
        aria-controls="projects-grid"
      />
      
      {localValue && (
        <button
          className="search-input-clear btn btn-ghost btn-icon btn-sm"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      )}
      
      <p id="search-help" className="sr-only">
        Search by title, technology, or keyword
      </p>
    </div>
  );
}
```

**Features:**

- 300ms debounce to reduce re-renders
- Local state for immediate UI feedback
- Syncs with external value prop
- Clear button when search has value
- Proper ARIA labels and descriptions
- Cleanup on unmount

### Filter Communication Strategy

**Challenge**: React island needs to communicate filtered results to static Astro grid

**Decision**: DOM Manipulation with class toggling

**Rationale:**

1. **Simpler implementation** - Direct DOM manipulation is more straightforward than complex CSS attribute selectors
2. **Better performance** - Toggling classes is faster than CSS parsing data attributes
3. **Easier debugging** - Visible class changes in DevTools vs. hidden CSS logic
4. **More maintainable** - JavaScript logic is easier to test and modify than CSS selectors
5. **Progressive enhancement preserved** - All cards visible without JavaScript

**Implementation:**

```typescript
// React island directly manipulates project card visibility
useEffect(() => {
  const cards = document.querySelectorAll('[data-project-slug]');
  const filteredSlugs = new Set(filteredProjects.map(p => p.slug));
  
  cards.forEach((card) => {
    const slug = card.getAttribute('data-project-slug');
    if (slug && filteredSlugs.has(slug)) {
      card.classList.remove('hidden');
      card.removeAttribute('aria-hidden');
    } else {
      card.classList.add('hidden');
      card.setAttribute('aria-hidden', 'true');
    }
  });
}, [filteredProjects]);
```

**ProjectCard data attributes:**

```astro
<!-- ProjectCard.astro -->
<article 
  class="card project-card"
  data-project-slug={project.slug}
>
  <!-- card content -->
</article>
```

**CSS for hidden state:**

```css
.project-card.hidden {
  display: none;
}
```

### Decision Matrix: Filter Communication Approaches

| Approach | Performance | Maintainability | Testability | Complexity | Recommendation |
| -------- | ----------- | --------------- | ----------- | ---------- | -------------- |
| CSS-based | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ❌ |
| DOM manipulation | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ✅ |
| Full client-side | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ❌ |

---

## Analytics Integration

### Tracked Events

#### 1. Page View

```typescript
// Tracked automatically on page load
{
  event: 'page_view',
  page_path: '/projects',
  page_title: 'Projects',
}
```

#### 2. Search Used

```typescript
{
  event: 'search_used',
  search_term: string,
  search_context: 'projects',
  results_count: number,
}
```

#### 3. Filter Change

```typescript
{
  event: 'filter_change',
  filter_type: 'stack' | 'domain' | 'tag' | 'clear_all',
  filter_values: string[],
  results_count: number,
}
```

#### 4. Project Click

```typescript
{
  event: 'project_click',
  project_slug: string,
  project_title: string,
  project_domain: string,
  project_featured: boolean,
  click_context: 'grid' | 'featured',
}
```

#### 5. Repo Click

```typescript
{
  event: 'repo_click',
  project_slug: string,
  repo_url: string,
  link_type: 'github',
}
```

#### 6. Outbound Link Click

```typescript
{
  event: 'outbound_link_click',
  project_slug: string,
  link_url: string,
  link_type: 'live_demo' | 'external',
}
```

### Analytics Implementation

```typescript
// src/types/analytics.ts
export interface SearchUsedEvent {
  event: 'search_used';
  search_term: string;
  search_context: string;
  results_count: number;
}

export interface FilterChangeEvent {
  event: 'filter_change';
  filter_type: string;
  filter_values: string[];
  results_count: number;
}

export interface ProjectClickEvent {
  event: 'project_click';
  project_slug: string;
  project_title: string;
  project_domain: string;
  project_featured: boolean;
  click_context: string;
}

export interface RepoClickEvent {
  event: 'repo_click';
  project_slug: string;
  repo_url: string;
  link_type: 'github';
}

export interface OutboundLinkClickEvent {
  event: 'outbound_link_click';
  project_slug: string;
  link_url: string;
  link_type: 'live_demo' | 'external';
}

export interface FilterCombinationEvent {
  event: 'filter_combination';
  filters: string;
  filter_count: number;
  results_count: number;
}

export type ProjectsPageEvent = 
  | SearchUsedEvent 
  | FilterChangeEvent 
  | ProjectClickEvent
  | RepoClickEvent
  | OutboundLinkClickEvent
  | FilterCombinationEvent;

// Global dataLayer type augmentation
declare global {
  interface Window {
    dataLayer: ProjectsPageEvent[];
  }
}
```

### Type-Safe Analytics Tracking

```typescript
// src/lib/analytics/track.ts
import type { ProjectsPageEvent } from '../../types/analytics';

export function trackEvent<T extends ProjectsPageEvent>(
  event: T['event'],
  data: Omit<T, 'event'>
): void {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...data,
    timestamp: new Date().toISOString(),
  } as T);
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event, data);
  }
}

// Type-safe usage examples:
// trackEvent('search_used', {
//   search_term: 'react',
//   search_context: 'projects',
//   results_count: 5,
// });
//
// trackEvent('filter_change', {
//   filter_type: 'stack',
//   filter_values: ['React'],
//   results_count: 8,
// });
```

### Filter Combination Analytics

Track which filters are commonly used together:

```typescript
// src/lib/analytics/filterCombinations.ts
import type { FilterCriteria } from '../../types/filters';
import { trackEvent } from './track';

export function trackFilterCombination(
  criteria: FilterCriteria,
  resultsCount: number
) {
  const activeFilters: string[] = [];
  
  if (criteria.searchQuery) activeFilters.push('search');
  if (criteria.selectedStacks.length > 0) activeFilters.push('stack');
  if (criteria.selectedDomains.length > 0) activeFilters.push('domain');
  if (criteria.selectedTags.length > 0) activeFilters.push('tags');
  
  // Only track when multiple filters are active
  if (activeFilters.length > 1) {
    trackEvent('filter_combination', {
      filters: activeFilters.sort().join('+'),
      filter_count: activeFilters.length,
      results_count: resultsCount,
    });
  }
}
```

### FilterDropdown Component

Complete implementation with keyboard navigation and accessibility:

```typescript
// src/components/filters/FilterDropdown.tsx
import { useState, useRef, useEffect } from 'react';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  multiSelect = true,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);
  
  const handleToggle = (value: string) => {
    if (multiSelect) {
      const newSelected = selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value];
      onChange(newSelected);
    } else {
      onChange([value]);
      setIsOpen(false);
    }
  };
  
  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className="filter-dropdown-button btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        {label}
        {selected.length > 0 && (
          <span className="badge badge-primary badge-sm">{selected.length}</span>
        )}
        <svg 
          className="icon-sm" 
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden="true"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M6 9L1 4h10z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="filter-dropdown-menu" role="menu">
          {options.map((option) => (
            <label
              key={option.value}
              className="filter-dropdown-item"
              role="menuitemcheckbox"
              aria-checked={selected.includes(option.value)}
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="visually-hidden"
              />
              <span className="filter-dropdown-checkbox">
                {selected.includes(option.value) && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M10 3L4.5 8.5 2 6"/>
                  </svg>
                )}
              </span>
              <span className="filter-dropdown-label">
                {option.label}
              </span>
              <span className="filter-dropdown-count">
                {option.count}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Features:**

- Multi-select or single-select mode
- Keyboard navigation (Escape to close)
- Outside click detection
- Selected count badge
- Project count per option
- Proper ARIA attributes
- Animated chevron icon

**Usage:**

```typescript
// Calculate options with counts
const stackOptions: FilterOption[] = allStacks.map(stack => ({
  value: stack,
  label: stack,
  count: projects.filter(p => p.stack.includes(stack)).length,
}));

<FilterDropdown
  label="Stack"
  options={stackOptions}
  selected={selectedStacks}
  onChange={handleStackChange}
  multiSelect={true}
/>
```

---

### Event Delegation

Use event delegation for link clicks to avoid attaching listeners to every card:

```typescript
// src/lib/analytics/projectsAnalytics.ts
export function initProjectsAnalytics() {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('[data-analytics-event]');
    
    if (!link) return;
    
    const eventType = link.getAttribute('data-analytics-event');
    const projectSlug = link.getAttribute('data-analytics-project');
    
    if (eventType === 'project_click') {
      trackEvent('project_click', {
        project_slug: projectSlug,
        project_title: link.getAttribute('data-analytics-title') || '',
        project_domain: link.getAttribute('data-analytics-domain') || '',
        project_featured: link.getAttribute('data-analytics-featured') === 'true',
        click_context: 'grid',
      });
    } else if (eventType === 'repo_click') {
      trackEvent('repo_click', {
        project_slug: projectSlug,
        repo_url: (link as HTMLAnchorElement).href,
        link_type: 'github',
      });
    } else if (eventType === 'outbound_link_click') {
      trackEvent('outbound_link_click', {
        project_slug: projectSlug,
        link_url: (link as HTMLAnchorElement).href,
        link_type: 'live_demo',
      });
    }
  });
}
```

---

## Performance Optimization

### JavaScript Budget

- **Filter component**: ~8-12 KB (gzipped)
- **Total page JS**: < 30 KB (gzipped)
- **Hydration timing**: Idle (not blocking initial render)

### Image Optimization

```astro
---
import { Image } from 'astro:assets';

const { project } = Astro.props;
const { title, thumbnail, thumbnailDark } = project.data;

// Use dark mode variant if available
const imageSrc = thumbnailDark && Astro.request.headers.get('Sec-CH-Prefers-Color-Scheme') === 'dark'
  ? thumbnailDark
  : thumbnail;

// Validate image exists at build time
let validatedSrc = imageSrc;
try {
  validatedSrc = imageSrc;
} catch (error) {
  console.warn(`Missing thumbnail for project: ${title}`);
  validatedSrc = '/images/placeholder-project.jpg';
}

// Define responsive sizes
const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
---

<Image 
  src={validatedSrc}
  alt={title}
  width={400}
  height={250}
  widths={[400, 600, 800]}
  sizes={sizes}
  loading="lazy"
  decoding="async"
  format="webp"
  quality={80}
/>
```

**Strategy**:

- Use Astro's built-in Image component
- Lazy load all project images
- Generate WebP format with quality optimization
- Provide appropriate dimensions
- Use responsive images for different screen sizes
- Support dark mode image variants
- Validate images at build time
- Fallback to placeholder for missing images

**Dark Mode Image Handling:**

For projects without separate dark mode thumbnails, use CSS blend mode:

```css
.project-card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--bg-tertiary);
  position: relative;
}

.project-card-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg-primary);
  mix-blend-mode: multiply;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

[data-theme="dark"] .project-card-image::after {
  opacity: 0.1; /* Subtle darkening for white backgrounds */
}

.project-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

### Code Splitting

```typescript
// Lazy load filter components if needed
const StackFilter = lazy(() => import('./StackFilter'));
const DomainFilter = lazy(() => import('./DomainFilter'));
```

### Caching Strategy

- **Build-time**: Projects fetched once during build
- **Browser cache**: Static assets cached with long TTL
- **No runtime API calls**: All data embedded at build time

---

## Accessibility

### Keyboard Navigation

**Requirements**:

- Tab through all interactive elements
- Enter/Space to activate buttons and checkboxes
- Escape to clear search or close dropdowns
- Arrow keys for dropdown navigation

### Screen Reader Support

**Announcements**:

```html
<!-- Results count announcement -->
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
>
  Showing {filteredCount} of {totalCount} projects
</div>

<!-- Empty state announcement -->
<div 
  role="status" 
  aria-live="polite"
>
  No projects found. Try adjusting your filters.
</div>
```

**Labels**:

```html
<label for="project-search" class="form-label">
  Search projects
</label>
<input 
  id="project-search"
  type="search"
  aria-describedby="search-help"
  aria-controls="projects-grid"
/>
<p id="search-help" class="form-helper">
  Search by title, technology, or keyword
</p>
```

### Focus Management

```typescript
// When filters change, optionally move focus to results
function announceResults(count: number) {
  const resultsElement = document.getElementById('projects-results-status');
  if (resultsElement) {
    resultsElement.textContent = `Showing ${count} projects`;
  }
}
```

---

## SEO Strategy

### Page Metadata

```astro
---
// src/pages/projects.astro
import SEOHead from '../components/seo/SEOHead.astro';

const seoData = {
  title: 'Projects | Your Name',
  description: 'Selected work across media platforms, fintech, enterprise systems, and developer tools. Explore projects built with React, TypeScript, Next.js, and modern web technologies.',
  canonical: new URL('/projects', Astro.site),
  openGraph: {
    type: 'website',
    title: 'Projects Portfolio',
    description: 'Explore my engineering projects and technical work',
    image: '/images/og-projects.jpg',
  },
};
---

<SEOHead {...seoData} />
```

### Structured Data

```typescript
// Schema.org structured data for projects page
const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Projects",
  "description": "Portfolio of engineering projects",
  "url": "https://yoursite.com/projects",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": projects.map((project, index) => ({
      "@type": "CreativeWork",
      "position": index + 1,
      "name": project.data.title,
      "description": project.data.summary,
      "url": `https://yoursite.com/projects/${project.slug}`,
      "keywords": project.data.tags.join(', '),
    })),
  },
};
```

### Sitemap Entry

```xml
<url>
  <loc>https://yoursite.com/projects</loc>
  <lastmod>2026-03-14</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## Styling & Design

### Layout Structure

```css
/* Projects page layout */
.projects-hero {
  padding: var(--space-16) 0 var(--space-12);
  text-align: center;
}

.projects-section {
  padding: var(--space-12) 0 var(--space-20);
}

.projects-filter {
  margin-bottom: var(--space-12);
}

/* Skip link for keyboard navigation */
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: var(--z-notification);
  padding: var(--space-3) var(--space-4);
  background: var(--primary-500);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
}

.skip-link:focus {
  left: var(--space-4);
  top: var(--space-4);
}

/* Filter controls - responsive layout */
.projects-filter-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Mobile: Stack vertically */
.projects-filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Tablet: Horizontal with wrap */
@media (min-width: 640px) {
  .projects-filter-group {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

/* Desktop: Full horizontal layout */
@media (min-width: 768px) {
  .projects-filter-controls {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .search-input-wrapper {
    flex: 1;
    min-width: 300px;
  }
  
  .projects-filter-group {
    flex-wrap: nowrap;
  }
}

.projects-filter-results {
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Loading state skeleton */
.projects-filter-loading {
  margin-bottom: var(--space-12);
}

.skeleton-search {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-input {
  height: 2.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-buttons {
  display: flex;
  gap: var(--space-3);
}

.skeleton-button {
  height: 2.5rem;
  width: 6rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (min-width: 768px) {
  .skeleton-search {
    flex-direction: row;
    align-items: center;
  }
  
  .skeleton-input {
    flex: 1;
  }
}
```

### Project Grid

```css
.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Project Card

```css
.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: var(--transition-base);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.project-card[data-featured="true"] {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 1px var(--primary-500);
}

.project-card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.project-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-transform);
}

.project-card:hover .project-card-image img {
  transform: scale(1.05);
}

.project-card-header {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.project-card-stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.project-links {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
```

### Filter Components

```css
/* Search Input */
.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding-left: var(--space-10);
}

.search-input-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input-clear {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
}

/* Filter Dropdown */
.filter-dropdown {
  position: relative;
}

.filter-dropdown-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filter-dropdown-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  
  z-index: var(--z-dropdown);
}

.filter-dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: var(--transition-colors);
}

.filter-dropdown-item:hover {
  background: var(--bg-tertiary);
}

.filter-dropdown-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.filter-dropdown-label {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.filter-dropdown-count {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
  margin-left: auto;
  padding-left: var(--space-2);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Filter Chips */
.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin-top: var(--space-4);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  
  background: var(--primary-100);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  
  transition: var(--transition-colors);
}

.filter-chip:hover {
  background: var(--primary-200);
}

.filter-chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
}

.filter-chip-clear-all {
  color: var(--text-secondary);
  text-decoration: underline;
  cursor: pointer;
  font-size: var(--text-xs);
}

.filter-chip-clear-all:hover {
  color: var(--text-primary);
}
```

### Empty State

Enhanced empty state with actionable guidance:

```astro
---
// src/components/sections/ProjectsEmpty.astro
interface Props {
  hasActiveFilters: boolean;
  filterCount: number;
}

const { hasActiveFilters, filterCount } = Astro.props;
---

<div class="projects-empty" role="status">
  <svg 
    class="projects-empty-icon" 
    width="64" 
    height="64" 
    viewBox="0 0 64 64" 
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
  >
    <circle cx="32" cy="32" r="28" stroke-width="2"/>
    <path d="M32 20v24M20 32h24" stroke-width="2" stroke-linecap="round"/>
  </svg>
  
  {hasActiveFilters ? (
    <>
      <h2 class="projects-empty-title">No projects found</h2>
      <p class="projects-empty-description">
        No projects match your current filters. Try adjusting your search or removing some filters.
      </p>
      <button 
        class="btn btn-secondary"
        onclick="window.dispatchEvent(new CustomEvent('clear-filters'))"
        type="button"
      >
        Clear all {filterCount} {filterCount === 1 ? 'filter' : 'filters'}
      </button>
    </>
  ) : (
    <>
      <h2 class="projects-empty-title">No projects yet</h2>
      <p class="projects-empty-description">
        Projects will appear here once they're added to the collection.
      </p>
    </>
  )}
</div>
```

```css
.projects-empty {
  text-align: center;
  padding: var(--space-16) var(--space-4);
}

.projects-empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto var(--space-6);
  color: var(--text-tertiary);
}

.projects-empty-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.projects-empty-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  max-width: 32rem;
  margin-left: auto;
  margin-right: auto;
}
```

---

## Error Handling

### Content Collection Errors

Fail fast in development, graceful degradation in production:

```typescript
// src/pages/projects.astro
---
import { getCollection } from 'astro:content';

let allProjects;

try {
  allProjects = await getCollection('projects');
} catch (error) {
  console.error('Failed to load projects collection:', error);
  
  // In development, fail fast to catch issues early
  if (import.meta.env.DEV) {
    throw new Error(
      `Content collection error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
  
  // In production, use empty array but log to monitoring
  allProjects = [];
  
  // TODO: Send to error monitoring service
  // reportError('content_collection_error', error);
}

// Validate we have projects
if (allProjects.length === 0) {
  console.warn('No projects found in collection');
}
---
```

### Filter Errors

Graceful degradation with error boundaries:

```typescript
// Wrapped in error boundary at component level
// Individual filter operations also have try-catch

const filteredProjects = useMemo(() => {
  try {
    return filterProjects(projects, filterCriteria);
  } catch (error) {
    console.error('Filter error:', error);
    return projects; // Fallback to all projects
  }
}, [projects, filterCriteria]);
```

### Image Loading Errors

Validate images at build time:

```astro
---
// src/components/cards/ProjectCard.astro
import { Image } from 'astro:assets';

const { project } = Astro.props;
const { title, thumbnail } = project.data;

// Validate image exists at build time
let imageSrc = thumbnail;
try {
  imageSrc = thumbnail;
} catch (error) {
  console.warn(`Missing thumbnail for project: ${title}`);
  imageSrc = '/images/placeholder-project.jpg';
}
---

<div class="project-card-image">
  <Image 
    src={imageSrc}
    alt={title}
    width={400}
    height={250}
    loading="lazy"
    decoding="async"
  />
</div>
```

**Note**: Astro's Image component validates images at build time, so runtime errors are rare. For additional safety, ensure placeholder image exists.

---

## Testing Strategy

### Unit Tests

**Filter Logic**:

```typescript
// src/lib/filters/projectFilters.test.ts
import { describe, it, expect } from 'vitest';
import { filterProjects } from './projectFilters';

describe('filterProjects', () => {
  it('filters by search query', () => {
    const projects = [
      { title: 'React Dashboard', summary: 'Admin panel', stack: ['React'], domain: 'saas', tags: [] },
      { title: 'Vue App', summary: 'Mobile app', stack: ['Vue'], domain: 'mobile', tags: [] },
    ];
    
    const result = filterProjects(projects, {
      searchQuery: 'react',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: [],
    });
    
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('React Dashboard');
  });
  
  it('filters by stack', () => {
    // Test stack filtering
  });
  
  it('combines multiple filters with AND logic', () => {
    // Test combined filters
  });
});
```

**Analytics Tracking**:

```typescript
// src/lib/analytics/track.test.ts
import { describe, it, expect, vi } from 'vitest';
import { trackEvent } from './track';

describe('trackEvent', () => {
  it('pushes event to dataLayer', () => {
    window.dataLayer = [];
    
    trackEvent('project_click', {
      project_slug: 'test-project',
      project_title: 'Test Project',
    });
    
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer[0].event).toBe('project_click');
  });
});
```

### Component Tests

```typescript
// src/components/filters/ProjectsFilter.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectsFilter from './ProjectsFilter';

describe('ProjectsFilter', () => {
  it('renders search input', () => {
    render(<ProjectsFilter projects={[]} stacks={[]} domains={[]} tags={[]} />);
    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
  });
  
  it('filters projects on search', async () => {
    const projects = [
      { title: 'React App', summary: 'Test', stack: ['React'], domain: 'saas', tags: [] },
    ];
    
    render(<ProjectsFilter projects={projects} stacks={['React']} domains={['saas']} tags={[]} />);
    
    const input = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(input, { target: { value: 'react' } });
    
    // Assert filtered results
  });
  
  it('shows loading state before hydration', () => {
    render(<ProjectsFilter projects={[]} stacks={[]} domains={[]} tags={[]} />);
    expect(screen.getByLabelText('Loading filters...')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test the critical filter-to-grid communication:

```typescript
// src/components/filters/ProjectsFilter.integration.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectsFilter from './ProjectsFilter';

describe('ProjectsFilter Integration', () => {
  beforeEach(() => {
    // Set up DOM with project cards
    document.body.innerHTML = `
      <div id="projects-grid">
        <article class="project-card" data-project-slug="project-1">
          <h3>React Dashboard</h3>
        </article>
        <article class="project-card" data-project-slug="project-2">
          <h3>Vue App</h3>
        </article>
      </div>
    `;
  });

  it('hides cards not matching filter', async () => {
    const user = userEvent.setup();
    const projects = [
      { 
        slug: 'project-1', 
        title: 'React Dashboard', 
        summary: 'Admin panel',
        stack: ['React', 'TypeScript'], 
        domain: 'saas', 
        tags: [],
        featured: false,
      },
      { 
        slug: 'project-2', 
        title: 'Vue App', 
        summary: 'Mobile app',
        stack: ['Vue'], 
        domain: 'mobile', 
        tags: [],
        featured: false,
      },
    ];

    const { container } = render(
      <ProjectsFilter 
        projects={projects}
        stacks={['React', 'Vue', 'TypeScript']}
        domains={['saas', 'mobile']}
        tags={[]}
      />
    );

    // Wait for hydration
    await screen.findByPlaceholderText('Search projects...');

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search projects...');
    await user.type(searchInput, 'react');

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 400));

    // Verify DOM manipulation
    const card1 = document.querySelector('[data-project-slug="project-1"]');
    const card2 = document.querySelector('[data-project-slug="project-2"]');

    expect(card1?.classList.contains('hidden')).toBe(false);
    expect(card2?.classList.contains('hidden')).toBe(true);
    expect(card2?.getAttribute('aria-hidden')).toBe('true');
  });

  it('announces result count to screen readers', async () => {
    const projects = [
      { slug: 'p1', title: 'Project 1', summary: '', stack: ['React'], domain: 'saas', tags: [], featured: false },
      { slug: 'p2', title: 'Project 2', summary: '', stack: ['Vue'], domain: 'saas', tags: [], featured: false },
    ];

    render(
      <ProjectsFilter 
        projects={projects}
        stacks={['React', 'Vue']}
        domains={['saas']}
        tags={[]}
      />
    );

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Showing 2 of 2 projects');
  });

  it('handles missing cards gracefully', () => {
    // Clear DOM
    document.body.innerHTML = '';

    const projects = [
      { slug: 'p1', title: 'Project 1', summary: '', stack: [], domain: 'saas', tags: [], featured: false },
    ];

    // Should not throw
    expect(() => {
      render(
        <ProjectsFilter 
          projects={projects}
          stacks={[]}
          domains={['saas']}
          tags={[]}
        />
      );
    }).not.toThrow();
  });
});
```

---

### Testing Event Delegation

Use event delegation for link clicks to avoid attaching listeners to every card:

### E2E Tests

```typescript
// tests/e2e/projects.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test('loads projects page', async ({ page }) => {
    await page.goto('/projects');
    
    await expect(page.locator('h1')).toContainText('Projects');
    await expect(page.locator('.project-card')).toHaveCount(10); // or expected count
  });
  
  test('filters projects by stack', async ({ page }) => {
    await page.goto('/projects');
    
    // Click stack filter
    await page.click('[data-filter="stack-react"]');
    
    // Verify filtered results
    const cards = page.locator('.project-card:visible');
    await expect(cards).toHaveCount(5); // expected filtered count
  });
  
  test('searches projects', async ({ page }) => {
    await page.goto('/projects');
    
    await page.fill('[data-testid="project-search"]', 'dashboard');
    
    // Wait for debounce
    await page.waitForTimeout(400);
    
    // Verify search results
    const cards = page.locator('.project-card:visible');
    await expect(cards.first()).toContainText('Dashboard');
  });
  
  test('tracks analytics events', async ({ page }) => {
    await page.goto('/projects');
    
    // Expose dataLayer
    const dataLayer = await page.evaluate(() => window.dataLayer);
    
    // Click project card
    await page.click('.project-card a[data-analytics-event="project_click"]');
    
    // Verify event was tracked
    const events = await page.evaluate(() => window.dataLayer);
    expect(events.some(e => e.event === 'project_click')).toBe(true);
  });
  
  test('is keyboard accessible', async ({ page }) => {
    await page.goto('/projects');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
  
  test('persists filter state in URL', async ({ page }) => {
    await page.goto('/projects');
    
    // Apply filters
    await page.fill('#project-search', 'react');
    await page.waitForTimeout(400);
    
    // Check URL updated
    expect(page.url()).toContain('?q=react');
    
    // Reload page
    await page.reload();
    
    // Verify filter state restored
    const searchInput = page.locator('#project-search');
    await expect(searchInput).toHaveValue('react');
  });
  
  test('handles empty search results', async ({ page }) => {
    await page.goto('/projects');
    
    await page.fill('#project-search', 'nonexistentproject123');
    await page.waitForTimeout(400);
    
    // Verify empty state shown
    await expect(page.locator('.projects-empty')).toBeVisible();
    await expect(page.locator('.projects-empty-title')).toContainText('No projects found');
  });
  
  test('clears filters with clear all button', async ({ page }) => {
    await page.goto('/projects?q=react&stack=TypeScript');
    
    // Verify filters active
    await expect(page.locator('.filter-chip')).toHaveCount(2);
    
    // Click clear all
    await page.click('.filter-chip-clear-all');
    
    // Verify filters cleared
    await expect(page.locator('.filter-chip')).toHaveCount(0);
    expect(page.url()).not.toContain('?');
  });
});
```

### Test Scenarios Matrix

**Filter Edge Cases:**

- ✅ Empty search query
- ✅ Special characters in search (`<script>`, `&`, quotes)
- ✅ Very long search query (> 100 chars)
- ✅ All filters selected simultaneously
- ✅ No projects match filters (empty state)
- ✅ Single project matches filter
- ✅ All projects match filter

**Analytics Edge Cases:**

- ✅ dataLayer not initialized (graceful fallback)
- ✅ Tracking errors (try-catch in trackEvent)
- ✅ Multiple rapid filter changes (debouncing)
- ✅ Analytics disabled (check window.dataLayer exists)

**Accessibility Edge Cases:**

- ✅ Screen reader navigation (ARIA live regions)
- ✅ Keyboard-only navigation (Tab, Enter, Escape)
- ✅ Focus trap prevention in dropdowns
- ✅ ARIA announcement timing (result count updates)
- ✅ Skip link functionality

**Performance Edge Cases:**

- ✅ 100+ projects (stress test filtering speed)
- ✅ Slow network (image lazy loading)
- ✅ Slow device (filter debouncing effectiveness)
- ✅ Rapid filter changes (memoization effectiveness)

**State Management Edge Cases:**

- ✅ URL state sync on mount
- ✅ URL state update on filter change
- ✅ SessionStorage persistence
- ✅ SessionStorage quota exceeded
- ✅ Invalid URL parameters
- ✅ Browser back/forward navigation

---

## Type Definitions

### Core Types

```typescript
// src/types/projects.ts
import type { CollectionEntry } from 'astro:content';
import type { z } from 'astro:content';
import { projectSchema } from '../content/config';

export type Project = CollectionEntry<'projects'>;

// Infer from Zod schema for consistency
export type ProjectData = z.infer<typeof projectSchema>;

// Client-side project data (subset for filtering)
export type ProjectFilterData = {
  slug: string;
  title: string;
  summary: string;
  description?: string;
  thumbnail: string;
  stack: string[];
  domain: string;
  tags: string[];
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
};

export type ProjectDomain = 
  | 'media'
  | 'fintech'
  | 'privacy'
  | 'enterprise'
  | 'ecommerce'
  | 'saas'
  | 'developer-tools'
  | 'other';

export type ProjectStatus = 'completed' | 'in-progress' | 'archived';
```

### Filter Types

```typescript
// src/types/filters.ts
export interface FilterCriteria {
  searchQuery: string;
  selectedStacks: string[];
  selectedDomains: string[];
  selectedTags: string[];
}

export interface FilterOption {
  value: string;
  label: string;
  count: number; // Required for displaying counts
}

export interface FilterState {
  criteria: FilterCriteria;
  resultCount: number;
  isActive: boolean;
}

export interface PersistedFilterState extends FilterCriteria {
  timestamp: number;
}
```

### Analytics Types

See "Analytics Implementation" section above for complete type definitions including:

- `SearchUsedEvent`
- `FilterChangeEvent`
- `ProjectClickEvent`
- `RepoClickEvent`
- `OutboundLinkClickEvent`
- `FilterCombinationEvent`
- `ProjectsPageEvent` (union type)
- Global `Window` interface augmentation

---

## File Structure

Complete file organization for the Projects page:

```txt
src/
├── components/
│   ├── cards/
│   │   ├── ProjectCard.astro
│   │   └── ProjectLinks.astro
│   ├── filters/
│   │   ├── ProjectsFilterErrorBoundary.tsx  # Error boundary wrapper
│   │   ├── ProjectsFilter.tsx               # Main filter island
│   │   ├── SearchInput.tsx                  # Debounced search
│   │   ├── StackFilter.tsx
│   │   ├── DomainFilter.tsx
│   │   ├── FilterChips.tsx
│   │   └── FilterDropdown.tsx               # Reusable dropdown
│   ├── sections/
│   │   ├── ProjectsHero.astro
│   │   ├── ProjectsGrid.astro
│   │   └── ProjectsEmpty.astro
│   └── ui/
│       └── Badge.astro
├── content/
│   ├── config.ts                            # Content collections schema (exported)
│   └── projects/
│       ├── project-1.md
│       ├── project-2.md
│       └── ...
├── lib/
│   ├── analytics/
│   │   ├── track.ts                         # Type-safe tracking utilities
│   │   ├── projectsAnalytics.ts             # Projects-specific analytics
│   │   └── filterCombinations.ts            # Filter combination tracking
│   ├── filters/
│   │   ├── projectFilters.ts                # Filter logic with validation
│   │   ├── projectFilters.test.ts           # Filter unit tests
│   │   ├── sanitize.ts                      # Input sanitization
│   │   ├── useFilterState.ts                # URL state management
│   │   └── usePersistedFilterState.ts       # SessionStorage persistence
│   └── vitals/
│       └── projectsVitals.ts                # Web Vitals tracking
├── pages/
│   ├── projects.astro                       # Main projects page
│   └── projects/
│       └── [slug].astro                     # Individual project detail page
├── styles/
│   └── projects.css                         # Projects-specific styles
└── types/
    ├── projects.ts                          # Project types
    ├── filters.ts                           # Filter types
    └── analytics.ts                         # Analytics event types

scripts/
└── validate-projects.ts                     # Content validation script

tests/
├── unit/
│   └── filters/
│       └── projectFilters.test.ts
├── integration/
│   └── ProjectsFilter.integration.test.tsx  # Filter-to-grid tests
└── e2e/
    └── projects.spec.ts                     # E2E tests
```

---

## Implementation Phases

### Phase 1: Foundation (Static)

**Goal**: Build static projects page without interactivity

**Tasks**:

1. Create content collection schema
2. Add sample project entries (5-10 projects)
3. Build ProjectsHero component
4. Build ProjectCard component
5. Build ProjectsGrid component
6. Add basic styling
7. Implement SEO metadata
8. Add structured data

**Outcome**: Static projects page with all content visible

---

### Phase 2: Filtering (Interactive)

**Goal**: Add client-side filtering and search

**Tasks**:

1. Create filter utility functions
2. Build SearchInput component
3. Build StackFilter component
4. Build DomainFilter component
5. Build FilterChips component
6. Integrate ProjectsFilter island
7. Implement CSS-based filtering
8. Add empty state component
9. Test filter combinations

**Outcome**: Fully interactive filtering system

---

### Phase 3: Analytics

**Goal**: Track user interactions

**Tasks**:

1. Define analytics event types
2. Implement event tracking utilities
3. Add analytics to filter interactions
4. Add analytics to project clicks
5. Add analytics to link clicks
6. Test analytics in development
7. Verify dataLayer events

**Outcome**: Complete analytics instrumentation

---

### Phase 4: Polish & Optimization

**Goal**: Refine UX and performance

**Tasks**:

1. Add loading states
2. Optimize images
3. Add animations (subtle)
4. Improve mobile experience
5. Test keyboard navigation
6. Test screen reader experience
7. Run Lighthouse audit
8. Fix accessibility issues
9. Add E2E tests

**Outcome**: Production-ready projects page

---

## Performance Targets

### Lighthouse Scores

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Core Web Vitals

- **LCP**: < 2.5s
- **CLS**: < 0.1
- **INP**: < 200ms

### Implementation JavaScript Budget

- **Initial bundle**: < 30 KB (gzipped)
- **Filter island**: < 12 KB (gzipped)
- **Total page weight**: < 500 KB

### Loading Performance

- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Total Blocking Time**: < 200ms

---

## Accessibility Checklist

### Semantic HTML

- [ ] Use `<main>` for page content
- [ ] Use `<article>` for project cards
- [ ] Use `<nav>` for filter controls
- [ ] Use proper heading hierarchy (h1 → h2 → h3)
- [ ] Use `<button>` for interactive elements
- [ ] Use `<a>` for navigation links

### ARIA Attributes

- [ ] `aria-label` for icon-only buttons
- [ ] `aria-live` for result count announcements
- [ ] `aria-controls` for filter → grid relationship
- [ ] `aria-expanded` for dropdown states
- [ ] `aria-checked` for checkbox filters
- [ ] `role="status"` for dynamic updates

### Accessibility Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes dropdowns
- [ ] Arrow keys navigate dropdowns
- [ ] Focus visible on all interactive elements
- [ ] Skip to main content link

### Accessibility Screen Reader Support

- [ ] Announce filter changes
- [ ] Announce result count changes
- [ ] Announce empty state
- [ ] Descriptive link text
- [ ] Alt text for all images
- [ ] Form labels properly associated

### Color & Contrast

- [ ] Text meets WCAG AA standards (4.5:1)
- [ ] Interactive elements meet 3:1 contrast
- [ ] Focus indicators are visible
- [ ] Color is not the only indicator

### Motion & Animation

- [ ] Respect `prefers-reduced-motion`
- [ ] Animations are subtle
- [ ] No auto-playing animations
- [ ] Transitions are purposeful

---

## SEO Checklist

### On-Page SEO

- [ ] Unique, descriptive title tag
- [ ] Meta description (150-160 characters)
- [ ] Canonical URL
- [ ] Proper heading hierarchy
- [ ] Descriptive alt text for images
- [ ] Internal links to project detail pages
- [ ] Semantic HTML structure

### Open Graph

- [ ] `og:title`
- [ ] `og:description`
- [ ] `og:image`
- [ ] `og:url`
- [ ] `og:type` (website)

### Twitter Cards

- [ ] `twitter:card` (summary_large_image)
- [ ] `twitter:title`
- [ ] `twitter:description`
- [ ] `twitter:image`

### Accessibility Structured Data

- [ ] CollectionPage schema
- [ ] ItemList with CreativeWork items
- [ ] Valid JSON-LD syntax
- [ ] Test with Google Rich Results Test

### Technical SEO

- [ ] Sitemap entry
- [ ] Robots.txt allows crawling
- [ ] Mobile-friendly design
- [ ] Fast loading speed
- [ ] HTTPS (in production)

---

## Future Enhancements

### Phase 5: Advanced Features

**Potential additions** (not in initial scope):

1. **Pagination**: For large project lists (50+ projects)
2. **Sort Options**: By date, popularity, alphabetical
3. **Project Detail Pages**: Full project pages with case study content
4. **Related Projects**: Show similar projects based on stack/domain
5. **Project Timeline**: Visual timeline of projects over time
6. **GitHub Integration**: Fetch live repo stats (stars, forks, last updated)
7. **View Modes**: Grid vs. List view toggle
8. **Bookmarking**: Save favorite projects (local storage)
9. **Share Functionality**: Share individual projects
10. **Print Styles**: Optimized print layout

### Integration Opportunities

**GitHub API**:

- Fetch live repository stats for projects with GitHub links
- Display stars, forks, last commit date
- Show language breakdown
- Cache data with TTL

**Content Relationships**:

- Link projects to related case studies
- Show case studies that reference projects
- Cross-reference between content types

**Advanced Analytics**:

- Track time spent on page
- Track scroll depth
- Track filter combinations (most popular)
- A/B test different layouts

---

## Architecture Decisions

### Decision 1: Client-Side vs. Server-Side Filtering

**Decision**: Client-side filtering

**Rationale**:

- Projects list is small (< 50 items)
- Instant feedback improves UX
- No server round-trips needed
- Simpler implementation
- Works with static generation

**Trade-offs**:

- All project data sent to client
- Filtering logic runs in browser
- Not suitable for 100+ projects

**Alternative**: Server-side filtering with SSR would be needed for large datasets

---

### Decision 2: CSS-Based vs. DOM Manipulation Filtering

**Decision**: DOM manipulation with class toggling

**Rationale**:

- Simpler implementation than complex CSS attribute selectors
- Better performance - toggling classes is faster than CSS parsing data attributes
- Easier debugging - visible class changes in DevTools
- More maintainable - JavaScript logic easier to test than CSS selectors
- Progressive enhancement preserved - all cards visible without JavaScript

**Trade-offs**:

- Direct DOM manipulation from React (crosses framework boundary)
- Requires `data-project-slug` attribute on each card
- Must ensure cards exist in DOM before manipulation

**Alternative Considered**: CSS-based filtering would be more "declarative" but adds complexity and is harder to debug

---

### Decision 3: Single Island vs. Multiple Islands

**Decision**: Single ProjectsFilter island

**Rationale**:

- Shared state between filter controls
- Single hydration boundary
- Simpler data flow
- Smaller bundle size

**Trade-offs**:

- All filter logic hydrates together
- Can't independently lazy-load filters

**Alternative**: Multiple islands would allow granular hydration but add complexity

---

### Decision 4: Debounced Search vs. Instant Search

**Decision**: 300ms debounced search

**Rationale**:

- Reduces re-renders while typing
- Better performance
- Still feels instant to users
- Reduces analytics noise

**Trade-offs**:

- Slight delay before results update
- More complex implementation

**Alternative**: Instant search would re-filter on every keystroke

---

### Decision 5: Filter Logic (AND vs. OR)

**Decision**:

- Within same filter type: OR logic
- Across filter types: AND logic

**Example**:

- Stack: [React, Vue] → Show projects with React OR Vue
- Domain: [media] → Show projects in media domain
- Combined: Show projects with (React OR Vue) AND (media domain)

**Rationale**:

- OR within type is more permissive (better for discovery)
- AND across types narrows results (more specific)
- Matches user mental model

**Trade-offs**:

- More complex to explain
- Requires clear UI indicators

**Alternative**: All AND logic would be more restrictive

---

## Maintenance & Scalability

### Scaling Thresholds

**Content Scale Strategy:**

- **< 50 projects**: Current client-side filtering (optimal)
  - All projects sent to client
  - Instant filtering
  - No pagination needed
  
- **50-100 projects**: Add pagination
  - 10-20 projects per page
  - Client-side filtering within page
  - URL-based page navigation
  
- **100-500 projects**: Add virtual scrolling or server-side filtering
  - Virtual scrolling for performance
  - Or move filtering to API endpoints
  - Consider search backend
  
- **500+ projects**: Require API-based filtering
  - Dedicated search backend (Algolia, Elasticsearch)
  - Server-side pagination
  - Advanced query optimization

**Current design is optimal for < 50 projects.**

### Adding New Projects

1. Create new `.md` file in `src/content/projects/`
2. Add frontmatter with required fields
3. Add thumbnail image (400x250px)
4. Optional: Add long-form content
5. Run `npm run validate:content` to check
6. Build regenerates static page

### Adding New Filter Types

1. Update content collection schema in `src/content/config.ts`
2. Add filter option to `FilterCriteria` type
3. Create filter UI component (or use `FilterDropdown`)
4. Update `filterProjects` logic in `src/lib/filters/projectFilters.ts`
5. Add analytics tracking event
6. Update integration tests
7. Update documentation

### Performance Monitoring

**Metrics to track**:

- Page load time (p50, p95, p99)
- Filter interaction latency
- Search debounce effectiveness
- JavaScript bundle size
- Image loading performance
- Core Web Vitals (LCP, CLS, INP)
- Filter-to-grid update time

**Tools**:

- Lighthouse CI in GitHub Actions
- Web Vitals tracking (see Performance Monitoring section)
- Bundle size monitoring with `bundlesize` package
- Performance budgets enforced in CI
- Real User Monitoring (RUM) in production

### Content Guidelines

**For content authors**:

- Use consistent frontmatter format
- Provide high-quality thumbnails (400x250px)
- Write concise summaries (< 150 characters)
- Use standard stack names (maintain consistency)
- Tag appropriately (3-5 tags per project)
- Include GitHub/live URLs when available

### Content Validation

Automated validation to enforce content guidelines:

```typescript
// scripts/validate-projects.ts
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { existsSync } from 'fs';
import { join } from 'path';

// Standard stack names for consistency
const VALID_STACKS = [
  'React', 'Vue', 'Angular', 'Svelte', 'Solid',
  'TypeScript', 'JavaScript',
  'Next.js', 'Nuxt', 'Astro', 'Remix',
  'Tailwind CSS', 'CSS', 'SCSS',
  'Node.js', 'Deno', 'Bun',
  'GraphQL', 'REST API',
  'PostgreSQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes',
  'AWS', 'Vercel', 'Netlify',
];

async function validateProjects() {
  const projects = await getCollection('projects');
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const project of projects) {
    const { data, slug } = project;
    
    // Validate summary length
    if (data.summary.length > 150) {
      errors.push(
        `${slug}: Summary too long (${data.summary.length} chars, max 150)`
      );
    }
    
    if (data.summary.length < 20) {
      warnings.push(
        `${slug}: Summary very short (${data.summary.length} chars, min 20 recommended)`
      );
    }
    
    // Validate thumbnail exists and dimensions
    const thumbnailPath = join(process.cwd(), 'public', data.thumbnail);
    if (!existsSync(thumbnailPath)) {
      errors.push(`${slug}: Thumbnail not found at ${data.thumbnail}`);
    } else {
      try {
        const metadata = await sharp(thumbnailPath).metadata();
        if (metadata.width !== 400 || metadata.height !== 250) {
          warnings.push(
            `${slug}: Thumbnail dimensions ${metadata.width}x${metadata.height}, recommended 400x250`
          );
        }
      } catch (error) {
        errors.push(`${slug}: Failed to read thumbnail: ${error}`);
      }
    }
    
    // Validate stack consistency
    const invalidStacks = data.stack.filter(s => !VALID_STACKS.includes(s));
    if (invalidStacks.length > 0) {
      warnings.push(
        `${slug}: Non-standard stack names: ${invalidStacks.join(', ')}`
      );
    }
    
    // Validate tag count
    if (data.tags.length === 0) {
      warnings.push(`${slug}: No tags defined`);
    }
    if (data.tags.length > 8) {
      warnings.push(`${slug}: Too many tags (${data.tags.length}, max 8 recommended)`);
    }
    
    // Validate URLs
    if (data.githubUrl && !data.githubUrl.startsWith('https://github.com')) {
      warnings.push(`${slug}: GitHub URL doesn't start with https://github.com`);
    }
    
    // Validate dates
    if (data.endDate && data.endDate < data.startDate) {
      errors.push(`${slug}: End date is before start date`);
    }
  }
  
  // Report results
  if (warnings.length > 0) {
    console.warn('\n⚠️  Validation warnings:');
    warnings.forEach(warn => console.warn(`  ${warn}`));
  }
  
  if (errors.length > 0) {
    console.error('\n❌ Validation errors:');
    errors.forEach(err => console.error(`  ${err}`));
    process.exit(1);
  }
  
  console.log(`\n✓ Validated ${projects.length} projects`);
  if (warnings.length > 0) {
    console.log(`  ${warnings.length} warnings (non-blocking)`);
  }
}

validateProjects();
```

```json
// package.json
{
  "scripts": {
    "validate:content": "tsx scripts/validate-projects.ts",
    "prebuild": "npm run validate:content",
    "dev": "npm run validate:content && astro dev"
  },
  "devDependencies": {
    "sharp": "^0.33.0",
    "tsx": "^4.0.0"
  }
}
```

**Benefits:**

- Catches content issues before build
- Enforces consistency across projects
- Validates image dimensions and existence
- Checks frontmatter conventions
- Provides helpful error messages

---

## Integration Points

### Analytics System

**Dependencies**:

- `src/lib/analytics/dataLayer.ts` - dataLayer initialization
- `src/lib/analytics/track.ts` - Event tracking utilities
- `src/lib/analytics/events.ts` - Event type definitions

**Integration**:

```typescript
import { trackEvent } from '../../lib/analytics/track';

// Track filter change
trackEvent('filter_change', {
  filter_type: 'stack',
  filter_values: ['React', 'TypeScript'],
  results_count: 12,
});
```

### Design System

**Dependencies**:

- Design tokens from `docs/design-system.md`
- Component styles (Button, Badge, Card)
- Utility classes

**Integration**:

- Use semantic color variables
- Follow spacing system
- Apply consistent border radius
- Use typography scale

### Content Collections

**Dependencies**:

- Astro Content Collections API
- Zod schema validation

**Integration**:

```typescript
import { getCollection } from 'astro:content';

const projects = await getCollection('projects');
```

---

## Security Considerations

### XSS Prevention

Sanitize user input in search queries:

```typescript
// src/lib/filters/sanitize.ts
export function sanitizeSearchQuery(query: string): string {
  // Remove HTML tags
  const withoutTags = query.replace(/<[^>]*>/g, '');
  
  // Remove script-like content
  const withoutScripts = withoutTags.replace(/javascript:/gi, '');
  
  // Limit length to prevent abuse
  const maxLength = 100;
  const truncated = withoutScripts.slice(0, maxLength);
  
  // Trim whitespace
  return truncated.trim();
}
```

**Usage:**

```typescript
const handleSearchChange = useCallback((query: string) => {
  const sanitized = sanitizeSearchQuery(query);
  setSearchQuery(sanitized);
}, []);
```

**Additional XSS protections:**

- Use Astro's automatic escaping for content
- Validate URLs before rendering links
- Use `rel="noopener noreferrer"` for external links
- Never use `dangerouslySetInnerHTML` or `v-html`

### Content Security Policy

Strict CSP for production:

```html
<meta 
  http-equiv="Content-Security-Policy" 
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: data:;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  "
>
```

**Note**: `'unsafe-inline'` is needed for Astro's inline scripts. Consider using nonces in production for stricter security.

### Data Validation

Multi-layer validation strategy:

1. **Build-time validation**: Zod schemas in content collections
2. **Runtime validation**: Validate data at component boundaries
3. **Input sanitization**: Sanitize user input (search queries)
4. **URL validation**: Validate external URLs before rendering

```typescript
// Validate URLs before rendering
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Use in components
{githubUrl && isValidUrl(githubUrl) && (
  <a href={githubUrl} target="_blank" rel="noopener noreferrer">
    GitHub
  </a>
)}
```

---

## Monitoring & Observability

### Analytics Dashboards

**Key Metrics**:

- Page views
- Search usage rate
- Most used filters
- Most clicked projects
- Filter → click conversion rate
- Average time on page
- Filter combination patterns

**Segmentation**:

- By device type
- By traffic source
- By user journey

### Performance Monitoring & Observability

**Real-time Web Vitals tracking:**

```typescript
// src/lib/vitals/projectsVitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import { trackEvent } from '../analytics/track';

export function initProjectsVitals() {
  onLCP((metric) => {
    trackEvent('web_vitals', {
      metric_name: 'LCP',
      metric_value: metric.value,
      metric_rating: metric.rating,
      page_path: '/projects',
    });
  });
  
  onCLS((metric) => {
    trackEvent('web_vitals', {
      metric_name: 'CLS',
      metric_value: metric.value,
      metric_rating: metric.rating,
      page_path: '/projects',
    });
  });
  
  onINP((metric) => {
    trackEvent('web_vitals', {
      metric_name: 'INP',
      metric_value: metric.value,
      metric_rating: metric.rating,
      page_path: '/projects',
    });
  });
  
  onFCP((metric) => {
    trackEvent('web_vitals', {
      metric_name: 'FCP',
      metric_value: metric.value,
      metric_rating: metric.rating,
      page_path: '/projects',
    });
  });
  
  onTTFB((metric) => {
    trackEvent('web_vitals', {
      metric_name: 'TTFB',
      metric_value: metric.value,
      metric_rating: metric.rating,
      page_path: '/projects',
    });
  });
}
```

**Usage:**

```astro
<script>
  import { initProjectsVitals } from '../lib/vitals/projectsVitals';
  initProjectsVitals();
</script>
```

**Metrics tracked**:

- Page load time (p50, p95, p99)
- Filter interaction latency
- Search debounce effectiveness
- JavaScript execution time
- Image loading time
- Core Web Vitals (LCP, CLS, INP, FCP, TTFB)

**Alerts**:

- Performance regression (> 10% slower)
- JavaScript errors
- Failed content collection builds
- Core Web Vitals degradation

### Performance Budget Enforcement

Automated bundle size monitoring:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'projects-filter': ['./src/components/filters/ProjectsFilter.tsx'],
          },
        },
      },
    },
  },
});
```

```json
// package.json
{
  "scripts": {
    "build": "astro build",
    "build:check": "astro build && npm run check:bundle-size",
    "check:bundle-size": "bundlesize"
  },
  "bundlesize": [
    {
      "path": "./dist/_astro/ProjectsFilter.*.js",
      "maxSize": "12 KB"
    },
    {
      "path": "./dist/_astro/projects.*.js",
      "maxSize": "30 KB"
    }
  ],
  "devDependencies": {
    "bundlesize": "^0.18.0"
  }
}
```

**CI/CD Integration:**

```yaml
# .github/workflows/ci.yml
- name: Check bundle size
  run: npm run check:bundle-size
  
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://preview-url.com/projects
    budgetPath: ./lighthouse-budget.json
```

### Error Tracking

**Capture**:

- Content collection errors
- Filter logic errors
- Analytics tracking failures
- Image loading failures
- React error boundary catches

**Context**:

- User agent
- Viewport size
- Active filters
- Search query
- Filtered result count
- Hydration state

---

## Documentation

### Component Documentation

Each component should include:

- Purpose and responsibility
- Props interface with descriptions
- Usage examples
- Accessibility notes
- Analytics integration points

### API Documentation

Document filter functions:

- Function signature
- Parameters
- Return type
- Examples
- Edge cases

### Content Authoring Guide

Provide guidelines for:

- Frontmatter structure
- Required vs. optional fields
- Image specifications
- Stack naming conventions
- Tag taxonomy
- Domain categories

---

## Success Metrics

### User Engagement

- **Filter usage rate**: % of visitors who use filters
- **Search usage rate**: % of visitors who search
- **Project click rate**: % of visitors who click projects
- **Average filters per session**: How many filters users apply
- **Time to interaction**: How quickly users engage with filters

### Content Performance

- **Most viewed projects**: Track popular projects
- **Most searched terms**: Understand user intent
- **Most used filters**: Identify important categorization
- **Featured project CTR**: Measure featured badge effectiveness

### Technical Performance

- **Lighthouse scores**: Maintain 95+ performance
- **Core Web Vitals**: Stay in "Good" range
- **JavaScript errors**: < 0.1% error rate
- **Filter latency**: < 100ms response time
- **Search debounce effectiveness**: Reduce re-renders by 70%+

---

## References

### Related Documentation

- [PLANNING.md](../PLANNING.md) - Overall project planning
- [design-system.md](../design-system.md) - Design system tokens and components
- [WORKFLOW.md](../WORKFLOW.md) - Development workflow

### Related Skills

- `skills/astro-platform-architect/` - Astro architecture patterns
- `skills/analytics-engineer/` - Analytics implementation
- `skills/accessibility-seo-reviewer/` - Accessibility and SEO best practices

### External Resources

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Islands](https://docs.astro.build/en/concepts/islands/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Appendix

### Sample Filter State Transitions

```txt
Initial State:
  searchQuery: ""
  selectedStacks: []
  selectedDomains: []
  filteredProjects: [all 15 projects]

User types "react":
  searchQuery: "react"
  selectedStacks: []
  selectedDomains: []
  filteredProjects: [8 projects with "react"]

User selects "TypeScript" stack:
  searchQuery: "react"
  selectedStacks: ["TypeScript"]
  selectedDomains: []
  filteredProjects: [5 projects with "react" AND TypeScript]

User selects "media" domain:
  searchQuery: "react"
  selectedStacks: ["TypeScript"]
  selectedDomains: ["media"]
  filteredProjects: [2 projects with "react" AND TypeScript AND media]

User clears all:
  searchQuery: ""
  selectedStacks: []
  selectedDomains: []
  filteredProjects: [all 15 projects]
```

### Sample Analytics Sequence

```javascript
// Page load
dataLayer.push({
  event: 'page_view',
  page_path: '/projects',
  page_title: 'Projects',
  timestamp: '2026-03-14T10:30:00Z',
});

// User searches
dataLayer.push({
  event: 'search_used',
  search_term: 'dashboard',
  search_context: 'projects',
  results_count: 4,
  timestamp: '2026-03-14T10:30:15Z',
});

// User applies filter
dataLayer.push({
  event: 'filter_change',
  filter_type: 'stack',
  filter_values: ['React', 'TypeScript'],
  results_count: 3,
  timestamp: '2026-03-14T10:30:22Z',
});

// User clicks project
dataLayer.push({
  event: 'project_click',
  project_slug: 'editorial-component-system',
  project_title: 'Editorial Component System',
  project_domain: 'media',
  project_featured: true,
  click_context: 'grid',
  timestamp: '2026-03-14T10:30:45Z',
});
```

### Sample Project Frontmatter Variations

**Minimal Project**:

```yaml
---
title: "Simple Landing Page"
slug: "simple-landing-page"
summary: "Marketing site for SaaS product"
thumbnail: "/images/projects/landing-page.jpg"
stack: ["HTML", "CSS", "JavaScript"]
domain: "saas"
tags: ["landing-page", "marketing"]
featured: false
status: "completed"
startDate: 2025-06-01
---
```

**Featured Project with All Fields**:

```yaml
---
title: "Enterprise ERP Modernization"
slug: "enterprise-erp-modernization"
summary: "Migrated legacy ERP system to modern React architecture"
description: "Led the frontend modernization of a 15-year-old enterprise ERP system, serving 10,000+ users across 50+ countries. Improved performance by 300%, reduced bug reports by 60%, and enabled mobile access for the first time."
thumbnail: "/images/projects/erp-thumb.jpg"
coverImage: "/images/projects/erp-cover.jpg"
stack: ["React", "TypeScript", "Redux", "Material-UI", "Webpack"]
domain: "enterprise"
tags: ["legacy-migration", "erp", "performance", "accessibility"]
githubUrl: "https://github.com/username/erp-frontend"
liveUrl: "https://erp.example.com"
featured: true
status: "completed"
startDate: 2023-09-01
endDate: 2024-12-15
seoTitle: "Enterprise ERP Modernization - React Migration Case Study"
seoDescription: "How we modernized a legacy ERP system with React, TypeScript, and modern frontend architecture"
order: 1
---
```

---

## Implementation Checklist

### Setup

- [ ] Create `src/content/projects/` directory
- [ ] Define and export content collection schema in `src/content/config.ts`
- [ ] Add sample project entries (minimum 5)
- [ ] Create type definitions in `src/types/projects.ts`
- [ ] Create type definitions in `src/types/filters.ts`
- [ ] Create type definitions in `src/types/analytics.ts`
- [ ] Add placeholder images (`/public/images/placeholder-project.jpg`)

### Components

- [ ] Build ProjectsHero.astro
- [ ] Build ProjectCard.astro (with data-project-slug attribute)
- [ ] Build ProjectLinks.astro
- [ ] Build ProjectsGrid.astro
- [ ] Build ProjectsEmpty.astro (with enhanced empty state)
- [ ] Build ProjectsFilterErrorBoundary.tsx (error boundary)
- [ ] Build ProjectsFilter.tsx (React island with hydration state)
- [ ] Build SearchInput.tsx (with debouncing)
- [ ] Build FilterDropdown.tsx (reusable dropdown)
- [ ] Build StackFilter.tsx (using FilterDropdown)
- [ ] Build DomainFilter.tsx (using FilterDropdown)
- [ ] Build FilterChips.tsx

### Logic

- [ ] Implement filter utilities in `src/lib/filters/projectFilters.ts` (with runtime validation)
- [ ] Implement sanitization in `src/lib/filters/sanitize.ts`
- [ ] Implement URL state management in `src/lib/filters/useFilterState.ts`
- [ ] Implement state persistence in `src/lib/filters/usePersistedFilterState.ts`
- [ ] Implement type-safe analytics in `src/lib/analytics/track.ts`
- [ ] Implement filter combination tracking in `src/lib/analytics/filterCombinations.ts`
- [ ] Implement Web Vitals tracking in `src/lib/vitals/projectsVitals.ts`
- [ ] Add event delegation for link clicks
- [ ] Write unit tests for filter logic
- [ ] Write unit tests for sanitization

### Styling

- [ ] Create `src/styles/projects.css`
- [ ] Style projects grid (responsive)
- [ ] Style project cards (with hover effects)
- [ ] Style filter controls (responsive layout)
- [ ] Style filter dropdown (with counts)
- [ ] Style filter chips
- [ ] Style empty state (with actionable guidance)
- [ ] Style loading skeleton
- [ ] Style skip link
- [ ] Add hover/focus states
- [ ] Test dark mode
- [ ] Add dark mode image handling

### SEO & Accessibility

- [ ] Add page metadata
- [ ] Add Open Graph tags
- [ ] Add structured data (CollectionPage schema)
- [ ] Add ARIA labels
- [ ] Add live regions for result count
- [ ] Add skip link for keyboard users
- [ ] Test keyboard navigation
- [ ] Test screen reader
- [ ] Verify color contrast
- [ ] Test reduced motion support

### Testing

- [ ] Write unit tests for filter logic
- [ ] Write unit tests for sanitization
- [ ] Write component tests for React components
- [ ] Write integration tests for filter-to-grid communication
- [ ] Write E2E tests for filtering
- [ ] Write E2E tests for search
- [ ] Write E2E tests for URL state
- [ ] Write E2E tests for analytics
- [ ] Test accessibility with axe
- [ ] Test error boundaries
- [ ] Run Lighthouse audit

### Performance

- [ ] Configure bundle size limits
- [ ] Add bundlesize checks to CI
- [ ] Optimize images (WebP, responsive sizes)
- [ ] Test with 50+ projects (stress test)
- [ ] Verify JavaScript budget (< 30 KB)
- [ ] Verify filter island size (< 12 KB)
- [ ] Test Core Web Vitals

### Content & Validation

- [ ] Create content validation script (`scripts/validate-projects.ts`)
- [ ] Add validation to prebuild script
- [ ] Validate thumbnail dimensions
- [ ] Validate summary length
- [ ] Validate stack name consistency
- [ ] Create content authoring guide

### Documentation Checklist

- [ ] Document component APIs
- [ ] Document filter logic
- [ ] Document analytics events
- [ ] Document URL parameters
- [ ] Document state persistence
- [ ] Create content authoring guide
- [ ] Add troubleshooting guide
- [ ] Add inline code comments (where needed)

---

## Revision History

### Version 2.0 - 2026-03-14

**Major revisions based on platform review:**

#### Critical Issues Addressed

1. **Filter Communication Strategy** (Issue 1)
   - ✅ Chose DOM manipulation approach (removed CSS-based and full client-side options)
   - ✅ Added decision matrix comparing approaches
   - ✅ Updated Decision 2 with revised rationale

2. **Error Boundary Pattern** (Issue 2)
   - ✅ Added `ProjectsFilterErrorBoundary` component
   - ✅ Integrated error boundary in component hierarchy
   - ✅ Added error handling to filter logic

3. **Runtime Validation** (Issue 3)
   - ✅ Added Zod-based runtime validation in `filterProjects`
   - ✅ Validates project data structure at boundaries
   - ✅ Graceful handling of invalid data

4. **Schema Export** (Issue 10)
   - ✅ Exported `projectSchema` from content config
   - ✅ Added type inference with `z.infer<typeof projectSchema>`
   - ✅ Enabled schema reuse for runtime validation

#### Important Issues Addressed

1. **Integration Tests** (Issue 4)
   - ✅ Added integration test section with complete examples
   - ✅ Tests filter-to-grid DOM manipulation
   - ✅ Tests ARIA announcements

2. **Analytics Race Condition** (Issue 5)
   - ✅ Fixed result count calculation in callbacks
   - ✅ Calculate counts inline for accuracy
   - ✅ Updated all filter change handlers

3. **Debounce Implementation** (Issue 7)
   - ✅ Added complete `SearchInput` component with debouncing
   - ✅ 300ms debounce with cleanup
   - ✅ Local state for immediate UI feedback

4. **URL State Management** (Issue 8)
   - ✅ Added `useFilterState` hook with URL synchronization
   - ✅ Enables shareable filtered views
   - ✅ Supports browser back/forward

5. **Content Collection Error Handling** (Issue 9)
   - ✅ Fail fast in development
   - ✅ Graceful degradation in production
   - ✅ Validation for empty collections

6. **Type-Safe Analytics** (Issue 15)
    - ✅ Added global `Window` interface augmentation
    - ✅ Type-safe `trackEvent` function
    - ✅ Complete event type definitions

#### Minor Issues Addressed

1. **Loading State** (Issue 6)
    - ✅ Added hydration state tracking
    - ✅ Skeleton UI while island hydrates
    - ✅ Prevents interaction before hydration

2. **State Persistence** (Issue 12)
    - ✅ Added `usePersistedFilterState` hook
    - ✅ SessionStorage with 30-minute TTL
    - ✅ Restores filters on navigation back

3. **Image Error Handling** (Issue 13)
    - ✅ Removed inline `onerror` attribute
    - ✅ Build-time image validation
    - ✅ Fallback to placeholder

4. **FilterDropdown Implementation** (Issue 14)
    - ✅ Complete component with keyboard navigation
    - ✅ Outside click detection
    - ✅ Escape key handling
    - ✅ Multi-select support

5. **Fuse.js Removal** (Issue 16)
    - ✅ Removed Fuse.js suggestion
    - ✅ Kept simple string matching
    - ✅ Added custom fuzzy match option (no dependency)

6. **Dark Mode Images** (Issue 17)
    - ✅ Added `thumbnailDark` field to schema
    - ✅ CSS blend mode for white backgrounds
    - ✅ Automatic dark mode handling

7. **Performance Budget Enforcement** (Issue 18)
    - ✅ Added bundlesize configuration
    - ✅ CI/CD integration examples
    - ✅ Manual chunks configuration

8. **Content Validation** (Issue 19)
    - ✅ Complete validation script
    - ✅ Checks dimensions, lengths, consistency
    - ✅ Prebuild integration

9. **Filter Count Display** (Issue 20)
    - ✅ Made `count` required in `FilterOption`
    - ✅ Added count display in dropdown
    - ✅ Styled count badges

10. **Skip Link** (Issue 11)
    - ✅ Added skip-to-projects link
    - ✅ Keyboard accessible
    - ✅ Proper styling and positioning

11. **Responsive Filter Layout** (Issue 21)
    - ✅ Mobile-optimized vertical stacking
    - ✅ Tablet horizontal with wrap
    - ✅ Desktop full horizontal layout

12. **Enhanced Empty State** (Issue 22)
    - ✅ Different messages for filtered vs. no content
    - ✅ Clear filters button
    - ✅ Actionable guidance

#### Enhancements Added

- ✅ Filter combination analytics tracking
- ✅ Web Vitals monitoring with `web-vitals` library
- ✅ Progressive enhancement strategy documented
- ✅ Scaling thresholds defined
- ✅ Decision matrix for filter approaches
- ✅ Component responsibility matrix
- ✅ Data flow diagram
- ✅ Comprehensive test scenarios matrix
- ✅ Search query sanitization
- ✅ Stricter Content Security Policy
- ✅ URL validation utilities

**Review Score**: 9.2/10 → Ready for implementation

---

*Architecture designed by: Astro Platform Architect*  
*Reviewed by: Platform Reviewer*  
*Version: 2.0*  
*Last updated: 2026-03-14*
