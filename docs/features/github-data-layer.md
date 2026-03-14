# GitHub Data Layer Architecture

**Feature**: GitHub API Integration for Projects Page  
**Status**: Architecture Design  
**Last Updated**: 2026-03-14

---

## Overview

The GitHub data layer provides a robust, type-safe integration with the GitHub API to enrich project cards with live repository statistics. This layer is designed as a **data service** that fetches, normalizes, caches, and exposes GitHub repository data to the frontend.

### Key Objectives

1. **Reliability**: Graceful degradation when API is unavailable or rate-limited
2. **Performance**: Aggressive caching to minimize API calls and respect rate limits
3. **Type Safety**: Runtime validation with Zod and strong TypeScript typing
4. **Maintainability**: Clean separation between API layer and UI layer
5. **Scalability**: Support for both build-time and runtime data fetching

### Design Principles

- **Never expose raw GitHub API responses to UI components**
- **Always normalize API responses to internal models**
- **Cache aggressively to respect rate limits**
- **Fail gracefully with fallback data**
- **Validate all external data at runtime**

---

## Architecture Overview

### Visual Architecture Diagram

```mermaid
graph TD
    A[Astro Page] -->|getCollection| B[Project Content]
    B -->|extractGitHubUrls| C[enrichProjectsWithGitHub]
    C --> D[fetchMultipleRepoStats]
    D --> E{Cache Hit?}
    E -->|Yes| F[Return Cached Data]
    E -->|No| G[GitHub API Client]
    G -->|request| H[GitHub REST API]
    H -->|response| I[Normalize Response]
    I -->|validate with Zod| J[RepoStats]
    J --> K[Update Cache]
    K --> F
    F --> L[Render ProjectCard]
    L --> M[Display RepoStats]
    
    N[Error Handler] -.->|on error| G
    N -->|fallback| O[Cached/Static Data]
    O --> L
    
    P[Rate Limit Monitor] -.->|check| G
    P -->|throttle| Q[Adaptive Backoff]
    Q --> G
    
    style H fill:#24292e,stroke:#58a6ff,color:#fff
    style J fill:#238636,stroke:#2ea043,color:#fff
    style K fill:#9e6a03,stroke:#d29922,color:#fff
    style N fill:#da3633,stroke:#f85149,color:#fff
```

### Directory Structure

```txt
src/lib/github/
├── client.ts           # GitHub API client with request handling
├── queries.ts          # Query functions for fetching repositories
├── normalize.ts        # Transform GitHub responses to internal models
├── types.ts            # TypeScript types and Zod schemas
├── cache.ts            # Caching layer with TTL and invalidation
├── errors.ts           # Error types and handling utilities
├── logger.ts           # Structured logging with context
├── rateLimit.ts        # Rate limit monitoring and backoff
├── lazyLoad.ts         # Intersection observer for lazy loading
└── __tests__/
    ├── client.test.ts
    ├── queries.test.ts
    ├── normalize.test.ts
    ├── performance.test.ts
    └── fixtures/
        ├── repo-response.json
        ├── rate-limit-response.json
        └── error-responses.json
```

### Data Flow

```txt
Build Time (SSG):
  Project Content → Extract GitHub URLs → Warm Cache → Fetch Repo Stats → Normalize → Cache → Embed in HTML

Runtime (Optional with Intersection Observer):
  Card Enters Viewport → Check Cache → Fetch from API Endpoint → Normalize → Update Cache → Update UI

Error Flow:
  API Error → Log Error → Return Cached Data → Fallback to Static Data → Graceful Degradation
```

---

## Type System

### Core Types

```typescript
// src/lib/github/types.ts
import { z } from 'zod';

/**
 * Raw GitHub API response schema
 * Based on GitHub REST API v3 repository object
 */
export const GitHubRepoResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: z.string().url(),
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
  license: z.object({
    key: z.string(),
    name: z.string(),
    spdx_id: z.string(),
  }).nullable(),
  archived: z.boolean(),
  disabled: z.boolean(),
  visibility: z.enum(['public', 'private', 'internal']).optional(),
});

export type GitHubRepoResponse = z.infer<typeof GitHubRepoResponseSchema>;

/**
 * Normalized repository data for UI consumption
 * Simplified, stable interface independent of GitHub API changes
 */
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
  updatedAt: string; // ISO 8601
  pushedAt: string; // ISO 8601
  createdAt: string; // ISO 8601
  license: {
    name: string;
    spdxId: string;
  } | null;
  isArchived: boolean;
  openIssuesCount: number;
}

/**
 * Lightweight stats for project cards
 * Minimal data needed for grid display
 */
export interface RepoCardStats {
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
}

/**
 * GitHub API error types
 */
export type GitHubError =
  | { type: 'rate_limit'; resetAt: number; remaining: number }
  | { type: 'not_found'; resource: string; url: string }
  | { type: 'forbidden'; message: string }
  | { type: 'network'; message: string; cause?: unknown }
  | { type: 'validation'; errors: string[]; response: unknown }
  | { type: 'unknown'; message: string; cause?: unknown };

/**
 * Result type for GitHub API operations
 */
export type GitHubResult<T> =
  | { success: true; data: T; cached: boolean; fetchedAt: string }
  | { success: false; error: GitHubError; fallbackData?: T };

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T;
  fetchedAt: string;
  expiresAt: string;
  etag?: string;
  lastModified?: string;
}

/**
 * GitHub API rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

/**
 * GitHub API request options
 */
export interface GitHubRequestOptions {
  useAuth?: boolean;
  bypassCache?: boolean;
  timeout?: number;
  retries?: number;
}
```

### Type Guards

```typescript
// src/lib/github/types.ts (continued)

export function isRateLimitError(error: GitHubError): error is Extract<GitHubError, { type: 'rate_limit' }> {
  return error.type === 'rate_limit';
}

export function isNotFoundError(error: GitHubError): error is Extract<GitHubError, { type: 'not_found' }> {
  return error.type === 'not_found';
}

export function isNetworkError(error: GitHubError): error is Extract<GitHubError, { type: 'network' }> {
  return error.type === 'network';
}

/**
 * Type guard for successful results
 */
export function isSuccess<T>(result: GitHubResult<T>): result is Extract<GitHubResult<T>, { success: true }> {
  return result.success === true;
}
```

### Branded Types

```typescript
// src/lib/github/types.ts (continued)

/**
 * Branded types for better type safety
 * Prevents mixing up regular strings with validated GitHub URLs
 */
export type GitHubUrl = string & { readonly __brand: 'GitHubUrl' };
export type GitHubRepoId = number & { readonly __brand: 'GitHubRepoId' };

/**
 * Type guard with validation for GitHub URLs
 */
export function isGitHubUrl(url: string): url is GitHubUrl {
  return GitHubUrlSchema.safeParse(url).success;
}

/**
 * Create branded GitHub URL from validated string
 */
export function createGitHubUrl(url: string): GitHubUrl {
  const result = GitHubUrlSchema.safeParse(url);
  if (!result.success) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }
  return url as GitHubUrl;
}

/**
 * Create branded repo ID
 */
export function createRepoId(id: number): GitHubRepoId {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid repo ID: ${id}`);
  }
  return id as GitHubRepoId;
}

/**
 * Zod schema for GitHub URLs
 */
export const GitHubUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => url.startsWith('https://github.com/'),
    { message: 'Must be a GitHub URL' }
  )
  .refine(
    (url) => {
      const parts = new URL(url).pathname.split('/').filter(Boolean);
      return parts.length >= 2;
    },
    { message: 'Must include owner and repository' }
  );
```

---

## GitHub API Client

### Client Implementation

```typescript
// src/lib/github/client.ts
import type { GitHubRequestOptions, RateLimitInfo } from './types';
import { createGitHubError } from './errors';

const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;

/**
 * GitHub API client with rate limit handling and retry logic
 */
export class GitHubClient {
  private baseUrl: string;
  private token?: string;
  private rateLimitInfo?: RateLimitInfo;

  constructor(token?: string) {
    this.baseUrl = GITHUB_API_BASE;
    this.token = token || import.meta.env.GITHUB_TOKEN;
  }

  /**
   * Make authenticated request to GitHub API
   */
  async request<T>(
    endpoint: string,
    options: GitHubRequestOptions = {}
  ): Promise<Response> {
    const {
      useAuth = true,
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.buildHeaders(useAuth);

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Update rate limit info from headers
        this.updateRateLimitInfo(response);

        // Handle rate limiting
        if (response.status === 429) {
          const resetAt = this.rateLimitInfo?.reset || Date.now() + 60000;
          throw createGitHubError('rate_limit', {
            resetAt,
            remaining: 0,
          });
        }

        // Handle other errors
        if (!response.ok) {
          throw await this.handleErrorResponse(response, endpoint);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Don't retry rate limit errors
        if (error instanceof Error && error.message.includes('rate_limit')) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        if (attempt < retries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Build request headers with optional authentication
   */
  private buildHeaders(useAuth: boolean): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'headless-platform-showcase',
    };

    if (useAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Update rate limit info from response headers
   */
  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const used = response.headers.get('X-RateLimit-Used');

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10) * 1000, // Convert to milliseconds
        used: used ? parseInt(used, 10) : 0,
      };
    }
  }

  /**
   * Handle error responses from GitHub API
   */
  private async handleErrorResponse(response: Response, endpoint: string): Promise<Error> {
    const contentType = response.headers.get('content-type');
    let errorData: any = null;

    if (contentType?.includes('application/json')) {
      try {
        errorData = await response.json();
      } catch {
        // Ignore JSON parse errors
      }
    }

    switch (response.status) {
      case 404:
        return createGitHubError('not_found', {
          resource: endpoint,
          url: `${this.baseUrl}${endpoint}`,
        });

      case 403:
        return createGitHubError('forbidden', {
          message: errorData?.message || 'Access forbidden',
        });

      case 422:
        return createGitHubError('validation', {
          errors: errorData?.errors || ['Validation failed'],
          response: errorData,
        });

      default:
        return createGitHubError('unknown', {
          message: errorData?.message || `HTTP ${response.status}`,
          cause: errorData,
        });
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo || null;
  }

  /**
   * Check if we're close to rate limit
   */
  isNearRateLimit(threshold: number = 10): boolean {
    if (!this.rateLimitInfo) return false;
    return this.rateLimitInfo.remaining <= threshold;
  }

  /**
   * Get time until rate limit reset
   */
  getTimeUntilReset(): number {
    if (!this.rateLimitInfo) return 0;
    return Math.max(0, this.rateLimitInfo.reset - Date.now());
  }
}

/**
 * Singleton instance for the application
 */
let clientInstance: GitHubClient | null = null;

export function getGitHubClient(): GitHubClient {
  if (!clientInstance) {
    clientInstance = new GitHubClient();
  }
  return clientInstance;
}
```

### Conditional Requests with ETags

```typescript
// src/lib/github/client.ts (continued)

export class GitHubClient {
  // ... previous methods ...

  /**
   * Make conditional request using ETag
   * Returns 304 if content hasn't changed
   */
  async conditionalRequest(
    endpoint: string,
    etag?: string,
    lastModified?: string,
    options: GitHubRequestOptions = {}
  ): Promise<Response> {
    const headers = this.buildHeaders(options.useAuth ?? true);

    if (etag) {
      headers['If-None-Match'] = etag;
    }

    if (lastModified) {
      headers['If-Modified-Since'] = lastModified;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, { headers });

    this.updateRateLimitInfo(response);

    return response;
  }

  /**
   * Extract ETag from response
   */
  getETag(response: Response): string | null {
    return response.headers.get('ETag');
  }

  /**
   * Extract Last-Modified from response
   */
  getLastModified(response: Response): string | null {
    return response.headers.get('Last-Modified');
  }
}
```

---

## Error Handling

### Error Factory

```typescript
// src/lib/github/errors.ts
import type { GitHubError } from './types';

export function createGitHubError(
  type: GitHubError['type'],
  details: Omit<Extract<GitHubError, { type: typeof type }>, 'type'>
): Error {
  const error = new Error(`GitHub API Error: ${type}`);
  (error as any).githubError = { type, ...details };
  return error;
}

export function extractGitHubError(error: unknown): GitHubError {
  if (error instanceof Error && (error as any).githubError) {
    return (error as any).githubError;
  }

  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message,
      cause: error,
    };
  }

  return {
    type: 'unknown',
    message: 'An unknown error occurred',
    cause: error,
  };
}

