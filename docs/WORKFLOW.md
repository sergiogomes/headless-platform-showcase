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

**Phase 1: Architecture** (new chat)

```txt
@astro-platform-architect

Design the projects page.
Output: docs/features/projects-page.md
```

**Phase 2: Implementation** (new chat)

```txt
@github-api-engineer

Read: docs/features/projects-page.md
Implement the GitHub data layer.
```

**Phase 3: Audit** (new chat, if UI involved)

```txt
@accessibility-seo-reviewer

Review: src/pages/projects.astro
Output: docs/reviews/projects-audit.md
```

**Phase 4: Review** (new chat)

```txt
@platform-reviewer

Review the projects page.
Read: docs/features/projects-page.md
Read: docs/reviews/projects-audit.md
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

## Tips

- **One skill per chat** for context efficiency
- **Create handoff docs** in `docs/features/` or `docs/reviews/`
- **Always review** before finalizing
