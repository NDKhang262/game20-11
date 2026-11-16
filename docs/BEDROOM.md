# Phòng ngủ ngày 20/11

## Chạy và chỉnh sửa

Game dùng `BedroomScene`, map 20×15 ô, 32×32 px (640×480), camera hiển thị toàn phòng.
Mở http://127.0.0.1:5173/ nếu server đã chạy; chỉ chạy `npm.cmd run dev` khi chưa có
server. Lỗi “Port 5173 is already in use” nghĩa là cổng đã có tiến trình sử dụng,
không nên mở thêm server hoặc tự dừng tiến trình không xác định.

Map chính: `public/assets/maps/bedroom.json`. Có thể mở trực tiếp trong Tiled bằng
File → Open. Tiled đã được tìm thấy tại `C:\Program Files\Tiled\tiled.exe` và đã
kiểm tra đọc/xuất JSON bằng CLI. Ảnh atlas là `public/assets/tilesets/bedroom.png`.
Các asset đều tạo từ mã nguồn, không tải bộ đồ họa bên ngoài.

## Điều khiển và tương tác

- WASD, phím mũi tên hoặc giữ các nút cảm ứng; tốc độ 120 px/s, chuẩn hóa đường chéo.
- Nhân vật dùng hitbox chân 18×14 px; tường, cửa đóng và nội thất có collision.
- Khi cách vùng tương tác không quá 52 px, biểu tượng E xuất hiện trên đồ vật gần nhất.
- E hoặc nút Tương tác mở hộp nội dung; nhân vật đứng yên khi hộp đang mở.
- Đóng bằng nút Đóng hoặc Escape. Chuyển tab/mất focus sẽ xóa trạng thái giữ phím.
- Bảy vùng: giường, bàn học, laptop, đồng hồ, giá sách, ảnh, cửa. Cửa chưa chuyển scene.

## Kịch bản chính thức

`src/game/data/chapter0.json` là điểm nhập nội dung; `story.ts` nạp và kiểm tra dữ liệu.
Hiện ba catalog đều rỗng, approval pending và chapter0 disabled. Xem [STORY.md](STORY.md).
Không có lời thoại, nhiệm vụ hay ký ức tự sáng tác. Thông báo khi tương tác chỉ là
trạng thái thiếu nội dung, không phải hội thoại của nhân vật.

`StoryState.ts` tách ba hệ thống khỏi Phaser:

- `DialogueSystem`: tìm kịch bản theo ID, đọc từng dòng, chuyển dòng và đóng.
- `QuestSystem`: ghi nhận tương tác theo ID và tính hoàn thành từ các điều kiện
  tương tác/ký ức được khai báo. Gọi lặp một tương tác không nhân đôi tiến độ.
- `MemorySystem`: chỉ nhận ID trong catalog, ngăn thu thập trùng.

ID hội thoại dự kiến: `bedroom.bed`, `bedroom.desk`, `bedroom.laptop`,
`bedroom.alarm`, `bedroom.bookshelf`, `bedroom.photo`, `bedroom.door`.
`memoryId` trên object là cơ chế generic cũ. Ký ức chương 0 dùng action onComplete
trong dữ liệu hội thoại sau khi duyệt nội dung/mapping, không tự thêm property vào map.
Tiến độ hiện chỉ nằm trong RAM, chưa lưu qua lần tải lại trang. Đã có gate logic
chương 0 và event yêu cầu chuyển chương, nhưng chưa có branching dialogue, mở cửa
thật hoặc scene năm nhất; xem REVIEW_REQUEST để chốt thiết kế.

## Kiểm thử

```powershell
npm.cmd run typecheck
npm.cmd run test:systems
npm.cmd run test:chapter0
npm.cmd run build
# Khi dev server đang chạy:
npm.cmd run test:browser
npm.cmd run test:chapter0:browser
```

`test:systems` hiện dùng Node 24 với experimental transform-types để chạy TypeScript
trực tiếp, không thêm dependency. Cảnh báo experimental chỉ áp dụng cho runner này.
Fixture A/B trong test không được đóng gói vào game.

Browser test đi bộ bằng input thật trong game, không teleport: tám phím di chuyển,
bảy điểm tương tác, chặn di chuyển trong hộp thoại, va chạm tường và nội thất,
cảm ứng, nhả nút, bố cục dọc/ngang và lỗi console/HTTP. Kết quả, ảnh và bản Tiled
xuất lại nằm trong `artifacts/bedroom-*`. Mobile là giả lập Chrome, chưa thử máy thật.

Màn thử cũ `TestScene.ts` được giữ nguyên. `scripts/smoke-legacy.mjs` lưu test cũ để
tham khảo; nó không chạy được với scene phòng ngủ và không nằm trong lệnh test hiện tại.
