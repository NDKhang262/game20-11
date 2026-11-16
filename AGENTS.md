# RE:STUDENT — quy ước làm việc

Áp dụng trong repository này. Yêu cầu trực tiếp của người dùng là phạm vi công việc;
không suy diễn đề xuất trong tài liệu thành quyết định đã duyệt.

## Vai trò và nguồn thông tin

- Game Director (ChatGPT/người dùng): cung cấp và duyệt kịch bản, câu đố, nhịp chơi,
  nội dung ký ức, art direction và tiêu chí nghiệm thu.
- Developer (Codex): đọc code, triển khai trong phạm vi được giao, kiểm thử, báo cáo
  bằng chứng, cập nhật tài liệu và đề xuất phương án kỹ thuật.
- `docs/GAME_DESIGN.md`: mục tiêu và phần đã triển khai; `docs/STORY.md`: hợp đồng
  dữ liệu; `docs/PUZZLES.md`: câu đố; `docs/ASSET_GUIDE.md`: tài nguyên.
- `docs/TASKS.md`: trạng thái công việc và kết quả test; `docs/DECISIONS.md`: quyết
  định và nguồn xác nhận; `docs/REVIEW_REQUEST.md`: câu hỏi còn mở cho Director.
- Nếu tài liệu và code khác nhau, ghi rõ sai khác; không tự biến code thành canon.
  Báo cáo cũ trong `BEDROOM-REPORT.md` là lịch sử, không đại diện mọi bản hiện tại.

## Quy trình một nhiệm vụ

1. Kiểm tra cwd, git status, remote/nhánh và đọc các tài liệu liên quan.
2. Ghi phạm vi và tiêu chí vào TASKS; tách phần làm được khỏi câu hỏi thiết kế.
3. Triển khai nhỏ trên nền có sẵn; không viết lại project hoặc xóa chức năng cũ.
4. Chạy kiểm tra phù hợp, ghi PASS/FAIL/CHƯA KIỂM TRA kèm ngày/lệnh/phạm vi.
5. Cập nhật TASKS và DECISIONS; vấn đề chưa chốt ghi REVIEW_REQUEST cùng đề xuất,
   tác động và mặc định tạm thời. Tiếp tục phần độc lập đã được giao.
6. Khi người dùng yêu cầu commit/push, kiểm tra diff/secrets, fetch và bảo toàn lịch
   sử; không force push. Báo SHA và trạng thái đồng bộ. Không tự deploy website.

## Ràng buộc dự án

- Giữ WASD/mũi tên/cảm ứng, tốc độ 120 px/s, hitbox chân, collision và map phòng ngủ
  khi nhiệm vụ không yêu cầu sửa chúng. TestScene cũ là tài liệu kỹ thuật, không canon.
- Không tự sáng tác lời thoại, đáp án câu đố hay gán nội dung ký ức chưa duyệt.
- Nội dung nằm ở `src/game/data/chapter0.json`, mặc định pending/disabled.
  Chỉ đổi approval sau khi có duyệt nội dung rõ ràng và ghi nguồn trong DECISIONS.
  Cơ chế này là quy ước nội dung, không phải cơ chế xác thực/bảo mật.
- Test fixture trong `scripts/fixtures/` không được nhập vào `src/` hoặc coi là kịch bản.
- Không chạy `assets:bedroom` lên map đã chỉnh tay nếu chưa bảo toàn chỉnh sửa.
- Chỉ dùng asset tự tạo hoặc nguồn có quyền sử dụng rõ ràng, ghi xuất xứ.
- Không commit `.env`, khóa, token, node_modules, cache hoặc artifacts.

## Kiểm tra

Node 24 đang dùng cho runner TypeScript; `npm.cmd` phù hợp PowerShell.
Chạy `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`.
Khi sửa scene/input/hội thoại, chạy `npm.cmd run test:browser`; khi sửa pipeline
chương 0, thêm `npm.cmd run test:chapter0:browser`. Hai browser test cần dev server
127.0.0.1:5173 và Chrome. Xác minh server hiện có trước khi khởi chạy mới.
Không gọi mobile giả lập là kiểm thử máy thật; không gọi transition request là scene đã tải.
