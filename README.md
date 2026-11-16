# RE:STUDENT — Nếu Được Học Lại

Bản demo phòng ngủ 20/11 cho RPG 2D / Escape Room: map Tiled 20×15 ô, mỗi ô 32 px, di chuyển, collision và tương tác. Chưa thêm kịch bản chính thức. Xem [hướng dẫn phòng ngủ](docs/BEDROOM.md).

## Phối hợp Director / Developer

Đọc [AGENTS.md](AGENTS.md) trước khi tiếp tục. Bộ tài liệu hiện hành:

- [GAME_DESIGN](docs/GAME_DESIGN.md): phạm vi game và demo thực tế.
- [STORY](docs/STORY.md): JSON hội thoại, effects và trạng thái chương 0.
- [PUZZLES](docs/PUZZLES.md): mẫu bàn giao câu đố, chưa có nội dung duyệt.
- [ASSET_GUIDE](docs/ASSET_GUIDE.md): inventory, nguồn gốc và quy tắc map.
- [TASKS](docs/TASKS.md): việc đã làm/chưa làm và kết quả kiểm thử.
- [DECISIONS](docs/DECISIONS.md): quyết định có nguồn, phân biệt đề xuất.
- [REVIEW_REQUEST](docs/REVIEW_REQUEST.md): câu hỏi cần Director giải quyết.

Chương 0 đã có logic chuẩn bị nhưng chưa bật: báo thức → ba ký ức → sổ → du hành →
yêu cầu sang năm nhất. Chưa có scene năm nhất hoặc lời thoại chính thức. Dữ liệu ở
`src/game/data/chapter0.json`, pending/disabled; test fixture không phải kịch bản.

## Chạy trên Windows PowerShell

```powershell
cd 'D:\folder vs code\Game2011\re-student'
npm.cmd install
npm.cmd run dev
```

Mở http://127.0.0.1:5173/. Dừng server bằng Ctrl+C. Dùng `npm.cmd` để không phụ thuộc PowerShell execution policy. Bộ nhớ đệm npm được đặt tại `.npm-cache` trong dự án; không thay đổi PATH hoặc bảo mật hệ thống.

Node hỗ trợ: 20.19+ trong nhánh 20 hoặc >=22.12; máy hiện dùng 24.15.0. Dependencies được khóa bằng package-lock.json; dùng `npm.cmd ci` để cài lại đúng lockfile.

VS Code đã có ở `D:\Microsoft VS Code` nhưng `code` không nằm trong PATH phiên làm việc. Mở dự án bằng:

```powershell
& 'D:\Microsoft VS Code\bin\code.cmd' .
```

## Điều khiển

- WASD hoặc phím mũi tên; tốc độ đường chéo được chuẩn hóa.
- Nút mũi tên hỗ trợ giữ/chạm trên mobile, nhả nút hoặc chuyển ứng dụng sẽ ngừng điều khiển cảm ứng.
- Đến gần đồ vật có biểu tượng E rồi nhấn E hoặc nút Tương tác; Đóng/Escape để đóng hộp nội dung.
- Camera hiển thị toàn phòng, có giới hạn thế giới và collision tường/nội thất.

