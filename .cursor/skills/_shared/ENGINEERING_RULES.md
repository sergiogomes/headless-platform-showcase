# Engineering Rules

These rules apply to **all engineering tasks performed in this project**.

Every AI skill and generated implementation must follow these guidelines to ensure the platform remains **maintainable, performant, and production-quality**.

---

## Core Engineering Principles

Always prioritize:

- clarity
- maintainability
- performance
- accessibility
- simplicity

Avoid unnecessary complexity.

The goal is to build a **production-grade frontend platform**, not a demo or template project.

---

## Technology Requirements

All code must follow the project's technology stack.

Required technologies:

- Astro
- React islands (only when necessary)
- TypeScript
- MDX for content
- Tailwind CSS for styling

Do not introduce additional frameworks unless absolutely necessary.

---

## TypeScript First

All code must use **TypeScript with strict mode enabled**.

### Requirements

- Enable `strict: true` in tsconfig.json
- Avoid `any` - use `unknown` or proper types instead
- Define explicit return types for functions
- Use type inference where it improves readability
- Create shared types in `src/types/`
- Use discriminated unions for complex types

### Type Organization

Types should live in:

    src/types/        # Shared types
    src/lib/*/types.ts  # Module-specific types

### Examples

Good:

    export function fetchData(id: string): Promise<Data> {
      // implementation
    }

    type Result<T> = 
      | { success: true; data: T }
      | { success: false; error: string }

Bad:

    export function fetchData(id: any): any {
      // implementation
    }

Type safety is non-negotiable for platform-quality code.

---

## Server-First Rendering

Prefer server-rendered content whenever possible.

Rendering priority:

1. Static generation
2. Server rendering
3. Client-side hydration (only when necessary)

Avoid excessive client-side JavaScript.

The platform should follow a **server-first architecture**.

---

## Minimal Client JavaScript

Client-side JavaScript must be minimized.

Use Astro's **islands architecture**.

Rules:

- hydrate components only when needed
- avoid large client bundles
- prefer server-rendered UI

Client JS should be used only for:

- interactive components
- UI state
- dynamic filtering
- analytics tracking

---

## Component Architecture

Follow component-driven design.

Components must be:

- small
- reusable
- predictable
- composable

Avoid:

- large monolithic components
- tightly coupled logic
- hidden side effects

Prefer stateless components when possible.

---

## Folder Structure

Follow the platform architecture.

Primary structure:

    src/
      components/
      content/
      layouts/
      lib/
      pages/
      styles/
      types/

Responsibilities:

- `components` → UI components
- `content` → MDX content collections
- `layouts` → page layouts
- `lib` → services, APIs, utilities
- `pages` → route definitions

Never mix business logic inside UI components.

---

## API and Data Layers

External data sources must be handled through **data service layers**.

Examples:

    src/lib/github/
    src/lib/analytics/
    src/lib/vitals/

Rules:

- UI components must not call APIs directly
- normalize API responses
- keep data access centralized

This keeps the architecture predictable.

---

## Performance First

Performance is a primary engineering goal.

Ensure:

- minimal JavaScript
- optimized images
- lazy loading where appropriate
- minimal layout shifts
- efficient rendering

The platform should aim for **excellent Lighthouse scores**.

---

## Accessibility Baseline

Accessibility must be considered during development.

Ensure:

- semantic HTML
- proper heading hierarchy
- keyboard navigation
- visible focus states
- accessible labels

Accessibility is a **core quality requirement**, not an optional feature.

---

## SEO Baseline

Pages must support proper technical SEO.

Ensure:

- page titles
- meta descriptions
- canonical URLs
- Open Graph metadata
- structured content hierarchy

SEO should be handled through **layout-level abstractions**.

---

## Analytics and Observability

Analytics must be implemented through the internal tracking system.

Use:

    window.dataLayer.push()

All analytics calls must go through the analytics module.

Never place analytics logic directly inside UI components.

---

## Dependencies

Avoid unnecessary dependencies.

Before adding a dependency:

1. Evaluate if native APIs can solve the problem.
2. Prefer lightweight libraries.
3. Avoid large UI frameworks.

Dependencies must remain **minimal and intentional**.

---

## Error Handling

Implement robust error handling at every layer:

### Principles

- Never fail silently
- Provide meaningful error messages
- Log errors appropriately (dev vs production)
- Handle errors at the right level
- Provide fallback states for users

### Patterns

**API Layer:**

    try {
      const data = await fetchData()
      return { success: true, data }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      return { success: false, error: 'Failed to load data' }
    }

**Component Layer:**

- Use Error Boundaries for React islands
- Show user-friendly error states
- Provide retry mechanisms
- Never expose technical details to users

**Validation:**

- Validate inputs at boundaries
- Use Zod or similar for runtime validation
- Fail fast with clear error messages

---

## Testing Standards

Platform-quality code requires comprehensive testing:

### Unit Tests

- Test utility functions
- Test data transformations
- Test validation logic
- Test error handling

### Integration Tests

- Test API integrations with mocks
- Test component interactions
- Test data flows

### E2E Tests

- Test critical user flows
- Test navigation
- Test interactive features

### Tools

- **Vitest** for unit and integration tests
- **Playwright** for E2E tests
- **Testing Library** for component tests
- **MSW** for API mocking

### Coverage

Aim for high test coverage on:

- Business logic in `lib/`
- API clients and queries
- Data normalization functions
- Critical user flows

Don't obsess over 100% coverage, focus on testing what matters.

---

## Code Style

Follow these guidelines:

- readable code
- descriptive variable names
- small functions (prefer < 50 lines)
- clear separation of concerns
- meaningful comments only when needed

Avoid:

- deeply nested logic (max 3-4 levels)
- overly clever abstractions
- premature optimization
- magic numbers (use named constants)
- abbreviations in names

Code should be understandable by other engineers.

### Naming Conventions

- **Components**: PascalCase (`ProjectCard.astro`)
- **Functions**: camelCase (`fetchRepos()`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case for utilities (`normalize-data.ts`)
- **Types**: PascalCase (`interface UserData`)

### Function Guidelines

Keep functions focused:

    // Good - single responsibility
    export function normalizeRepo(raw: unknown): Repo {
      // normalization logic
    }

    // Bad - multiple responsibilities
    export function fetchAndNormalizeAndCacheRepo(id: string) {
      // too much in one function
    }

Break complex functions into smaller, testable units.

---

## Documentation

Engineering decisions should be documented when relevant.

Use:

    docs/

for architecture explanations.

Documentation should focus on:

- architecture decisions
- system design
- tradeoffs
- why, not what (code shows what)

### Code Comments

Use comments sparingly:

**Good comments:**

- Explain non-obvious intent
- Document tradeoffs
- Clarify complex algorithms
- Warn about edge cases

**Bad comments:**

- Narrate what code does
- Redundant explanations
- Outdated information
- Obvious statements

Example:

Good:

    // Use stale-while-revalidate to prevent rate limit exhaustion
    // while keeping data reasonably fresh
    const cached = await getCache(key)

Bad:

    // Get the cache
    const cached = await getCache(key)

---

## Git Practices

Follow clean git practices:

### Commits

- Write clear, descriptive commit messages
- Use conventional commits format when appropriate
- Keep commits focused and atomic
- Commit working code, not broken states

### Branches

- Use descriptive branch names
- Keep branches short-lived
- Merge frequently to avoid drift

### Pull Requests

- Provide clear PR descriptions
- Include context and reasoning
- Reference related issues
- Keep PRs focused and reviewable

---

## Engineering Mindset

Treat this project as a **production-quality frontend platform**.

Focus on:

- long-term maintainability
- predictable architecture
- clear code structure
- performance
- developer experience

Every implementation should reflect **senior-level engineering practices**.
