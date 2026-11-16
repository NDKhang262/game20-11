import Phaser from 'phaser';
import { BedroomScene } from './game/scenes/BedroomScene';
import './styles/main.css';

const scene = new BedroomScene();
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 640,
  height: 480,
  backgroundColor: '#233d3d',
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [scene],
});

// The CSS container can resize independently of Phaser's window resize polling.
const resizeObserver = new ResizeObserver(() => game.scale.refresh());
resizeObserver.observe(document.querySelector('#game')!);
game.events.once(Phaser.Core.Events.DESTROY, () => resizeObserver.disconnect());

if (import.meta.env.DEV) {
  Object.defineProperty(window, '__reStudent', { value: () => scene.snapshot() });
}
