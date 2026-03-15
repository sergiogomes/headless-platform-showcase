# Astro v6 Migration Guide

## Overview

This document outlines the migration path from Astro v5 to v6 for the Headless Platform Showcase project. Based on the official [Astro v6 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v6/), this analysis identifies specific changes needed for our codebase.

## Current State Analysis

### Dependencies (package.json)

- **Astro**: Currently on `^5.0.3`
- **Zod**: Currently on `^3.23.8` (needs upgrade to v4)
- **Node**: Project should verify Node 22+ compatibility
- **Vitest**: Currently on `^2.1.6` (compatible)

### Project Configuration

- **astro.config.mjs**: Simple static site configuration with React and Tailwind
- **vitest.config.ts**: Already using `environment: 'node'` (v6 compatible)
- **No experimental flags**: Clean configuration
- **No legacy flags**: No backwards compatibility issues

### Content Collections Status

Our content collections are **already v5 Content Layer API compliant**:

- ✅ Using `src/content/config.ts` (correct location)
- ✅ Using `defineCollection` and `z` from `astro:content`
- ❌ **BREAKING**: Using deprecated `type: 'content'` (must be removed)
- ✅ No usage of legacy `slug` or `render()` methods
- ✅ Using modern `getCollection()` API

## Required Changes

### 1. Critical: Content Collections Migration

**File**: `src/content/config.ts`

**Issue**: Collection defines `type: 'content'` which is no longer supported in v6.

**Action Required**:

```typescript
// BEFORE (v5)
const projectsCollection = defineCollection({
  type: 'content',  // ❌ Remove this
  schema: projectSchema,
});

// AFTER (v6)
import { glob } from 'astro/loaders';

const projectsCollection = defineCollection({
  loader: glob({ 
    pattern: '**/[^_]*.{md,mdx}', 
    base: './src/content/projects' 
  }),
  schema: projectSchema,
});
```

**Impact**: HIGH - Build will fail without this change.

### 2. Critical: Zod v4 Upgrade

**Files**: All schema definitions, particularly `src/content/config.ts`

**Current Zod Usage**:

- `z.string().url()` - Still valid in v4
- `z.coerce.date()` - Still valid in v4
- `z.enum()` - Still valid in v4
- `z.array()` - Still valid in v4
- `.default()` - **Potential issue with transforms**

**Action Required**:

1. Update package.json:

   ```json
   "dependencies": {
     "zod": "^4.0.0"
   }
   ```

2. Review schema for transform + default combinations:

   ```typescript
   // If we had this pattern (we don't currently):
   // BEFORE (v3)
   views: z.string().transform(Number).default("0")
   
   // AFTER (v4)
   views: z.string().transform(Number).default(0)  // Default must match output type
   ```

3. Import Zod from `astro/zod` for consistency:

   ```typescript
   // BEFORE
   import { defineCollection, z } from 'astro:content';
   
   // AFTER (recommended)
   import { defineCollection } from 'astro:content';
   import { z } from 'astro/zod';
   ```

**Impact**: MEDIUM - Schema validation may break if not updated correctly.

### 3. Medium: import.meta.env Behavior Change

**Files Affected**:

- `src/lib/analytics/track.ts` (line 17)
- `src/lib/github/client.ts` (line 17 comment)
- `src/lib/github/errors.ts` (line 86)
- `src/pages/projects.astro` (line 18)

**Issue**: In v6, `import.meta.env` values are always inlined and never coerced. Type coercion must be explicit.

**Current Usage**:

```typescript
// src/lib/analytics/track.ts
if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  console.log('[Analytics]', event, data);
}
```

**Action Required**:
Our current usage is safe because:

- We only check `import.meta.env.DEV` (boolean, no coercion needed)
- We use optional chaining (`?.`) which handles undefined safely
- We don't use non-public env vars that would need `process.env`

**Verification Needed**:

- Ensure `GITHUB_TOKEN` (if used) is accessed correctly
- Check if any env vars need explicit type conversion

**Impact**: LOW - Current code appears compatible, but needs testing.

### 4. Low: Node Version Requirement

**Action Required**:

1. Update `.nvmrc` (if exists) or create one:

   ```txt
   22.12.0
   ```

2. Update CI/CD pipelines to use Node 22+

3. Verify deployment environment supports Node 22

**Impact**: LOW - Infrastructure change, no code changes needed.

### 5. Low: Vite 7.0 Compatibility

**Action Required**:

- Review any custom Vite plugins (we have none currently)
- Test build process after upgrade
- No code changes expected for our simple configuration

**Impact**: LOW - Astro handles Vite internally.

## Migration Steps

### Phase 1: Pre-Migration Preparation

1. ✅ Review current Astro version (`^5.0.3`)
2. ✅ Audit content collections structure
3. ✅ Check for experimental/legacy flags (none found)
4. ✅ Identify breaking changes applicable to our codebase
5. ⏳ Create backup branch: `git checkout -b pre-v6-backup`

### Phase 2: Dependency Updates

1. Update Node version requirement:

   ```bash
   echo "22.12.0" > .nvmrc
   ```

2. Update package.json dependencies:

   ```json
   {
     "dependencies": {
       "astro": "^6.0.0",
       "zod": "^4.0.0",
       "@astrojs/react": "^5.0.0",
       "@astrojs/tailwind": "^6.0.0"
     }
   }
   ```
   Install with `npm install --legacy-peer-deps` until `@astrojs/tailwind` declares Astro 6 peer support.

3. (Optional) Run upgrade command: `npx @astrojs/upgrade` (may fail to resolve "latest"; manual version bumps above are sufficient.)

