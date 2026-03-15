# Headless Platform Showcase

A high-performance Astro + React engineering portfolio and platform demo showcasing headless architecture, GitHub API integration, analytics via dataLayer, Web Vitals instrumentation, MDX case studies, and scalable frontend patterns.

## Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd headless-platform-showcase
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **(Optional) GitHub token for repo stats**
   - Copy `.env.example` to `.env`
   - Add a [GitHub personal access token](https://github.com/settings/tokens) (no scopes required for public repos)
   - Without a token: 60 requests/hour (unauthenticated). With token: 5,000 requests/hour.
   - The projects page will still work without a token; repo stats (stars, forks) may be missing if the limit is hit.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

5. **Build for production**

   ```bash
   npm run build
   npm run preview
   ```

**Note:** Replace placeholder project content in `src/content/projects/` with real project data, GitHub URLs, and thumbnails before production.

## App Structure

```txt
headless-platform-showcase/
  planning/
    PLANNING.md
  docs/
    WORKFLOW.md
  skills/
    _shared/
      ENGINEERING_RULES.md
    astro-platform-architect/
      SKILL.md
    github-api-engineer/
      SKILL.md
    analytics-engineer/
      SKILL.md
    web-vitals-engineer/
      SKILL.md
    mdx-content-architect/
      SKILL.md
    accessibility-seo-reviewer/
      SKILL.md
    platform-reviewer/
      SKILL.md
    devops-engineer/
      SKILL.md
    ui-design-engineer/
      SKILL.md
    testing-engineer/
      SKILL.md
```
