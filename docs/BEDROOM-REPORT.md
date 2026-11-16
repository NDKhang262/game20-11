# Báo cáo demo phòng ngủ — 17/11/2026

Dự án: `D:\folder vs code\Game2011\re-student`

Demo đang dùng server có sẵn: http://127.0.0.1:5173/ . Không khởi động server thứ hai,
không dừng tiến trình khác, không thay đổi dependencies hoặc cấu hình bảo mật hệ thống.

## File mới

- `public/assets/maps/bedroom.json`: map 20×15 ô, 32 px, tileset nhúng, năm layer.
- `public/assets/tilesets/bedroom.png`: atlas 256×128 tự tạo bằng mã.
- `public/assets/tilesets/bedroom.tsj`: tileset độc lập để tái sử dụng trong Tiled.
- `public/assets/ASSET-NOTES.md`: nguồn gốc asset và lưu ý khi tái tạo.
- `scripts/generate-bedroom.mjs`: sinh PNG và JSON, không dependency ngoài.
- `src/game/scenes/BedroomScene.ts`: nạp map, va chạm, tương tác, hộp nội dung.
- `src/game/entities/Player.ts`: sprite tự vẽ, hitbox chân.
- `src/game/systems/StoryState.ts`: hệ thống hội thoại, nhiệm vụ và ký ức.
- `src/game/data/story.ts`: catalog rỗng chờ nội dung chính thức.
- `scripts/story.test.mjs`: test hệ thống, kích thước map và khả năng tiếp cận đồ vật.
- `scripts/smoke-legacy.mjs`: bản giữ lại của test màn thử cũ.
- `docs/BEDROOM.md`, `docs/BEDROOM-REPORT.md`: hướng dẫn và báo cáo.

## File chỉnh sửa

- `src/main.ts`: dùng BedroomScene, kích thước 640×480, ResizeObserver cập nhật canvas.
- `index.html`: tên phòng, trạng thái nhiệm vụ/ký ức, dialog tương tác.
- `src/styles/main.css`: khung 4:3, dialog, trạng thái nút tương tác.
- `scripts/smoke.mjs`: test trình duyệt cho phòng ngủ.
- `package.json`: thêm lệnh sinh asset và kiểm thử hệ thống.
- `README.md`: hướng dẫn hiện tại và trạng thái Tiled đã cài.

`TestScene.ts` cũ giữ nguyên. Bản build được cập nhật trong `dist/`. Không tạo commit,
remote, deploy hoặc sửa dự án khác.

## Chức năng

- Đủ sàn gỗ, tường, giường, bàn học, laptop, đồng hồ, giá sách, ảnh và cửa.
- WASD/mũi tên, cảm ứng, chuẩn hóa vận tốc chéo, xóa phím khi mất focus.
- Collision tường/nội thất, camera hiển thị toàn phòng.
- Biểu tượng E cho đồ vật gần nhất; tương tác bằng bàn phím hoặc nút.
- Modal có nút đóng/Escape, ngừng di chuyển trong lúc mở.
- Kiến trúc hội thoại nhiều dòng, điều kiện nhiệm vụ, thu thập ký ức không trùng.
  Catalog nội dung rỗng; demo chỉ thông báo chờ kịch bản.

## Kết quả đã thực thi

| Hạng mục | Kết quả |
| --- | --- |
| Kiểm tra project/dependency trước sửa | PASS — các dependency hiện tại đầy đủ |
| TypeScript / build | PASS |
| Test logic hội thoại/nhiệm vụ/ký ức | PASS với fixture riêng, không đóng gói vào game |
| Tiled 1.12.2 đọc/xuất lại JSON | PASS, exit code 0, không stderr |
| So sánh map xuất lại | PASS — kích thước, tile data và 8 object được giữ nguyên |
| HTTP localhost | PASS — 200 |
| Chrome desktop 1366×1080 | PASS — canvas, cả 8 phím WASD/mũi tên, 7 vùng tương tác |
| Va chạm | PASS — bốn phía tường, bàn học, bàn đồng hồ, giường, giá sách |
| Modal | PASS — mở/đóng và chặn di chuyển |
| Chrome mobile giả lập 390×844, 844×390 | PASS — cảm ứng, nhả nút, va chạm, tương tác, canvas vừa khung sau xoay |
| Console/runtime/HTTP tài nguyên | Không ghi nhận lỗi |

Chứng cứ: `artifacts/bedroom-results.json`, `bedroom-desktop.png`, `bedroom-mobile.png`,
`bedroom-mobile-landscape.png`, `bedroom-tiled-roundtrip.json`, `tiled-error.log`.

## Lỗi đã xử lý và giới hạn

- Cổng 5173 đang dùng đúng bởi server RE:STUDENT: tái sử dụng, không chạy trùng.
- Git báo khác chủ sở hữu: kiểm tra bằng safe.directory chỉ cho từng lệnh, không đổi global config.
- Canvas sau đổi chiều màn hình có thể chưa vừa khung: thêm ResizeObserver, test lại PASS.
- Build vẫn cảnh báo bundle >500 kB (~1.20 MB, gzip ~322 kB) do Phaser; không chặn build.
- Runner test logic dùng experimental transform-types của Node, có cảnh báo experimental.
- Chưa thử điện thoại thật/Safari. Chưa lưu tiến độ qua reload, chưa chuyển cảnh qua cửa.
- Không có thao tác bị chặn bởi kết nối hoặc quyền công cụ trong lần phát triển này.

Tiếp theo: nhập kịch bản chính thức, xác định nhiệm vụ/ký ức và điều kiện mở cửa/chuyển chương.
