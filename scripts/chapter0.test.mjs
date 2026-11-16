import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ChapterZero } from '../src/game/systems/ChapterZero.ts';
import { DialogueSystem } from '../src/game/systems/StoryState.ts';
import { parseStoryCatalog, runtimeStory } from '../src/game/systems/StoryCatalog.ts';
import { makeChapterZeroFixture } from './fixtures/chapter0.mjs';

const source = JSON.parse(readFileSync(new URL('../src/game/data/chapter0.json', import.meta.url)));
const shipped = runtimeStory(parseStoryCatalog(source));
assert.equal(shipped.chapter0.enabled, false);
assert.deepEqual(shipped.dialogues, []);
const fixture = parseStoryCatalog(makeChapterZeroFixture());
const ids = fixture.chapter0.memoryIds;
const state = new ChapterZero(ids);
for (const action of [{ type: 'memory.collect', memoryId: ids[0] }, { type: 'notebook.open' }, { type: 'timeTravel.activate' }, { type: 'yearOne.request' }]) {
  assert.equal(state.dispatch(action), false);
}
assert.equal(state.confirmYearOneLoaded(), false);
assert.equal(state.dispatch({ type: 'alarm.off' }), true);
assert.equal(state.dispatch({ type: 'alarm.off' }), false);
assert.equal(state.dispatch({ type: 'memory.collect', memoryId: 'unknown' }), false);
assert.equal(state.dispatch({ type: 'memory.collect', memoryId: ids[1] }), true);
assert.equal(state.dispatch({ type: 'memory.collect', memoryId: ids[1] }), false);
assert.equal(state.dispatch({ type: 'notebook.open' }), false);
state.dispatch({ type: 'memory.collect', memoryId: ids[0] });
assert.equal(state.dispatch({ type: 'notebook.open' }), false);
state.dispatch({ type: 'memory.collect', memoryId: ids[2] });
assert.equal(state.snapshot.phase, 'notebook-ready');
assert.equal(state.dispatch({ type: 'timeTravel.activate' }), false);
assert.equal(state.dispatch({ type: 'notebook.open' }), true);
assert.equal(state.dispatch({ type: 'notebook.open' }), false);
assert.equal(state.dispatch({ type: 'yearOne.request' }), false);
assert.equal(state.dispatch({ type: 'timeTravel.activate' }), true);
assert.equal(state.confirmYearOneLoaded(), false);
assert.equal(state.dispatch({ type: 'yearOne.request' }), true);
assert.equal(state.dispatch({ type: 'yearOne.request' }), false);
assert.equal(state.snapshot.complete, false);
assert.equal(state.snapshot.transitionRequested, true);
assert.equal(state.confirmYearOneLoaded(), true);
assert.equal(state.confirmYearOneLoaded(), false);
assert.equal(state.snapshot.complete, true);
state.snapshot.collectedMemoryIds.length = 0;
assert.equal(state.snapshot.collectedMemoryIds.length, 3);
assert.equal(new ChapterZero(ids).snapshot.phase, 'alarm-ringing');
assert.throws(() => new ChapterZero(['a','a','b']));
assert.throws(() => new ChapterZero(['a','b']));
// All six collection orders yield the same gate state.
for (const order of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]) {
  const run = new ChapterZero(ids); run.dispatch({ type: 'alarm.off' });
  for (const n of order) assert.equal(run.dispatch({ type: 'memory.collect', memoryId: ids[n] }), true);
  assert.equal(run.snapshot.phase, 'notebook-ready');
}
const dialogue = new DialogueSystem(fixture.dialogues);
dialogue.open('bedroom.alarm'); dialogue.next(); dialogue.close();
assert.deepEqual(dialogue.takeCompletedActions(), [], 'cancel does not apply actions');
dialogue.open('bedroom.alarm'); dialogue.next();
assert.deepEqual(dialogue.takeCompletedActions(), [], 'not complete at final displayed line');
assert.equal(dialogue.next(), undefined);
assert.deepEqual(dialogue.takeCompletedActions(), [{ type: 'alarm.off' }]);
assert.deepEqual(dialogue.takeCompletedActions(), [], 'consume exactly once');
dialogue.open('bedroom.alarm'); dialogue.next(); dialogue.next(); dialogue.open('missing');
assert.deepEqual(dialogue.takeCompletedActions(), [], 'new dialogue clears stale actions');
const draft = makeChapterZeroFixture(); draft.approval = 'pending'; draft.chapter0.enabled = false;
assert.deepEqual(runtimeStory(parseStoryCatalog(draft)).dialogues, []);
const invalid = [
  x => x.schemaVersion = 99,
  x => x.typo = true,
  x => x.approval = 'pending',
  x => x.dialogues.push(x.dialogues[0]),
  x => x.dialogues[0].lines = [],
  x => x.dialogues[0].lines[0].text = ' ',
  x => x.dialogues[0].onComplete = [{ type: 'yearOne.confirm' }],
  x => x.dialogues[0].onComplete = [{ type: ['alarm.off'] }],
  x => x.dialogues[0].onComplete = [{ type: 'memory.collect', memoryId: 'missing' }],
  x => x.memories[0].chapter = 9,
  x => x.memories[0].chapter = 1,
  x => x.chapter0.memoryIds = ['a','a','b'],
  x => x.chapter0.enabled = 'yes',
  x => x.quests[0].requiredMemories = ['missing'],
  x => x.memories.push(x.memories[0]),
  x => x.dialogues[0].onComplete[0].typo = 'bad',
];
for (const mutate of invalid) { const bad = makeChapterZeroFixture(); mutate(bad); assert.throws(() => parseStoryCatalog(bad)); }
console.log('PASS: chapter 0 gates, six memory orders, idempotency, scene handoff, dialogue completion/cancellation, draft guard and schema validation.');
