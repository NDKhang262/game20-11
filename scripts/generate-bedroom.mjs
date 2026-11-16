// Original geometric pixel placeholders. No external artwork or dependencies.
import { deflateSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../public/assets/', import.meta.url));
const width = 256, height = 128;
const pixels = Buffer.alloc(width * height * 4);
function rect(x, y, w, h, hex) {
  const color = hex.match(/../g).map(value => parseInt(value, 16));
  for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) {
    const i = (py * width + px) * 4;
    pixels.set([...color, 255], i);
  }
}
function tile(id, draw) {
  const ox = id % 8 * 32, oy = Math.floor(id / 8) * 32;
  draw((x, y, w, h, color) => rect(ox + x, oy + y, w, h, color));
}
for (const id of [0, 1]) tile(id, r => {
  r(0, 0, 32, 32, id ? 'a37a52' : 'ad8258');
  for (let y = 0; y < 32; y += 8) {
    r(0, y, 32, 1, '77563f'); r(0, y + 1, 32, 1, 'bf9768');
    r((y % 16 ? 23 : 8), y, 1, 8, '77563f');
    r(13, y + 5, 7, 1, '97704d');
  }
});
tile(2, r => { r(0, 0, 32, 32, '425c59'); r(0, 1, 32, 2, '799185'); r(0, 24, 32, 8, '304440'); r(0, 25, 32, 2, 'b89b6e'); });
tile(3, r => { r(0, 0, 32, 32, '304440'); r(3, 0, 26, 32, '425c59'); r(3, 0, 2, 32, '799185'); });
for (let id = 4; id <= 9; id++) tile(id, r => {
  r(0, 0, 32, 32, '553f35'); r(2, 0, 28, 32, '967357');
  r(4, 0, 24, 32, '477c84'); r(6, 0, 2, 32, '609ba0');
  if (id <= 5) { r(4, 3, 24, 11, 'e0d9b6'); r(7, 5, 19, 7, 'f4e9cb'); r(4, 17, 24, 3, '86b4ad'); }
  if (id >= 8) { r(2, 27, 28, 5, '553f35'); r(4, 27, 24, 2, 'b68e62'); }
});
tile(10, r => { r(0, 0, 32, 32, '604632'); r(1, 1, 30, 25, 'c39a64'); r(2, 3, 28, 2, 'e1bb7f'); r(2, 28, 4, 4, '46372e'); r(26, 28, 4, 4, '46372e'); });
tile(11, r => { r(4, 4, 24, 17, '233b43'); r(6, 6, 20, 12, '7fc0bd'); r(8, 8, 10, 2, 'c3ebd5'); r(2, 22, 28, 4, 'acb9ae'); r(6, 22, 20, 2, '4f6669'); });
tile(12, r => { r(5, 4, 7, 4, 'd19b62'); r(20, 4, 7, 4, 'd19b62'); r(6, 8, 20, 20, 'd19b62'); r(9, 10, 14, 14, 'f4e9cb'); r(15, 12, 2, 7, '435151'); r(15, 17, 6, 2, '435151'); r(7, 28, 4, 3, '493f37'); r(21, 28, 4, 3, '493f37'); });
tile(13, r => {
  r(0, 0, 32, 32, '513f34'); r(2, 1, 28, 30, '876547');
  for (let row = 0; row < 2; row++) {
    ['638b83','d5b175','ab6961','899bad','dac9a0'].forEach((c, i) => r(4 + i * 5, 3 + row * 15, 4, 10, c));
    r(2, 13 + row * 15, 28, 3, 'b89060');
  }
});
tile(14, r => { r(3, 2, 26, 28, '644733'); r(5, 4, 22, 24, 'e5c48c'); r(7, 6, 18, 20, '7fa7a1'); r(9, 12, 5, 5, 'edd4aa'); r(18, 10, 5, 5, 'edd4aa'); r(8, 18, 7, 8, '5a7188'); r(17, 16, 7, 10, 'b77966'); });
tile(15, r => { r(0, 0, 32, 32, '343e36'); r(3, 0, 26, 32, 'a67b50'); r(6, 3, 20, 25, '795940'); r(8, 5, 16, 20, '94704d'); r(24, 17, 3, 3, 'f3d493'); r(0, 29, 32, 3, 'd1b27c'); });
tile(16, r => { r(0, 0, 32, 32, '627b73'); r(1, 1, 30, 30, '8ca494'); r(3, 3, 26, 26, '536f67'); r(6, 6, 20, 20, '6e8a7b'); });
// PNG encoding: RGBA + unfiltered rows, CRC32 for each chunk.
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(name, data) {
  const type = Buffer.from(name); const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([length, type, data, crc]);
}
const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
const rows = Buffer.alloc((width * 4 + 1) * height);
for (let y = 0; y < height; y++) pixels.copy(rows, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
await mkdir(resolve(root, 'tilesets'), { recursive: true });
await mkdir(resolve(root, 'maps'), { recursive: true });
await writeFile(resolve(root, 'tilesets/bedroom.png'), Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]));

