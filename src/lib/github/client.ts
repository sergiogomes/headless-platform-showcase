import type { GitHubRequestOptions, RateLimitInfo } from './types';
import { createGitHubError } from './errors';

const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 3;

/**
 * Low-level client for the GitHub REST API. Handles auth, rate limit headers,
 * retries with exponential backoff, and maps HTTP errors to typed GitHub errors.
 */
export class GitHubClient {
  private baseUrl: string;
  private token?: string;
  private rateLimitInfo?: RateLimitInfo;

  /** Optional token; falls back to import.meta.env.GITHUB_TOKEN when not passed. */
  constructor(token?: string) {
    this.baseUrl = GITHUB_API_BASE;
    this.token = token || (typeof import.meta !== 'undefined' && (import.meta as any).env?.GITHUB_TOKEN);
  }

  /**
   * Sends a GET request to the given endpoint (e.g. "/repos/owner/repo").
   * Retries on failure (except rate limit), updates rate limit info from headers, throws on 4xx/5xx.
   */
  async request(endpoint: string, options: GitHubRequestOptions = {}): Promise<Response> {
    const { useAuth = true, timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES } = options;
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
        this.updateRateLimitInfo(response);

        if (response.status === 429) {
          const resetAt = this.rateLimitInfo?.reset ?? Date.now() + 60000;
          throw createGitHubError('rate_limit', { resetAt, remaining: 0 });
        }

        if (!response.ok) {
          throw await this.handleErrorResponse(response, endpoint);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        attempt++;
        if (error instanceof Error && error.message.includes('rate_limit')) {
          throw error;
        }
        if (attempt < retries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  /** Builds Accept and optional Authorization headers for the API. */
  private buildHeaders(useAuth: boolean): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'headless-platform-showcase',
    };
    if (useAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /** Reads X-RateLimit-* headers and stores them for isNearRateLimit / getTimeUntilReset. */
  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const used = response.headers.get('X-RateLimit-Used');
    if (limit && remaining !== null && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10) * 1000,
        used: used ? parseInt(used, 10) : 0,
      };
    }
  }

  /** Maps 404/403/422 and other status codes to typed createGitHubError results. */
  private async handleErrorResponse(response: Response, endpoint: string): Promise<Error> {
    let errorData: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        errorData = await response.json();
      } catch {
        // ignore
      }
    }
    const data = errorData as { message?: string } | null;

    switch (response.status) {
      case 404:
        return createGitHubError('not_found', {
          resource: endpoint,
          url: `${this.baseUrl}${endpoint}`,
        });
      case 403:
        return createGitHubError('forbidden', {
          message: data?.message ?? 'Access forbidden',
        });
      case 422:
        return createGitHubError('validation', {
          errors: Array.isArray((data as any)?.errors) ? (data as any).errors : ['Validation failed'],
          response: errorData,
        });
      default:
        return createGitHubError('unknown', {
          message: data?.message ?? `HTTP ${response.status}`,
          cause: errorData,
        });
    }
  }

  /** Returns the last rate limit info from response headers, or null if not yet set. */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo ?? null;
  }

  /** True if remaining requests are at or below the given threshold (default 10). */
  isNearRateLimit(threshold: number = 10): boolean {
    if (!this.rateLimitInfo) return false;
    return this.rateLimitInfo.remaining <= threshold;
  }

  /** Milliseconds until the rate limit window resets; 0 if no info. */
  getTimeUntilReset(): number {
    if (!this.rateLimitInfo) return 0;
    return Math.max(0, this.rateLimitInfo.reset - Date.now());
  }

  /** Reads ETag from response (for conditional requests). */
  getETag(response: Response): string | null {
    return response.headers.get('ETag');
  }

  /** Reads Last-Modified from response (for conditional requests). */
  getLastModified(response: Response): string | null {
    return response.headers.get('Last-Modified');
  }
}

let clientInstance: GitHubClient | null = null;

/** Returns a singleton GitHubClient instance (uses env GITHUB_TOKEN when available). */
export function getGitHubClient(): GitHubClient {
  if (!clientInstance) {
    clientInstance = new GitHubClient();
  }
  return clientInstance;
}