export function isGitHubError(error: unknown): error is Error & { githubError: GitHubError } {
  return error instanceof Error && (error as any).githubError !== undefined;
}
```

### Error Recovery Strategies

```typescript
// src/lib/github/errors.ts (continued)

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: GitHubError): boolean {
  switch (error.type) {
    case 'network':
      return true;
    case 'rate_limit':
      return false; // Don't retry, use cache instead
    case 'not_found':
      return false; // Resource doesn't exist
    case 'forbidden':
      return false; // Auth issue
    case 'validation':
      return false; // Bad request
    case 'unknown':
      return true; // Might be transient
    default:
      return false;
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: GitHubError): string {
  switch (error.type) {
    case 'rate_limit':
      const minutes = Math.ceil((error.resetAt - Date.now()) / 60000);
      return `GitHub API rate limit reached. Resets in ${minutes} minutes.`;
    
    case 'not_found':
      return `Repository not found: ${error.resource}`;
    
    case 'forbidden':
      return `Access denied: ${error.message}`;
    
    case 'network':
      return `Network error: ${error.message}`;
    
    case 'validation':
      return `Validation error: ${error.errors.join(', ')}`;
    
    case 'unknown':
      return `Unexpected error: ${error.message}`;
  }
}

/**
 * Log error with appropriate level
 */
export function logGitHubError(error: GitHubError, context: string): void {
  const isDev = import.meta.env.DEV;
  
  if (!isDev && error.type === 'rate_limit') {
    // Rate limits are expected in production, log as warning
    console.warn(`[GitHub API] ${context}:`, getErrorMessage(error));
    return;
  }

  if (error.type === 'not_found') {
    // 404s might be expected (deleted repos), log as info
    console.info(`[GitHub API] ${context}:`, getErrorMessage(error));
    return;
  }

  // All other errors are unexpected
  console.error(`[GitHub API] ${context}:`, error);
}
```

---

## Normalization Layer

### Normalization Functions

```typescript
// src/lib/github/normalize.ts
import { GitHubRepoResponseSchema, type RepoStats, type RepoCardStats } from './types';
import { createGitHubError } from './errors';

/**
 * Normalize GitHub repository response to internal model
 * Validates response and transforms to stable interface
 */
export function normalizeRepo(raw: unknown): RepoStats {
  try {
    // Runtime validation with Zod
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
      license: validated.license ? {
        name: validated.license.name,
        spdxId: validated.license.spdx_id,
      } : null,
      isArchived: validated.archived,
      openIssuesCount: validated.open_issues_count,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw createGitHubError('validation', {
        errors: [(error as any).errors?.map((e: any) => e.message).join(', ') || 'Invalid response'],
        response: raw,
      });
    }
    throw error;
  }
}

/**
 * Extract lightweight stats for project cards
 * Reduces data footprint for grid display
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
 * Normalize multiple repositories
 */
export function normalizeRepos(raw: unknown[]): RepoStats[] {
  const normalized: RepoStats[] = [];
  const errors: Array<{ index: number; error: unknown }> = [];

  raw.forEach((item, index) => {
    try {
      normalized.push(normalizeRepo(item));
    } catch (error) {
      errors.push({ index, error });
      console.warn(`Failed to normalize repo at index ${index}:`, error);
    }
  });

  // Log errors in development
  if (import.meta.env.DEV && errors.length > 0) {
    console.warn(`Failed to normalize ${errors.length} of ${raw.length} repositories`);
  }

  return normalized;
}

/**
 * Parse GitHub URL to extract owner and repo name
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url);
    
    // Support both github.com and raw githubusercontent URLs
    if (!urlObj.hostname.includes('github')) {
      return null;
    }

    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      return null;
    }

    return {
      owner: pathParts[0],
      repo: pathParts[1].replace(/\.git$/, ''), // Remove .git suffix if present
    };
  } catch {
    return null;
  }
}

/**
 * Validate GitHub URL format
 */
export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}
```

### Normalization Tests

```typescript
// src/lib/github/__tests__/normalize.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeRepo, parseGitHubUrl, extractCardStats } from '../normalize';
import repoFixture from './fixtures/repo-response.json';

describe('normalizeRepo', () => {
  it('transforms GitHub response to internal model', () => {
    const normalized = normalizeRepo(repoFixture);

    expect(normalized).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      fullName: expect.any(String),
      stars: expect.any(Number),
      forks: expect.any(Number),
    });
  });

  it('handles null description', () => {
    const fixture = { ...repoFixture, description: null };
    const normalized = normalizeRepo(fixture);
    expect(normalized.description).toBeNull();
  });

  it('handles missing topics', () => {
    const fixture = { ...repoFixture, topics: undefined };
    const normalized = normalizeRepo(fixture);
    expect(normalized.topics).toEqual([]);
  });

  it('throws validation error for invalid data', () => {
    expect(() => normalizeRepo({ invalid: 'data' })).toThrow();
  });
});

