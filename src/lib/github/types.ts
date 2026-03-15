import { z } from 'zod';

export const GitHubRepoResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: z.url(),
  homepage: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  watchers_count: z.number(),
  language: z.string().nullable(),
  topics: z.array(z.string()).default([]),
  updated_at: z.string(),
  pushed_at: z.string(),
  created_at: z.string(),
  size: z.number(),
  open_issues_count: z.number(),
  license: z
    .object({
      key: z.string(),
      name: z.string(),
      spdx_id: z.string(),
    })
    .nullable(),
  archived: z.boolean(),
  disabled: z.boolean(),
  visibility: z.enum(['public', 'private', 'internal']).optional(),
});

export type GitHubRepoResponse = z.infer<typeof GitHubRepoResponseSchema>;

export interface RepoStats {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  pushedAt: string;
  createdAt: string;
  license: { name: string; spdxId: string } | null;
  isArchived: boolean;
  openIssuesCount: number;
}

export interface RepoCardStats {
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
}

export type GitHubError =
  | { type: 'rate_limit'; resetAt: number; remaining: number }
  | { type: 'not_found'; resource: string; url: string }
  | { type: 'forbidden'; message: string }
  | { type: 'network'; message: string; cause?: unknown }
  | { type: 'validation'; errors: string[]; response: unknown }
  | { type: 'unknown'; message: string; cause?: unknown };

export type GitHubResult<T> =
  | { success: true; data: T; cached: boolean; fetchedAt: string }
  | { success: false; error: GitHubError; fallbackData?: T };

export interface CacheEntry<T> {
  data: T;
  fetchedAt: string;
  expiresAt: string;
  etag?: string;
  lastModified?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface GitHubRequestOptions {
  useAuth?: boolean;
  bypassCache?: boolean;
  timeout?: number;
  retries?: number;
}

export const GitHubUrlSchema = z
  .url()
  .refine((url) => url.startsWith('https://github.com/'), {
    message: 'Must be a GitHub URL',
  })
  .refine(
    (url) => {
      const parts = new URL(url).pathname.split('/').filter(Boolean);
      return parts.length >= 2;
    },
    { message: 'Must include owner and repository' }
  );

export type GitHubUrl = string & { readonly __brand: 'GitHubUrl' };

/**
 * Returns true if the string is a valid GitHub repository URL (https://github.com/owner/repo).
 */
export function isGitHubUrl(url: string): boolean {
  return GitHubUrlSchema.safeParse(url).success;
}

/**
 * Type guard: narrows GitHubError to the rate_limit variant.
 */
export function isRateLimitError(
  error: GitHubError
): error is Extract<GitHubError, { type: 'rate_limit' }> {
  return error.type === 'rate_limit';
}

/**
 * Type guard: narrows GitHubError to the not_found variant.
 */
export function isNotFoundError(
  error: GitHubError
): error is Extract<GitHubError, { type: 'not_found' }> {
  return error.type === 'not_found';
}

/**
 * Type guard: narrows GitHubError to the network variant.
 */
export function isNetworkError(
  error: GitHubError
): error is Extract<GitHubError, { type: 'network' }> {
  return error.type === 'network';
}

/**
 * Type guard: narrows GitHubResult<T> to the success variant (so you can use result.data).
 */
export function isSuccess<T>(
  result: GitHubResult<T>
): result is Extract<GitHubResult<T>, { success: true }> {
  return result.success === true;
}
