import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    if (!scene.textures.exists('student')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x263c43).fillRect(6, 24, 5, 6).fillRect(15, 24, 5, 6);
      g.fillStyle(0xe6ddbb).fillRect(5, 13, 16, 12);
      g.fillStyle(0x6a9492).fillRect(9, 14, 8, 11);
      g.fillStyle(0xe3b98b).fillRect(7, 4, 12, 10).fillRect(3, 15, 3, 8).fillRect(20, 15, 3, 8);
      g.fillStyle(0x393733).fillRect(6, 2, 14, 5).fillRect(6, 5, 3, 4);
      g.fillStyle(0x283d40).fillRect(15, 8, 2, 2);
      g.generateTexture('student', 26, 32); g.destroy();
    }
    super(scene, x, y, 'student');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setSize(18, 14).setOffset(4, 18).setCollideWorldBounds(true).setDepth(5);
  }
}