describe('parseGitHubUrl', () => {
  it('parses standard GitHub URLs', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('handles .git suffix', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('handles trailing slashes', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo/');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('returns null for invalid URLs', () => {
    expect(parseGitHubUrl('not-a-url')).toBeNull();
    expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
    expect(parseGitHubUrl('https://github.com/owner')).toBeNull();
  });
});

describe('extractCardStats', () => {
  it('extracts minimal stats for cards', () => {
    const fullStats: RepoStats = {
      id: 123,
      name: 'repo',
      fullName: 'owner/repo',
      description: 'A repo',
      url: 'https://github.com/owner/repo',
      homepage: null,
      stars: 42,
      forks: 10,
      watchers: 30,
      language: 'TypeScript',
      topics: ['astro'],
      updatedAt: '2026-03-14T12:00:00Z',
      pushedAt: '2026-03-14T12:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      license: null,
      isArchived: false,
      openIssuesCount: 5,
    };

    const cardStats = extractCardStats(fullStats);

    expect(cardStats).toEqual({
      stars: 42,
      forks: 10,
      language: 'TypeScript',
      updatedAt: '2026-03-14T12:00:00Z',
    });
  });
});
```

---

## Query Layer

### Query Functions

```typescript
// src/lib/github/queries.ts
import { getGitHubClient } from './client';
import { normalizeRepo, parseGitHubUrl, extractCardStats } from './normalize';
import { extractGitHubError, logGitHubError } from './errors';
import { getCachedRepo, setCachedRepo, getCachedCardStats, setCachedCardStats } from './cache';
import type { RepoStats, RepoCardStats, GitHubResult, GitHubRequestOptions } from './types';

/**
 * Fetch repository statistics from GitHub API
 * Returns full repository data with caching
 */
export async function fetchRepoStats(
  githubUrl: string,
  options: GitHubRequestOptions = {}
): Promise<GitHubResult<RepoStats>> {
  const parsed = parseGitHubUrl(githubUrl);

  if (!parsed) {
    return {
      success: false,
      error: {
        type: 'validation',
        errors: ['Invalid GitHub URL format'],
        response: githubUrl,
      },
    };
  }

  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}`;

  // Check cache first (unless bypassed)
  if (!options.bypassCache) {
    const cached = getCachedRepo(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  // Fetch from GitHub API
  try {
    const client = getGitHubClient();
    const endpoint = `/repos/${owner}/${repo}`;
    
    const response = await client.request(endpoint, options);
    const data = await response.json();

    // Normalize and validate
    const normalized = normalizeRepo(data);

    // Cache the result
    const etag = client.getETag(response);
    const lastModified = client.getLastModified(response);
    setCachedRepo(cacheKey, normalized, etag || undefined, lastModified || undefined);

    return {
      success: true,
      data: normalized,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const githubError = extractGitHubError(error);
    logGitHubError(githubError, `fetchRepoStats(${cacheKey})`);

    // Try to return cached data as fallback
    const cached = getCachedRepo(cacheKey, true); // Allow stale
    if (cached) {
      return {
        success: false,
        error: githubError,
        fallbackData: cached,
      };
    }

    return {
      success: false,
      error: githubError,
    };
  }
}

/**
 * Fetch lightweight stats for project cards
 * Optimized for grid display with minimal data
 */
export async function fetchRepoCardStats(
  githubUrl: string,
  options: GitHubRequestOptions = {}
): Promise<GitHubResult<RepoCardStats>> {
  const parsed = parseGitHubUrl(githubUrl);

  if (!parsed) {
    return {
      success: false,
      error: {
        type: 'validation',
        errors: ['Invalid GitHub URL format'],
        response: githubUrl,
      },
    };
  }

  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}:card`;

  // Check cache first
  if (!options.bypassCache) {
    const cached = getCachedCardStats(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  // Fetch full stats and extract card data
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
 * Batch fetch repository stats for multiple URLs
 * Optimized to minimize API calls and respect rate limits
 */
export async function fetchMultipleRepoStats(
  githubUrls: string[],
  options: GitHubRequestOptions = {}
): Promise<Map<string, GitHubResult<RepoCardStats>>> {
  const results = new Map<string, GitHubResult<RepoCardStats>>();
  const client = getGitHubClient();

  // Check rate limit before batch operation
  if (client.isNearRateLimit(githubUrls.length)) {
    console.warn('[GitHub API] Near rate limit, using cached data only');
    
    // Return cached data for all URLs
    for (const url of githubUrls) {
      const result = await fetchRepoCardStats(url, { ...options, bypassCache: false });
      results.set(url, result);
    }
    
    return results;
  }

  // Fetch with concurrency limit to avoid overwhelming API
  const CONCURRENCY_LIMIT = 5;
  const batches: string[][] = [];
  
  for (let i = 0; i < githubUrls.length; i += CONCURRENCY_LIMIT) {
    batches.push(githubUrls.slice(i, i + CONCURRENCY_LIMIT));
  }

  for (const batch of batches) {
    const promises = batch.map(url => fetchRepoCardStats(url, options));
    const batchResults = await Promise.allSettled(promises);

    batchResults.forEach((result, index) => {
      const url = batch[index];
      
      if (result.status === 'fulfilled') {
        results.set(url, result.value);
      } else {
        // Promise rejected, create error result
        results.set(url, {
          success: false,
          error: {
            type: 'unknown',
            message: result.reason?.message || 'Fetch failed',
            cause: result.reason,
          },
        });
      }
    });

    // Small delay between batches to be respectful to API
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Fetch repository languages breakdown
 * Returns language percentages for visualization
 */
export async function fetchRepoLanguages(
  githubUrl: string,
  options: GitHubRequestOptions = {}
): Promise<GitHubResult<Record<string, number>>> {
  const parsed = parseGitHubUrl(githubUrl);

  if (!parsed) {
    return {
      success: false,
      error: {
        type: 'validation',
        errors: ['Invalid GitHub URL format'],
        response: githubUrl,
      },
    };
  }

  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}:languages`;

  // Check cache
  if (!options.bypassCache) {
    const cached = getCachedCardStats(cacheKey); // Reuse card stats cache
    if (cached) {
      return {
        success: true,
        data: cached as any,
        cached: true,
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  try {
    const client = getGitHubClient();
    const endpoint = `/repos/${owner}/${repo}/languages`;
    
    const response = await client.request(endpoint, options);
    const data = await response.json();

    // GitHub returns { "TypeScript": 12345, "JavaScript": 6789, ... }
    setCachedCardStats(cacheKey, data);

    return {
      success: true,
      data,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const githubError = extractGitHubError(error);
    logGitHubError(githubError, `fetchRepoLanguages(${cacheKey})`);

    return {
      success: false,
      error: githubError,
    };
  }
}
```

### Query Utilities

```typescript
// src/lib/github/queries.ts (continued)

/**
 * Extract GitHub URLs from project collection
 */
export function extractGitHubUrls(projects: Array<{ githubUrl?: string }>): string[] {
  return projects
    .map(p => p.githubUrl)
    .filter((url): url is string => typeof url === 'string' && url.length > 0)
    .filter(isValidGitHubUrl);
}

/**
 * Enrich projects with GitHub stats
 * Merges repo stats into project data
 */
export async function enrichProjectsWithGitHub<T extends { githubUrl?: string; slug: string }>(
  projects: T[]
): Promise<Array<T & { repoStats?: RepoCardStats }>> {
  const githubUrls = extractGitHubUrls(projects);
  
  if (githubUrls.length === 0) {
    return projects;
  }

  const statsMap = await fetchMultipleRepoStats(githubUrls);

  return projects.map(project => {
    if (!project.githubUrl) {
      return project;
    }

    const result = statsMap.get(project.githubUrl);
    
    if (result?.success) {
      return {
        ...project,
        repoStats: result.data,
      };
    }

    // Log failures in development
    if (import.meta.env.DEV && result && !result.success) {
      console.warn(`Failed to fetch stats for ${project.slug}:`, result.error);
    }

    return project;
  });
}

/**
 * Pre-warm cache with all project repos
 * Optimizes build performance by populating cache before enrichment
 */
export async function warmCache(projects: Array<{ githubUrl?: string }>): Promise<void> {
  const urls = extractGitHubUrls(projects);
  
  if (urls.length === 0) {
    console.log('[GitHub Cache] No repositories to warm');
    return;
  }

  console.log(`[GitHub Cache] Warming cache for ${urls.length} repositories...`);
  
  const startTime = Date.now();
  await fetchMultipleRepoStats(urls, { bypassCache: false });
  const duration = Date.now() - startTime;
  
  console.log(`[GitHub Cache] Cache warming complete (${duration}ms)`);
}
```

---

## Caching Layer

### Cache Implementation

```typescript
// src/lib/github/cache.ts
import type { RepoStats, RepoCardStats, CacheEntry } from './types';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  REPO_STATS_TTL: 15 * 60 * 1000, // 15 minutes
  CARD_STATS_TTL: 15 * 60 * 1000, // 15 minutes
  LANGUAGES_TTL: 60 * 60 * 1000, // 1 hour (changes rarely)
  MAX_CACHE_SIZE: 100, // Maximum number of cached entries
  STALE_WHILE_REVALIDATE: 60 * 60 * 1000, // 1 hour - serve stale data while fetching fresh
};

/**
 * In-memory cache store
 * For build-time: persists for duration of build
 * For runtime: persists until page reload
 */
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessLog = new Map<string, number>(); // Track access for LRU

  set(key: string, data: T, ttl: number, etag?: string, lastModified?: string): void {
    const now = Date.now();
    
    // Enforce max cache size with LRU eviction
    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      fetchedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttl).toISOString(),
      etag,
      lastModified,
    });

    this.accessLog.set(key, now);
  }

  get(key: string, allowStale: boolean = false): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const expiresAt = new Date(entry.expiresAt).getTime();

    // Update access log
    this.accessLog.set(key, now);

    // Check if expired
    if (now > expiresAt) {
      if (allowStale) {
        // Serve stale data if allowed
        return entry.data;
      }
      
      // Check if within stale-while-revalidate window
      const staleUntil = expiresAt + CACHE_CONFIG.STALE_WHILE_REVALIDATE;
      if (now <= staleUntil) {
        // Serve stale data (caller should trigger background revalidation)
        return entry.data;
      }

      // Expired and beyond stale window
      this.cache.delete(key);
      this.accessLog.delete(key);
      return null;
    }

    return entry.data;
  }

  getEntry(key: string): CacheEntry<T> | null {
    return this.cache.get(key) || null;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.accessLog.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessLog.clear();
  }

  size(): number {
    return this.cache.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.accessLog.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessLog.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    // This is a simplified version - full implementation would track hits/misses
    return {
      size: this.cache.size,
      maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
      hitRate: 0, // Would need hit/miss tracking
    };
  }
}

/**
 * Cache instances
 */
const repoStatsCache = new MemoryCache<RepoStats>();
const cardStatsCache = new MemoryCache<RepoCardStats>();

/**
 * Get cached repository stats
 */
export function getCachedRepo(key: string, allowStale: boolean = false): RepoStats | null {
  return repoStatsCache.get(key, allowStale);
}

/**
 * Set cached repository stats
 */
export function setCachedRepo(
  key: string,
  data: RepoStats,
  etag?: string,
  lastModified?: string
): void {
  repoStatsCache.set(key, data, CACHE_CONFIG.REPO_STATS_TTL, etag, lastModified);
}

/**
 * Get cached card stats
 */
export function getCachedCardStats(key: string, allowStale: boolean = false): RepoCardStats | null {
  return cardStatsCache.get(key, allowStale);
}

/**
 * Set cached card stats
 */
export function setCachedCardStats(
  key: string,
  data: RepoCardStats,
  etag?: string,
  lastModified?: string
): void {
  cardStatsCache.set(key, data, CACHE_CONFIG.CARD_STATS_TTL, etag, lastModified);
}

/**
 * Clear all GitHub caches
 */
export function clearGitHubCache(): void {
  repoStatsCache.clear();
  cardStatsCache.clear();
}

/**
 * Get cache statistics for monitoring
 */
export function getGitHubCacheStats() {
  return {
    repoStats: repoStatsCache.getStats(),
    cardStats: cardStatsCache.getStats(),
  };
}

/**
 * Cache invalidation options
 */
export interface CacheInvalidationOptions {
  pattern?: string; // e.g., "owner/*" to invalidate all repos from owner
  olderThan?: number; // Invalidate entries older than timestamp
  force?: boolean; // Force invalidate even if not expired
}

/**
 * Invalidate cache entries matching criteria
 * Useful for manual refresh or webhook-triggered updates
 */
export function invalidateCache(options: CacheInvalidationOptions): void {
  const { pattern, olderThan, force } = options;

  // Helper to check if key matches pattern
  const matchesPattern = (key: string): boolean => {
    if (!pattern) return true;
    
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    return new RegExp(`^${regexPattern}$`).test(key);
  };

  // Helper to check if entry is older than timestamp
  const isOlderThan = (entry: CacheEntry<any>): boolean => {
    if (!olderThan) return false;
    const fetchedAt = new Date(entry.fetchedAt).getTime();
    return fetchedAt < olderThan;
  };

  // Invalidate repo stats cache
  for (const [key, entry] of (repoStatsCache as any).cache.entries()) {
    if (matchesPattern(key) && (force || isOlderThan(entry))) {
      repoStatsCache.delete(key);
    }
  }

  // Invalidate card stats cache
  for (const [key, entry] of (cardStatsCache as any).cache.entries()) {
    if (matchesPattern(key) && (force || isOlderThan(entry))) {
      cardStatsCache.delete(key);
    }
  }

  console.log(`[GitHub Cache] Invalidated entries matching: ${JSON.stringify(options)}`);
}
```

### Persistent Cache (Optional)

For build-time caching that persists across builds:

```typescript
// src/lib/github/persistentCache.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import type { RepoStats, CacheEntry } from './types';

const CACHE_DIR = '.cache/github';
const CACHE_FILE = 'repos.json';

/**
 * Persistent file-based cache for build-time data
 * Survives across builds to minimize API calls during development
 */
export class PersistentCache {
  private cachePath: string;

  constructor(cacheDir: string = CACHE_DIR) {
    this.cachePath = path.join(process.cwd(), cacheDir, CACHE_FILE);
  }

  /**
   * Load cache from disk
   */
  async load(): Promise<Map<string, CacheEntry<RepoStats>>> {
    try {
      await fs.mkdir(path.dirname(this.cachePath), { recursive: true });
      const content = await fs.readFile(this.cachePath, 'utf-8');
      const data = JSON.parse(content);
      return new Map(Object.entries(data));
    } catch (error) {
      // Cache file doesn't exist or is invalid
      return new Map();
    }
  }

  /**
   * Save cache to disk
   */
  async save(cache: Map<string, CacheEntry<RepoStats>>): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.cachePath), { recursive: true });
      const data = Object.fromEntries(cache);
      await fs.writeFile(this.cachePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.warn('[GitHub Cache] Failed to save cache:', error);
    }
  }

  /**
   * Clear cache file
   */
  async clear(): Promise<void> {
    try {
      await fs.unlink(this.cachePath);
    } catch {
      // File doesn't exist, ignore
    }
  }
}

/**
 * Hybrid cache that uses both memory and disk
 * Memory for fast access, disk for persistence
 */
export class HybridCache {
  private memoryCache = new Map<string, CacheEntry<RepoStats>>();
  private persistentCache = new PersistentCache();
  private loaded = false;

  async get(key: string, allowStale: boolean = false): Promise<RepoStats | null> {
    // Ensure cache is loaded
    if (!this.loaded) {
      await this.loadFromDisk();
    }

    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const expiresAt = new Date(entry.expiresAt).getTime();

    if (now > expiresAt && !allowStale) {
      return null;
    }

    return entry.data;
  }

  async set(key: string, data: RepoStats, ttl: number, etag?: string, lastModified?: string): Promise<void> {
    const now = Date.now();
    
    this.memoryCache.set(key, {
      data,
      fetchedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttl).toISOString(),
      etag,
      lastModified,
    });

    // Persist to disk asynchronously (don't await)
    this.persistentCache.save(this.memoryCache).catch(error => {
      console.warn('[GitHub Cache] Failed to persist cache:', error);
    });
  }

  private async loadFromDisk(): Promise<void> {
    this.memoryCache = await this.persistentCache.load();
    this.loaded = true;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    await this.persistentCache.clear();
  }
}
```

---

## Build-Time Integration

### Astro Integration

```typescript
// src/pages/projects.astro
---
import { getCollection } from 'astro:content';
import { enrichProjectsWithGitHub } from '../lib/github/queries';
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectsHero from '../components/sections/ProjectsHero.astro';
import ProjectsFilter from '../components/filters/ProjectsFilter';
import ProjectsGrid from '../components/sections/ProjectsGrid.astro';

// Fetch projects from content collection
let allProjects;

try {
  allProjects = await getCollection('projects');
} catch (error) {
  console.error('Failed to load projects collection:', error);
  allProjects = [];
}

// Sort projects
const sortedProjects = allProjects
  .filter(p => p.data.status !== 'archived')
  .sort((a, b) => {
    if (a.data.order !== b.data.order) {
      return a.data.order - b.data.order;
    }
    return b.data.startDate.getTime() - a.data.startDate.getTime();
  });

// Enrich with GitHub stats (build-time)
const enrichedProjects = await enrichProjectsWithGitHub(
  sortedProjects.map(p => ({
    ...p.data,
    slug: p.slug,
  }))
);

// Prepare data for client-side filtering
const projectsData = enrichedProjects.map(p => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  thumbnail: p.thumbnail,
  stack: p.stack,
  domain: p.domain,
  tags: p.tags,
  featured: p.featured,
  githubUrl: p.githubUrl,
  liveUrl: p.liveUrl,
  repoStats: p.repoStats, // GitHub stats included
}));

// Extract filter options
const allStacks = [...new Set(allProjects.flatMap(p => p.data.stack))].sort();
const allDomains = [...new Set(allProjects.map(p => p.data.domain))].sort();
const allTags = [...new Set(allProjects.flatMap(p => p.data.tags))].sort();
---

<BaseLayout 
  title="Projects | Your Name"
  description="Selected work across media platforms, fintech, enterprise systems, and developer tools"
>
  <ProjectsHero projectCount={sortedProjects.length} />
  
  <section class="projects-section">
    <div class="container">
      <ProjectsFilter 
        projects={projectsData}
        stacks={allStacks}
        domains={allDomains}
        tags={allTags}
        client:idle
      />
      
      <div id="projects-grid">
        <ProjectsGrid projects={enrichedProjects} />
      </div>
    </div>
  </section>
</BaseLayout>
```

### Build-Time Caching Strategy

```typescript
// src/lib/github/buildCache.ts
import { HybridCache } from './persistentCache';
import type { RepoStats } from './types';

const buildCache = new HybridCache();

/**
 * Fetch with build-time caching
 * Uses persistent cache to avoid refetching during development builds
 */
export async function fetchWithBuildCache(
  key: string,
  fetcher: () => Promise<RepoStats>,
  ttl: number = 15 * 60 * 1000
): Promise<RepoStats> {
  // Check cache first
  const cached = await buildCache.get(key);
  
  if (cached) {
    if (import.meta.env.DEV) {
      console.log(`[GitHub Cache] Hit: ${key}`);
    }
    return cached;
  }

  // Fetch fresh data
  if (import.meta.env.DEV) {
    console.log(`[GitHub Cache] Miss: ${key}`);
  }

  const data = await fetcher();
  await buildCache.set(key, data, ttl);

  return data;
}

/**
 * Clear build cache
 * Useful for forcing fresh fetches
 */
export async function clearBuildCache(): Promise<void> {
  await buildCache.clear();
}
```

---

## Runtime Integration (Optional)

For dynamic updates after page load:

### Client-Side Fetching

```typescript
// src/lib/github/clientQueries.ts
import type { RepoCardStats, GitHubResult } from './types';

/**
 * Fetch repo stats from client-side API endpoint
 * Proxies through server to hide credentials
 */
export async function fetchRepoStatsClient(
  githubUrl: string
): Promise<GitHubResult<RepoCardStats>> {
  try {
    const response = await fetch('/api/github/repo-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ githubUrl }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'network',
        message: error instanceof Error ? error.message : 'Network error',
        cause: error,
      },
    };
  }
}

/**
 * Refresh repo stats for a project
 * Updates UI with fresh data
 */
export async function refreshProjectStats(
  projectSlug: string,
  githubUrl: string
): Promise<void> {
  const result = await fetchRepoStatsClient(githubUrl);

  if (!result.success) {
    console.warn(`Failed to refresh stats for ${projectSlug}:`, result.error);
    return;
  }

  // Update DOM with fresh stats
  const card = document.querySelector(`[data-project-slug="${projectSlug}"]`);
  if (!card) return;

  const statsEl = card.querySelector('[data-repo-stats]');
  if (!statsEl) return;

  // Update stats display
  const { stars, forks, language, updatedAt } = result.data;
  
  const starsEl = statsEl.querySelector('[data-stat="stars"]');
  if (starsEl) {
    starsEl.textContent = formatNumber(stars);
  }

  const forksEl = statsEl.querySelector('[data-stat="forks"]');
  if (forksEl) {
    forksEl.textContent = formatNumber(forks);
  }

  const langEl = statsEl.querySelector('[data-stat="language"]');
  if (langEl && language) {
    langEl.textContent = language;
  }

  const updatedEl = statsEl.querySelector('[data-stat="updated"]');
  if (updatedEl) {
    updatedEl.textContent = formatRelativeTime(updatedAt);
  }
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
```

### API Endpoint (Server-Side Proxy)

```typescript
// src/pages/api/github/repo-stats.ts
import type { APIRoute } from 'astro';
import { fetchRepoCardStats } from '../../../lib/github/queries';
import { isSuccess } from '../../../lib/github/types';

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimiter.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Server-side API endpoint to proxy GitHub requests
 * Hides credentials and provides caching layer
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting
  if (!checkRateLimit(clientAddress)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          type: 'rate_limit',
          message: 'Too many requests. Please try again later.',
        },
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '900', // 15 minutes
        },
      }
    );
  }

  try {
    const { githubUrl } = await request.json();

    if (!githubUrl || typeof githubUrl !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            type: 'validation',
            errors: ['githubUrl is required'],
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await fetchRepoCardStats(githubUrl);

    return new Response(JSON.stringify(result), {
      status: isSuccess(result) ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900', // 15 minutes
        'Access-Control-Allow-Origin': import.meta.env.SITE || '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('[API] GitHub repo stats error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          type: 'unknown',
          message: 'Internal server error',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * Handle CORS preflight
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': import.meta.env.SITE || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
};
```

---

## UI Integration

### ProjectCard with GitHub Stats

```astro
---
// src/components/cards/ProjectCard.astro
import { Image } from 'astro:assets';
import Badge from '../ui/Badge.astro';
import ProjectLinks from './ProjectLinks.astro';
import RepoStats from './RepoStats.astro';
import type { CollectionEntry } from 'astro:content';
import type { RepoCardStats } from '../../lib/github/types';

interface Props {
  project: CollectionEntry<'projects'> & {
    repoStats?: RepoCardStats;
  };
}

const { project } = Astro.props;
const { title, summary, thumbnail, stack, domain, tags, featured, githubUrl } = project.data;
const { repoStats } = project;
---

<article 
  class="card project-card" 
  data-project-slug={project.slug}
  data-featured={featured}
>
  {thumbnail && (
    <div class="project-card-image">
      <Image 
        src={thumbnail} 
        alt={title}
        width={400}
        height={250}
        loading="lazy"
      />
    </div>
  )}
  
  <div class="card-body">
    <div class="project-card-header">
      {featured && <Badge variant="primary">Featured</Badge>}
      <span class="badge">{domain}</span>
    </div>
    
    <h3 class="card-title">{title}</h3>
    <p class="card-subtitle">{summary}</p>
    
    <div class="project-card-stack">
      {stack.slice(0, 4).map((tech) => (
        <Badge>{tech}</Badge>
      ))}
      {stack.length > 4 && (
        <Badge>+{stack.length - 4} more</Badge>
      )}
    </div>

    {repoStats && (
      <RepoStats stats={repoStats} />
    )}
  </div>
  
  <div class="card-footer">
    <ProjectLinks 
      githubUrl={githubUrl}
      liveUrl={project.data.liveUrl}
      slug={project.slug}
    />
  </div>
</article>
```

### RepoStats Component

```astro
---
// src/components/cards/RepoStats.astro
import type { RepoCardStats } from '../../lib/github/types';

interface Props {
  stats: RepoCardStats;
}

const { stats } = Astro.props;

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
---

<div class="repo-stats" data-repo-stats>
  <div class="repo-stats-item" title={`${stats.stars} stars`}>
    <svg 
      class="icon-sm" 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
    </svg>
    <span data-stat="stars">{formatNumber(stats.stars)}</span>
  </div>

  <div class="repo-stats-item" title={`${stats.forks} forks`}>
    <svg 
      class="icon-sm" 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
    </svg>
    <span data-stat="forks">{formatNumber(stats.forks)}</span>
  </div>

  {stats.language && (
    <div class="repo-stats-item">
      <span class="language-dot" style={`background-color: var(--lang-${stats.language.toLowerCase()}, var(--color-text-tertiary))`}></span>
      <span data-stat="language">{stats.language}</span>
    </div>
  )}

  <div class="repo-stats-item" title={`Updated ${stats.updatedAt}`}>
    <svg 
      class="icon-sm" 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.471.696l2.5 1a.75.75 0 00.557-1.392L8.5 7.742V4.75z"/>
    </svg>
    <span data-stat="updated">{formatRelativeTime(stats.updatedAt)}</span>
  </div>
</div>

<style>
  .repo-stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-secondary);
  }

  .repo-stats-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .language-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .icon-sm {
    opacity: 0.7;
  }
</style>
```

### Progressive Enhancement with Intersection Observer

```typescript
// src/lib/github/lazyLoad.ts
import { fetchRepoStatsClient } from './clientQueries';
import type { RepoCardStats } from './types';

/**
 * Lazy load repo stats when project card enters viewport
 * Improves performance for pages with many projects
 */
export function lazyLoadRepoStats(element: HTMLElement): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          const githubUrl = element.dataset.githubUrl;
          
          if (githubUrl) {
            const result = await fetchRepoStatsClient(githubUrl);
            
            if (result.success) {
              updateStatsUI(element, result.data);
            } else {
              hideLoadingSkeleton(element);
            }
          }
          
          // Stop observing after loading
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading slightly before entering viewport
      threshold: 0.1,
    }
  );

  observer.observe(element);
}

/**
 * Update stats UI with fetched data
 */
function updateStatsUI(element: HTMLElement, stats: RepoCardStats): void {
  const loadingEl = element.querySelector('[data-repo-stats-loading]');
  
  if (!loadingEl) return;

  loadingEl.innerHTML = renderRepoStats(stats);
  loadingEl.removeAttribute('data-repo-stats-loading');
  loadingEl.setAttribute('data-repo-stats', '');
  loadingEl.classList.add('fade-in');
}

/**
 * Hide loading skeleton on error
 */
function hideLoadingSkeleton(element: HTMLElement): void {
  const loadingEl = element.querySelector('[data-repo-stats-loading]');
  if (loadingEl) {
    loadingEl.remove();
  }
}

/**
 * Render repo stats HTML
 */
function renderRepoStats(stats: RepoCardStats): string {
  return `
    <div class="repo-stats" data-repo-stats>
      <div class="repo-stats-item" title="${stats.stars} stars">
        <svg class="icon-sm" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
        </svg>
        <span>${formatNumber(stats.stars)}</span>
      </div>
      <div class="repo-stats-item" title="${stats.forks} forks">
        <svg class="icon-sm" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
        </svg>
        <span>${formatNumber(stats.forks)}</span>
      </div>
      ${stats.language ? `
        <div class="repo-stats-item">
          <span class="language-dot" style="background-color: var(--lang-${stats.language.toLowerCase()}, var(--color-text-tertiary))"></span>
          <span>${stats.language}</span>
        </div>
      ` : ''}
      <div class="repo-stats-item" title="Updated ${stats.updatedAt}">
        <svg class="icon-sm" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.471.696l2.5 1a.75.75 0 00.557-1.392L8.5 7.742V4.75z"/>
        </svg>
        <span>${formatRelativeTime(stats.updatedAt)}</span>
      </div>
    </div>
  `;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Initialize lazy loading for all project cards
 */
export function initLazyLoadRepoStats(): void {
  const cards = document.querySelectorAll<HTMLElement>('[data-github-url]');
  
  cards.forEach(card => {
    lazyLoadRepoStats(card);
  });
}
```

### Progressive Enhancement Component

```typescript
// src/components/cards/ProjectCard.astro (with progressive enhancement)
---
const { project } = Astro.props;
const { repoStats } = project;

// Determine if stats should be fetched client-side
const shouldFetchClientSide = !repoStats && project.data.githubUrl;
---

<article 
  class="card project-card" 
  data-project-slug={project.slug}
  data-github-url={shouldFetchClientSide ? project.data.githubUrl : undefined}
>
  <!-- Card content -->
  
  {repoStats && (
    <RepoStats stats={repoStats} />
  )}
  
  {shouldFetchClientSide && (
    <div class="repo-stats-loading" data-repo-stats-loading>
      <div class="skeleton-stats">
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
      </div>
    </div>
  )}
</article>

{shouldFetchClientSide && (
  <script>
    // Initialize lazy loading with intersection observer
    import { initLazyLoadRepoStats } from '../../lib/github/lazyLoad';
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initLazyLoadRepoStats);
    } else {
      initLazyLoadRepoStats();
    }
  </script>
)}

<style>
  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .skeleton-stats {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-4) 0;
  }

  .skeleton-stat {
    width: 60px;
    height: 20px;
    background: linear-gradient(
      90deg,
      var(--bg-tertiary) 25%,
      var(--bg-secondary) 50%,
      var(--bg-tertiary) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-sm);
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
```

---

## Caching Strategies

### Strategy 1: Build-Time Only (Recommended)

**Use Case**: Static portfolio showcase with infrequent updates

**Implementation**:

- Fetch all GitHub stats during build
- Cache results in persistent file cache
- Embed stats in static HTML
- No runtime API calls

**Pros**:

- Zero runtime API calls
- No rate limit concerns for visitors
- Fast page loads (no client-side fetching)
- Works without JavaScript

**Cons**:

- Stats can be stale (updated only on rebuild)
- Requires rebuild to refresh data

**Best For**: Personal portfolios, project showcases

---

### Strategy 2: Build-Time + Stale-While-Revalidate

**Use Case**: Balance between fresh data and performance

**Implementation**:

- Fetch stats at build time
- Serve stale data immediately
- Revalidate in background on page load
- Update UI when fresh data arrives

**Pros**:

- Fast initial render with stale data
- Fresh data loaded progressively
- Graceful degradation

**Cons**:

- Requires client-side JavaScript
- Slightly more complex implementation
- Still makes API calls (cached)

**Best For**: Projects pages with moderate traffic

---

### Strategy 3: On-Demand with Aggressive Caching

**Use Case**: High-traffic sites with many projects

**Implementation**:

- No build-time fetching
- Fetch on first request
- Cache at CDN edge (Vercel, Cloudflare)
- Long TTL (1 hour+)

**Pros**:

- No build-time API calls
- Scales with CDN caching
- Fresh data on first visit after cache expiry

**Cons**:

- First visitor sees loading state
- Requires server-side API endpoint
- More complex caching logic

**Best For**: High-traffic sites, many projects (50+)

---

### Strategy Comparison

| Strategy | Build Time | Runtime Calls | Freshness | Complexity | Recommended For |
| -------- | ---------- | ------------- | --------- | ---------- | --------------- |
| Build-time only | Slow (many API calls) | None | Stale | Low | Personal portfolios |
| Build + Revalidate | Slow | Low (cached) | Fresh | Medium | Most projects pages |
| On-demand | Fast | Medium (CDN cached) | Fresh | High | High-traffic sites |

**Recommendation**: Start with **Build-Time Only** for simplicity. Upgrade to **Build + Revalidate** if fresh data is important.

---

## Rate Limit Management

### Rate Limit Monitoring

```typescript
// src/lib/github/rateLimit.ts
import { getGitHubClient } from './client';
import type { RateLimitInfo } from './types';

/**
 * Check current rate limit status
 */
export function checkRateLimit(): RateLimitInfo | null {
  const client = getGitHubClient();
  return client.getRateLimitInfo();
}

/**
 * Check if we should pause API calls
 */
export function shouldPauseRequests(threshold: number = 10): boolean {
  const client = getGitHubClient();
  return client.isNearRateLimit(threshold);
}

/**
 * Get time until rate limit resets
 */
export function getTimeUntilReset(): number {
  const client = getGitHubClient();
  return client.getTimeUntilReset();
}

/**
 * Wait until rate limit resets
 */
export async function waitForRateLimitReset(): Promise<void> {
  const waitTime = getTimeUntilReset();
  
  if (waitTime > 0) {
    console.log(`[GitHub API] Waiting ${Math.ceil(waitTime / 1000)}s for rate limit reset`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

/**
 * Fetch with rate limit protection
 * Automatically waits if near rate limit
 */
export async function fetchWithRateLimitProtection<T>(
  fetcher: () => Promise<T>,
  threshold: number = 5
): Promise<T> {
  if (shouldPauseRequests(threshold)) {
    console.warn('[GitHub API] Near rate limit, waiting for reset');
    await waitForRateLimitReset();
  }

  return fetcher();
}

/**
 * Fetch with adaptive exponential backoff and jitter
 * Prevents thundering herd when multiple builds hit rate limits
 */
export async function fetchWithAdaptiveBackoff<T>(
  fetcher: () => Promise<T>,
  attempt: number = 0,
  maxAttempts: number = 5
): Promise<T> {
  const client = getGitHubClient();
  const rateLimit = client.getRateLimitInfo();
  
  // Check if we're near rate limit
  if (rateLimit && rateLimit.remaining < 10) {
    // Adaptive backoff based on remaining quota
    // Lower remaining = longer backoff
    const quotaFactor = Math.max(1, 10 - rateLimit.remaining);
    const backoffMs = Math.min(
      1000 * Math.pow(2, attempt) * quotaFactor + Math.random() * 1000, // Jitter
      60000 // Max 1 minute
    );
    
    console.warn(
      `[GitHub API] Low quota (${rateLimit.remaining} remaining), ` +
      `backing off for ${Math.ceil(backoffMs / 1000)}s`
    );
    
    await new Promise(resolve => setTimeout(resolve, backoffMs));
  }
  
  try {
    return await fetcher();
  } catch (error) {
    // Retry with backoff if we hit rate limit
    if (attempt < maxAttempts && error instanceof Error && error.message.includes('rate_limit')) {
      console.warn(`[GitHub API] Rate limit hit, retrying (attempt ${attempt + 1}/${maxAttempts})`);
      return fetchWithAdaptiveBackoff(fetcher, attempt + 1, maxAttempts);
    }
    throw error;
  }
}
```

### Rate Limit Dashboard (Development)

```typescript
// src/lib/github/rateLimitDashboard.ts
import { checkRateLimit } from './rateLimit';
import { getGitHubCacheStats } from './cache';

/**
 * Display rate limit info in development console
 * Useful for monitoring API usage during development
 */
export function logRateLimitStatus(): void {
  if (!import.meta.env.DEV) return;

  const rateLimit = checkRateLimit();
  const cacheStats = getGitHubCacheStats();

  if (rateLimit) {
    const resetDate = new Date(rateLimit.reset);
    const minutesUntilReset = Math.ceil((rateLimit.reset - Date.now()) / 60000);

    console.group('[GitHub API] Rate Limit Status');
    console.log(`Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
    console.log(`Used: ${rateLimit.used}`);
    console.log(`Resets: ${resetDate.toLocaleTimeString()} (${minutesUntilReset}m)`);
    console.log(`Cache: ${cacheStats.repoStats.size} repos, ${cacheStats.cardStats.size} cards`);
    console.groupEnd();
  }
}

/**
 * Initialize rate limit monitoring in development
 */
export function initRateLimitMonitoring(): void {
  if (!import.meta.env.DEV) return;

  // Log status every 5 minutes
  setInterval(logRateLimitStatus, 5 * 60 * 1000);

  // Log on page load
  logRateLimitStatus();
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/lib/github/__tests__/client.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubClient } from '../client';

describe('GitHubClient', () => {
  let client: GitHubClient;

  beforeEach(() => {
    client = new GitHubClient();
    global.fetch = vi.fn();
  });

  it('makes authenticated requests with token', async () => {
    const mockResponse = new Response(JSON.stringify({ id: 123 }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '5000',
        'X-RateLimit-Remaining': '4999',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
      },
    });

    (global.fetch as any).mockResolvedValue(mockResponse);

    const response = await client.request('/repos/owner/repo');
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer'),
        }),
      })
    );

    expect(response.status).toBe(200);
  });

  it('updates rate limit info from headers', async () => {
    const mockResponse = new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        'X-RateLimit-Limit': '5000',
        'X-RateLimit-Remaining': '4500',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
        'X-RateLimit-Used': '500',
      },
    });

    (global.fetch as any).mockResolvedValue(mockResponse);

    await client.request('/repos/owner/repo');
    
    const rateLimitInfo = client.getRateLimitInfo();
    
    expect(rateLimitInfo).toMatchObject({
      limit: 5000,
      remaining: 4500,
      used: 500,
    });
  });

  it('handles 404 errors', async () => {
    const mockResponse = new Response(
      JSON.stringify({ message: 'Not Found' }),
      { status: 404 }
    );

    (global.fetch as any).mockResolvedValue(mockResponse);

    await expect(client.request('/repos/owner/nonexistent')).rejects.toThrow();
  });

  it('retries on network errors', async () => {
    (global.fetch as any)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 123 }), { status: 200 }));

    const response = await client.request('/repos/owner/repo');
    
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(response.status).toBe(200);
  });

  it('does not retry rate limit errors', async () => {
    const mockResponse = new Response(
      JSON.stringify({ message: 'API rate limit exceeded' }),
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
        },
      }
    );

    (global.fetch as any).mockResolvedValue(mockResponse);

    await expect(client.request('/repos/owner/repo')).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(1); // No retries
  });
});
```

### Integration Tests with MSW

```typescript
// src/lib/github/__tests__/queries.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { fetchRepoStats, fetchMultipleRepoStats } from '../queries';
import repoFixture from './fixtures/repo-response.json';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchRepoStats', () => {
  it('fetches and normalizes repository data', async () => {
    server.use(
      http.get('https://api.github.com/repos/owner/repo', () => {
        return HttpResponse.json(repoFixture);
      })
    );

    const result = await fetchRepoStats('https://github.com/owner/repo');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        name: expect.any(String),
        stars: expect.any(Number),
        forks: expect.any(Number),
      });
    }
  });

  it('handles 404 errors gracefully', async () => {
    server.use(
      http.get('https://api.github.com/repos/owner/nonexistent', () => {
        return HttpResponse.json(
          { message: 'Not Found' },
          { status: 404 }
        );
      })
    );

    const result = await fetchRepoStats('https://github.com/owner/nonexistent');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('not_found');
    }
  });

  it('returns cached data on rate limit', async () => {
    // First request succeeds
    server.use(
      http.get('https://api.github.com/repos/owner/repo', () => {
        return HttpResponse.json(repoFixture);
      })
    );

    const firstResult = await fetchRepoStats('https://github.com/owner/repo');
    expect(firstResult.success).toBe(true);

    // Second request hits rate limit
    server.use(
      http.get('https://api.github.com/repos/owner/repo', () => {
        return HttpResponse.json(
          { message: 'API rate limit exceeded' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
            },
          }
        );
      })
    );

    const secondResult = await fetchRepoStats('https://github.com/owner/repo');
    
    // Should return cached data as fallback
    expect(secondResult.success).toBe(false);
    if (!secondResult.success) {
      expect(secondResult.error.type).toBe('rate_limit');
      expect(secondResult.fallbackData).toBeDefined();
    }
  });
});

