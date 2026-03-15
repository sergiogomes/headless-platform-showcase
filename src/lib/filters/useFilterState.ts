import { useState, useEffect } from 'react';
import type { FilterCriteria } from '../../types/filters';
import { sanitizeSearchQuery } from './sanitize';

const PARAM_Q = 'q';
const PARAM_STACK = 'stack';
const PARAM_DOMAIN = 'domain';
const PARAM_TAGS = 'tags';

const MAX_FILTER_VALUES = 20;
const MAX_VALUE_LENGTH = 50;

function sanitizeFilterValue(value: string): string {
  return value
    .trim()
    .slice(0, MAX_VALUE_LENGTH)
    .replace(/[<>'"]/g, '');
}

function sanitizeFilterArray(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map(sanitizeFilterValue)
    .filter(Boolean)
    .slice(0, MAX_FILTER_VALUES);
}

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
  
  try {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get(PARAM_Q);
    
    return {
      searchQuery: searchQuery ? sanitizeSearchQuery(searchQuery) : '',
      selectedStacks: sanitizeFilterArray(params.get(PARAM_STACK)),
      selectedDomains: sanitizeFilterArray(params.get(PARAM_DOMAIN)),
      selectedTags: sanitizeFilterArray(params.get(PARAM_TAGS)),
    };
  } catch (error) {
    console.warn('Failed to parse URL query params:', error);
    return {
      searchQuery: '',
      selectedStacks: [],
      selectedDomains: [],
      selectedTags: [],
    };
  }
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
