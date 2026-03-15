import type { FilterCriteria } from '../../types/filters';

const STORAGE_KEY = 'projects-filter-state';
const STORAGE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface PersistedState extends FilterCriteria {
  timestamp: number;
}

/**
 * Loads filter state from sessionStorage. Returns null if not found, expired (older than 30 min),
 * or in a non-browser environment. Used to restore filters when the user returns to the page with no URL params.
 */
export function loadPersistedFilterState(): FilterCriteria | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: PersistedState = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > STORAGE_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      searchQuery: parsed.searchQuery ?? '',
      selectedStacks: parsed.selectedStacks ?? [],
      selectedDomains: parsed.selectedDomains ?? [],
      selectedTags: parsed.selectedTags ?? [],
    };
  } catch {
    return null;
  }
}

/**
 * Saves filter state to sessionStorage with a timestamp. Used so filters can be restored
 * on next visit when URL has no params. Safe to call in SSR (no-op when sessionStorage is missing).
 */
export function savePersistedFilterState(state: FilterCriteria): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, timestamp: Date.now() } as PersistedState)
    );
  } catch {
    // ignore
  }
}
