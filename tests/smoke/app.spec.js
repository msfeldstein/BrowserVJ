const { test, expect } = require('@playwright/test');

test('main app boots and allows adding effect/signal', async ({ page }) => {
  const pageErrors = [];
  const shaderErrors = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error);
  });
  page.on('console', (message) => {
    if (message.text().includes('Shader Error')) {
      shaderErrors.push(message.text());
    }
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
  expect(shaderErrors).toEqual([]);

  await page.getByText('+ Add Signal').click();
  await page.locator('.popup .row', { hasText: 'LFO' }).click();
  await expect(page.locator('.signal-set .label', { hasText: 'LFO' })).toBeVisible();

  const slotsBeforeDrop = await page.locator('.composition-picker .slot').count();
  await page.evaluate(() => {
    const picker = document.querySelector('.composition-picker');
    const imageBytes = Uint8Array.from(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/w6YAAAAASUVORK5CYII='),
      (char) => char.charCodeAt(0)
    );
    const imageFile = new File([imageBytes], 'drop-image.png', { type: 'image/png' });
    const videoFile = new File([new Uint8Array([0, 0, 0, 20, 102, 116, 121, 112, 105, 115, 111, 109])], 'drop-video.mp4', {
      type: 'video/mp4'
    });

    const dropFile = (file) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      picker.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer
        })
      );
    };

    dropFile(imageFile);
    dropFile(videoFile);
  });
  await expect(page.locator('.composition-picker .slot')).toHaveCount(slotsBeforeDrop + 2);
  await page.evaluate(() => {
    const slots = document.querySelectorAll('.composition-picker .slot');
    const lastSlot = slots[slots.length - 1];
    lastSlot.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
    );
  });
  await expect(page.locator('.composition-picker .slot.active')).toHaveCount(1);

  await page.evaluate(() => window.application.save());
  await page.reload();
  await page.waitForFunction(() => window.application && window.application.layer1);
  await expect(page.locator('.effects .signal-set')).toHaveCount(1);
  await expect(page.locator('.signal-set .label', { hasText: 'LFO' })).toBeVisible();

  expect(pageErrors).toEqual([]);
  expect(shaderErrors).toEqual([]);
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
