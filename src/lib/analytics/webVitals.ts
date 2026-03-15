import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { trackEvent } from './track';

/** Sends a single Web Vital metric to the dataLayer for analytics. */
function sendToAnalytics(metric: { name: string; value: number; id: string; delta: number; rating: string }) {
  trackEvent('web_vitals', {
    name: metric.name as 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB',
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
  });
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
