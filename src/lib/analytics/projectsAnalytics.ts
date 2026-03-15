import { trackEvent } from './track';

/**
 * Sets up a single click listener on document that finds elements with data-analytics-event
 * and pushes project_click, repo_click, or outbound_link_click to the dataLayer based on
 * the attribute and other data-* attributes. Call once after the projects page is mounted.
 */
export function initProjectsAnalytics(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest<HTMLElement>('[data-analytics-event]');
    if (!link) return;

    const eventType = link.getAttribute('data-analytics-event');
    const projectSlug = link.getAttribute('data-analytics-project') ?? '';

    if (eventType === 'project_click') {
      trackEvent('project_click', {
        project_slug: projectSlug,
        project_title: link.getAttribute('data-analytics-title') ?? '',
        project_domain: link.getAttribute('data-analytics-domain') ?? '',
        project_featured: link.getAttribute('data-analytics-featured') === 'true',
        click_context: 'grid',
      });
    } else if (eventType === 'repo_click') {
      trackEvent('repo_click', {
        project_slug: projectSlug,
        repo_url: (link as HTMLAnchorElement).href,
        link_type: 'github',
      });
    } else if (eventType === 'outbound_link_click') {
      trackEvent('outbound_link_click', {
        project_slug: projectSlug,
        link_url: (link as HTMLAnchorElement).href,
        link_type: 'live_demo',
      });
    }
  });
}