describe('fetchMultipleRepoStats', () => {
  it('fetches multiple repos with concurrency limit', async () => {
    const urls = [
      'https://github.com/owner/repo1',
      'https://github.com/owner/repo2',
      'https://github.com/owner/repo3',
    ];

    server.use(
      http.get('https://api.github.com/repos/owner/*', () => {
        return HttpResponse.json(repoFixture);
      })
    );

    const results = await fetchMultipleRepoStats(urls);

    expect(results.size).toBe(3);
    
    for (const [url, result] of results) {
      expect(result.success).toBe(true);
    }
  });

  it('continues on individual failures', async () => {
    const urls = [
      'https://github.com/owner/repo1',
      'https://github.com/owner/nonexistent',
      'https://github.com/owner/repo3',
    ];

    server.use(
      http.get('https://api.github.com/repos/owner/repo1', () => {
        return HttpResponse.json(repoFixture);
      }),
      http.get('https://api.github.com/repos/owner/nonexistent', () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      }),
      http.get('https://api.github.com/repos/owner/repo3', () => {
        return HttpResponse.json(repoFixture);
      })
    );

    const results = await fetchMultipleRepoStats(urls);

    expect(results.size).toBe(3);
    
    const repo1 = results.get(urls[0]);
    expect(repo1?.success).toBe(true);
    
    const nonexistent = results.get(urls[1]);
    expect(nonexistent?.success).toBe(false);
    
    const repo3 = results.get(urls[2]);
    expect(repo3?.success).toBe(true);
  });
});
```

### Test Fixtures

```json
// src/lib/github/__tests__/fixtures/repo-response.json
{
  "id": 123456789,
  "name": "example-repo",
  "full_name": "owner/example-repo",
  "description": "An example repository for testing",
  "html_url": "https://github.com/owner/example-repo",
  "homepage": "https://example.com",
  "stargazers_count": 42,
  "forks_count": 10,
  "watchers_count": 35,
  "language": "TypeScript",
  "topics": ["astro", "typescript", "showcase"],
  "updated_at": "2026-03-14T12:00:00Z",
  "pushed_at": "2026-03-14T11:30:00Z",
  "created_at": "2025-01-15T10:00:00Z",
  "size": 1024,
  "open_issues_count": 3,
  "license": {
    "key": "mit",
    "name": "MIT License",
    "spdx_id": "MIT"
  },
  "archived": false,
  "disabled": false,
  "visibility": "public"
}
```

```json
// src/lib/github/__tests__/fixtures/rate-limit-response.json
{
  "message": "API rate limit exceeded for user ID 123456.",
  "documentation_url": "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting"
}
```

```json
// src/lib/github/__tests__/fixtures/not-found-response.json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/reference/repos#get-a-repository"
}
```

### Performance Benchmarks

```typescript
// src/lib/github/__tests__/performance.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { fetchRepoStats, fetchMultipleRepoStats } from '../queries';
import { clearGitHubCache } from '../cache';
import repoFixture from './fixtures/repo-response.json';

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    clearGitHubCache();
    server.resetHandlers();
  });

  it('fetches single repo in < 2s', async () => {
    server.use(
      http.get('https://api.github.com/repos/owner/repo', () => {
        return HttpResponse.json(repoFixture);
      })
    );

    const start = Date.now();
    const result = await fetchRepoStats('https://github.com/owner/repo');
    const duration = Date.now() - start;

    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(2000);
  });

  it('fetches 10 repos in < 5s with batching', async () => {
    server.use(
      http.get('https://api.github.com/repos/owner/*', () => {
        return HttpResponse.json(repoFixture);
      })
    );

    const urls = Array.from({ length: 10 }, (_, i) => 
      `https://github.com/owner/repo${i}`
    );

    const start = Date.now();
    const results = await fetchMultipleRepoStats(urls);
    const duration = Date.now() - start;

    expect(results.size).toBe(10);
    expect(duration).toBeLessThan(5000);
  });

  it('cache hit is < 10ms', async () => {
    server.use(
      http.get('https://api.github.com/repos/owner/repo', () => {
        return HttpResponse.json(repoFixture);
      })
    );

    const url = 'https://github.com/owner/repo';

    // Prime cache
    await fetchRepoStats(url);

    // Measure cache hit
    const start = Date.now();
    const result = await fetchRepoStats(url);
    const duration = Date.now() - start;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.cached).toBe(true);
    }
    expect(duration).toBeLessThan(10);
  });

  it('batch fetch with cache hits is faster than individual fetches', async () => {
    server.use(
      http.get('https://api.github.com/repos/owner/*', () => {
        // Simulate 100ms network delay
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(HttpResponse.json(repoFixture));
          }, 100);
        });
      })
    );

    const urls = Array.from({ length: 5 }, (_, i) => 
      `https://github.com/owner/repo${i}`
    );

    // Prime cache with batch fetch
    await fetchMultipleRepoStats(urls);

    // Measure cached batch fetch
    const start = Date.now();
    await fetchMultipleRepoStats(urls);
    const duration = Date.now() - start;

    // Should be much faster than 5 * 100ms = 500ms
    expect(duration).toBeLessThan(100);
  });

  it('handles 50 repos efficiently', async () => {
    server.use(
      http.get('https://api.github.com/repos/owner/*', () => {
        return HttpResponse.json(repoFixture);
      })
    );

    const urls = Array.from({ length: 50 }, (_, i) => 
      `https://github.com/owner/repo${i}`
    );

    const start = Date.now();
    const results = await fetchMultipleRepoStats(urls);
    const duration = Date.now() - start;

    expect(results.size).toBe(50);
    // Should complete in reasonable time with concurrency control
    expect(duration).toBeLessThan(15000); // 15 seconds
  });
});
```

---

## Performance Optimization

### Optimization Checklist

- ✅ **Batch requests** - Fetch multiple repos with concurrency limit
- ✅ **Aggressive caching** - 15-minute TTL for repo stats
- ✅ **Stale-while-revalidate** - Serve stale data while fetching fresh
- ✅ **ETag support** - Conditional requests to minimize data transfer
- ✅ **Minimal payload** - Extract only needed fields for cards
- ✅ **Build-time fetching** - Embed stats in HTML when possible
- ✅ **Rate limit awareness** - Check limits before batch operations
- ✅ **Concurrency control** - Limit parallel requests to 5

### Bundle Size Impact

**Build-time only** (recommended):

- Client bundle: 0 KB (no runtime code)
- Build time: +10-30s (depending on project count)

**With runtime fetching**:

- Client bundle: ~3-5 KB (gzipped)
- API endpoint: ~2 KB (gzipped)
- Total: ~5-7 KB additional JavaScript

### Performance Metrics

**Target Metrics**:

- Build-time fetch: < 2s per repository
- Cache hit rate: > 90% in development
- API calls per build: ≤ number of projects with GitHub URLs
- Client-side fetch: < 500ms per repository (cached)
- Batch fetch: < 2s for 10 repositories

---

## Security Considerations

### Token Management

```typescript
// .env (never commit)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```typescript
// astro.config.mjs
export default defineConfig({
  // Expose only to server-side code
  vite: {
    define: {
      'import.meta.env.GITHUB_TOKEN': JSON.stringify(process.env.GITHUB_TOKEN),
    },
  },
});
```

**Rules**:

- ✅ Store token in environment variables
- ✅ Access token only in server-side code
- ✅ Never expose token to client bundle
- ✅ Use fine-grained tokens with minimal scopes
- ✅ Rotate tokens regularly
- ❌ Never commit tokens to git
- ❌ Never log tokens (even in development)
- ❌ Never send tokens to client

### Token Scopes

For public repository stats, use token with minimal scopes:

- `public_repo` - Read public repositories (if needed)
- Or no scopes at all for public data

**Unauthenticated requests** (60/hour) are sufficient for:

- Personal portfolios with < 10 projects
- Infrequent builds (once per day)

**Authenticated requests** (5000/hour) are needed for:

- Many projects (20+)
- Frequent builds (CI/CD)
- Development with hot reload

### Input Validation

```typescript
// src/lib/github/validation.ts
import { z } from 'zod';

