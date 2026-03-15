import { getGitHubClient } from './client';
import { normalizeRepo, parseGitHubUrl, extractCardStats, isValidGitHubUrl } from './normalize';
import { extractGitHubError, logGitHubError } from './errors';
import { getCachedRepo, setCachedRepo, getCachedCardStats, setCachedCardStats } from './cache';
import type { RepoStats, RepoCardStats, GitHubResult, GitHubRequestOptions } from './types';

/**
 * Fetches full repository stats from the GitHub API (or cache). Returns success with data,
 * or failure with error and optional fallbackData from cache on API failure.
 */
export async function fetchRepoStats(
  githubUrl: string,
  options: GitHubRequestOptions = {}
): Promise<GitHubResult<RepoStats>> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    return {
      success: false,
      error: { type: 'validation', errors: ['Invalid GitHub URL format'], response: githubUrl },
    };
  }
  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}`;

  if (!options.bypassCache) {
    const cached = getCachedRepo(cacheKey);
    if (cached) {
      return { success: true, data: cached, cached: true, fetchedAt: new Date().toISOString() };
    }
  }

  try {
    const client = getGitHubClient();
    const response = await client.request(`/repos/${owner}/${repo}`, options);
    const data = await response.json();
    const normalized = normalizeRepo(data);
    setCachedRepo(cacheKey, normalized, client.getETag(response) ?? undefined, client.getLastModified(response) ?? undefined);
    return { success: true, data: normalized, cached: false, fetchedAt: new Date().toISOString() };
  } catch (error) {
    const githubError = extractGitHubError(error);
    logGitHubError(githubError, `fetchRepoStats(${cacheKey})`);
    const cached = getCachedRepo(cacheKey, true);
    if (cached) {
      return { success: false, error: githubError, fallbackData: cached };
    }
    return { success: false, error: githubError };
  }
}

/**
 * Fetches lightweight card stats (stars, forks, language, updatedAt) for a repo.
 * Uses cache first; on miss fetches full repo then extracts card stats and caches them.
 */
export async function fetchRepoCardStats(
  githubUrl: string,
  options: GitHubRequestOptions = {}
): Promise<GitHubResult<RepoCardStats>> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    return {
      success: false,
      error: { type: 'validation', errors: ['Invalid GitHub URL format'], response: githubUrl },
    };
  }
  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}:card`;

  if (!options.bypassCache) {
    const cached = getCachedCardStats(cacheKey);
    if (cached) {
      return { success: true, data: cached, cached: true, fetchedAt: new Date().toISOString() };
    }
  }

  const result = await fetchRepoStats(githubUrl, options);
  if (!result.success) {
    return result as GitHubResult<RepoCardStats>;
  }
  const cardStats = extractCardStats(result.data);
  setCachedCardStats(cacheKey, cardStats);
  return {
    success: true,
    data: cardStats,
    cached: false,
    fetchedAt: result.fetchedAt,
  };
}

/**
 * Fetches card stats for multiple repo URLs. When near rate limit, fetches sequentially
 * without bypassing cache; otherwise fetches in batches of 5 with a 100ms delay between batches.
 * Returns a Map from URL to GitHubResult<RepoCardStats>.
 */
export async function fetchMultipleRepoStats(
  githubUrls: string[],
  options: GitHubRequestOptions = {}
): Promise<Map<string, GitHubResult<RepoCardStats>>> {
  const results = new Map<string, GitHubResult<RepoCardStats>>();
  const client = getGitHubClient();

  if (client.isNearRateLimit(githubUrls.length)) {
    for (const url of githubUrls) {
      const result = await fetchRepoCardStats(url, { ...options, bypassCache: false });
      results.set(url, result);
    }
    return results;
  }

  const CONCURRENCY_LIMIT = 5;
  for (let i = 0; i < githubUrls.length; i += CONCURRENCY_LIMIT) {
    const batch = githubUrls.slice(i, i + CONCURRENCY_LIMIT);
    const batchResults = await Promise.allSettled(batch.map((url) => fetchRepoCardStats(url, options)));
    batchResults.forEach((result, index) => {
      const url = batch[index];
      if (result.status === 'fulfilled') {
        results.set(url, result.value);
      } else {
        results.set(url, {
          success: false,
          error: {
            type: 'unknown',
            message: result.reason?.message ?? 'Fetch failed',
            cause: result.reason,
          },
        });
      }
    });
    if (i + CONCURRENCY_LIMIT < githubUrls.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return results;
}

/**
 * Collects all valid GitHub URLs from an array of objects with an optional githubUrl property.
 */
export function extractGitHubUrls(projects: Array<{ githubUrl?: string }>): string[] {
  return projects
    .map((p) => p.githubUrl)
    .filter((url): url is string => typeof url === 'string' && url.length > 0)
    .filter(isValidGitHubUrl);
}

/**
 * For each project that has a githubUrl, fetches repo card stats (via fetchMultipleRepoStats)
 * and attaches them as repoStats. Projects without githubUrl or with failed fetches are returned unchanged.
 */
export async function enrichProjectsWithGitHub<T extends { githubUrl?: string; slug: string }>(
  projects: T[]
): Promise<Array<T & { repoStats?: RepoCardStats }>> {
  const githubUrls = extractGitHubUrls(projects);
  if (githubUrls.length === 0) return projects;

  const statsMap = await fetchMultipleRepoStats(githubUrls);

  return projects.map((project) => {
    if (!project.githubUrl) return project;
    const result = statsMap.get(project.githubUrl);
    if (result?.success) {
      return { ...project, repoStats: result.data };
    }
    return project;
  });
}
