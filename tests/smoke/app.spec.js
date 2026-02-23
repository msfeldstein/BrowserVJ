const { test, expect } = require('@playwright/test');

test('main app boots and allows adding effect/signal', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error);
  });

  await page.goto('/');
  await expect(page.locator('#output')).toBeVisible();

  await page.waitForFunction(() => window.application && window.application.layer1);

  const canvasSize = await page.locator('#output').evaluate((canvas) => ({
    width: canvas.width,
    height: canvas.height
  }));
  expect(canvasSize.width).toBeGreaterThan(0);
  expect(canvasSize.height).toBeGreaterThan(0);

  await page.getByText('+ Add Effect').first().click();
  await page.locator('.popup .row', { hasText: 'Zoom Blur' }).click();
  await expect(page.locator('.effects .signal-set')).toHaveCount(1);

  await page.getByText('+ Add Signal').click();
  await page.locator('.popup .row', { hasText: 'LFO' }).click();
  await expect(page.locator('.signal-set .label', { hasText: 'LFO' })).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test('output page can load standalone', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error);
  });

  await page.goto('/output.html');
  await expect(page.locator('#output-canvas')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
