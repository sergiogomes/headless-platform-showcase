import { describe, it, expect, beforeEach } from 'vitest';
import type { ProjectsPageEvent } from '../../types/analytics';
import { initProjectsAnalytics } from './projectsAnalytics';

declare global {
  interface Window {
    dataLayer?: ProjectsPageEvent[];
  }
}

describe('initProjectsAnalytics', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // @ts-expect-error - deleting possibly undefined property for test isolation
    delete window.dataLayer;
  });

  it('tracks project_click events from data attributes', () => {
    initProjectsAnalytics();

    const link = document.createElement('a');
    link.setAttribute('data-analytics-event', 'project_click');
    link.setAttribute('data-analytics-project', 'test-project');
    link.setAttribute('data-analytics-title', 'Test Project');
    link.setAttribute('data-analytics-domain', 'media');
    link.setAttribute('data-analytics-featured', 'true');
    document.body.appendChild(link);

    link.click();

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer?.[0]).toMatchObject({
      event: 'project_click',
      project_slug: 'test-project',
      project_title: 'Test Project',
      project_domain: 'media',
      project_featured: true,
    });
  });

  it('ignores clicks without analytics attributes', () => {
    initProjectsAnalytics();

    const link = document.createElement('a');
    document.body.appendChild(link);

    link.click();

    expect(window.dataLayer).toBeUndefined();
  });
});

