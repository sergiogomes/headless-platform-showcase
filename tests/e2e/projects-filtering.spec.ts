import { test, expect } from '@playwright/test';

test.describe('Projects page filtering', () => {
  test('filters projects via search input', async ({ page }) => {
    await page.goto('/projects');

    const allCards = page.locator('.project-card');
    await expect(allCards).toHaveCountGreaterThan(0);

    const initialVisibleCount = await allCards.filter({
      hasNot: page.locator('[aria-hidden="true"]'),
    }).count();

    await page.fill('#project-search', 'dashboard');
    await page.waitForTimeout(400);

    const visibleAfterSearch = await allCards.filter({
      hasNot: page.locator('[aria-hidden="true"]'),
    }).count();

    expect(visibleAfterSearch).toBeLessThanOrEqual(initialVisibleCount);
    expect(visibleAfterSearch).toBeGreaterThan(0);
  });

  test('filters projects by stack and domain', async ({ page }) => {
    await page.goto('/projects');

    const allCards = page.locator('.project-card');
    await expect(allCards).toHaveCountGreaterThan(0);

    const initialVisibleCount = await allCards.filter({
      hasNot: page.locator('[aria-hidden="true"]'),
    }).count();

    await page.getByRole('button', { name: 'Stack' }).click();
    const firstStackOption = page.locator('.filter-dropdown-item').first();
    await firstStackOption.click();

    await page.getByRole('button', { name: 'Domain' }).click();
    const firstDomainOption = page.locator('.filter-dropdown-item').first();
    await firstDomainOption.click();

    await page.waitForTimeout(400);

    const visibleAfterFilters = await allCards.filter({
      hasNot: page.locator('[aria-hidden="true"]'),
    }).count();

    expect(visibleAfterFilters).toBeLessThanOrEqual(initialVisibleCount);
    expect(visibleAfterFilters).toBeGreaterThan(0);
  });
}