/**
 * Validate GitHub URL from user input
 */
export const GitHubUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => url.startsWith('https://github.com/'),
    { message: 'Must be a GitHub URL' }
  )
  .refine(
    (url) => {
      const parts = new URL(url).pathname.split('/').filter(Boolean);
      return parts.length >= 2;
    },
    { message: 'Must include owner and repository' }
  );

/**
 * Sanitize GitHub URL
 * Removes query parameters and fragments
 */
export function sanitizeGitHubUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url;
  }
}
```

---

## Error Handling Patterns

### Graceful Degradation

```typescript
// src/lib/github/fallback.ts
import type { RepoCardStats } from './types';

/**
 * Generate fallback stats when GitHub API fails
 * Uses static data or reasonable defaults
 */
export function getFallbackStats(githubUrl: string): RepoCardStats {
  return {
    stars: 0,
    forks: 0,
    language: null,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check if stats are fallback (zero values)
 */
export function isFallbackStats(stats: RepoCardStats): boolean {
  return stats.stars === 0 && stats.forks === 0;
}
```

### Error Boundaries for UI

```astro
---
// src/components/cards/RepoStatsWrapper.astro
import RepoStats from './RepoStats.astro';
import type { RepoCardStats } from '../../lib/github/types';

interface Props {
  stats?: RepoCardStats;
  githubUrl?: string;
}

const { stats, githubUrl } = Astro.props;

// Don't show stats if:
// - No stats available
// - No GitHub URL
// - Stats are fallback (all zeros)
const shouldShowStats = stats && githubUrl && (stats.stars > 0 || stats.forks > 0);
---

{shouldShowStats && (
  <RepoStats stats={stats} />
)}

{!shouldShowStats && githubUrl && (
  <!-- Optional: Show "View on GitHub" link without stats -->
  <div class="repo-link-only">
    <a 
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="link-secondary"
    >
      View on GitHub →
    </a>
  </div>
)}
```

---

## Monitoring and Observability

### Logging Strategy

```typescript
// src/lib/github/logger.ts
import type { GitHubError, RateLimitInfo } from './types';

export interface LogContext {
  operation: string;
  repoUrl?: string;
  cached?: boolean;
  duration?: number;
  error?: GitHubError;
  [key: string]: unknown;
}

export interface GitHubLogEvent {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: LogContext;
}

class GitHubLogger {
  private logs: GitHubLogEvent[] = [];
  private maxLogs = 100;

  log(level: GitHubLogEvent['level'], message: string, context?: LogContext): void {
    const event: GitHubLogEvent = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.logs.push(event);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Send to logging service in production
    if (import.meta.env.PROD && level !== 'debug') {
      this.sendToLoggingService(event);
    }

    // Console output in development
    if (import.meta.env.DEV) {
      this.logToConsole(level, message, context);
    }
  }

  private logToConsole(
    level: GitHubLogEvent['level'],
    message: string,
    context?: LogContext
  ): void {
    const prefix = `[GitHub API]`;
    const contextStr = context ? JSON.stringify(context, null, 2) : '';
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, contextStr);
        break;
      case 'info':
        console.info(prefix, message, contextStr);
        break;
      case 'warn':
        console.warn(prefix, message, contextStr);
        break;
      case 'error':
        console.error(prefix, message, contextStr);
        break;
    }
  }

  private sendToLoggingService(event: GitHubLogEvent): void {
    // TODO: Integrate with logging service (Sentry, Datadog, etc.)
    // Example:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureMessage(event.message, {
    //     level: event.level,
    //     extra: event.context,
    //   });
    // }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  getLogs(): GitHubLogEvent[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

export const githubLogger = new GitHubLogger();

/**
 * Log with structured context for better observability
 */
export function logWithContext(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context: LogContext
): void {
  githubLogger.log(level, message, context);
}
```

### Metrics Collection

```typescript
// src/lib/github/metrics.ts
import type { GitHubResult } from './types';

interface GitHubMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  rateLimitErrors: number;
  networkErrors: number;
  averageResponseTime: number;
}

class MetricsCollector {
  private metrics: GitHubMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    rateLimitErrors: 0,
    networkErrors: 0,
    averageResponseTime: 0,
  };

  private responseTimes: number[] = [];

  recordRequest<T>(result: GitHubResult<T>, responseTime: number): void {
    this.metrics.totalRequests++;
    this.responseTimes.push(responseTime);

    if (result.success) {
      this.metrics.successfulRequests++;
      
      if (result.cached) {
        this.metrics.cacheHits++;
      } else {
        this.metrics.cacheMisses++;
      }
    } else {
      this.metrics.failedRequests++;
      
      if (result.error.type === 'rate_limit') {
        this.metrics.rateLimitErrors++;
      } else if (result.error.type === 'network') {
        this.metrics.networkErrors++;
      }
    }

    // Update average response time
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  getMetrics(): GitHubMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rateLimitErrors: 0,
      networkErrors: 0,
      averageResponseTime: 0,
    };
    this.responseTimes = [];
  }

  /**
   * Log metrics summary
   */
  logSummary(): void {
    if (!import.meta.env.DEV) return;

    const { 
      totalRequests, 
      successfulRequests, 
      cacheHits, 
      cacheMisses,
      rateLimitErrors,
      networkErrors,
      averageResponseTime,
    } = this.metrics;

    const successRate = totalRequests > 0 
      ? ((successfulRequests / totalRequests) * 100).toFixed(1)
      : '0';

    const cacheHitRate = (cacheHits + cacheMisses) > 0
      ? ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1)
      : '0';

    console.group('[GitHub API] Metrics Summary');
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Cache Hit Rate: ${cacheHitRate}%`);
    console.log(`Rate Limit Errors: ${rateLimitErrors}`);
    console.log(`Network Errors: ${networkErrors}`);
    console.log(`Avg Response Time: ${averageResponseTime.toFixed(0)}ms`);
    console.groupEnd();
  }
}

export const githubMetrics = new MetricsCollector();

/**
 * Wrap fetch with metrics tracking
 */
export async function fetchWithMetrics<T>(
  fetcher: () => Promise<GitHubResult<T>>
): Promise<GitHubResult<T>> {
  const startTime = Date.now();
  const result = await fetcher();
  const responseTime = Date.now() - startTime;

  githubMetrics.recordRequest(result, responseTime);

  return result;
}
```

