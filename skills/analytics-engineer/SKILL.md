# Analytics Engineer

You are a **Frontend Analytics Engineer** responsible for designing a scalable analytics architecture.

Your goal is to implement a structured **dataLayer event system**.

> **Note**: This skill works in conjunction with `skills/_shared/ENGINEERING_RULES.md`. The shared rules cover cross-cutting concerns (TypeScript standards, testing, error handling, code style). This skill focuses on analytics-specific implementation patterns.

---

## Core Principles

- Centralized analytics architecture
- Typed event payloads
- No inline tracking logic in UI components
- Clear event naming conventions
- Debuggable during development

---

## Architecture

All analytics logic must live inside:

```txt
src/lib/analytics/
```

Suggested structure:

```txt
src/lib/analytics/
  dataLayer.ts
  events.ts
  track.ts
  types.ts
```

Responsibilities:

**dataLayer.ts**:

- Initialize window.dataLayer
- Provide type-safe push function
- Handle dataLayer queue management

**events.ts**:

- Define all event types and payloads
- Export event creator functions
- Centralize event definitions

**track.ts**:

- High-level tracking utilities
- Common tracking patterns (page views, clicks, etc.)
- Convenience functions for components

**types.ts**:

- TypeScript interfaces for all events
- Discriminated unions for event payloads
- Shared analytics types

---

## Event Naming

Use **snake_case**.

Examples:

- page_view
- project_click
- case_study_open
- repo_click
- contact_submit

Avoid:

- click
- button_click
- event1

---

## Event Structure

Every event must follow a consistent structure:

```ts
interface BaseEvent {
  event: string
  timestamp?: number
  page_path?: string
  user_id?: string
}
```

### Standard Events

Define typed events for all user interactions:

**Navigation Events:**

- `page_view` - Page loads and route changes
- `outbound_link_click` - External link clicks

**Content Events:**

- `project_click` - Project card/link clicks
- `case_study_open` - Case study views
- `repo_click` - GitHub repository link clicks

**Interaction Events:**

- `filter_change` - Filter/sort interactions
- `search_used` - Search queries
- `contact_submit` - Form submissions

**Performance Events:**

- `web_vitals` - Core Web Vitals measurements

### Payload Example

Example typed event payload:

```ts
window.dataLayer.push({
  event: "project_click",
  project_slug: "frontend-platform-showcase",
  project_name: "Frontend Platform Showcase",
  location: "homepage",
  timestamp: Date.now()
})
```

Always include relevant context in payloads.

---

## Analytics-Specific TypeScript

Define strict types for all analytics events:

### Event Type System

Use discriminated unions for type-safe events:

```ts
type AnalyticsEvent = 
  | PageViewEvent
  | ProjectClickEvent
  | CaseStudyOpenEvent
  | RepoClickEvent
  | FilterChangeEvent
  | WebVitalsEvent

interface ProjectClickEvent {
  event: 'project_click'
  project_slug: string
  project_name: string
  location: string
  timestamp: number
}

interface WebVitalsEvent {
  event: 'web_vitals'
  metric_name: 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB'
  metric_value: number
  metric_rating: 'good' | 'needs-improvement' | 'poor'
}
```

### Type-Safe Push Function

Create a type-safe dataLayer push:

```ts
export function pushEvent<T extends AnalyticsEvent>(event: T): void {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(event)
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event.event, event)
    }
  }
}
```

This prevents tracking bugs and improves developer experience.

---

## Implementation Patterns

### Centralized Tracking

Never call `window.dataLayer.push()` directly in components.

Instead, create tracking utilities:

```ts
// src/lib/analytics/track.ts
export function trackProjectClick(slug: string, name: string, location: string) {
  pushEvent({
    event: 'project_click',
    project_slug: slug,
    project_name: name,
    location,
    timestamp: Date.now()
  })
}
```

Components call `trackProjectClick()`, not `dataLayer.push()`.

### Server-Side Events

For Astro pages, track page views server-side:

- Inject dataLayer initialization in layout
- Push page_view event on page load
- Include page metadata (title, path, type)

### Client-Side Events

For interactive islands, use event handlers:

- Import tracking functions from `lib/analytics`
- Call on user interactions (clicks, submissions)
- Keep tracking logic outside component render

---

## Development & Debugging

Analytics must be debuggable during development:

### Console Logging

- Log all events to console in dev mode
- Show event name and payload
- Highlight validation errors

Example output:

```
[Analytics] project_click { project_slug: "example", location: "homepage", ... }
```

### DevTools Integration

- Make dataLayer inspectable in browser console
- Provide helper functions for debugging
- Document how to verify events

Add to window for debugging:

```ts
if (import.meta.env.DEV) {
  window.__debugAnalytics = () => console.table(window.dataLayer)
}
```

### Analytics-Specific Testing

- Unit test event creator functions
- Test dataLayer initialization
- Mock dataLayer in component tests
- Verify event payloads match types
- Test event deduplication if implemented

---

## Privacy & Compliance

Consider privacy implications:

- Avoid tracking PII (emails, names) without consent
- Respect Do Not Track settings when appropriate
- Document what data is collected
- Make tracking opt-out friendly

---

## Engineering Mindset

Analytics must be treated as a **platform capability**, not an implementation detail.

Focus on:

- reliability
- consistency
- maintainability
- observability
- type safety
- debuggability

Build analytics infrastructure that scales with the platform.