### Phase 3: Content Collections Migration

1. **Move** config to `src/content.config.ts` (v6 location) and update:
   - Import `defineCollection` from `astro:content`; `z` from `astro/zod`; `glob` from `astro/loaders`
   - Remove `type: 'content'` and add `loader: glob({ pattern, base, generateId })`
   - Use Zod v4 APIs (e.g. `z.url().optional()` instead of `z.string().url().optional()`)
   - Remove legacy `src/content/config.ts`

2. Test content collection queries:

   ```bash
   npm run build
   ```

### Phase 4: Code Updates

1. Review and update Zod schemas (if needed)
2. Test `import.meta.env` usage in development
3. Verify environment variable access patterns

### Phase 5: Testing & Validation

1. Run type checking:

   ```bash
   npm run check
   ```

2. Run tests:

   ```bash
   npm test
   ```

3. Test development server:

   ```bash
   npm run dev
   ```

4. Test production build:

   ```bash
   npm run build
   npm run preview
   ```

5. Verify:
   - ✅ Content collections load correctly
   - ✅ Projects page renders
   - ✅ Analytics tracking works
   - ✅ GitHub API integration works
   - ✅ All routes accessible

### Phase 6: Documentation Updates

1. Update README.md with Node 22 requirement
2. Update WORKFLOW.md if needed
3. Document any new patterns or changes

## Breaking Changes Not Applicable

The following v6 breaking changes **do not affect** our project:

### ✅ Not Using

- `Astro.glob()` - We use `getCollection()` ✅
- `ViewTransitions` component - Not used ✅
- `emitESMImage()` - Not used ✅
- `getStaticPaths()` - No dynamic routes ✅
- `astro:actions` - Not using Actions API ✅
- `astro:ssr-manifest` - Static site, no SSR ✅
- Custom adapters - Static output only ✅
- Session drivers - Not using sessions ✅
- CommonJS config - Using ESM ✅
- Experimental flags - None in use ✅

### ✅ Already Compatible

- **Script/style ordering**: No issues expected
- **Trailing slashes**: No custom endpoints with file extensions
- **Markdown heading IDs**: No manual heading links
- **Vitest environment**: Already using `node` ✅
- **Rollup config**: No custom Rollup configuration

## Validation steps (Node 22 only)

Run these with Node ≥22.12.0 (e.g. `nvm use`):

```bash
npm run build
npm run dev          # then open /projects, check console
npm run preview      # production build
```

Optional: verify installed versions:

```bash
npm list astro zod @astrojs/react @astrojs/tailwind
```

Optional: create a backup tag before merging (use commit hash from before migration):

```bash
git tag v5-last-working-state <commit-hash-before-migration>
```

## Rollback Plan

If migration fails:

1. Revert to backup branch (if created) or backup tag:

   ```bash
   git checkout pre-v6-backup
   # or: git checkout v5-last-working-state
   ```

2. Restore dependencies:

   ```bash
   npm install
   ```

3. Document issues encountered

4. Consider staged migration:
   - Migrate content collections first
   - Test thoroughly
   - Then upgrade Astro version

## Post-Migration Checklist

- [ ] All builds pass without errors (requires Node >=22.12.0: `nvm use` then `npm run build`)
- [x] All tests pass (24 tests)
- [ ] Development server runs correctly (`npm run dev` with Node 22)
- [ ] Production build generates expected output
- [ ] Content collections load and render
- [ ] Analytics tracking works
- [ ] GitHub API integration works
- [ ] No console errors in browser
- [ ] Performance metrics unchanged or improved
- [x] Documentation updated (README, migration doc)
- [ ] Team notified of changes

## Known Issues & Considerations

### Content Collections

- **Migration complexity**: LOW - We only need to add a loader and remove `type`
- **Data location**: Content is in `src/content/projects/` - verify glob pattern matches
- **Schema compatibility**: Our schema is simple and should work without changes

### Environment Variables

- **GITHUB_TOKEN**: Verify this works correctly if used in build
- **DEV flag**: Our usage is safe but test thoroughly

### Dependencies

- **React**: `@astrojs/react` v5 used (Astro 6–compatible)
- **Tailwind**: `@astrojs/tailwind` v6 used; install with `--legacy-peer-deps` until it declares Astro 6 peer support
- Check integration changelogs for any further breaking changes

## Resources

- [Official Astro v6 Upgrade Guide](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [Astro v6 Changelog](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md)
- [Zod v4 Migration Guide](https://zod.dev)
- [Content Layer API Documentation](https://docs.astro.build/en/guides/content-collections/)

## Timeline Estimate

- **Preparation**: 1 hour
- **Dependency Updates**: 30 minutes
- **Content Collections Migration**: 1-2 hours
- **Testing**: 2-3 hours
- **Documentation**: 1 hour

**Total Estimated Time**: 5-7 hours

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Content collections break | Medium | High | Test thoroughly, have rollback ready |
| Zod schema issues | Low | Medium | Review schema carefully, test validation |
| Build failures | Low | High | Incremental migration, good test coverage |
| Environment variable issues | Low | Low | Limited usage, easy to fix |
| Integration incompatibilities | Low | Medium | Check integration changelogs first |

## Success Criteria

Migration is successful when:

1. ✅ Project builds without errors
2. ✅ All tests pass
3. ✅ Development experience unchanged or improved
4. ✅ Production output is correct
5. ✅ No runtime errors
6. ✅ Performance is maintained or improved
7. ✅ Team can continue development without issues

---

**Status**: ✅ Migration implemented (Node 22 required for `npm run build`)  
**Last Updated**: 2026-03-15  
**Next Review**: After migration completion
