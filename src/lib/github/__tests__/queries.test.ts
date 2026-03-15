import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  fetchRepoStats,
  fetchRepoCardStats,
  fetchMultipleRepoStats,
  extractGitHubUrls,
  enrichProjectsWithGitHub,
} from '../queries';

import type { GitHubResult, RepoCardStats, RepoStats } from '../types';

vi.mock('../client', () => {
  const request = vi.fn();
  const isNearRateLimit = vi.fn(() => false);
  const getETag = vi.fn(() => null);
  const getLastModified = vi.fn(() => null);
  return {
    getGitHubClient: () => ({
      request,
      isNearRateLimit,
      getETag,
      getLastModified,
    }),
  };
});

vi.mock('../cache', () => {
  const repoStore = new Map<string, RepoStats>();
  const cardStore = new Map<string, RepoCardStats>();
  return {
    getCachedRepo: vi.fn((key: string) => repoStore.get(key) ?? null),
    setCachedRepo: vi.fn((key: string, data: RepoStats) => {
      repoStore.set(key, data);
    }),
    getCachedCardStats: vi.fn((key: string) => cardStore.get(key) ?? null),
    setCachedCardStats: vi.fn((key: string, data: RepoCardStats) => {
      cardStore.set(key, data);
    }),
  };
});

vi.mock('../errors', async (original) => {
  const actual = await original();
  return {
    ...actual,
    extractGitHubError: vi.fn((error: unknown) => {
      if (typeof error === 'object' && error && 'type' in (error as any)) {
        return error as any;
      }
      return { type: 'unknown', message: 'mock-error', cause: error };
    }),
  };
});

const mockRepo: RepoStats = {
  id: 1,
  name: 'repo',
  fullName: 'owner/repo',
  description: 'Test repo',
  url: 'https://github.com/owner/repo',
  homepage: null,
  stars: 10,
  forks: 2,
  watchers: 5,
  language: 'TypeScript',
  topics: [],
  updatedAt: '2026-03-14T12:00:00Z',
  pushedAt: '2026-03-14T12:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
  license: null,
  isArchived: false,
  openIssuesCount: 0,
};

describe('GitHub queries unit tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('extractGitHubUrls', () => {
    it('collects only valid GitHub URLs', () => {
      const urls = extractGitHubUrls([
        { githubUrl: 'https://github.com/owner/repo' },
        { githubUrl: '' },
        { githubUrl: 'https://gitlab.com/owner/repo' },
        {},
      ]);

      expect(urls).toEqual(['https://github.com/owner/repo']);
    });
  });

  describe('fetchRepoStats', () => {
    it('returns validation error for invalid URL', async () => {
      const result = await fetchRepoStats('not-a-url');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('validation');
      }
    });

    it('returns cached result when present', async () => {
      const { getCachedRepo } = await import('../cache');
      (getCachedRepo as unknown as vi.Mock).mockReturnValueOnce(mockRepo);

      const result = await fetchRepoStats('https://github.com/owner/repo');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.cached).toBe(true);
        expect(result.data).toEqual(mockRepo);
      }
    });
  });

  describe('fetchRepoCardStats', () => {
    it('returns validation error for invalid URL', async () => {
      const result = await fetchRepoCardStats('https://example.com/not-github');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('validation');
      }
    });

    it('returns cached card stats when present', async () => {
      const cardStats: RepoCardStats = {
        stars: 10,
        forks: 2,
        language: 'TypeScript',
        updatedAt: '2026-03-14T12:00:00Z',
      };
      const { getCachedCardStats } = await import('../cache');
      (getCachedCardStats as unknown as vi.Mock).mockReturnValueOnce(cardStats);

      const result = await fetchRepoCardStats('https://github.com/owner/repo');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.cached).toBe(true);
        expect(result.data).toEqual(cardStats);
      }
    });
  });

  describe('fetchMultipleRepoStats', () => {
    it('fetches stats for multiple URLs and maps them by URL', async () => {
      const urls = [
        'https://github.com/owner/repo1',
        'https://github.com/owner/repo2',
      ];

      const mockResults: Record<string, GitHubResult<RepoCardStats>> = {
        [urls[0]]: {
          success: true,
          cached: false,
          fetchedAt: '2026-03-14T12:00:00Z',
          data: { stars: 1, forks: 0, language: 'TS', updatedAt: '2026-03-14T12:00:00Z' },
        },
        [urls[1]]: {
          success: true,
          cached: false,
          fetchedAt: '2026-03-14T12:00:00Z',
          data: { stars: 2, forks: 1, language: 'TS', updatedAt: '2026-03-14T12:00:00Z' },
        },
      };

      const spy = vi.spyOn(await import('../queries'), 'fetchRepoCardStats');
      spy.mockImplementation(async (githubUrl: string) => mockResults[githubUrl] as any);

      const map = await fetchMultipleRepoStats(urls);

      expect(map.size).toBe(2);
      expect(map.get(urls[0])).toEqual(mockResults[urls[0]]);
      expect(map.get(urls[1])).toEqual(mockResults[urls[1]]);
    });
  });

  describe('enrichProjectsWithGitHub', () => {
    it('returns original projects when there are no GitHub URLs', async () => {
      const projects = [{ slug: 'a' }, { slug: 'b' }];
      const result = await enrichProjectsWithGitHub(projects);
      expect(result).toEqual(projects);
    });

    it('attaches repoStats to projects with GitHub URLs', async () => {
      const projects = [
        { slug: 'a', githubUrl: 'https://github.com/owner/repo1' },
        { slug: 'b', githubUrl: 'https://github.com/owner/repo2' },
        { slug: 'c' },
      ];

      const mockStats: RepoCardStats = {
        stars: 5,
        forks: 1,
        language: 'TypeScript',
        updatedAt: '2026-03-14T12:00:00Z',
      };

      const urls = projects
        .map((p) => p.githubUrl)
        .filter((url): url is string => !!url);

      const statsMap = new Map<string, GitHubResult<RepoCardStats>>();
      urls.forEach((url) => {
        statsMap.set(url, {
          success: true,
          cached: false,
          fetchedAt: '2026-03-14T12:00:00Z',
          data: mockStats,
        });
      });

      const originalFetchMultiple = await import('../queries');
      vi.spyOn(originalFetchMultiple, 'fetchMultipleRepoStats').mockResolvedValue(statsMap);

      const result = await enrichProjectsWithGitHub(projects);

      const enrichedWithStats = result.filter((p) => 'repoStats' in p) as Array<
        { repoStats: RepoCardStats }
      >;

      expect(enrichedWithStats).toHaveLength(2);
      enrichedWithStats.forEach((p) => {
        expect(p.repoStats).toEqual(mockStats);
      });

      const withoutGitHub = result.find((p) => (p as any).slug === 'c') as any;
      expect(withoutGitHub.repoStats).toBeUndefined();
    });
  });
});

