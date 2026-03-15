import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectsPageEvent } from '../../types/analytics';
import { trackEvent } from './track';

declare global {
  interface Window {
    dataLayer?: ProjectsPageEvent[];
  }
}

describe('trackEvent', () => {
  beforeEach(() => {
    // Minimal window mock for node test environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = (globalThis as any).window ?? {};
    // @ts-expect-error - deleting possibly undefined property for test isolation
    delete window.dataLayer;
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('initializes dataLayer when not present', () => {
    trackEvent('page_view', {
      page_name: 'test',
      page_category: 'test',
    });

    expect(window.dataLayer).toBeDefined();
    expect(window.dataLayer).toHaveLength(1);
  });

  it('pushes correctly shaped event', () => {
    trackEvent('search_used', {
      search_term: 'react',
      search_context: 'projects',
      results_count: 5,
    });

    expect(window.dataLayer?.[0]).toEqual({
      event: 'search_used',
      search_term: 'react',
      search_context: 'projects',
      results_count: 5,
    });
  });

  it('handles multiple events', () => {
    trackEvent('page_view', { page_name: 'a', page_category: 'a' });
    trackEvent('page_view', { page_name: 'b', page_category: 'b' });

    expect(window.dataLayer).toHaveLength(2);
  });
});

