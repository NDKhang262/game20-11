import Phaser from 'phaser';
import { Controls } from '../systems/Controls';

export class TestScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private controls!: Controls;
  private interactions = 0;

  constructor() { super('TestScene'); }

  create() {
    const g = this.add.graphics();
    g.fillStyle(0x304c48).fillRect(0, 0, 1280, 720);
    for (let y = 0; y < 720; y += 40) {
      for (let x = 0; x < 1280; x += 40) {
        g.lineStyle(1, 0x3d5951, 0.65).strokeRect(x, y, 40, 40);
      }
    }
    g.fillStyle(0x1c3535).fillRect(0, 0, 1280, 48);
    g.fillStyle(0x709980).fillRect(64, 14, 112, 20).fillRect(280, 14, 112, 20);
    g.fillStyle(0x947450).fillRect(430, 220, 100, 64);
    g.fillStyle(0xf3d697).fillRect(462, 230, 36, 24);
    this.add.text(430, 296, 'BÀN THƯ · E', { fontSize: '15px', color: '#ffe4ad', fontFamily: 'Arial' });
    this.add.text(80, 620, 'KHU VỰC KIỂM THỬ', { fontSize: '22px', color: '#77988b', fontFamily: 'Arial' });
    this.player = this.add.rectangle(320, 300, 24, 32, 0xe9c389).setStrokeStyle(3, 0xffefc6);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    this.physics.world.setBounds(16, 48, 1248, 656);
    this.cameras.main.setBounds(0, 0, 1280, 720).startFollow(this.player, true, 0.12, 0.12);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E') as typeof this.keys;
    this.keys.E.on('down', () => this.interact());
    this.controls = new Controls(() => this.interact());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.controls.destroy());
  }

  private interact() {
    const nearby = Phaser.Math.Distance.Between(this.player.x, this.player.y, 480, 252) < 120;
    const message = nearby
      ? `Tương tác thành công (${++this.interactions}): Một lá thư đang chờ bạn. Hẹn gặp lại ngày 20/11!`
      : 'Hãy đến gần bàn thư màu vàng hơn (trong phạm vi 120 px).';
    document.querySelector('#message')!.textContent = message;
  }

  update() {
    const down = (...names: string[]) => names.some(name => this.keys[name].isDown);
    const held = this.controls.held;
    const x = Number(down('D', 'RIGHT') || held.has('right')) - Number(down('A', 'LEFT') || held.has('left'));
    const y = Number(down('S', 'DOWN') || held.has('down')) - Number(down('W', 'UP') || held.has('up'));
    const velocity = new Phaser.Math.Vector2(x, y).normalize().scale(180);
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(velocity.x, velocity.y);
  }

  // Read-only snapshot for repeatable browser smoke tests in development.
  snapshot() {
    return { x: this.player.x, y: this.player.y, interactions: this.interactions,
      cameraX: this.cameras.main.scrollX, cameraY: this.cameras.main.scrollY };
  }
}
