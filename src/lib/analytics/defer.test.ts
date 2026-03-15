import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deferAnalytics } from './defer';

describe('deferAnalytics', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalWindow) {
      // @ts-expect-error - restoring original window
      globalThis.window = originalWindow;
    } else {
      // @ts-expect-error - cleaning up window
      delete (globalThis as any).window;
    }

    if (originalDocument) {
      // @ts-expect-error - restoring original document
      globalThis.document = originalDocument;
    } else {
      // @ts-expect-error - cleaning up document
      delete (globalThis as any).document;
    }
  });

  it('is a no-op when window or document are undefined', () => {
    // @ts-expect-error - simulating server environment
    delete (globalThis as any).window;
    // @ts-expect-error - simulating server environment
    delete (globalThis as any).document;

    const fn = vi.fn();
    deferAnalytics(fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it('uses requestIdleCallback when available and document is complete', () => {
    const fn = vi.fn();
    const mockRequestIdleCallback = vi.fn((cb: () => void) => cb());

    // @ts-expect-error - partial window mock
    globalThis.window = {
      requestIdleCallback: mockRequestIdleCallback,
      addEventListener: vi.fn(),
    };
    // @ts-expect-error - partial document mock
    globalThis.document = { readyState: 'complete' };

    deferAnalytics(fn);

    expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('falls back to setTimeout when requestIdleCallback is not available', () => {
    const fn = vi.fn();

    // @ts-expect-error - partial window mock
    globalThis.window = {
      addEventListener: vi.fn(),
    };
    // @ts-expect-error - partial document mock
    globalThis.document = { readyState: 'complete' };

    deferAnalytics(fn);

    expect(fn).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('waits for load when document is not complete', () => {
    const fn = vi.fn();
    const listeners: Record<string, () => void> = {};

    // @ts-expect-error - partial window mock
    globalThis.window = {
      requestIdleCallback: (cb: () => void) => cb(),
      addEventListener: vi.fn((event: string, cb: () => void) => {
        listeners[event] = cb;
      }),
    };
    // @ts-expect-error - partial document mock
    globalThis.document = { readyState: 'loading' };

    deferAnalytics(fn);

    expect(fn).not.toHaveBeenCalled();

    // Simulate load event
    listeners.load();

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

