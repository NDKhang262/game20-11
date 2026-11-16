export type ChapterZeroPhase = 'alarm-ringing' | 'collecting-memories' | 'notebook-ready' |
  'notebook-open' | 'time-travel-active' | 'year-one-pending' | 'year-one';
export type ChapterZeroAction =
  | { type: 'alarm.off' }
  | { type: 'memory.collect'; memoryId: string }
  | { type: 'notebook.open' }
  | { type: 'timeTravel.activate' }
  | { type: 'yearOne.request' };

/** Pure progression logic. No dialogue, audio, map mutation or scene loading. */
export class ChapterZero {
  private phase: ChapterZeroPhase = 'alarm-ringing';
  private readonly collected = new Set<string>();
  private readonly required: readonly string[];
  constructor(memoryIds: readonly string[]) {
    if (memoryIds.length !== 3 || new Set(memoryIds).size !== 3 || memoryIds.some(id => !id.trim())) {
      throw new Error('Chapter 0 requires exactly three distinct memory IDs.');
    }
    this.required = [...memoryIds];
  }

  dispatch(action: ChapterZeroAction): boolean {
    switch (action.type) {
      case 'alarm.off':
        if (this.phase !== 'alarm-ringing') return false;
        this.phase = 'collecting-memories'; return true;
      case 'memory.collect':
        if (this.phase !== 'collecting-memories' || !this.required.includes(action.memoryId) || this.collected.has(action.memoryId)) return false;
        this.collected.add(action.memoryId);
        if (this.collected.size === 3) this.phase = 'notebook-ready';
        return true;
      case 'notebook.open':
        if (this.phase !== 'notebook-ready') return false;
        this.phase = 'notebook-open'; return true;
      case 'timeTravel.activate':
        if (this.phase !== 'notebook-open') return false;
        this.phase = 'time-travel-active'; return true;
      case 'yearOne.request':
        if (this.phase !== 'time-travel-active') return false;
        this.phase = 'year-one-pending'; return true;
      default: return false;
    }
  }

  /** Future destination scene calls this only after it has actually loaded. */
  confirmYearOneLoaded(): boolean {
    if (this.phase !== 'year-one-pending') return false;
    this.phase = 'year-one'; return true;
  }

  get snapshot() {
    return { phase: this.phase, alarmOff: this.phase !== 'alarm-ringing',
      collectedMemoryIds: [...this.collected], requiredMemoryIds: [...this.required],
      notebookOpen: ['notebook-open', 'time-travel-active', 'year-one-pending', 'year-one'].includes(this.phase),
      transitionRequested: this.phase === 'year-one-pending', complete: this.phase === 'year-one' };
  }
}
