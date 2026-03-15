# Engineering Workflow

This project uses **specialized AI engineering skills** - each skill is a separate chat/conversation focused on one domain.

---

## Available Skills

| Skill | Use For |
| ----- | ------- |
| `@astro-platform-architect` | Architecture, pages, layouts, components, routing |
| `@github-api-engineer` | GitHub API integration, data fetching, caching |
| `@analytics-engineer` | Event tracking, dataLayer, analytics |
| `@web-vitals-engineer` | Performance monitoring, Core Web Vitals |
| `@mdx-content-architect` | Content collections, case studies, MDX |
| `@accessibility-seo-reviewer` | A11y audits, SEO reviews, semantic HTML |
| `@ui-design-engineer` | Design system, Tailwind config, visual design |
| `@testing-engineer` | Test strategy, Vitest, Playwright, test automation |
| `@devops-engineer` | CI/CD, GitHub Actions, deployment, quality gates |
| `@platform-reviewer` | Architecture reviews, code quality audits |

**Shared:** All skills reference `skills/_shared/ENGINEERING_RULES.md`

---

## Recommended: One Chat Per Skill

**Use separate chats for each phase:**

✅ 5-7x less context per chat  
✅ Clear role boundaries  
✅ Focused expertise  
✅ Better documentation

### Handoff Pattern

Each phase creates a document for the next:

✅ **Phase 1: Architecture** (new chat, Sonnet 4.5)

```txt
@astro-platform-architect

Design the projects page architecture.
Output: docs/features/projects-page-architecture.md
```

✅ **Phase 2: Design System** (new chat, Sonnet 4.5)

```txt
@ui-design-engineer

Read: docs/features/projects-page-architecture.md
Design the UI components (ProjectCard, FilterPanel).
Output: docs/features/projects-page-design.md
```

✅ **Phase 3: Data Layer** (new chat, Sonnet 4.5 for design)

```txt
@github-api-engineer

Read: docs/features/projects-page-architecture.md
Design the GitHub data layer (queries, caching, types).
Output: docs/features/github-data-layer.md
```

✅ **Phase 4: Implementation** (new chat, Auto)

```txt
@astro-platform-architect

Read: docs/features/projects-page-architecture.md
Read: docs/features/projects-page-design.md
Read: docs/features/github-data-layer.md

Implement the projects page, components, and data integration.
```

**Phase 5: Analytics** (new chat, Auto)

```txt
@analytics-engineer

Review: src/pages/projects.astro and components
Add event tracking for:
- page_view
- project_click
- filter_change
```

**Phase 6: Performance** (new chat, Auto)

```txt
@web-vitals-engineer

Review: src/pages/projects.astro
Ensure Web Vitals monitoring is implemented.
Verify performance best practices.
```

**Phase 7: Testing** (new chat, Auto)

```txt
@testing-engineer

Review implementation in:
- src/pages/projects.astro
- src/lib/github/
- src/components/ui/

Write comprehensive tests:
- Unit tests for GitHub queries
- Integration tests for data flow
- E2E tests for filtering
```

**Phase 8: Accessibility Audit** (new chat, Sonnet 4.5)

```txt
@accessibility-seo-reviewer

Review: src/pages/projects.astro and related components
Output: docs/reviews/projects-page-a11y-seo-audit.md
```

**Phase 9: Final Review** (new chat, Sonnet 4.5)

```txt
@platform-reviewer

Review the complete projects page implementation.
Read: docs/features/projects-page-architecture.md
Read: docs/reviews/projects-page-a11y-seo-audit.md

Output: docs/reviews/projects-page-final-review.md
```

**Phase 10: Fixes** (new chat, Auto or Sonnet based on complexity)

```txt
@ui-design-engineer (or relevant skill)

Read: docs/reviews/projects-page-final-review.md
Implement all recommended improvements.
```

---

## Quick Reference

**Building a feature:**

1. Architecture → `@astro-platform-architect`
2. Data layer → `@github-api-engineer` or relevant skill
3. UI audit → `@accessibility-seo-reviewer`
4. Final review → `@platform-reviewer`

**Optimizing performance:**

1. Measure → `@web-vitals-engineer`
2. Fix → `@astro-platform-architect`
3. Review → `@platform-reviewer`

**Adding content:**

1. Design → `@mdx-content-architect`
2. Review → `@accessibility-seo-reviewer`

**Reviewing code:**

1. Domain review → relevant specialist skill
2. Quality review → `@platform-reviewer`

---

## Model Selection Guide

Choose the right model for each skill:

### Use Sonnet 4.5

- `@astro-platform-architect` - Architecture decisions, tradeoffs
- `@github-api-engineer` - Data layer design, caching strategy
- `@mdx-content-architect` - Content schema design
- `@ui-design-engineer` - Design system creation, synthesis
- `@accessibility-seo-reviewer` - Comprehensive audits
- `@platform-reviewer` - Code reviews, quality assessment
- `@web-vitals-engineer` - Performance strategy

**Why:** Requires deep reasoning, nuanced judgment, architectural thinking

### Use Cursor Auto

- `@ui-design-engineer` - Component implementation (after design)
- `@analytics-engineer` - Event tracking implementation
- `@testing-engineer` - Writing tests following patterns
- `@devops-engineer` - CI/CD configuration files

**Why:** Following established patterns, repetitive work, faster and cheaper

### Hybrid Approach

- **Design phase** → Sonnet 4.5
- **Implementation phase** → Cursor Auto
- **Review phase** → Sonnet 4.5

---

## Tips

- **One skill per chat** for context efficiency
- **Create handoff docs** in `docs/features/` or `docs/reviews/`
- **Choose model based on task complexity** (see guide above)
- **Always review** before finalizing
