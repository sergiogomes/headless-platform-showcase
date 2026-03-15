import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { filterProjects, type ProjectData } from '../../lib/filters/projectFilters';
import type { FilterCriteria } from '../../types/filters';
import { trackEvent } from '../../lib/analytics/track';
import { sanitizeSearchQuery } from '../../lib/filters/sanitize';
import { useFilterState } from '../../lib/filters/useFilterState';
import {
  loadPersistedFilterState,
  savePersistedFilterState,
} from '../../lib/filters/usePersistedFilterState';
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
  const hasRestoredFromStorage = useRef(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedStacks,
    setSelectedStacks,
    selectedDomains,
    setSelectedDomains,
    selectedTags,
    setSelectedTags,
  } = useFilterState();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || hasRestoredFromStorage.current) return;
    hasRestoredFromStorage.current = true;
    const fromUrl = typeof window !== 'undefined' && window.location.search;
    if (fromUrl) return;
    const persisted = loadPersistedFilterState();
    if (persisted) {
      setSearchQuery(persisted.searchQuery);
      setSelectedStacks(persisted.selectedStacks);
      setSelectedDomains(persisted.selectedDomains);
      setSelectedTags(persisted.selectedTags);
    }
  }, [isHydrated, setSearchQuery, setSelectedStacks, setSelectedDomains, setSelectedTags]);

  useEffect(() => {
    if (!isHydrated) return;
    savePersistedFilterState({
      searchQuery,
      selectedStacks,
      selectedDomains,
      selectedTags,
    });
  }, [isHydrated, searchQuery, selectedStacks, selectedDomains, selectedTags]);

  const filterCriteria: FilterCriteria = useMemo(
    () => ({
      searchQuery,
      selectedStacks,
      selectedDomains,
      selectedTags,
    }),
    [searchQuery, selectedStacks, selectedDomains, selectedTags]
  );

  const filteredProjects = useMemo(() => {
    try {
      return filterProjects(projects, filterCriteria);
    } catch {
      return projects;
    }
  }, [projects, filterCriteria]);

  useEffect(() => {
    const cards = document.querySelectorAll('[data-project-slug]');
    const filteredSlugs = new Set(filteredProjects.map((p) => p.slug));
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

  useEffect(() => {
    if (!isHydrated) return;
    if (filteredProjects.length === 0) return;

    const resultsSummary = document.querySelector<HTMLElement>('.projects-filter-results');
    if (resultsSummary) {
      resultsSummary.focus();
      return;
    }

    const firstVisibleCard = document.querySelector<HTMLElement>(
      '.project-card:not([aria-hidden="true"])'
    );
    firstVisibleCard?.focus();
  }, [isHydrated, filteredProjects.length]);

  const handleSearchChange = useCallback(
    (query: string) => {
      const sanitized = sanitizeSearchQuery(query);
      setSearchQuery(sanitized);
      if (sanitized) {
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
    },
    [projects, selectedStacks, selectedDomains, selectedTags]
  );

  const handleFilterChange = useCallback(
    (filterType: string, values: string[], updatedCriteria: FilterCriteria) => {
      const results = filterProjects(projects, updatedCriteria);
      trackEvent('filter_change', {
        filter_type: filterType,
        filter_values: values,
        results_count: results.length,
      });
    },
    [projects]
  );

  const handleStackChange = useCallback(
    (stacks: string[]) => {
      setSelectedStacks(stacks);
      handleFilterChange('stack', stacks, {
        searchQuery,
        selectedStacks: stacks,
        selectedDomains,
        selectedTags,
      });
    },
    [searchQuery, selectedDomains, selectedTags, handleFilterChange]
  );

  const handleDomainChange = useCallback(
    (domains: string[]) => {
      setSelectedDomains(domains);
      handleFilterChange('domain', domains, {
        searchQuery,
        selectedStacks,
        selectedDomains: domains,
        selectedTags,
      });
    },
    [searchQuery, selectedStacks, selectedTags, handleFilterChange]
  );

  const handleTagChange = useCallback(
    (tags: string[]) => {
      setSelectedTags(tags);
      handleFilterChange('tag', tags, {
        searchQuery,
        selectedStacks,
        selectedDomains,
        selectedTags: tags,
      });
    },
    [searchQuery, selectedStacks, selectedDomains, handleFilterChange]
  );

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

  const projectCountByStack = useMemo(() => {
    const acc: Record<string, number> = {};
    projects.forEach((p) => {
      p.stack.forEach((s) => {
        acc[s] = (acc[s] ?? 0) + 1;
      });
    });
    return acc;
  }, [projects]);

  const projectCountByDomain = useMemo(() => {
    const acc: Record<string, number> = {};
    projects.forEach((p) => {
      acc[p.domain] = (acc[p.domain] ?? 0) + 1;
    });
    return acc;
  }, [projects]);

  const hasActiveFilters =
    searchQuery ||
    selectedStacks.length > 0 ||
    selectedDomains.length > 0 ||
    selectedTags.length > 0;

  useEffect(() => {
    if (!isHydrated) return;

    const activeFilters: string[] = [
      ...selectedStacks.map((s) => `stack:${s}`),
      ...selectedDomains.map((d) => `domain:${d}`),
      ...selectedTags.map((t) => `tag:${t}`),
    ];

    if (activeFilters.length > 1) {
      const results = filterProjects(projects, {
        searchQuery,
        selectedStacks,
        selectedDomains,
        selectedTags,
      });

      trackEvent('filter_combination', {
        filters: activeFilters.join(','),
        filter_count: activeFilters.length,
        results_count: results.length,
      });
    }
  }, [
    isHydrated,
    projects,
    searchQuery,
    selectedStacks,
    selectedDomains,
    selectedTags,
  ]);

  useEffect(() => {
    function onClearFilters() {
      handleClearAll();
    }
    const btn = document.getElementById('clear-filters-btn');
    btn?.addEventListener('click', onClearFilters);
    window.addEventListener('clear-filters', onClearFilters);
    return () => {
      btn?.removeEventListener('click', onClearFilters);
      window.removeEventListener('clear-filters', onClearFilters);
    };
  }, [handleClearAll]);

  if (!isHydrated) {
    return (
      <div className="projects-filter projects-filter-loading">
        <div className="skeleton-search" aria-label="Loading filters...">
          <div className="skeleton-input" />
          <div className="skeleton-buttons">
            <div className="skeleton-button" />
            <div className="skeleton-button" />
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
            projectCountByStack={projectCountByStack}
          />
          <DomainFilter
            domains={domains}
            selected={selectedDomains}
            onChange={handleDomainChange}
            projectCountByDomain={projectCountByDomain}
          />
        </div>
      </div>
      {hasActiveFilters ? (
        <FilterChips
          searchQuery={searchQuery}
          selectedStacks={selectedStacks}
          selectedDomains={selectedDomains}
          selectedTags={selectedTags}
          onRemoveSearch={() => setSearchQuery('')}
          onRemoveStack={(stack) => setSelectedStacks((prev) => prev.filter((s) => s !== stack))}
          onRemoveDomain={(domain) =>
            setSelectedDomains((prev) => prev.filter((d) => d !== domain))
          }
          onRemoveTag={(tag) => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
          onClearAll={handleClearAll}
        />
      ) : null}
      <div
        className="projects-filter-results"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        tabIndex={-1}
      >
        Showing {filteredProjects.length} of {projects.length} projects
      </div>
    </div>
  );
}
