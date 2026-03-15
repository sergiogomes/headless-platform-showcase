# Web Vitals Tracking Strategy

This document describes how Core Web Vitals are measured, reported, and analyzed in the Headless Platform Showcase.

## Goals

- **Measure real user performance** using Core Web Vitals
- **Avoid impacting user experience** while collecting metrics
- **Integrate with the existing analytics data layer**
- **Provide actionable insights** (not just raw numbers)

## Metrics Tracked

We track the standard Core Web Vitals using the official `web-vitals` library:

- **LCP** (Largest Contentful Paint) – loading performance
- **CLS** (Cumulative Layout Shift) – visual stability
- **INP** (Interaction to Next Paint) – responsiveness
- **FCP** (First Contentful Paint) – initial render
- **TTFB** (Time to First Byte) – server response time

Each metric is captured as a `web_vitals` event in the analytics data layer.

## Architecture

- **Measurement library**: `web-vitals` (Google-maintained)
- **Measurement module**: `src/lib/analytics/webVitals.ts`
- **Analytics transport**: `trackEvent()` → `window.dataLayer`
- **Global initialization point**: `BaseLayout.astro`

High-level flow:

1. `BaseLayout.astro` defers initialization of `initWebVitals()` using `deferAnalytics`.
2. `initWebVitals()` registers listeners (`onCLS`, `onFCP`, `onINP`, `onLCP`, `onTTFB`) with the `web-vitals` library.
3. When a metric is reported, `sendToAnalytics()` normalizes it and calls `trackEvent('web_vitals', payload)`.
4. `trackEvent` pushes a typed event onto `window.dataLayer` for GTM/GA4 or other consumers.

## Event Shape

Web Vitals are represented in the analytics types as:

```51:59:src/types/analytics.ts
export interface WebVitalsEvent {
  event: 'web_vitals';
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}
```

The actual payload pushed to the data layer includes:

- `name` – metric name (e.g. `LCP`)
- `value` – metric value
- `delta` – change since last report
- `id` – unique identifier for the metric
- `rating` – `"good" | "needs-improvement" | "poor"`
- `navigationType` – optional navigation context (`navigate`, `reload`, `back-forward`, `prerender`)

## Initialization & Deferral

To protect Core Web Vitals, Web Vitals initialization is **deferred** so it never competes with the critical rendering path.

### Shared deferral utility

The shared helper `deferAnalytics` lives in `src/lib/analytics/defer.ts`:

```1:18:src/lib/analytics/defer.ts
export function deferAnalytics(fn: () => void): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const run = () => {
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(fn);
    } else {
      setTimeout(fn, 0);
    }
  };

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run, { once: true });
  }
}
```

This utility:

- Uses `requestIdleCallback` when available
- Falls back to `setTimeout(fn, 0)` for older browsers
- Waits for full `load` when needed
- No-ops on the server

### Base layout integration

`BaseLayout.astro` uses `deferAnalytics` to initialize Web Vitals:

```47:50:src/layouts/BaseLayout.astro
    <script>
      import { deferAnalytics } from '../lib/analytics/defer';
      import { initWebVitals } from '../lib/analytics/webVitals';

      deferAnalytics(initWebVitals);
    </script>
```

This guarantees:

- Web Vitals are measured on every page
- Initialization is non-blocking for LCP/FCP/INP
- The pattern is reusable for other analytics modules

## Error Handling

Web Vitals reporting is wrapped in a defensive `try/catch`:

```5:21:src/lib/analytics/webVitals.ts
function sendToAnalytics(metric: Metric) {
  try {
    trackEvent('web_vitals', {
      name: metric.name as 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB',
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
      navigationType: (metric as Metric & { navigationType?: string }).navigationType,
    });
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.error('[Web Vitals] Failed to track metric', metric.name, error);
    }
  }
}
```

If analytics transport fails:

- The Web Vitals library continues to function.
- The user experience is unaffected.
- Debug logs in the console make failures observable in development and QA.

## Testing Strategy

Web Vitals logic is covered by dedicated tests:

```338:412:src/lib/analytics/webVitals.test.ts
describe('initWebVitals', () => {
  it('registers all web vitals callbacks when window is defined', async () => {
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
```

These tests ensure:

- All Web Vitals callbacks are registered when expected.
- Metric payloads flow correctly into `trackEvent`.
- `navigationType` is propagated into analytics events.

## How to Debug Web Vitals

1. **In the browser console**
   - Inspect `window.dataLayer` for `web_vitals` events.
   - Confirm that `name`, `value`, `rating`, and `navigationType` look reasonable.
2. **Using DevTools**
   - Use the Performance panel to correlate events with timeline.
   - Run Lighthouse to compare lab scores with real user metrics.
3. **In analytics tooling**
   - Build dashboards that:
     - Segment by `name` (LCP, INP, etc.)
     - Filter by `navigationType`
     - Track P75/P95 over time

## Future Enhancements

Potential future improvements:

- **Attribution builds in development** for deeper debugging (`web-vitals/attribution`).
- **Dashboards and alerts** to watch for regressions (e.g. LCP P75 crossing thresholds).
- **Device and connection segmentation** (mobile vs desktop, 4G vs Wi-Fi) if needed.

