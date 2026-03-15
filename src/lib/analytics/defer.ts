/**
 * Defers non-critical analytics work to avoid blocking initial rendering.
 * Uses requestIdleCallback when available, with a setTimeout fallback.
 */
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