## Kiểm tra

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
# Giữ dev server hoạt động ở terminal khác:
npm.cmd run test:browser
npm.cmd run test:chapter0:browser
```

Smoke test dùng Chrome đã cài, không tải Chromium riêng. Kiểm tra HTTP, canvas, WASD/mũi tên, collision, bảy vùng tương tác, hộp nội dung, desktop 1366×1080 và mobile giả lập 390×844 / 844×390, cảm ứng và console. Kết quả/ảnh được lưu tại `artifacts/bedroom-*`. Đây không thay thế kiểm thử điện thoại thật hoặc Safari/iOS.

## Cấu trúc

- `src/main.ts`: khởi tạo Phaser và scale.
- `src/game/scenes/BedroomScene.ts`: phòng ngủ, tải map, collision, tương tác và UI hội thoại.
- `src/game/scenes/TestScene.ts`: giữ lại màn thử cũ.
- `src/game/entities/Player.ts`: nhân vật placeholder và hitbox chân.
- `src/game/systems/StoryState.ts`, `src/game/data/story.ts`: kiến trúc hội thoại/nhiệm vụ/ký ức và catalog chờ kịch bản.
- `src/game/systems/StoryCatalog.ts`, `src/game/data/chapter0.json`: dữ liệu riêng và validation/approval guard.
- `src/game/systems/ChapterZero.ts`: gate chương 0 và handoff sang năm nhất, chưa có scene đích.
- `src/game/systems/Controls.ts`: điều khiển cảm ứng và vòng đời event listener.
- `src/game/entities`, `puzzles`, `data`: chỗ mở rộng nhân vật, câu đố, dữ liệu.
- `src/styles/main.css`: giao diện responsive.
- `public/assets/maps/bedroom.json`, `public/assets/tilesets/bedroom.png`, `bedroom.tsj`: map và tileset tự tạo.
- `scripts/generate-bedroom.mjs`: tái tạo asset (ghi lại file map, không chạy nếu đã sửa map thủ công).
- `scripts/smoke.mjs`: kiểm thử trình duyệt có thể chạy lại.

## Trạng thái môi trường

| Công cụ | Phiên bản | Ban đầu → sau xử lý |
| --- | --- | --- |
| Windows x64 / CPU Intel64 | 25H2, build 26200.9711 | Có sẵn → giữ nguyên |
| Node.js | 24.15.0 | Có sẵn → giữ nguyên |
| npm | 10.9.9 | Có sẵn → dùng cache trong dự án |
| Git | 2.53.0.windows.2 | Có sẵn → khởi tạo repo cục bộ |
| VS Code | 1.115.0 x64 | Có sẵn, thiếu PATH → dùng đường dẫn đầy đủ |
| Phaser | 3.90.0 | Chưa có trong workspace → cài local |
| TypeScript | 5.9.3 | Chưa có → cài local |
| Vite | 8.3.8 | Chưa có → cài local |
| Playwright test | 1.65.1 | Chưa có → cài local |
| Chrome | 157.0.8103.52 | Có sẵn → đã dùng kiểm thử |
| Edge | 157.0.4341.60 | Có sẵn → giữ nguyên, chưa chạy test |
| Tiled | 1.12.2 | Người dùng đã cài → xác nhận CLI đọc/xuất map thành công |
| Aseprite/LibreSprite | Chưa xác định | Không tìm thấy → không bắt buộc, chưa cài |

WMI không được cấp quyền trong sandbox; thông tin Windows lấy từ registry và kiến trúc từ biến môi trường. Registry ghi ProductName cũ là Windows 10 Pro; build được báo nguyên văn để tránh nhầm phiên bản.

## Giới hạn và bước tiếp theo

- Tiled đã có tại `C:\Program Files\Tiled\tiled.exe`; trở ngại cài đặt trước đây đã được giải quyết.
- npm ban đầu báo EPERM do cache ngoài workspace; đã xử lý bằng `.npmrc` cục bộ.
- Build có cảnh báo bundle >500 kB do Phaser (~1.20 MB, gzip ~321 kB); build vẫn thành công. Tối ưu tải khi game có nhiều scene/assets.
- VS Code CLI in cảnh báo Crashpad access denied trong sandbox nhưng trả phiên bản thành công; không thay đổi quyền hệ thống.
- Chưa chạy trên điện thoại thật. Chỉ Chrome đã được kiểm thử.
- Repository: https://github.com/NDKhang262/game20-11 — remote `origin`, nhánh `main`. Đây là lưu mã nguồn, chưa triển khai website công khai.
- Git có khác biệt chủ sở hữu giữa tài khoản sandbox ban đầu và Admin; kiểm tra bằng `git -c safe.directory='D:/folder vs code/Game2011/re-student' status`, không cần sửa cấu hình toàn hệ thống.
- Bước tiếp theo: nhận kịch bản chính thức để điền hội thoại, nhiệm vụ, ký ức và điều kiện chuyển sang năm nhất.

Yêu cầu Node của Vite được đối chiếu với https://vite.dev/guide/ và trường engines của package đã cài.
