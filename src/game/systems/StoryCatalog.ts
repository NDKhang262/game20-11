import type { DialogueDefinition, MemoryDefinition, QuestDefinition } from './StoryState';
import type { ChapterZeroAction } from './ChapterZero';

export interface StoryCatalog {
  schemaVersion: 1;
  approval: 'pending' | 'approved';
  chapter0: { enabled: boolean; memoryIds: string[] };
  dialogues: DialogueDefinition[];
  memories: MemoryDefinition[];
  quests: QuestDefinition[];
}
type ObjectValue = Record<string, unknown>;
function object(value: unknown, path: string): ObjectValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path}: expected object`);
  return value as ObjectValue;
}
function fields(value: ObjectValue, allowed: string[], path: string) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${path}.${key}: unknown field`);
}
function text(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${path}: expected non-empty string`);
  return value;
}
function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path}: expected array`);
  return value;
}
function ids(value: unknown, path: string): string[] {
  const result = array(value, path).map((v, i) => text(v, `${path}[${i}]`));
  if (new Set(result).size !== result.length) throw new Error(`${path}: duplicate IDs`);
  return result;
}
function unique(items: { id: string }[], path: string) { ids(items.map(item => item.id), path); }

/** Validate external JSON before it reaches UI; reject typos and dangling IDs. */
export function parseStoryCatalog(input: unknown): StoryCatalog {
  const root = object(input, 'story');
  fields(root, ['schemaVersion','approval','chapter0','dialogues','memories','quests'], 'story');
  if (root.schemaVersion !== 1) throw new Error('story.schemaVersion: expected 1');
  if (root.approval !== 'pending' && root.approval !== 'approved') throw new Error('story.approval: invalid status');
  const chapter = object(root.chapter0, 'chapter0');
  fields(chapter, ['enabled','memoryIds'], 'chapter0');
  if (typeof chapter.enabled !== 'boolean') throw new Error('chapter0.enabled: expected boolean');
  const memoryIds = ids(chapter.memoryIds, 'chapter0.memoryIds');
  if (memoryIds.length !== 3) throw new Error('chapter0.memoryIds: expected exactly three IDs');
  if (chapter.enabled && root.approval !== 'approved') throw new Error('chapter0: cannot enable pending content');
  const memories = array(root.memories, 'memories').map((value, i): MemoryDefinition => {
    const m = object(value, `memories[${i}]`); fields(m, ['id','title','chapter'], 'memory');
    if (![0,1,2,3,4].includes(m.chapter as number)) throw new Error('memory.chapter: expected 0..4');
    return { id: text(m.id, 'memory.id'), title: text(m.title, 'memory.title'), chapter: m.chapter as MemoryDefinition['chapter'] };
  });
  unique(memories, 'memories');
  const memorySet = new Set(memories.map(m => m.id));
  if (chapter.enabled && memoryIds.some(id => !memories.some(m => m.id === id && m.chapter === 0))) throw new Error('chapter0: missing chapter 0 memory definition');
  const dialogues = array(root.dialogues, 'dialogues').map((value, i): DialogueDefinition => {
    const d = object(value, `dialogues[${i}]`); fields(d, ['id','lines','onComplete'], 'dialogue');
    const lines = array(d.lines, 'dialogue.lines').map(value => {
      const line = object(value, 'line'); fields(line, ['speaker','text'], 'line');
      return { text: text(line.text, 'line.text'), ...(line.speaker === undefined ? {} : { speaker: text(line.speaker, 'line.speaker') }) };
    });
    if (!lines.length) throw new Error('dialogue.lines: cannot be empty');
    const onComplete = array(d.onComplete ?? [], 'dialogue.onComplete').map((value): ChapterZeroAction => {
      const action = object(value, 'action');
      const type = text(action.type, 'action.type');
      fields(action, type === 'memory.collect' ? ['type','memoryId'] : ['type'], 'action');
      if (type === 'memory.collect') {
        const id = text(action.memoryId, 'action.memoryId');
        if (!memoryIds.includes(id) || !memories.some(m => m.id === id && m.chapter === 0)) throw new Error('action.memoryId: unknown chapter 0 memory');
        return { type: 'memory.collect', memoryId: id };
      }
      if (!['alarm.off','notebook.open','timeTravel.activate','yearOne.request'].includes(type)) throw new Error('action.type: unsupported');
      return { type } as ChapterZeroAction;
    });
    return { id: text(d.id, 'dialogue.id'), lines, onComplete };
  });
  unique(dialogues, 'dialogues');
  const quests = array(root.quests, 'quests').map((value, i): QuestDefinition => {
    const q = object(value, `quests[${i}]`); fields(q, ['id','title','requiredInteractions','requiredMemories'], 'quest');
    const requiredMemories = ids(q.requiredMemories ?? [], 'quest.requiredMemories');
    if (requiredMemories.some(id => !memorySet.has(id))) throw new Error('quest.requiredMemories: unknown memory');
    return { id: text(q.id, 'quest.id'), title: text(q.title, 'quest.title'), requiredInteractions: ids(q.requiredInteractions, 'quest.requiredInteractions'), requiredMemories };
  });
  unique(quests, 'quests');
  return { schemaVersion: 1, approval: root.approval, chapter0: { enabled: chapter.enabled, memoryIds }, dialogues, memories, quests };
}

export function runtimeStory(catalog: StoryCatalog): StoryCatalog {
  if (catalog.approval === 'approved') return catalog;
  return { ...catalog, chapter0: { ...catalog.chapter0, enabled: false }, dialogues: [], quests: [], memories: [] };
}
