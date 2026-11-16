export interface DialogueLine { speaker?: string; text: string }
export interface DialogueDefinition { id: string; lines: readonly DialogueLine[] }
export interface QuestDefinition { id: string; title: string; requiredInteractions: readonly string[]; requiredMemories?: readonly string[] }
export interface MemoryDefinition { id: string; title: string; chapter: 1 | 2 | 3 | 4 }

/** No story text is generated here: content is supplied through catalogs. */
export class DialogueSystem {
  private active?: DialogueDefinition;
  private index = 0;
  constructor(private readonly catalog: readonly DialogueDefinition[]) {}
  open(id: string): boolean {
    this.close();
    this.active = this.catalog.find(item => item.id === id && item.lines.length > 0);
    return !!this.active;
  }
  get current(): DialogueLine | undefined { return this.active?.lines[this.index]; }
  next(): DialogueLine | undefined {
    if (this.active && ++this.index >= this.active.lines.length) this.close();
    return this.current;
  }
  close() { this.active = undefined; this.index = 0; }
}

export class MemorySystem {
  private readonly collected = new Set<string>();
  constructor(private readonly catalog: readonly MemoryDefinition[]) {}
  collect(id: string): boolean {
    if (!this.catalog.some(item => item.id === id) || this.collected.has(id)) return false;
    this.collected.add(id); return true;
  }
  has(id: string) { return this.collected.has(id); }
  get ids(): readonly string[] { return [...this.collected]; }
}

export class QuestSystem {
  private readonly observed = new Set<string>();
  constructor(private readonly catalog: readonly QuestDefinition[], private readonly memories: MemorySystem) {}
  recordInteraction(id: string) { this.observed.add(id); }
  get states() {
    return this.catalog.map(quest => ({ id: quest.id, title: quest.title,
      complete: quest.requiredInteractions.every(id => this.observed.has(id)) &&
        (quest.requiredMemories ?? []).every(id => this.memories.has(id)) }));
  }
}
