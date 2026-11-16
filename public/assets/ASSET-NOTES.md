# Bedroom placeholder assets

`tilesets/bedroom.png` is original geometric pixel artwork generated locally by
`scripts/generate-bedroom.mjs`. No downloaded artwork, fonts or third-party asset
packs are included. The student texture is drawn in `src/game/entities/Player.ts`.
These placeholders may be modified and used with this project.

The atlas uses 32×32 tiles, 8 columns, 4 rows (256×128 RGBA PNG).
Tile IDs 0–16 contain wood variations, back/side walls, six bed parts, desk,
laptop, alarm clock, bookshelf, photo, door and rug. Remaining slots are empty.

`maps/bedroom.json` embeds its tileset for direct Phaser loading, with a relative
image reference valid in Tiled. `tilesets/bedroom.tsj` is a standalone copy for
reuse in future maps; changes to that copy do not automatically change the
embedded tileset in bedroom.json.

The map has Floor, Walls, Furniture, Decorations and Objects layers. The boolean
tile property `collides` controls collision on Walls and Furniture. Objects
contains a player spawn and seven interaction regions with stable IDs,
`label` and `dialogueId` properties. Optional `memoryId` connects an object to an
approved memory catalog entry. No memory content is assigned in this demo.

Running `npm run assets:bedroom` intentionally regenerates the three generated
files. Do not run it over manual Tiled edits without backing them up first.
