export interface PageViewEvent {
  event: 'page_view';
  page_name: string;
  page_category: string;
}

export interface SearchUsedEvent {
  event: 'search_used';
  search_term: string;
  search_context: string;
  results_count: number;
}

export interface FilterChangeEvent {
  event: 'filter_change';
  filter_type: string;
  filter_values: string[];
  results_count: number;
}

export interface ProjectClickEvent {
  event: 'project_click';
  project_slug: string;
  project_title: string;
  project_domain: string;
  project_featured: boolean;
  click_context: string;
}

export interface RepoClickEvent {
  event: 'repo_click';
  project_slug: string;
  repo_url: string;
  link_type: 'github';
}

export interface OutboundLinkClickEvent {
  event: 'outbound_link_click';
  project_slug: string;
  link_url: string;
  link_type: 'live_demo' | 'external';
}

export interface FilterCombinationEvent {
  event: 'filter_combination';
  filters: string;
  filter_count: number;
  results_count: number;
}

export interface WebVitalsEvent {
  event: 'web_vitals';
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}

export type ProjectsPageEvent =
  | PageViewEvent
  | SearchUsedEvent
  | FilterChangeEvent
  | ProjectClickEvent
  | RepoClickEvent
  | OutboundLinkClickEvent
  | FilterCombinationEvent
  | WebVitalsEvent;

declare global {
  interface Window {
    dataLayer?: ProjectsPageEvent[];
  }
}
