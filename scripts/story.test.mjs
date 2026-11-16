import assert from 'node:assert/strict';
import { DialogueSystem, MemorySystem, QuestSystem } from '../src/game/systems/StoryState.ts';
import { readFileSync } from 'node:fs';
// Synthetic fixtures only; never loaded into the game.
const dialogue = new DialogueSystem([{ id: 'fixture', lines: [{ text: 'A' }, { speaker: 'test', text: 'B' }] }]);
assert.equal(dialogue.open('missing'), false);
assert.equal(dialogue.open('fixture'), true);
assert.equal(dialogue.current.text, 'A');
assert.equal(dialogue.next().text, 'B');
assert.equal(dialogue.next(), undefined);
dialogue.open('fixture'); dialogue.close(); assert.equal(dialogue.current, undefined);
const memories = new MemorySystem([{ id: 'm1', title: 'test', chapter: 1 }]);
const quests = new QuestSystem([{ id: 'q1', title: 'test', requiredInteractions: ['photo'], requiredMemories: ['m1'] }], memories);
assert.equal(quests.states[0].complete, false);
quests.recordInteraction('photo'); quests.recordInteraction('photo');
assert.equal(quests.states[0].complete, false);
assert.equal(memories.collect('unknown'), false);
assert.equal(memories.collect('m1'), true);
assert.equal(memories.collect('m1'), false);
assert.equal(quests.states[0].complete, true);
const copy = memories.ids; copy.push('mutated'); assert.equal(memories.has('mutated'), false);
const map = JSON.parse(readFileSync(new URL('../public/assets/maps/bedroom.json', import.meta.url)));
assert.deepEqual([map.width, map.height, map.tilewidth, map.tileheight], [20,15,32,32]);
for (const layer of map.layers.filter(l => l.type === 'tilelayer')) {
  assert.equal(layer.data.length, 300);
  assert(layer.data.every(id => Number.isInteger(id) && id >= 0 && id <= 32));
}
const objects = map.layers.find(l => l.name === 'Objects').objects;
assert.equal(objects.filter(o => o.type === 'interactable').length, 7);
const solid = new Set(map.tilesets[0].tiles.filter(t => t.properties.some(p => p.name === 'collides' && p.value)).map(t => t.id + 1));
const blocked = index => map.layers.filter(l => ['Walls','Furniture'].includes(l.name)).some(l => solid.has(l.data[index]));
const reachable = new Set([9 * 20 + 10]); const queue = [...reachable];
while (queue.length) {
  const i = queue.shift(); const x = i % 20, y = Math.floor(i / 20);
  for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
    const n = ny * 20 + nx;
    if (nx >= 0 && nx < 20 && ny >= 0 && ny < 15 && !blocked(n) && !reachable.has(n)) { reachable.add(n); queue.push(n); }
  }
}
for (const object of objects.filter(o => o.type === 'interactable')) {
  assert([...reachable].some(i => {
    const x = i % 20 * 32 + 16, y = Math.floor(i / 20) * 32 + 16;
    return Math.hypot(x - Math.max(object.x, Math.min(x, object.x + object.width)), y - Math.max(object.y, Math.min(y, object.y + object.height))) <= 52;
  }), `reachable: ${object.name}`);
}
console.log('PASS: dialogue lifecycle, quest prerequisites, memory deduplication, map dimensions, all 7 interaction regions reachable.');
