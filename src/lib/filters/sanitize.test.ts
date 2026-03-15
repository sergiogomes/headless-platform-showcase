import { describe, it, expect } from 'vitest';
import { sanitizeSearchQuery } from './sanitize';

describe('sanitizeSearchQuery', () => {
  it('trims whitespace', () => {
    expect(sanitizeSearchQuery('  react  ')).toBe('react');
  });

  it('collapses multiple spaces', () => {
    expect(sanitizeSearchQuery('react   typescript')).toBe('react typescript');
  });

  it('limits length to 200 characters', () => {
    const long = 'a'.repeat(300);
    expect(sanitizeSearchQuery(long).length).toBe(200);
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeSearchQuery('')).toBe('');
    expect(sanitizeSearchQuery('   ')).toBe('');
  });
});
