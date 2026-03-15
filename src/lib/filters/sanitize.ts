const MAX_SEARCH_LENGTH = 200;

/**
 * Sanitizes user search input: trims whitespace, limits length to 200 characters,
 * and collapses multiple spaces into one. Use before passing the query to filter or analytics.
 */
export function sanitizeSearchQuery(input: string): string {
  return input
    .trim()
    .slice(0, MAX_SEARCH_LENGTH)
    .replace(/\s+/g, ' ');
}
