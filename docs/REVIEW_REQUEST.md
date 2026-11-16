# REVIEW REQUEST — chương 0

Gửi Game Director qua báo cáo repository; chưa gửi tin nhắn tới dịch vụ ngoài.
Mốc nền: e56d44c (demo phòng ngủ). Các câu hỏi dưới đây không chặn việc giao nền tảng
kỹ thuật; chúng chặn việc bật kịch bản chính thức. Tất cả đang OPEN, chưa được duyệt.

| ID | Câu hỏi cần quyết định | Đề xuất của Developer / mặc định hiện tại | Tác động |
| --- | --- | --- | --- |
| RR-01 | Có bắt buộc tắt báo thức trước không? Ba ký ức có thứ tự cố định không? | Tắt báo thức trước; ký ức tự do thứ tự; đủ 3 mới mở sổ | State machine đã chuẩn bị theo đề xuất, chưa bật |
| RR-02 | Ba ký ức chương 0 là gì, gắn vào đâu; có tính vào bốn mảnh của bốn năm không? | Dùng 3 ID chương 0 riêng, không cộng vào bộ bốn năm cho tới khi duyệt | Chưa có title/text hoặc mapping đồ vật |
| RR-03 | Cuốn sổ nằm ở đâu, là object mới hay tương tác phụ ở bàn? | Object notebook riêng trên bàn sau khi được duyệt; hiện chưa thêm vào map | Cần asset/vùng tương tác/dialogueId, tránh đụng laptop/desk |
| RR-04 | Ghi tiến độ lúc mở đồ vật hay sau đọc hết? Đóng/Escape và đọc lại xử lý thế nào? | Effects chương 0 chỉ khi Next qua dòng cuối; đóng thì hủy; ký ức không trùng | Quest legacy vẫn ghi interaction khi mở modal; cần chốt trước viết quest chính thức |
| RR-05 | Du hành được kích hoạt từ đâu, hiệu ứng/âm thanh/thời lượng gì, scene năm nhất và spawn nào? | Event request rồi scene đích xác nhận tải; chưa tạo scene/cutscene giả | Hiện chỉ tới year-one-pending, không báo game đã sang năm nhất |
| RR-06 | Chương 0 có puzzle/hint/thất bại hay chỉ hướng dẫn tương tác? | Chỉ onboarding cho tới khi có đề bài/đáp án duyệt | Chưa có puzzle implementation |
| RR-07 | HUD cần hiện mục tiêu, tên ký ức và phản hồi khi chưa đủ điều kiện thế nào? | Giữ UI demo, không tự viết thông báo cốt truyện | Action bị từ chối hiện chỉ có kết quả logic, chưa có UI hướng dẫn riêng |
| RR-08 | Có cần save/checkpoint ở chương 0 không? | Giữ RAM-only trong demo, cân nhắc lưu sau mở sổ | Reload reset; chưa có versioned save/migration |
| RR-09 | Nội dung chính thức gồm người nói, từng dòng và lời dẫn nào? | Director giao theo bảng bên dưới, Developer chuyển thành JSON | Chưa có thoại tự sáng tác, JSON pending/disabled |

## Mẫu trả lời / bàn giao

`RR-ID | Chấp thuận/Thay đổi | Nội dung quyết định | Revision/ngày`

Với hội thoại: `dialogueId | objectId/trigger | speaker | các dòng theo thứ tự |
điều kiện mở | onComplete | đọc lại/hủy`. Với ký ức: `id | title | nội dung đã duyệt |
đồ vật nguồn | quan hệ với bốn năm`. Với scene năm nhất: `scene ID | map | spawn |
điều kiện vào | giao diện/cutscene`.

Không cần Director tự thao tác Tiled. Developer sẽ gắn dữ liệu/asset sau khi nhận
các lựa chọn thiết kế; không coi fixture test hoặc đề xuất ở đây là câu trả lời.
