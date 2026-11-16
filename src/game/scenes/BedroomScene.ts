import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Controls } from '../systems/Controls';
import { DialogueSystem, MemorySystem, QuestSystem } from '../systems/StoryState';
import { dialogues, memories, quests, story } from '../data/story';
import { ChapterZero } from '../systems/ChapterZero';

interface Target { id: string; label: string; dialogueId: string; memoryId?: string; x: number; y: number; width: number; height: number }

export class BedroomScene extends Phaser.Scene {
  private player!: Player;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private controls!: Controls;
  private marker!: Phaser.GameObjects.Text;
  private targets: Target[] = [];
  private nearby?: Target;
  private interactions = 0;
  private dialogue = new DialogueSystem(dialogues);
  private memory = new MemorySystem(memories);
  private quest = new QuestSystem(quests, this.memory);
  private chapter0 = new ChapterZero(story.chapter0.memoryIds);
  private panelOpen = false;
  constructor() { super('BedroomScene'); }

  preload() {
    this.load.image('bedroom-tiles', 'assets/tilesets/bedroom.png');
    this.load.tilemapTiledJSON('bedroom', 'assets/maps/bedroom.json');
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      document.querySelector('#message')!.textContent = `Không tải được tài nguyên: ${file.key}. Hãy tải lại trang.`;
    });
  }

  create() {
    const map = this.make.tilemap({ key: 'bedroom' });
    const tileset = map.addTilesetImage('bedroom', 'bedroom-tiles')!;
    map.createLayer('Floor', tileset)!.setDepth(0);
    const walls = map.createLayer('Walls', tileset)!.setDepth(1);
    const furniture = map.createLayer('Furniture', tileset)!.setDepth(2);
    map.createLayer('Decorations', tileset)!.setDepth(3);
    walls.setCollisionByProperty({ collides: true });
    furniture.setCollisionByProperty({ collides: true });
    const objects = map.getObjectLayer('Objects')!.objects;
    const spawn = objects.find(object => object.name === 'spawn')!;
    this.player = new Player(this, spawn.x!, spawn.y!);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, furniture);
    this.targets = objects.filter(object => object.type === 'interactable').map(object => {
      const properties = Object.fromEntries((object.properties ?? []).map((p: { name: string; value: unknown }) => [p.name, p.value]));
      return { id: object.name, label: String(properties.label ?? object.name), dialogueId: String(properties.dialogueId ?? ''),
        memoryId: properties.memoryId ? String(properties.memoryId) : undefined,
        x: object.x!, y: object.y!, width: object.width!, height: object.height! };
    });
    this.marker = this.add.text(0, 0, 'E', { fontFamily: 'Arial', fontSize: '14px', color: '#253d37', backgroundColor: '#f4d590', padding: { x: 6, y: 3 } }).setOrigin(0.5, 1).setDepth(10).setVisible(false);
    this.cameras.main.setBounds(0, 0, 640, 480);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as typeof this.keys;
    this.keys.E.on('down', () => this.interact());
    this.keys.ESC.on('down', () => this.closePanel());
    this.controls = new Controls(() => this.interact());
    const abort = new AbortController();
    document.querySelector('#dialogue-close')!.addEventListener('click', () => this.closePanel(), { signal: abort.signal });
    document.querySelector('#dialogue-next')!.addEventListener('click', () => {
      if (this.dialogue.next()) this.renderLine();
      else {
        this.applyCompletedDialogue();
        this.closePanel();
      }
    }, { signal: abort.signal });
    const reset = () => { this.input.keyboard?.resetKeys(); this.controls.held.clear(); this.player.setVelocity(0); };
    window.addEventListener('blur', reset, { signal: abort.signal });
    document.addEventListener('visibilitychange', reset, { signal: abort.signal });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.controls.destroy(); abort.abort(); this.closePanel(); });
    document.querySelector('#story-status')!.textContent = 'Nhiệm vụ: chờ kịch bản · Ký ức: 0';
  }

  private findNearby() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    return this.targets.map(target => {
      const x = Phaser.Math.Clamp(body.center.x, target.x, target.x + target.width);
      const y = Phaser.Math.Clamp(body.center.y, target.y, target.y + target.height);
      return { target, distance: Phaser.Math.Distance.Between(body.center.x, body.center.y, x, y) };
    }).filter(item => item.distance <= 52).sort((a, b) => a.distance - b.distance)[0]?.target;
  }

  private interact() {
    if (this.panelOpen) return;
    const target = this.findNearby();
    if (!target) return;
    this.interactions++;
    this.quest.recordInteraction(target.id);
    if (target.memoryId) this.memory.collect(target.memoryId);
    const hasDialogue = this.dialogue.open(target.dialogueId);
    document.querySelector('#dialogue-title')!.textContent = target.label;
    document.querySelector('#dialogue-text')!.textContent = 'Chưa có nội dung kịch bản chính thức cho đồ vật này.';
    (document.querySelector('#dialogue-next') as HTMLButtonElement).hidden = !hasDialogue;
    if (hasDialogue) this.renderLine();
    this.panelOpen = true;
    this.player.setVelocity(0);
    this.controls.held.clear();
    document.querySelector<HTMLDialogElement>('#dialogue')!.showModal();
    document.querySelector<HTMLButtonElement>('#dialogue-close')!.focus();
    document.querySelector('#story-status')!.textContent = `Nhiệm vụ: ${quests.length ? this.quest.states.filter(q => q.complete).length + '/' + quests.length : 'chờ kịch bản'} · Ký ức: ${this.memory.ids.length}`;
  }

  private renderLine() {
    const line = this.dialogue.current;
    if (line) document.querySelector('#dialogue-text')!.textContent = `${line.speaker ? line.speaker + ': ' : ''}${line.text}`;
  }

  private applyCompletedDialogue() {
    const actions = this.dialogue.takeCompletedActions();
    if (!story.chapter0.enabled) return;
    for (const action of actions) {
      if (!this.chapter0.dispatch(action)) continue;
      if (action.type === 'memory.collect') this.memory.collect(action.memoryId);
      if (action.type === 'yearOne.request') {
        // Handoff only: no YearOne scene exists yet; never claim it has loaded.
        this.events.emit('chapter0:year-one-requested', this.chapter0.snapshot);
      }
    }
    document.querySelector('#story-status')!.textContent = `Nhiệm vụ: ${quests.length ? this.quest.states.filter(q => q.complete).length + '/' + quests.length : 'chờ kịch bản'} · Ký ức: ${this.memory.ids.length}`;
  }

  private closePanel() {
    document.querySelector<HTMLDialogElement>('#dialogue')!.close();
    this.panelOpen = false; this.dialogue.close();
    this.input.keyboard?.resetKeys(); this.controls?.held.clear();
  }

  update() {
    if (!this.player) return;
    // Native dialog Escape can close without the Phaser keyboard receiving the key.
    if (this.panelOpen && !document.querySelector<HTMLDialogElement>('#dialogue')!.open) this.closePanel();
    const down = (...names: string[]) => names.some(name => this.keys[name].isDown);
    const held = this.controls.held;
    const x = Number(down('D', 'RIGHT') || held.has('right')) - Number(down('A', 'LEFT') || held.has('left'));
    const y = Number(down('S', 'DOWN') || held.has('down')) - Number(down('W', 'UP') || held.has('up'));
    const velocity = new Phaser.Math.Vector2(x, y).normalize().scale(this.panelOpen ? 0 : 120);
    this.player.setVelocity(velocity.x, velocity.y);
    if (x) this.player.setFlipX(x < 0);
    this.nearby = this.findNearby();
    this.marker.setVisible(!!this.nearby && !this.panelOpen);
    if (this.nearby) this.marker.setPosition(this.nearby.x + this.nearby.width / 2, Math.max(26, this.nearby.y - 4));
    const button = document.querySelector<HTMLButtonElement>('#interact')!;
    button.disabled = !this.nearby || this.panelOpen;
    document.querySelector('#message')!.textContent = this.nearby ? `${this.nearby.label} · Nhấn E hoặc Tương tác` : 'Đến gần đồ vật để hiện biểu tượng tương tác.';
  }

  snapshot() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    return { x: this.player.x, y: this.player.y, body: { x: body.x, y: body.y, width: body.width, height: body.height },
      nearby: this.nearby?.id ?? null, marker: this.marker.visible, panelOpen: this.panelOpen,
      interactions: this.interactions, memories: this.memory.ids, quests: this.quest.states,
      chapter0: { enabled: story.chapter0.enabled, ...this.chapter0.snapshot },
      map: { width: 20, height: 15, tileSize: 32 } };
  }
}
