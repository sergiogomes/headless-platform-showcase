import { describe, it, expect, beforeEach, vi } from 'vitest';

import { fetchRepoCardStats } from '../queries';
import { clearGitHubCache } from '../cache';

const mockApiResponse = {
  id: 123,
  name: 'example-repo',
  full_name: 'owner/example-repo',
  description: 'Example repository',
  html_url: 'https://github.com/owner/example-repo',
  homepage: null,
  stargazers_count: 42,
  forks_count: 7,
  watchers_count: 10,
  language: 'TypeScript',
  topics: ['astro'],
  updated_at: '2026-03-14T12:00:00Z',
  pushed_at: '2026-03-14T12:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  size: 100,
  open_issues_count: 0,
  license: {
    key: 'mit',
    name: 'MIT License',
    spdx_id: 'MIT',
  },
  archived: false,
  disabled: false,
};

describe('GitHub data flow integration', () => {
  beforeEach(() => {
    clearGitHubCache();
    vi.restoreAllMocks();
  });

  it('flows data from GitHub API through normalization and caching to card stats', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockApiResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '59',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
          },
        }),
      );

    const url = 'https://github.com/owner/example-repo';

    const first = await fetchRepoCardStats(url);
    expect(first.success).toBe(true);
    if (first.success) {
      expect(first.cached).toBe(false);
      expect(first.data).toEqual({
        stars: mockApiResponse.stargazers_count,
        forks: mockApiResponse.forks_count,
        language: mockApiResponse.language,
        updatedAt: mockApiResponse.updated_at,
      });
    }

    const second = await fetchRepoCardStats(url);
    expect(second.success).toBe(true);
    if (second.success) {
      expect(second.cached).toBe(true);
      expect(second.data).toEqual(first.success ? first.data : second.data);
    }

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

