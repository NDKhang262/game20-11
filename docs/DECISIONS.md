# DECISIONS

Mỗi quyết định ghi nguồn, trạng thái và tác động. Đề xuất kỹ thuật không phải kịch bản đã duyệt.

| ID | Ngày / trạng thái | Quyết định và nguồn |
| --- | --- | --- |
| D-001 | 2026-11-17 / đã giao | Người dùng chọn Phaser 3 + TypeScript + Vite, desktop/mobile, chủ đề 20/11 |
| D-002 | 2026-11-17 / đã giao | Phòng ngủ 20×15, ô 32 px, placeholder tự tạo, collision và touch |
| D-003 | 2026-11-17 / đã giao | Giữ gameplay hiện có, không tự sáng tác lời thoại chưa duyệt |
| D-004 | 2026-11-17 / đã giao | Chuẩn bị logic báo thức → ba ký ức → sổ → du hành → năm nhất; yêu cầu mới nhất của người dùng |
| D-005 | 2026-11-17 / kỹ thuật đã triển khai | JSON schemaVersion=1; parser kiểm tra kiểu/ID/action; pending không được nạp vào UI |
| D-006 | 2026-11-17 / kỹ thuật đã triển khai | State machine độc lập Phaser; sai thứ tự/trùng không đổi state; snapshot sao chép |
| D-007 | 2026-11-17 / kỹ thuật đã triển khai | Chuyển cảnh tách request/confirm; chưa có scene đích thì không báo hoàn thành |
| D-008 | 2026-11-17 / tạm thời, chờ RR-01/04 | Thu ký ức tự do sau tắt báo thức; effect khi bấm Next qua dòng cuối; hủy thì không effect |
| D-009 | 2026-11-17 / giữ nguyên hiện trạng | RAM-only; không thêm save, asset, input hoặc collision trong tác vụ này |
| D-010 | 2026-11-17 / đã được yêu cầu | Commit/push main trên NDKhang262/game20-11; không force hoặc deploy |

Chưa có revision hội thoại/nội dung ký ức/câu đố nào được duyệt. Không đổi D-008
thành thiết kế chính thức chỉ vì test đã PASS. Khi Director trả lời RR, ghi quyết
định mới liên kết RR, revision và bằng chứng trả lời; giữ lịch sử quyết định cũ.
