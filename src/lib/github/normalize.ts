import { GitHubRepoResponseSchema } from './types';
import type { RepoStats, RepoCardStats } from './types';
import { createGitHubError } from './errors';

/**
 * Validates raw API response with Zod and maps it to our internal RepoStats shape
 * (camelCase, stable field names). Throws a validation GitHubError if parsing fails.
 */
export function normalizeRepo(raw: unknown): RepoStats {
  try {
    const validated = GitHubRepoResponseSchema.parse(raw);
    return {
      id: validated.id,
      name: validated.name,
      fullName: validated.full_name,
      description: validated.description,
      url: validated.html_url,
      homepage: validated.homepage,
      stars: validated.stargazers_count,
      forks: validated.forks_count,
      watchers: validated.watchers_count,
      language: validated.language,
      topics: validated.topics,
      updatedAt: validated.updated_at,
      pushedAt: validated.pushed_at,
      createdAt: validated.created_at,
      license: validated.license
        ? { name: validated.license.name, spdxId: validated.license.spdx_id }
        : null,
      isArchived: validated.archived,
      openIssuesCount: validated.open_issues_count,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const err = error as { errors?: Array<{ message: string }> };
      throw createGitHubError('validation', {
        errors: err.errors?.map((e) => e.message) ?? ['Invalid response'],
        response: raw,
      });
    }
    throw error;
  }
}

/**
 * Picks only the fields needed for project cards: stars, forks, language, updatedAt.
 */
export function extractCardStats(repo: RepoStats): RepoCardStats {
  return {
    stars: repo.stars,
    forks: repo.forks,
    language: repo.language,
    updatedAt: repo.updatedAt,
  };
}

/**
 * Normalizes an array of raw API responses. Invalid items are skipped and warned;
 * returns only successfully normalized RepoStats.
 */
export function normalizeRepos(raw: unknown[]): RepoStats[] {
  const normalized: RepoStats[] = [];
  for (let i = 0; i < raw.length; i++) {
    try {
      normalized.push(normalizeRepo(raw[i]));
    } catch (error) {
      console.warn(`Failed to normalize repo at index ${i}:`, error);
    }
  }
  return normalized;
}

/**
 * Parses a GitHub repo URL into { owner, repo }. Returns null if the URL is not
 * a valid github.com URL or does not have at least owner/repo in the path. Strips .git suffix.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('github')) return null;
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) return null;
    return {
      owner: pathParts[0],
      repo: pathParts[1].replace(/\.git$/, ''),
    };
  } catch {
    return null;
  }
}

/**
 * Returns true if the string is a valid GitHub repo URL (parseGitHubUrl would return non-null).
 */
export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}
