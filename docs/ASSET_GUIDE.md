# ASSET GUIDE

## Inventory hiện tại

| Asset | Nguồn / kích thước / trạng thái |
| --- | --- |
| bedroom.png | Tự sinh bằng generate-bedroom.mjs; PNG RGBA 256×128, ô 32×32, 8 cột |
| bedroom.tsj | Tileset độc lập Tiled, 32 slot, ID 0–16 có hình, các slot còn lại trống |
| bedroom.json | Map orthogonal 20×15, nhúng tileset, image tương đối ../tilesets/bedroom.png |
| student texture | Hình chữ nhật pixel trong Player.ts, 26×32, không có spritesheet animation |
| Audio, ảnh UI, portrait | Chưa có; thư mục giữ chỗ |

Không tải asset bên ngoài. Nguồn gốc và quyền dùng placeholder trong
`public/assets/ASSET-NOTES.md`; repository chưa tuyên bố giấy phép tổng thể cho mọi
đóng góp tương lai. Asset mới cần URL nguồn, tác giả, giấy phép và attribution nếu có.

## Quy ước map

Layer Floor, Walls, Furniture, Decorations, Objects. Collision chỉ trên Walls và
Furniture theo property bool `collides`. Object type interactable có `name`, label,
dialogueId và vùng chữ nhật. Spawn có tên spawn. Không đổi các ID hoặc hitbox để sửa
kịch bản nếu chưa xác định tác động. Cuốn sổ hiện chưa có hình/object riêng (RR-03).

File TSJ độc lập không được map tham chiếu trực tiếp: sửa TSJ không tự cập nhật
tileset nhúng. Nếu đổi atlas, đồng bộ metadata trong map và TSJ, kiểm tra lại Phaser/Tiled.
Không chạy `npm run assets:bedroom` sau sửa map thủ công mà không giữ bản sửa;
generator ghi lại cả PNG, TSJ và JSON. Không cần chạy generator trong tác vụ tài liệu.

## Khi thay placeholder

Giữ tỉ lệ ô 32 px và ghi thay đổi pivot/hitbox; dùng nearest-neighbor/pixelArt.
Test đường đi tới đủ 7 vùng, collision, ảnh desktop/mobile, resize dọc/ngang và
khả năng đọc biểu tượng E. Không tự thay theme hay vị trí nội thất theo hình tham khảo.
Tiled đã từng được kiểm tra CLI ở bản phòng ngủ; xem báo cáo cũ, không coi là test
mới nếu file chưa được chạy lại. Chưa có animation hoặc âm thanh báo thức được duyệt.