---

## GraphQL Alternative (Advanced)

For more complex queries or when fetching multiple related resources:

### GraphQL Client

```typescript
// src/lib/github/graphql.ts
import { getGitHubClient } from './client';
import type { GitHubResult } from './types';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

/**
 * Execute GraphQL query against GitHub API
 */
export async function executeGraphQLQuery<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<GitHubResult<T>> {
  try {
    const client = getGitHubClient();
    
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${client.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
    }

    if (!result.data) {
      throw new Error('No data in GraphQL response');
    }

    return {
      success: true,
      data: result.data,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'unknown',
        message: error instanceof Error ? error.message : 'GraphQL query failed',
        cause: error,
      },
    };
  }
}
```

### GraphQL Queries

```typescript
// src/lib/github/graphqlQueries.ts
import { executeGraphQLQuery } from './graphql';
import type { RepoStats, GitHubResult } from './types';

/**
 * Fetch repository stats using GraphQL
 * More efficient than REST for multiple fields
 */
export async function fetchRepoStatsGraphQL(
  owner: string,
  repo: string
): Promise<GitHubResult<RepoStats>> {
  const query = `
    query GetRepoStats($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id: databaseId
        name
        nameWithOwner
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        watchers {
          totalCount
        }
        primaryLanguage {
          name
        }
        repositoryTopics(first: 10) {
          nodes {
            topic {
              name
            }
          }
        }
        updatedAt
        pushedAt
        createdAt
        licenseInfo {
          name
          spdxId
        }
        isArchived
        openIssues: issues(states: OPEN) {
          totalCount
        }
      }
    }
  `;

  const result = await executeGraphQLQuery<{ repository: any }>(query, { owner, repo });

  if (!result.success) {
    return result as GitHubResult<RepoStats>;
  }

  const repo = result.data.repository;

  // Transform GraphQL response to normalized model
  const normalized: RepoStats = {
    id: repo.id,
    name: repo.name,
    fullName: repo.nameWithOwner,
    description: repo.description,
    url: repo.url,
    homepage: repo.homepageUrl,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    watchers: repo.watchers.totalCount,
    language: repo.primaryLanguage?.name || null,
    topics: repo.repositoryTopics.nodes.map((n: any) => n.topic.name),
    updatedAt: repo.updatedAt,
    pushedAt: repo.pushedAt,
    createdAt: repo.createdAt,
    license: repo.licenseInfo ? {
      name: repo.licenseInfo.name,
      spdxId: repo.licenseInfo.spdxId,
    } : null,
    isArchived: repo.isArchived,
    openIssuesCount: repo.openIssues.totalCount,
  };

  return {
    success: true,
    data: normalized,
    cached: false,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Batch fetch multiple repositories using GraphQL
 * More efficient than multiple REST calls
 */
export async function fetchMultipleReposGraphQL(
  repos: Array<{ owner: string; repo: string }>
): Promise<Map<string, GitHubResult<RepoStats>>> {
  // GraphQL allows fetching multiple repos in one query using aliases
  const aliases = repos.map((r, i) => `repo${i}: repository(owner: "${r.owner}", name: "${r.repo}")`);
  
  const query = `
    query GetMultipleRepos {
      ${aliases.map((alias, i) => `
        ${alias} {
          id: databaseId
          name
          nameWithOwner
          stargazerCount
          forkCount
          primaryLanguage { name }
          updatedAt
        }
      `).join('\n')}
    }
  `;

  const result = await executeGraphQLQuery<Record<string, any>>(query, {});

  const results = new Map<string, GitHubResult<RepoStats>>();

  if (!result.success) {
    // Return error for all repos
    repos.forEach(r => {
      results.set(`${r.owner}/${r.repo}`, result as GitHubResult<RepoStats>);
    });
    return results;
  }

  // Parse individual repo results
  repos.forEach((r, i) => {
    const repoData = result.data[`repo${i}`];
    const key = `${r.owner}/${r.repo}`;

    if (repoData) {
      results.set(key, {
        success: true,
        data: {
          id: repoData.id,
          name: repoData.name,
          fullName: repoData.nameWithOwner,
          description: null,
          url: `https://github.com/${repoData.nameWithOwner}`,
          homepage: null,
          stars: repoData.stargazerCount,
          forks: repoData.forkCount,
          watchers: 0,
          language: repoData.primaryLanguage?.name || null,
          topics: [],
          updatedAt: repoData.updatedAt,
          pushedAt: repoData.updatedAt,
          createdAt: repoData.updatedAt,
          license: null,
          isArchived: false,
          openIssuesCount: 0,
        },
        cached: false,
        fetchedAt: new Date().toISOString(),
      });
    } else {
      results.set(key, {
        success: false,
        error: {
          type: 'not_found',
          resource: key,
          url: `https://github.com/${key}`,
        },
      });
    }
  });

  return results;
}
```

**When to Use GraphQL**:

- Fetching 10+ repositories in one request
- Need precise field selection
- Complex nested queries (repo + issues + PRs)

**When to Use REST**:

- Simple single repo fetches
- Standard endpoints are sufficient
- Simpler implementation preferred

---

## Development Workflow

### Local Development Setup

```bash
# 1. Get GitHub token (optional, increases rate limit)
# Visit: https://github.com/settings/tokens
# Create token with 'public_repo' scope (or no scopes for public data)

