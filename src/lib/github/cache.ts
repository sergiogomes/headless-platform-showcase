import type { RepoStats, RepoCardStats, CacheEntry } from './types';

const CACHE_CONFIG = {
  REPO_STATS_TTL: 15 * 60 * 1000,
  CARD_STATS_TTL: 15 * 60 * 1000,
  MAX_CACHE_SIZE: 100,
};

/**
 * In-memory cache with TTL and LRU eviction when max size is reached.
 */
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessLog = new Map<string, number>();

  /** Stores data under key with the given TTL. Evicts least-recently-used entry if at max size. */
  set(key: string, data: T, ttl: number, etag?: string, lastModified?: string): void {
    const now = Date.now();
    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      this.evictLRU();
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

  /** Returns cached data if present and not expired (or allowStale is true). Updates access log. */
  get(key: string, allowStale: boolean = false): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    this.accessLog.set(key, Date.now());
    const now = Date.now();
    const expiresAt = new Date(entry.expiresAt).getTime();
    if (now > expiresAt && !allowStale) {
      this.cache.delete(key);
      this.accessLog.delete(key);
      return null;
    }
    return entry.data;
  }

  /** Removes the entry for key. */
  delete(key: string): void {
    this.cache.delete(key);
    this.accessLog.delete(key);
  }

  /** Removes all entries. */
  clear(): void {
    this.cache.clear();
    this.accessLog.clear();
  }

  /** Removes the least-recently-used entry (oldest in accessLog). */
  private evictLRU(): void {
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
}

const repoStatsCache = new MemoryCache<RepoStats>();
const cardStatsCache = new MemoryCache<RepoCardStats>();

/** Returns full repo stats from cache if present. Key is typically "owner/repo". */
export function getCachedRepo(key: string, allowStale: boolean = false): RepoStats | null {
  return repoStatsCache.get(key, allowStale);
}

/** Stores full repo stats with default TTL (15 min). Optional etag/lastModified for conditional requests. */
export function setCachedRepo(
  key: string,
  data: RepoStats,
  etag?: string,
  lastModified?: string
): void {
  repoStatsCache.set(key, data, CACHE_CONFIG.REPO_STATS_TTL, etag, lastModified);
}

/** Returns card stats (stars, forks, language, updatedAt) from cache. Key is typically "owner/repo:card". */
export function getCachedCardStats(key: string, allowStale: boolean = false): RepoCardStats | null {
  return cardStatsCache.get(key, allowStale);
}

/** Stores card stats with default TTL (15 min). */
export function setCachedCardStats(
  key: string,
  data: RepoCardStats,
  etag?: string,
  lastModified?: string
): void {
  cardStatsCache.set(key, data, CACHE_CONFIG.CARD_STATS_TTL, etag, lastModified);
}

/** Clears all in-memory GitHub caches (repo and card stats). */
export function clearGitHubCache(): void {
  repoStatsCache.clear();
  cardStatsCache.clear();
}
