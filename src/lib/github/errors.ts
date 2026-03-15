import type { GitHubError } from './types';

/**
 * Creates a standard Error instance with a typed githubError property attached.
 * Used so API errors can carry structured GitHubError data (rate_limit, not_found, etc.).
 */
export function createGitHubError(
  type: GitHubError['type'],
  details: Omit<Extract<GitHubError, { type: typeof type }>, 'type'>
): Error {
  const error = new Error(`GitHub API Error: ${type}`);
  (error as Error & { githubError: GitHubError }).githubError = { type, ...details } as GitHubError;
  return error;
}

/**
 * Converts an unknown thrown value into a GitHubError. If it's already an Error
 * with a githubError property, returns that; otherwise wraps as type 'unknown'.
 */
export function extractGitHubError(error: unknown): GitHubError {
  if (error instanceof Error && (error as Error & { githubError?: GitHubError }).githubError) {
    return (error as Error & { githubError: GitHubError }).githubError;
  }
  if (error instanceof Error) {
    return { type: 'unknown', message: error.message, cause: error };
  }
  return { type: 'unknown', message: 'An unknown error occurred', cause: error };
}

/**
 * Type guard: true if the value is an Error that has a githubError property (from createGitHubError).
 */
export function isGitHubError(
  error: unknown
): error is Error & { githubError: GitHubError } {
  return error instanceof Error && (error as Error & { githubError?: unknown }).githubError !== undefined;
}

/**
 * Returns true if the GitHub error is transient and the request could be retried
 * (e.g. network or unknown). Rate limit, not_found, forbidden, validation are not retryable.
 */
export function isRetryableError(error: GitHubError): boolean {
  switch (error.type) {
    case 'network':
    case 'unknown':
      return true;
    case 'rate_limit':
    case 'not_found':
    case 'forbidden':
    case 'validation':
      return false;
    default:
      return false;
  }
}

/**
 * Returns a human-readable message for the given GitHubError (e.g. for logging or UI).
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
    default:
      return 'An error occurred';
  }
}

/**
 * Logs a GitHubError with context. In production, rate_limit is logged as warn and
 * not_found as info; other errors are logged as error.
 */
export function logGitHubError(error: GitHubError, context: string): void {
  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  if (!isDev && error.type === 'rate_limit') {
    console.warn(`[GitHub API] ${context}:`, getErrorMessage(error));
    return;
  }
  if (error.type === 'not_found') {
    console.info(`[GitHub API] ${context}:`, getErrorMessage(error));
    return;
  }
  console.error(`[GitHub API] ${context}:`, error);
}