# 2. Add to .env
echo "GITHUB_TOKEN=ghp_your_token_here" >> .env

# 3. Add .env to .gitignore (if not already)
echo ".env" >> .gitignore

# 4. Clear cache when needed
npm run clear:github-cache
```

### Package Scripts

```json
// package.json
{
  "scripts": {
    "github:check": "node scripts/check-github-rate-limit.js",
    "github:clear-cache": "rm -rf .cache/github",
    "github:warm-cache": "node scripts/warm-github-cache.js",
    "github:test": "vitest run src/lib/github",
    "github:test:watch": "vitest watch src/lib/github",
    "github:test:perf": "vitest run src/lib/github/__tests__/performance.test.ts"
  }
}
```

### Cache Warming Script

```javascript
// scripts/warm-github-cache.js
import { getCollection } from 'astro:content';
import { warmCache } from '../src/lib/github/queries.js';

async function main() {
  console.log('🔥 Warming GitHub cache...\n');
  
  try {
    const projects = await getCollection('projects');
    await warmCache(projects);
    
    console.log('\n✅ Cache warming complete!');
  } catch (error) {
    console.error('\n❌ Cache warming failed:', error);
    process.exit(1);
  }
}

main();
```

### Rate Limit Check Script

```javascript
// scripts/check-github-rate-limit.js
import { getGitHubClient } from '../src/lib/github/client.js';

