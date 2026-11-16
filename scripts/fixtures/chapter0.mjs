// Test-only action bindings and text. Not approved story; never imported by src/.
export function makeChapterZeroFixture() {
  const bindings = [
    ['alarm', { type: 'alarm.off' }],
    ['bed', { type: 'memory.collect', memoryId: 'chapter0.memory.1' }],
    ['photo', { type: 'memory.collect', memoryId: 'chapter0.memory.2' }],
    ['bookshelf', { type: 'memory.collect', memoryId: 'chapter0.memory.3' }],
    ['desk', { type: 'notebook.open' }],
    ['laptop', { type: 'timeTravel.activate' }],
    ['door', { type: 'yearOne.request' }],
  ];
  return {
    schemaVersion: 1, approval: 'approved',
    chapter0: { enabled: true, memoryIds: [1,2,3].map(n => `chapter0.memory.${n}`) },
    dialogues: bindings.map(([id, action]) => ({ id: `bedroom.${id}`, lines: [{ text: '[TEST A]' }, { speaker: '[TEST]', text: '[TEST B]' }], onComplete: [action] })),
    memories: [1,2,3].map(n => ({ id: `chapter0.memory.${n}`, title: `[TEST MEMORY ${n}]`, chapter: 0 })),
    quests: [{ id: 'fixture.quest', title: '[TEST QUEST]', requiredInteractions: ['alarm'], requiredMemories: [1,2,3].map(n => `chapter0.memory.${n}`) }],
  };
}
