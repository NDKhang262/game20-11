import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const results = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const response = await page.goto('http://127.0.0.1:5173');
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => { try { return window.__reStudent().x > 0; } catch { return false; } });
    const canvas = page.locator('canvas');
    await canvas.waitFor({ state: 'visible' });
    const box = await canvas.boundingBox();
    assert(box.width > 300 && box.height > 150);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const state = () => page.evaluate(() => window.__reStudent());
    const start = await state();
    await page.locator('#interact').click();
    await page.getByRole('status').filter({ hasText: 'gần bàn thư' }).waitFor();
    if (mobile) {
      const button = page.locator('[data-direction="right"]');
      const bounds = await button.boundingBox();
      const cdp = await context.newCDPSession(page);
      const touch = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] });
      await page.waitForTimeout(550);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await cdp.detach();
    } else {
      await page.keyboard.down('d');
      await page.waitForTimeout(550);
      await page.keyboard.up('d');
    }
    assert((await state()).x > start.x + 30, 'right movement');
    await page.locator('#interact').click();
    assert.equal((await state()).interactions, 1);
    if (!mobile) {
      await page.keyboard.press('e');
      await page.waitForTimeout(100);
      assert.equal((await state()).interactions, 2, 'E interaction');
      for (const [key, axis, sign] of [['ArrowRight', 'x', 1], ['a', 'x', -1], ['ArrowLeft', 'x', -1], ['w', 'y', -1], ['ArrowUp', 'y', -1], ['s', 'y', 1], ['ArrowDown', 'y', 1]]) {
        const before = await state();
        await page.keyboard.down(key);
        await page.waitForTimeout(200);
        await page.keyboard.up(key);
        assert(((await state())[axis] - before[axis]) * sign > 10, key);
      }
      await page.keyboard.down('d');
      await page.waitForTimeout(1000);
      await page.keyboard.up('d');
      await page.waitForTimeout(100);
      assert((await state()).cameraX > 0, 'camera follows');
    }
    const stopped = await state();
    await page.waitForTimeout(150);
    assert(Math.abs((await state()).x - stopped.x) < 5, 'release stops movement');
    await page.screenshot({ path: `artifacts/${mobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
    results.push({ viewport: mobile ? 'mobile 390x844 (emulated)' : 'desktop 1366x900', canvas: 'PASS', controls: 'PASS', interaction: 'PASS', overflow: 'PASS' });
    await context.close();
  }
  assert.deepEqual(errors, [], 'browser console/runtime errors');
  await writeFile('artifacts/results.json', JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
