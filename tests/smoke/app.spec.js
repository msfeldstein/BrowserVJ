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

  const builtInCompositionCount = await page.locator('.composition-picker .slot').count();
  expect(builtInCompositionCount).toBeGreaterThan(1);

  const blendOpacityCheck = await page.evaluate(() => {
    const app = window.application;

    app.layer1.setComposition(null);
    app.layer2.setComposition(new CubeReplication());
    app.layer2.set('Blend Mode', 'Multiply');
    app.layer2.set('opacity', 0);
    for (let i = 0; i < 3; i += 1) {
      app.layer2.render();
      app.mixer.render();
    }
    const visibilityWhenZeroOpacity = app.mixer.compositePass.layerSets[1].material.visible;

    app.layer2.set('Blend Mode', 'Additive');
    app.layer2.set('opacity', 1);
    for (let i = 0; i < 3; i += 1) {
      app.layer2.render();
      app.mixer.render();
    }
    const visibilityWhenFullOpacity = app.mixer.compositePass.layerSets[1].material.visible;
    const blendConst = app.mixer.compositePass.layerSets[1].material.blending;

    app.layer1.setComposition(new CubeReplication());
    app.layer2.setComposition(null);
    app.layer2.set('Blend Mode', 'Normal');
    app.layer2.set('opacity', 1);

    return {
      visibilityWhenZeroOpacity,
      visibilityWhenFullOpacity,
      blendConst,
      additiveConst: THREE.AdditiveBlending
    };
  });
  expect(blendOpacityCheck.visibilityWhenZeroOpacity).toBe(false);
  expect(blendOpacityCheck.visibilityWhenFullOpacity).toBe(true);
  expect(blendOpacityCheck.blendConst).toBe(blendOpacityCheck.additiveConst);

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
  });
  await expect(page.locator('.composition-picker .slot')).toHaveCount(slotsBeforeDrop + 1);
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
