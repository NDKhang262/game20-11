# TASKS — theo dõi bàn giao

Cập nhật 17/11/2026, nền e56d44c. Trạng thái implementation tách khỏi kết quả kiểm thử.

| ID | Chủ trì | Công việc | Trạng thái implementation |
| --- | --- | --- | --- |
| T-001 | Developer | Đọc cấu trúc, source, config, script, map/tileset và tài liệu hiện tại | Đã đọc; không đọc vendor/generated build như source tự viết |
| T-002 | Developer | AGENTS và 7 tài liệu phối hợp | Đã tạo |
| T-003 | Developer | JSON hội thoại, parser, approval guard | Đã triển khai; catalog chưa có nội dung chính thức |
| T-004 | Developer | Logic chương 0 và completion action adapter | Đã triển khai, mặc định disabled |
| T-005 | Developer | Bảo toàn input/collision/map và regression | Đã xác minh bằng diff và browser PASS |
| T-006 | Director | Revision hội thoại, 3 ký ức, mapping và sổ | Chờ RR-01..04/09 |
| T-007 | Director + Developer | Art/audio du hành và scene năm nhất | Chưa triển khai; chờ RR-05 |
| T-008 | Director + Developer | Puzzle/hint, HUD, save | Chưa triển khai; chờ RR-06..08 |
| T-009 | Developer | Commit/push main và kiểm tra SHA remote | Chuẩn bị bàn giao; SHA và đồng bộ được xác nhận trong báo cáo cuối |

## Kiểm thử của lần bàn giao này

| Lệnh/phạm vi | Kết quả thực tế |
| --- | --- |
| npm.cmd run typecheck | PASS, đã chạy 17/11/2026 |
| npm.cmd test | PASS, hệ thống cũ + chương 0/schema/approval/completion/cancel |
| npm.cmd run build | PASS, còn cảnh báo chunk >500 kB |
| npm.cmd run test:browser | PASS, desktop 1366×1080 + mobile giả lập 390×844 / 844×390; console/runtime không lỗi |
| npm.cmd run test:chapter0:browser | PASS, fixture riêng: nạp JSON, cancel, đọc hết, gate, memory/quest, request năm nhất và reset khi reload; không phải kịch bản chính thức |
| Tiled CLI roundtrip | Không chạy lại lần này; map/tileset không đổi, kết quả lịch sử ở BEDROOM-REPORT |
| Điện thoại thật / Safari | CHƯA KIỂM TRA |
| Chơi chương 0 với kịch bản chính thức | CHƯA KIỂM TRA — chưa có nội dung |
| Scene năm nhất tải thật | CHƯA TRIỂN KHAI |

Unit test đã kiểm tra sáu thứ tự ký ức, gate trước/sau báo thức, ID sai/trùng,
không mở sổ sớm, không du hành sớm, không confirm trước request, tiêu thụ effects
một lần, cancel, dữ liệu sai và pending. Test scene đích chỉ xác nhận hợp đồng logic.

Chứng cứ local: output terminal, artifacts/bedroom-results.json và
artifacts/chapter0-results.json. Artifacts bị gitignore;
người review clone repo chạy lại lệnh để tái hiện. npm test cần Node 24 trong môi
trường hiện tại, runner có cảnh báo experimental-transform-types.

Tiêu chí đóng T-005: regression desktop/mobile PASS, git diff xác nhận map/Player/
Controls/CSS không đổi. T-009: commit có SHA, local/remote cùng SHA và status sạch.

## Lỗi phát hiện và xử lý trong lần này

Lần browser đầu FAIL do Vite cũ trả 504 Outdated Optimize Dep cho Phaser, canvas
không khởi tạo. Đã xác minh đúng PID của server dự án, khởi động lại với
`npm.cmd run dev -- --force` để tối ưu lại cache, sau đó chạy lại cả hai bộ browser:
PASS. Đây là tùy chọn Vite, không phải git push --force. Không đổi dependency.
Stop-Process gặp lỗi PowerShell; dừng đúng PID đã xác minh bằng taskkill rồi khởi động lại.

Review parser phát hiện type action có thể nhận mảng một chuỗi qua ép kiểu String;
đã đổi sang validation chuỗi thực sự và thêm negative test. Build vẫn chỉ cảnh báo
bundle Phaser lớn (~1.21 MB / gzip ~324 kB); không có lỗi build chưa xử lý.
