import { describe, it, expect, vi } from 'vitest';
import type { Metric } from 'web-vitals';
import { initWebVitals } from './webVitals';
import { trackEvent } from './track';

vi.mock('./track', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('web-vitals', () => {
  return {
    onCLS: vi.fn(),
    onFCP: vi.fn(),
    onINP: vi.fn(),
    onLCP: vi.fn(),
    onTTFB: vi.fn(),
  };
});

describe('initWebVitals', () => {
  it('registers all web vitals callbacks when window is defined', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = {};

    const { initWebVitals: freshInit } = await import('./webVitals');
    const webVitals = await import('web-vitals');
    const mocked = vi.mocked(webVitals);

    freshInit();

    expect(mocked.onCLS).toHaveBeenCalledTimes(1);
    expect(mocked.onFCP).toHaveBeenCalledTimes(1);
    expect(mocked.onINP).toHaveBeenCalledTimes(1);
    expect(mocked.onLCP).toHaveBeenCalledTimes(1);
    expect(mocked.onTTFB).toHaveBeenCalledTimes(1);
  });

  it('routes metrics to trackEvent with navigationType when available', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = {};

    const { initWebVitals: freshInit } = await import('./webVitals');
    const webVitals = await import('web-vitals');
    const mocked = vi.mocked(webVitals);

    freshInit();

    const metric: Metric & { navigationType?: string } = {
      name: 'LCP',
      value: 1234,
      delta: 1234,
      id: 'v3-123',
      rating: 'good',
      // @ts-expect-error - not all properties are required for this test
      valueAtTTFB: 0,
      navigationType: 'navigate',
    };

    const lcpCallback = mocked.onLCP.mock.calls[0][0];
    lcpCallback(metric);

    expect(trackEvent).toHaveBeenCalledWith(
      'web_vitals',
      expect.objectContaining({
        name: 'LCP',
        value: 1234,
        id: 'v3-123',
        delta: 1234,
        rating: 'good',
        navigationType: 'navigate',
      })
    );
  });
});

