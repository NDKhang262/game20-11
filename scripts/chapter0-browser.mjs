import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { makeChapterZeroFixture } from './fixtures/chapter0.mjs';

// Inject only a test response in this browser. Never modify the shipped JSON.
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 1080 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/src/game/data/chapter0.json*', route => route.fulfill({ contentType: 'application/javascript', body: `export default ${JSON.stringify(makeChapterZeroFixture())};` }));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5173');
  const state = () => page.evaluate(() => window.__reStudent());
  await page.waitForFunction(() => { try { return window.__reStudent().chapter0.enabled; } catch { return false; } });
  async function walk(x, y) {
    for (const [axis, target, negative, positive] of [['x',x,'a','d'],['y',y,'w','s']]) {
      const before = await state(); if (Math.abs(before[axis] - target) < 4) continue;
      const sign = target > before[axis] ? 1 : -1, key = sign > 0 ? positive : negative;
      await page.keyboard.down(key);
      try { await page.waitForFunction(({axis,target,sign}) => (window.__reStudent()[axis] - target) * sign >= -3, {axis,target,sign}, {timeout: 6000}); }
      finally { await page.keyboard.up(key); }
      await page.waitForTimeout(60);
    }
  }
  async function open(id) {
    assert.equal((await state()).nearby, id);
    await page.locator('#interact').click();
    await page.locator('#dialogue').waitFor({state:'visible'});
    assert.equal(await page.locator('#dialogue-text').textContent(), '[TEST A]');
  }
  async function finish(id) {
    await open(id);
    await page.locator('#dialogue-next').click();
    assert.equal(await page.locator('#dialogue-text').textContent(), '[TEST]: [TEST B]');
    await page.locator('#dialogue-next').click();
    await page.locator('#dialogue').waitFor({state:'hidden'});
    await page.waitForTimeout(80);
  }
  await walk(208, 188);
  await open('alarm'); await page.locator('#dialogue-next').click();
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  assert.equal((await state()).chapter0.phase, 'alarm-ringing', 'Escape cancels effects');
  await finish('alarm'); assert.equal((await state()).chapter0.phase, 'collecting-memories');
  await finish('alarm'); assert.equal((await state()).chapter0.phase, 'collecting-memories');
  await walk(260,240); await walk(180,180); await finish('bed');
  assert.equal((await state()).memories.length, 1);
  await finish('bed'); assert.equal((await state()).memories.length, 1, 'no duplicate memory');
  await walk(260,240); await walk(304,85); await finish('photo');
  assert.equal((await state()).chapter0.collectedMemoryIds.length, 2);
  await walk(320,240); await walk(365,110); await finish('desk');
  assert.equal((await state()).chapter0.phase, 'collecting-memories', 'notebook locked before third memory');
  await walk(320,240); await walk(490,300); await finish('bookshelf');
  assert.equal((await state()).chapter0.phase, 'notebook-ready');
  assert.equal((await state()).quests[0].complete, true);
  await walk(320,240); await walk(365,110); await finish('desk');
  assert.equal((await state()).chapter0.phase, 'notebook-open');
  await walk(350,220); await walk(432,186); await finish('laptop');
  assert.equal((await state()).chapter0.phase, 'time-travel-active');
  await walk(336,422); await finish('door');
  assert.equal((await state()).chapter0.phase, 'year-one-pending');
  assert.equal((await state()).chapter0.complete, false, 'no destination scene, no fake completion');
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({path:'artifacts/chapter0-fixture.png',fullPage:true});
  await page.reload();
  await page.waitForFunction(() => { try { return window.__reStudent().chapter0.phase === 'alarm-ringing'; } catch { return false; } });
  assert.equal((await state()).memories.length, 0, 'RAM-only state resets on reload');
  assert.deepEqual(errors, []);
  const result = { scope: 'test fixture only, not official content', dialogueData: 'PASS', cancelEffects: 'PASS', chapterGates: 'PASS', memoriesAndQuest: 'PASS', yearOne: 'request only; real scene NOT IMPLEMENTED', errors };
  await writeFile('artifacts/chapter0-results.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
