import type { ProjectsPageEvent } from '../../types/analytics';

/**
 * Pushes a typed event onto window.dataLayer (GTM-compatible). No-op when run on the server.
 * In development, also logs the event to the console.
 */
export function trackEvent<T extends ProjectsPageEvent>(
  event: T['event'],
  data: Omit<T, 'event'>
): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    ...data,
  } as T);
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[Analytics]', event, data);
  }
}
