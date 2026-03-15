import { useState, useEffect } from 'react';
import type { FilterCriteria } from '../../types/filters';

const PARAM_Q = 'q';
const PARAM_STACK = 'stack';
const PARAM_DOMAIN = 'domain';
const PARAM_TAGS = 'tags';

/**
 * Reads filter state from the current URL query string (q, stack, domain, tags).
 * Used on mount to restore shareable filter state.
 */
function getInitialStateFromUrl(): FilterCriteria {
  if (typeof window === 'undefined') {
    return {
      searchQuery: '',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: [],
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    searchQuery: params.get(PARAM_Q) ?? '',
    selectedStacks: params.get(PARAM_STACK)?.split(',').filter(Boolean) ?? [],
    selectedDomains: params.get(PARAM_DOMAIN)?.split(',').filter(Boolean) ?? [],
    selectedTags: params.get(PARAM_TAGS)?.split(',').filter(Boolean) ?? [],
  };
}

/**
 * React hook that keeps filter state (search, stacks, domains, tags) in sync with the URL.
 * On mount, initial state is read from query params; on state change, URL is updated via replaceState.
 * Enables shareable and back/forward-friendly filter URLs.
 */
export function useFilterState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const url = getInitialStateFromUrl();
    setSearchQuery(url.searchQuery);
    setSelectedStacks(url.selectedStacks);
    setSelectedDomains(url.selectedDomains);
    setSelectedTags(url.selectedTags);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (searchQuery) params.set(PARAM_Q, searchQuery);
    if (selectedStacks.length > 0) params.set(PARAM_STACK, selectedStacks.join(','));
    if (selectedDomains.length > 0) params.set(PARAM_DOMAIN, selectedDomains.join(','));
    if (selectedTags.length > 0) params.set(PARAM_TAGS, selectedTags.join(','));
    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
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
