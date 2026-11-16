import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [], results = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 1080 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    const state = () => page.evaluate(() => window.__reStudent());
    async function fittedCanvas() {
      await page.waitForFunction(() => {
        const box = document.querySelector('#game').getBoundingClientRect();
        const canvas = document.querySelector('canvas').getBoundingClientRect();
        return canvas.width <= box.width + 1 && canvas.height <= box.height + 1 && Math.abs(canvas.width / canvas.height - 4/3) < .02;
      });
    }
    async function hold(key, duration) {
      await page.keyboard.down(key); await page.waitForTimeout(duration); await page.keyboard.up(key); await page.waitForTimeout(60);
    }
    async function walk(x, y) {
      for (const [axis, target, negative, positive] of [['x', x, 'a', 'd'], ['y', y, 'w', 's']]) {
        const before = await state();
        if (Math.abs(before[axis] - target) < 4) continue;
        const sign = target > before[axis] ? 1 : -1;
        const key = sign > 0 ? positive : negative;
        await page.keyboard.down(key);
        try { await page.waitForFunction(({ axis, target, sign }) => (window.__reStudent()[axis] - target) * sign >= -3, { axis, target, sign }, { timeout: 6000 }); }
        finally { await page.keyboard.up(key); }
        await page.waitForTimeout(60);
        assert(Math.abs((await state())[axis] - target) < 14, `walk ${axis}=${target}`);
      }
    }
    async function interact(id, keyboard = false) {
      assert.equal((await state()).nearby, id);
      assert.equal((await state()).marker, true);
      if (keyboard) await page.keyboard.press('e'); else await page.locator('#interact').click();
      await page.locator('#dialogue').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#dialogue-next').isVisible(), false);
      const before = await state(); await hold('d', 150);
      assert(Math.abs((await state()).x - before.x) < 1, 'movement blocked during dialogue');
      await page.locator('#dialogue-close').click(); await page.waitForTimeout(80);
      assert.equal((await state()).panelOpen, false);
      console.log('PASS interaction:', id);
    }
    const response = await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5173');
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => { try { return window.__reStudent().x > 0; } catch { return false; } });
    assert.deepEqual((await state()).map, { width: 20, height: 15, tileSize: 32 });
    const box = await page.locator('canvas').boundingBox();
    assert(box.width > 300 && Math.abs(box.width / box.height - 4/3) < .02);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal((await state()).marker, false);
    assert.equal(await page.locator('#interact').isDisabled(), true);
    if (mobile) {
      await page.locator('[data-direction="down"]').scrollIntoViewIfNeeded();
      const bounds = await page.locator('[data-direction="down"]').boundingBox();
      const cdp = await context.newCDPSession(page);
      const touch = { x: bounds.x + bounds.width/2, y: bounds.y + bounds.height/2 };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] });
      await page.waitForTimeout(1500);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(100);
      assert((await state()).y > 390 && (await state()).body.y + (await state()).body.height <= 448.5, 'touch movement / bottom wall collision');
      const stopped = await state(); await page.waitForTimeout(200);
      assert(Math.abs((await state()).y - stopped.y) < 1, 'touch release');
      await page.locator('#interact').tap();
      await page.locator('#dialogue').waitFor({ state: 'visible' });
      await page.locator('#dialogue-close').tap();
      await cdp.detach();
      await page.setViewportSize({ width: 844, height: 390 }); await fittedCanvas();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: 'artifacts/bedroom-mobile-landscape.png', fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await fittedCanvas();
    } else {
      for (const [key, axis, sign] of [['d','x',1], ['ArrowRight','x',1], ['a','x',-1], ['ArrowLeft','x',-1], ['w','y',-1], ['ArrowUp','y',-1], ['s','y',1], ['ArrowDown','y',1]]) {
        const before = await state(); await hold(key, 160);
        assert(((await state())[axis] - before[axis]) * sign > 8, key);
      }
      await walk(336, 422); await interact('door', true);
      await hold('s', 500); assert((await state()).body.y + (await state()).body.height <= 448.5, 'south wall');
      await walk(320, 240); await walk(304, 85); await interact('photo');
      await hold('w', 500); assert((await state()).body.y >= 63.5, 'north wall');
      await walk(320, 240); await walk(432, 186); await interact('laptop', true);
      await hold('w', 600); assert((await state()).body.y >= 159.5, 'desk collision');
      await walk(350, 220); await walk(365, 110); await interact('desk');
      await walk(320, 230); await walk(208, 188); await interact('alarm');
      await hold('w', 500); assert((await state()).body.y >= 159.5, 'alarm table collision');
      await walk(260, 240); await walk(180, 180); await interact('bed');
      await hold('a', 500); assert((await state()).body.x >= 159.5, 'bed collision');
      await walk(260, 240); await walk(490, 300); await interact('bookshelf');
      await hold('d', 500); assert((await state()).body.x + (await state()).body.width <= 512.5, 'bookshelf collision');
      await walk(300, 380); await hold('a', 2800); assert((await state()).body.x >= 31.5, 'west wall');
      await walk(580, 380); await hold('d', 700); assert((await state()).body.x + (await state()).body.width <= 608.5, 'east wall');
      await walk(320, 304);
      assert.equal((await state()).memories.length, 0);
      assert.equal((await state()).quests.length, 0);
    }
    await page.screenshot({ path: `artifacts/bedroom-${mobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
    results.push({ viewport: mobile ? '390x844 + 844x390 emulated' : '1366x1080', canvas: 'PASS', controls: 'PASS', collision: 'PASS', interaction: 'PASS', dialogueModal: 'PASS', overflow: 'PASS' });
    await context.close();
  }
  assert.deepEqual(errors, [], 'console/runtime/HTTP errors');
  await writeFile('artifacts/bedroom-results.json', JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
