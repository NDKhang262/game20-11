# PUZZLES

Hiện chưa có câu đố chơi được, đáp án, cơ chế nhập đáp án, hint hay điều kiện thất bại.
`src/game/puzzles/` đang trống. Luồng điều kiện chương 0 là nền tảng tiến độ, không
được báo là đã hoàn thành câu đố Escape Room.

## Định hướng đã có

Bốn năm đại học có câu đố CNTT tăng độ khó. Chủ đề, kiến thức cụ thể, lời giải và
cách đánh giá cần Game Director cung cấp; chưa tự chọn thuật toán hoặc nội dung học.

## Mẫu bàn giao một câu đố

| Mục | Director cần cung cấp |
| --- | --- |
| ID / revision / trạng thái duyệt | ID ổn định theo chương, người và ngày duyệt |
| Mục tiêu | Kiến thức và vai trò trong câu chuyện |
| Trigger / điều kiện mở | Object hoặc sự kiện; nhiệm vụ/ký ức tiên quyết |
| Đề bài / UI | Nguyên văn đã duyệt; bàn phím và cảm ứng |
| Đáp án / validator | Các đáp án hợp lệ; phân biệt chữ hoa, khoảng trắng, nhiều lời giải |
| Hint / sai / bỏ qua | Nội dung duyệt, số lần thử, reset và cách tránh kẹt tiến độ |
| Phần thưởng | Event/quest/memory ID, không nhận trùng |
| Nghiệm thu | Ca đúng/sai/biên, reload, touch, accessibility |

Không lưu bí mật thực sự trong puzzle client HTML5. Chưa có hệ thống chống gian lận
hay backend. Đề xuất ban đầu: chương 0 chỉ hướng dẫn tương tác; hỏi RR-06 trước khi
thêm câu đố hoặc điều kiện thất bại.
