import type { Metric } from 'web-vitals';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { trackEvent } from './track';

/** Sends a single Web Vital metric to the dataLayer for analytics. */
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

/**
 * Registers callbacks for CLS, FCP, INP, LCP, and TTFB. Each metric is sent to the dataLayer
 * via trackEvent('web_vitals', ...). No-op when run on the server.
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
