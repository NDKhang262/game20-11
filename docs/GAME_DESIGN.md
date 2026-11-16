# GAME DESIGN — RE:STUDENT

Trạng thái: tài liệu nền ngày 17/11/2026. Phân biệt định hướng người dùng và demo hiện tại.

## Định hướng đã cung cấp

- RE:STUDENT – Nếu Được Học Lại; RPG 2D top-down pixel art kết hợp Escape Room.
- HTML5 cho trình duyệt desktop/mobile, chủ đề Ngày Nhà giáo Việt Nam 20/11.
- Nhân vật chính là sinh viên CNTT; hồi tưởng và trở lại năm nhất, đi qua bốn năm
  đại học với câu đố CNTT tăng độ khó, thu thập bốn mảnh ký ức để mở kết thúc tri ân.
- Chi tiết lời thoại, câu đố và tên nhân vật chưa được duyệt.
- Yêu cầu mới: chương 0 có báo thức, ba ký ức, cuốn sổ, du hành thời gian và năm nhất.
  Quan hệ giữa ba ký ức này với bốn mảnh của toàn game chưa chốt (RR-02).

## Demo đang chạy

| Thành phần | Hiện trạng |
| --- | --- |
| Phaser 3.90 / TypeScript 5.9 / Vite 8.3 | Đã có, không đổi dependency lần này |
| Phòng ngủ | 20×15 ô, ô 32 px, camera toàn phòng 640×480 |
| Điều khiển | WASD, mũi tên, nút chạm; tốc độ 120 px/s, chuẩn hóa đường chéo |
| Collision | Hitbox chân 18×14; Walls/Furniture dùng tile property collides |
| Tương tác | 7 vùng; chọn gần nhất trong 52 px; biểu tượng E và nút HTML |
| Hội thoại | Modal HTML, Next/Đóng/Escape, dừng di chuyển; nội dung JSON riêng |
| Chương 0 | State machine và adapter completion đã có; mặc định chưa bật |
| Năm nhất | Chưa có scene/map; chỉ hợp đồng yêu cầu chuyển và xác nhận tải |
| Âm thanh/animation/cutscene/save | Chưa triển khai |

## Cấu trúc đọc code

`main.ts` tạo BedroomScene → scene nạp map/atlas và tạo Player/Controls.
Map giữ bố cục, collision và object IDs. Scene giữ tương tác và UI.
`data/story.ts` đọc JSON → `StoryCatalog.ts` kiểm tra và lọc nội dung chưa duyệt.
`StoryState.ts` quản lý hội thoại, nhiệm vụ, ký ức; `ChapterZero.ts` quản lý thứ tự
chương 0. Logic này độc lập với Phaser, được kiểm tra bằng fixture riêng.

`src/game/puzzles/` vẫn trống; audio/characters/images/ui là thư mục dự phòng.
Sprite sinh trong Player.ts. TestScene và smoke-legacy là bản thử cũ không được
đăng ký ở main. Chỉ assets và nội dung được import vào src đi vào bản build.

## Tiêu chí không hồi quy

Giữ nguyên map, tileset, collision, input, phạm vi tương tác và UI mặc định.
Nội dung pending không thay đổi tiến độ khi người chơi tương tác. JSON không hợp
lệ phải bị kiểm thử dữ liệu phát hiện trước tích hợp. Không mở cửa hoặc đưa người
chơi sang scene chưa tồn tại. Kết quả chạy thực tế xem TASKS, không suy ra từ bảng này.