async function checkRateLimit() {
  const client = getGitHubClient();
  
  try {
    // Make a minimal request to get rate limit info
    await client.request('/rate_limit');
    
    const info = client.getRateLimitInfo();
    
    if (info) {
      const resetDate = new Date(info.reset);
      const minutesUntilReset = Math.ceil((info.reset - Date.now()) / 60000);

      console.log('\n📊 GitHub API Rate Limit Status\n');
      console.log(`Limit:     ${info.limit} requests/hour`);
      console.log(`Remaining: ${info.remaining} requests`);
      console.log(`Used:      ${info.used} requests`);
      console.log(`Resets:    ${resetDate.toLocaleString()} (${minutesUntilReset}m)\n`);

      if (info.remaining < 100) {
        console.warn('⚠️  Warning: Low remaining requests');
      }

      if (info.remaining === 0) {
        console.error('❌ Rate limit exhausted');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    process.exit(1);
  }
}

checkRateLimit();
```

---

## Migration Path

### Phase 1: Foundation (Week 1)

**Goal**: Set up basic GitHub integration with types and client

**Tasks**:

1. Create directory structure (`src/lib/github/`)
2. Implement type definitions (`types.ts`)
3. Build GitHub API client (`client.ts`)
4. Add error handling (`errors.ts`)
5. Write unit tests for client

**Deliverables**:

- Working GitHub API client
- Type-safe error handling
- Unit tests passing

---

### Phase 2: Queries and Normalization (Week 1-2)

**Goal**: Implement data fetching and normalization

**Tasks**:

1. Implement normalization functions (`normalize.ts`)
2. Build query utilities (`queries.ts`)
3. Add runtime validation with Zod
4. Create test fixtures
5. Write integration tests with MSW

**Deliverables**:

- Query functions for fetching repos
- Normalization layer
- Comprehensive test coverage

---

### Phase 3: Caching Layer (Week 2)

**Goal**: Add caching to minimize API calls

**Tasks**:

1. Implement in-memory cache (`cache.ts`)
2. Add persistent file cache (`persistentCache.ts`)
3. Implement ETag support
4. Add cache statistics
5. Test cache behavior

**Deliverables**:

- Multi-layer caching system
- ETag-based conditional requests
- Cache monitoring tools

---

### Phase 4: UI Integration (Week 2-3)

**Goal**: Integrate GitHub stats into project cards

**Tasks**:

1. Update ProjectCard component
2. Create RepoStats component
3. Enrich projects at build time
4. Add loading states
5. Test UI integration

**Deliverables**:

- Project cards showing GitHub stats
- Graceful fallbacks
- Loading states

---

### Phase 5: Optimization and Monitoring (Week 3)

**Goal**: Optimize performance and add observability

**Tasks**:

1. Implement batch fetching
2. Add rate limit monitoring
3. Create metrics collector
4. Add development dashboard
5. Performance testing

**Deliverables**:

- Optimized batch operations
- Rate limit dashboard
- Performance metrics
- Documentation

---

## Best Practices

### Do's

- ✅ Always validate GitHub API responses with Zod
- ✅ Normalize responses to internal models
- ✅ Cache aggressively (15+ minute TTL)
- ✅ Handle rate limits gracefully
- ✅ Use ETags for conditional requests
- ✅ Batch requests when possible
- ✅ Log errors with context
- ✅ Provide fallback data
- ✅ Test with realistic fixtures
- ✅ Monitor rate limit status
- ✅ Keep API logic in `src/lib/github/`
- ✅ Use TypeScript strictly

### Don'ts

- ❌ Don't expose raw GitHub responses to UI
- ❌ Don't call GitHub API from UI components
- ❌ Don't ignore rate limit headers
- ❌ Don't retry rate limit errors
- ❌ Don't expose tokens to client
- ❌ Don't make unnecessary API calls
- ❌ Don't trust API responses without validation
- ❌ Don't hard-code GitHub URLs
- ❌ Don't spam API with rapid requests
- ❌ Don't skip error handling

---

## Configuration

### Environment Variables

```bash
# .env
# GitHub personal access token (optional, increases rate limit from 60 to 5000/hour)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cache configuration
GITHUB_CACHE_TTL=900000          # 15 minutes in milliseconds
GITHUB_CACHE_MAX_SIZE=100        # Maximum cached entries
GITHUB_CACHE_STALE_TTL=3600000   # 1 hour stale-while-revalidate

# Rate limit configuration
GITHUB_RATE_LIMIT_THRESHOLD=10   # Pause requests when remaining < 10
GITHUB_REQUEST_TIMEOUT=10000     # 10 seconds
GITHUB_MAX_RETRIES=3             # Maximum retry attempts

# Feature flags
GITHUB_ENABLE_RUNTIME_FETCH=false  # Enable client-side fetching
GITHUB_ENABLE_GRAPHQL=false        # Use GraphQL instead of REST
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/lib/github/*": ["./src/lib/github/*"]
    }
  }
}
```

---

## API Reference

### Core Functions

#### `fetchRepoStats(githubUrl: string, options?: GitHubRequestOptions): Promise<GitHubResult<RepoStats>>`

Fetch full repository statistics.

**Parameters**:

- `githubUrl` - GitHub repository URL
- `options` - Optional request configuration

**Returns**: Result object with repo stats or error

**Example**:

```typescript
const result = await fetchRepoStats('https://github.com/owner/repo');

if (result.success) {
  console.log(`Stars: ${result.data.stars}`);
} else {
  console.error(`Error: ${result.error.type}`);
}
```

---

#### `fetchRepoCardStats(githubUrl: string, options?: GitHubRequestOptions): Promise<GitHubResult<RepoCardStats>>`

Fetch lightweight stats for project cards.

**Parameters**:

- `githubUrl` - GitHub repository URL
- `options` - Optional request configuration

**Returns**: Result object with minimal stats or error

**Example**:

```typescript
const result = await fetchRepoCardStats('https://github.com/owner/repo');

if (result.success) {
  console.log(`Stars: ${result.data.stars}, Language: ${result.data.language}`);
}
```

---

#### `fetchMultipleRepoStats(githubUrls: string[], options?: GitHubRequestOptions): Promise<Map<string, GitHubResult<RepoCardStats>>>`

Batch fetch stats for multiple repositories.

**Parameters**:

- `githubUrls` - Array of GitHub repository URLs
- `options` - Optional request configuration

**Returns**: Map of URL to result object

**Example**:

```typescript
const urls = [
  'https://github.com/owner/repo1',
  'https://github.com/owner/repo2',
];

const results = await fetchMultipleRepoStats(urls);

for (const [url, result] of results) {
  if (result.success) {
    console.log(`${url}: ${result.data.stars} stars`);
  }
}
```

---

#### `enrichProjectsWithGitHub<T>(projects: T[]): Promise<Array<T & { repoStats?: RepoCardStats }>>`

Enrich project data with GitHub stats.

**Parameters**:

- `projects` - Array of projects with `githubUrl` field

**Returns**: Projects with `repoStats` field added

**Example**:

```typescript
const projects = [
  { slug: 'project-1', githubUrl: 'https://github.com/owner/repo1' },
  { slug: 'project-2', githubUrl: 'https://github.com/owner/repo2' },
];

const enriched = await enrichProjectsWithGitHub(projects);

enriched.forEach(project => {
  if (project.repoStats) {
    console.log(`${project.slug}: ${project.repoStats.stars} stars`);
  }
});
```

---

### Utility Functions

#### `parseGitHubUrl(url: string): { owner: string; repo: string } | null`

Parse GitHub URL to extract owner and repo name.

**Example**:

```typescript
const parsed = parseGitHubUrl('https://github.com/owner/repo');
// { owner: 'owner', repo: 'repo' }
```

---

#### `isValidGitHubUrl(url: string): boolean`

Validate GitHub URL format.

**Example**:

```typescript
isValidGitHubUrl('https://github.com/owner/repo'); // true
isValidGitHubUrl('https://gitlab.com/owner/repo'); // false
```

---

#### `normalizeRepo(raw: unknown): RepoStats`

Normalize GitHub API response to internal model.

**Example**:

```typescript
const raw = await response.json();
const normalized = normalizeRepo(raw);
```

---

#### `extractCardStats(repo: RepoStats): RepoCardStats`

Extract minimal stats for project cards.

**Example**:

```typescript
const cardStats = extractCardStats(fullStats);
// { stars: 42, forks: 10, language: 'TypeScript', updatedAt: '...' }
```

---

### Cache Functions

#### `getCachedRepo(key: string, allowStale?: boolean): RepoStats | null`

Get cached repository stats.

**Example**:

```typescript
const cached = getCachedRepo('owner/repo');
if (cached) {
  console.log('Cache hit:', cached.stars);
}
```

---

#### `setCachedRepo(key: string, data: RepoStats, etag?: string, lastModified?: string): void`

Set cached repository stats.

**Example**:

```typescript
setCachedRepo('owner/repo', stats, etag, lastModified);
```

---

#### `clearGitHubCache(): void`

Clear all GitHub caches.

**Example**:

```typescript
clearGitHubCache();
```

---

## Troubleshooting

### Common Issues

#### Issue: Rate Limit Exceeded

**Symptoms**:

- 429 responses from GitHub API
- "API rate limit exceeded" errors
- Builds failing with rate limit errors

**Solutions**:

1. Add GitHub token to increase limit (60 → 5000/hour)
2. Enable persistent cache to reduce build-time calls
3. Reduce build frequency in development
4. Use cached data as fallback

**Check rate limit**:

```bash
npm run check:rate-limit
```

---

#### Issue: Stale Data

**Symptoms**:

- Star counts don't update
- Old repository information displayed

**Solutions**:

1. Clear cache: `npm run clear:github-cache`
2. Reduce cache TTL in configuration
3. Implement stale-while-revalidate
4. Add manual refresh button

---

#### Issue: Slow Builds

**Symptoms**:

- Build takes > 1 minute
- Many GitHub API calls during build

**Solutions**:

1. Enable persistent cache (`.cache/github/`)
2. Reduce number of projects with GitHub URLs
3. Use GraphQL for batch fetching
4. Fetch only card stats (not full repo data)

---

#### Issue: Missing Stats

**Symptoms**:

- Some projects don't show GitHub stats
- Stats component not rendering

**Solutions**:

1. Check GitHub URL format in project frontmatter
2. Verify repository is public
3. Check for API errors in console
4. Verify cache is working

**Debug**:

```typescript
// Enable debug logging
import { githubLogger } from './lib/github/logger';
githubLogger.info('Fetching stats for:', { url: githubUrl });
```

---

## Astro Integration

For easier setup and configuration, create a custom Astro integration:

```typescript
// integrations/github-stats.ts
import type { AstroIntegration } from 'astro';
import { warmCache } from '../src/lib/github/queries';
import { getCollection } from 'astro:content';

export interface GitHubStatsOptions {
  warmCache?: boolean;
  cacheDir?: string;
  rateLimitThreshold?: number;
}

export function githubStats(options: GitHubStatsOptions = {}): AstroIntegration {
  const {
    warmCache: shouldWarmCache = true,
    cacheDir = '.cache/github',
    rateLimitThreshold = 10,
  } = options;

  return {
    name: 'github-stats',
    hooks: {
      'astro:config:setup': ({ updateConfig, config }) => {
        console.log('[GitHub Stats] Configuring integration...');
        
        // Add environment variables to Vite config
        updateConfig({
          vite: {
            define: {
              'import.meta.env.GITHUB_CACHE_DIR': JSON.stringify(cacheDir),
              'import.meta.env.GITHUB_RATE_LIMIT_THRESHOLD': rateLimitThreshold,
            },
          },
        });
      },
      
      'astro:build:start': async () => {
        if (!shouldWarmCache) return;
        
        console.log('[GitHub Stats] Warming cache...');
        
        try {
          const projects = await getCollection('projects');
          await warmCache(projects);
          console.log('[GitHub Stats] Cache warming complete ✓');
        } catch (error) {
          console.warn('[GitHub Stats] Cache warming failed:', error);
          // Don't fail the build, continue with cold cache
        }
      },
      
      'astro:build:done': ({ dir, pages }) => {
        const projectPages = pages.filter(p => p.pathname.includes('projects'));
        console.log(`[GitHub Stats] Built ${projectPages.length} project pages`);
      },
    },
  };
}
```

### Usage

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { githubStats } from './integrations/github-stats';

export default defineConfig({
  integrations: [
    githubStats({
      warmCache: true,
      cacheDir: '.cache/github',
      rateLimitThreshold: 10,
    }),
  ],
});
```

**Benefits**:
- Automatic cache warming before build
- Centralized configuration
- Build-time logging
- Easy to enable/disable

---

## Future Enhancements

### Planned Features

1. **GraphQL Migration**: Switch to GraphQL for batch operations
2. **Language Breakdown**: Show repository language percentages
3. **Contribution Activity**: Display commit activity sparkline
4. **Repository Topics**: Show GitHub topics as tags
5. **License Badges**: Display license information
6. **Freshness Indicator**: Show when stats were last updated
7. **Manual Refresh**: Allow users to refresh stats
8. **Offline Support**: Service worker caching for stats
9. **Real-time Updates**: WebSocket for live star counts
10. **Advanced Analytics**: Track which repos get most clicks

### Experimental Features

**GitHub Webhook Integration**:

```typescript
// src/pages/api/github/webhook.ts
import type { APIRoute } from 'astro';
import { invalidateCache } from '../../../lib/github/cache';
import crypto from 'node:crypto';

interface GitHubWebhookPayload {
  action: string;
  repository: {
    owner: { login: string };
    name: string;
    full_name: string;
  };
}

/**
 * Verify webhook signature
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Handle GitHub webhook events
 * Invalidates cache when repository is updated
 */
export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('x-hub-signature-256');
  const event = request.headers.get('x-github-event');
  
  if (!signature) {
    return new Response('Missing signature', { status: 401 });
  }

  const payload = await request.text();
  const secret = import.meta.env.GITHUB_WEBHOOK_SECRET;

  if (!verifySignature(payload, signature, secret)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const data: GitHubWebhookPayload = JSON.parse(payload);

  // Handle repository update events
  if (event === 'push' || event === 'star' || event === 'fork') {
    const cacheKey = data.repository.full_name;
    
    console.log(`[Webhook] ${event} event for ${cacheKey}`);
    
    // Invalidate cache for this repository
    invalidateCache({ pattern: cacheKey, force: true });
    
    // Optionally trigger rebuild (Vercel, Netlify, etc.)
    // await triggerRebuild();
  }

  return new Response('OK', { status: 200 });
};
```

**Setup Webhook**:

1. Go to GitHub repository settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/github/webhook`
3. Select events: `push`, `star`, `fork`
4. Set secret in `.env`: `GITHUB_WEBHOOK_SECRET=your_secret_here`

**Benefits**:
- Near real-time cache invalidation
- Automatic updates on repository changes
- No polling required

---

**GitHub Activity Feed**:

```typescript
// Fetch recent commits for a repository
export async function fetchRecentCommits(
  githubUrl: string,
  limit: number = 5
): Promise<GitHubResult<Array<{ sha: string; message: string; date: string }>>> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    return {
      success: false,
      error: { type: 'validation', errors: ['Invalid GitHub URL'], response: githubUrl },
    };
  }

  try {
    const client = getGitHubClient();
    const endpoint = `/repos/${parsed.owner}/${parsed.repo}/commits?per_page=${limit}`;
    const response = await client.request(endpoint);
    const data = await response.json();

    const commits = data.map((commit: any) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0],
      date: commit.commit.author.date,
    }));

    return {
      success: true,
      data: commits,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: extractGitHubError(error),
    };
  }
}
```

**Repository Health Score**:

```typescript
// Calculate repository health based on activity, issues, etc.
export function calculateRepoHealth(stats: RepoStats): {
  score: number; // 0-100
  factors: {
    activity: number;
    maintenance: number;
    community: number;
  };
} {
  const now = Date.now();
  const lastUpdate = new Date(stats.updatedAt).getTime();
  const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);

  // Activity score (0-40 points)
  const activityScore = Math.max(0, 40 - daysSinceUpdate);

  // Maintenance score (0-30 points)
  const maintenanceScore = stats.isArchived ? 0 : 30;

  // Community score (0-30 points)
  const communityScore = Math.min(30, (stats.stars / 100) * 10 + (stats.forks / 50) * 10);

  const totalScore = Math.round(activityScore + maintenanceScore + communityScore);

  return {
    score: Math.min(100, totalScore),
    factors: {
      activity: Math.round(activityScore),
      maintenance: maintenanceScore,
      community: Math.round(communityScore),
    },
  };
}
```

---

## Architecture Decision Records (ADRs)

### ADR-001: REST API over GraphQL for Initial Implementation

**Status**: Accepted

**Context**: Need to fetch GitHub repository statistics for project cards.

**Decision**: Use REST API v3 initially, with GraphQL as future enhancement.

**Rationale**:
- Simpler implementation for MVP
- Well-documented REST endpoints
- Easier to test and debug
- GraphQL adds complexity for small benefit initially
- REST is sufficient for < 20 projects

**Consequences**:
- More API calls for batch operations
- Larger payloads (can't select specific fields)
- Will migrate to GraphQL in Phase 5 for batch optimization
- Acceptable trade-off for initial implementation

**Alternatives Considered**:
- GraphQL: More efficient but adds complexity
- Third-party service (shields.io): Limited customization
- Manual data entry: High maintenance burden

---

### ADR-002: Build-Time Fetching as Default Strategy

**Status**: Accepted

**Context**: Need to decide when to fetch GitHub stats (build vs runtime).

**Decision**: Default to build-time fetching with optional runtime updates.

**Rationale**:
- Zero client-side JavaScript required
- No rate limit concerns for visitors
- Fast page loads (no client-side fetching)
- Works without JavaScript enabled
- Acceptable staleness for portfolio showcase

**Consequences**:
- Stats can be stale between builds
- Requires rebuild to refresh data
- Build time increases with project count (~1.5s per repo)
- Persistent cache mitigates rebuild performance

**Alternatives Considered**:
- Runtime-only: Requires JS, slower initial render
- Hybrid: More complex, adds client bundle size
- Server-side rendering: Requires server, more infrastructure

---

### ADR-003: Multi-Layer Caching Strategy

**Status**: Accepted

**Context**: Need to minimize GitHub API calls and respect rate limits.

**Decision**: Implement multi-layer caching (memory + persistent file + ETag).

**Rationale**:
- Memory cache for fast in-process access
- Persistent cache survives builds (development efficiency)
- ETag support minimizes bandwidth
- LRU eviction prevents unbounded growth
- 15-minute TTL balances freshness and API usage

**Consequences**:
- Increased complexity vs simple TTL cache
- File system dependency for persistent cache
- Cache invalidation requires careful design
- Significant performance improvement justifies complexity

**Alternatives Considered**:
- Memory-only: Lost on rebuild
- Redis/external cache: Overkill for static site
- No caching: Exceeds rate limits quickly

---

### ADR-004: Zod for Runtime Validation

**Status**: Accepted

**Context**: GitHub API responses can change, need runtime safety.

**Decision**: Use Zod for runtime validation of all GitHub API responses.

**Rationale**:
- Type-safe schema definition
- Runtime validation prevents crashes
- Clear error messages for debugging
- Schema serves as documentation
- Minimal bundle size impact (build-time only)

**Consequences**:
- Additional dependency (Zod)
- Slight performance overhead (negligible)
- Schemas must be maintained alongside types
- Prevents entire class of runtime errors

**Alternatives Considered**:
- TypeScript only: No runtime safety
- JSON Schema: Less ergonomic than Zod
- Manual validation: Error-prone, verbose

---

### ADR-005: Branded Types for URLs

**Status**: Accepted

**Context**: Need to prevent mixing validated and unvalidated GitHub URLs.

**Decision**: Use branded types (`GitHubUrl`) for validated URLs.

**Rationale**:
- Compile-time safety for URL handling
- Forces validation at boundaries
- Self-documenting code
- Zero runtime cost
- Prevents entire class of bugs

**Consequences**:
- Slightly more verbose type signatures
- Requires explicit validation/casting
- Better type safety justifies verbosity

**Alternatives Considered**:
- Plain strings: No type safety
- Wrapper class: Runtime overhead
- Nominal types: Not supported in TypeScript

---

## Quick Start Guide

### 1. Install Dependencies

```bash
npm install zod
```

### 2. Set Up Environment

```bash
# .env
GITHUB_TOKEN=ghp_your_token_here  # Optional, increases rate limit
```

Get a token at: https://github.com/settings/tokens

**Scopes needed**: None (for public repos) or `public_repo` (if needed)

### 3. Create GitHub Module Structure

```bash
mkdir -p src/lib/github/__tests__/fixtures
touch src/lib/github/{types,client,queries,normalize,cache,errors,logger}.ts
```

### 4. Copy Implementation

Copy the code from this document to the respective files:

- `types.ts` - Type definitions and Zod schemas
- `client.ts` - GitHub API client
- `queries.ts` - Query functions
- `normalize.ts` - Response normalization
- `cache.ts` - Caching layer
- `errors.ts` - Error handling
- `logger.ts` - Logging utilities

### 5. Integrate with Projects Page

```typescript
// src/pages/projects.astro
---
import { getCollection } from 'astro:content';
import { enrichProjectsWithGitHub, warmCache } from '../lib/github/queries';

const projects = await getCollection('projects');

// Optional: Warm cache before enrichment
await warmCache(projects);

// Enrich with GitHub stats
const enriched = await enrichProjectsWithGitHub(projects);
---

<ProjectsGrid projects={enriched} />
```

### 6. Display Stats in ProjectCard

```astro
<!-- src/components/cards/ProjectCard.astro -->
---
import RepoStats from './RepoStats.astro';

const { project } = Astro.props;
---

<article class="project-card">
  <!-- Card content -->
  
  {project.repoStats && (
    <RepoStats stats={project.repoStats} />
  )}
</article>
```

### 7. Add RepoStats Component

Copy the `RepoStats.astro` component from the UI Integration section.

### 8. Test the Integration

```bash
# Check rate limit
npm run github:check

# Run tests
npm run test:github

# Build and verify
npm run build
```

Done! 🎉 Your projects now show live GitHub stats.

---

## Summary

This GitHub data layer provides a **production-ready integration** for enriching project cards with live repository statistics.

### Key Features

- ✅ **Type-safe** with runtime validation (Zod + branded types)
- ✅ **Aggressive caching** with multi-layer strategy (memory + persistent + ETag)
- ✅ **Rate limit protection** with adaptive backoff and jitter
- ✅ **Graceful error handling** with typed errors and fallbacks
- ✅ **Build-time and runtime support** with progressive enhancement
- ✅ **Comprehensive testing** (unit + integration + performance benchmarks)
- ✅ **Monitoring and observability** with structured logging
- ✅ **Progressive enhancement** with intersection observer lazy loading
- ✅ **Zero client-side JS** (optional, build-time only mode)
- ✅ **Cache warming** for optimized build performance
- ✅ **Manual cache invalidation** for webhook integration
- ✅ **Astro integration** for easy setup
- ✅ **Security hardened** with rate limiting and CORS

### Architecture Highlights

- **Separation of Concerns**: Clean boundaries between client, queries, normalization, caching, and error handling
- **Type Safety**: Zod validation + branded types + TypeScript for compile-time and runtime safety
- **Performance**: Multi-layer caching, batch operations, ETag support, intersection observer lazy loading
- **Reliability**: Comprehensive error handling, fallbacks, adaptive retry logic with exponential backoff
- **Maintainability**: Well-tested (unit + integration + performance), documented (ADRs + quick start), modular code
- **Observability**: Structured logging with context, metrics collection, rate limit monitoring
- **Developer Experience**: Astro integration, CLI scripts, cache warming, clear troubleshooting guide

### Integration Points

- **Astro Content Collections**: Seamless integration with project data
- **React Islands**: Optional runtime updates
- **Analytics**: Track GitHub link clicks
- **Design System**: Consistent styling with RepoStats component

This data layer is designed to be **reliable, performant, and maintainable** - suitable for production use in a professional portfolio showcase.
