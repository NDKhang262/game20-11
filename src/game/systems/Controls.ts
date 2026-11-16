export type Direction = 'up' | 'down' | 'left' | 'right';

export class Controls {
  readonly held = new Set<Direction>();
  private readonly abort = new AbortController();

  constructor(interact: () => void) {
    const options = { signal: this.abort.signal };
    document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => {
      const direction = button.dataset.direction as Direction;
      button.addEventListener('pointerdown', event => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.held.add(direction);
      }, options);
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        button.addEventListener(type, () => this.held.delete(direction), options);
      }
    });
    document.querySelector('#interact')!.addEventListener('click', interact, options);
    window.addEventListener('blur', () => this.held.clear(), options);
    document.addEventListener('visibilitychange', () => this.held.clear(), options);
  }

  destroy() { this.abort.abort(); this.held.clear(); }
}