const names = ['wood-a','wood-b','wall-back','wall-side','bed-top-left','bed-top-right','bed-middle-left','bed-middle-right','bed-foot-left','bed-foot-right','desk','laptop','alarm','bookshelf','photo','door','rug'];
const tileset = { name: 'bedroom', tilewidth: 32, tileheight: 32, tilecount: 32, columns: 8, margin: 0, spacing: 0, image: '../tilesets/bedroom.png', imagewidth: width, imageheight: height,
  tiles: names.map((name, id) => ({ id, properties: [{ name: 'label', type: 'string', value: name }, { name: 'collides', type: 'bool', value: id >= 2 && id <= 10 || id === 13 || id === 15 }] })) };
let layerId = 1;
function layer(name) { return { id: layerId++, name, type: 'tilelayer', width: 20, height: 15, x: 0, y: 0, opacity: 1, visible: true, data: Array(300).fill(0) }; }
function put(layer, x, y, gid) { layer.data[y * 20 + x] = gid; }
const floor = layer('Floor'), walls = layer('Walls'), furniture = layer('Furniture'), decorations = layer('Decorations');
for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++) {
  put(floor, x, y, (x + y) % 3 === 0 ? 2 : 1);
  if (y < 2 || y === 14) put(walls, x, y, 3);
  if (x === 0 || x === 19) put(walls, x, y, 4);
}
for (let y = 7; y <= 10; y++) for (let x = 8; x <= 11; x++) put(floor, x, y, 17);
for (let y = 0; y < 3; y++) for (let x = 0; x < 2; x++) put(furniture, 3 + x, 3 + y, 5 + y * 2 + x);
for (let y = 3; y <= 4; y++) for (let x = 12; x <= 14; x++) put(furniture, x, y, 11);
put(furniture, 6, 4, 11); put(decorations, 6, 4, 13);
put(decorations, 13, 4, 12);
for (let y = 8; y <= 10; y++) for (let x = 16; x <= 17; x++) put(furniture, x, y, 14);
put(decorations, 9, 1, 15); put(walls, 10, 14, 16);
let objectId = 1;
const object = (name, x, y, w, h, label) => ({ id: objectId++, name, type: 'interactable', x: x * 32, y: y * 32, width: w * 32, height: h * 32, rotation: 0, visible: true, properties: [{ name: 'label', type: 'string', value: label }, { name: 'dialogueId', type: 'string', value: `bedroom.${name}` }] });
const objects = [object('bed',3,3,2,3,'Giường'), object('desk',12,3,3,1,'Bàn học'), object('laptop',13,4,1,1,'Laptop'), object('alarm',6,4,1,1,'Đồng hồ báo thức'), object('bookshelf',16,8,2,3,'Giá sách'), object('photo',9,1,1,1,'Ảnh kỷ niệm'), object('door',10,14,1,1,'Cửa phòng')];
objects.push({ id: objectId++, name: 'spawn', type: 'spawn', x: 320, y: 304, point: true, width: 0, height: 0, rotation: 0, visible: true });
const map = { type: 'map', version: '1.10', tiledversion: '1.12.2', orientation: 'orthogonal', renderorder: 'right-down', width: 20, height: 15, tilewidth: 32, tileheight: 32, infinite: false, nextlayerid: 6, nextobjectid: objectId, backgroundcolor: '#243c3a', layers: [floor,walls,furniture,decorations,{ id: 5, name: 'Objects', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects }], tilesets: [{ firstgid: 1, ...tileset }] };
await writeFile(resolve(root, 'maps/bedroom.json'), JSON.stringify(map, null, 2) + '\n');
await writeFile(resolve(root, 'tilesets/bedroom.tsj'), JSON.stringify({ ...tileset, image: 'bedroom.png', type: 'tileset', version: '1.10', tiledversion: '1.12.2' }, null, 2) + '\n');
console.log('Generated bedroom.png, bedroom.tsj and bedroom.json (20×15, 32px).');
