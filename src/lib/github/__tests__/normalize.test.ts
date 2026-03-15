import { describe, it, expect } from 'vitest';
import { normalizeRepo, parseGitHubUrl, extractCardStats, isValidGitHubUrl } from '../normalize';

const minimalRepoFixture = {
  id: 123,
  name: 'repo',
  full_name: 'owner/repo',
  description: 'A test repo',
  html_url: 'https://github.com/owner/repo',
  homepage: null,
  stargazers_count: 42,
  forks_count: 10,
  watchers_count: 30,
  language: 'TypeScript',
  topics: ['astro'],
  updated_at: '2026-03-14T12:00:00Z',
  pushed_at: '2026-03-14T12:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  size: 100,
  open_issues_count: 5,
  license: { key: 'mit', name: 'MIT License', spdx_id: 'MIT' },
  archived: false,
  disabled: false,
};

describe('normalizeRepo', () => {
  it('transforms GitHub response to internal model', () => {
    const normalized = normalizeRepo(minimalRepoFixture);
    expect(normalized).toMatchObject({
      id: 123,
      name: 'repo',
      fullName: 'owner/repo',
      stars: 42,
      forks: 10,
      language: 'TypeScript',
      isArchived: false,
    });
    expect(normalized.license).toEqual({ name: 'MIT License', spdxId: 'MIT' });
  });

  it('handles null description', () => {
    const normalized = normalizeRepo({ ...minimalRepoFixture, description: null });
    expect(normalized.description).toBeNull();
  });

  it('handles missing topics', () => {
    const normalized = normalizeRepo({ ...minimalRepoFixture, topics: undefined });
    expect(normalized.topics).toEqual([]);
  });

  it('throws validation error for invalid data', () => {
    expect(() => normalizeRepo({ invalid: 'data' })).toThrow();
  });
});

describe('parseGitHubUrl', () => {
  it('parses standard GitHub URLs', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('handles .git suffix', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo.git')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('handles trailing slashes', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo/')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it('returns null for invalid URLs', () => {
    expect(parseGitHubUrl('not-a-url')).toBeNull();
    expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
    expect(parseGitHubUrl('https://github.com/owner')).toBeNull();
  });
});

describe('extractCardStats', () => {
  it('extracts minimal stats for cards', () => {
    const fullStats = normalizeRepo(minimalRepoFixture);
    const cardStats = extractCardStats(fullStats);
    expect(cardStats).toEqual({
      stars: 42,
      forks: 10,
      language: 'TypeScript',
      updatedAt: '2026-03-14T12:00:00Z',
    });
  });
});

describe('isValidGitHubUrl', () => {
  it('returns true for valid GitHub URLs', () => {
    expect(isValidGitHubUrl('https://github.com/a/b')).toBe(true);
  });
  it('returns false for non-GitHub URLs', () => {
    expect(isValidGitHubUrl('https://gitlab.com/a/b')).toBe(false);
  });
});
