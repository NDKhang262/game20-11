# STORY — hợp đồng nội dung chương 0

Nguồn nội dung chính thức: Game Director. Chưa có lời thoại được cung cấp.
`src/game/data/chapter0.json` là nguồn dữ liệu; `story.ts` chỉ là adapter.
JSON được Vite import khi build, không tải từ API hoặc dịch vụ ngoài.

## Trạng thái dữ liệu đang giao

`schemaVersion: 1`, `approval: "pending"`, `chapter0.enabled: false`.
Ba danh sách dialogues/memories/quests rỗng. Các ID `chapter0.memory.1..3` chỉ là
slot kỹ thuật, không phải tên/nội dung ký ức. Luồng chính thức chưa chơi được.
`runtimeStory` không đưa nội dung pending vào UI; bật chương khi pending là lỗi validation.

## Định dạng

| Trường | Quy tắc |
| --- | --- |
| schemaVersion | Số 1 |
| approval | pending hoặc approved; ghi bằng chứng duyệt trong DECISIONS |
| chapter0 | enabled boolean; memoryIds đúng 3 ID khác nhau |
| dialogues[] | id duy nhất, lines không rỗng; onComplete tùy chọn |
| lines[] | text không rỗng; speaker tùy chọn; hiển thị bằng textContent, không HTML |
| memories[] | id duy nhất, title không rỗng, chapter 0..4 |
| quests[] | id/title, requiredInteractions[], requiredMemories[] tùy chọn |

Parser từ chối field lạ, phiên bản sai, ID trùng, kiểu sai, lời thoại rỗng,
action không hỗ trợ và tham chiếu ký ức thiếu. Khi bật chương, ba memoryIds phải có
định nghĩa chapter=0. Quest requiredInteractions là tên object trong map; cần đối
chiếu map khi duyệt nội dung, parser chưa biết toàn bộ object của các scene tương lai.

Dialog IDs hiện được map tham chiếu: `bedroom.bed`, `.desk`, `.laptop`, `.alarm`,
`.bookshelf`, `.photo`, `.door` (đều có tiền tố bedroom). Chưa có `.notebook` hoặc
object cuốn sổ. Thêm ID mới phải gắn object/trigger thật; parser không tự tạo object.

## Effects và các trạng thái

`onComplete` là danh sách action có trường `type`; riêng `memory.collect` thêm
`memoryId`. Effects chạy theo thứ tự sau khi bấm Next vượt qua dòng cuối.
Đóng/Escape giữa chừng không chạy effects. Chưa có branching, choices hoặc điều
kiện chọn phiên bản hội thoại. Quest cũ vẫn ghi nhận việc tương tác khi mở modal;
khác với effect chương 0 khi đọc xong, cần Director duyệt RR-04.

| Trạng thái trước | Action/điều kiện | Trạng thái sau |
| --- | --- | --- |
| alarm-ringing | alarm.off | collecting-memories |
| collecting-memories | memory.collect với một trong ba ID, chưa có | giữ nguyên tới khi đủ 3 |
| collecting-memories | đủ ba ID khác nhau | notebook-ready |
| notebook-ready | notebook.open | notebook-open |
| notebook-open | timeTravel.activate | time-travel-active |
| time-travel-active | yearOne.request | year-one-pending |
| year-one-pending | scene đích gọi confirmYearOneLoaded() | year-one |

Action sai thứ tự/ID lạ/trùng trả false, không đổi state. Ba ký ức tạm cho phép lấy
theo mọi thứ tự sau tắt báo thức; đây là đề xuất kỹ thuật cần xác nhận RR-01.
State snapshot là bản sao; complete chỉ true khi scene đích xác nhận thật.

BedroomScene chỉ nhận effects nếu enabled. Thu ký ức hợp lệ cập nhật MemorySystem
và HUD. Khi có yêu cầu sang năm nhất, scene emit `chapter0:year-one-requested`
kèm snapshot. Chưa có consumer/scene đích/cutscene; không gọi confirm tự động.
Tắt báo thức hiện chỉ là cờ logic, không có âm thanh để tắt. Toàn bộ tiến độ ở RAM.

## Quy trình nhận kịch bản

1. Director giao revision, ID hội thoại/object, người nói, từng dòng, action kết thúc,
   điều kiện, nội dung ba ký ức và chính sách đọc lại/hủy.
2. Developer đối chiếu map, ghi các thiếu sót vào REVIEW_REQUEST; không tự điền thoại.
3. Ghi duyệt revision vào DECISIONS, điền JSON, chỉ bật khi mapping và luồng đã sẵn sàng.
4. Chạy typecheck, npm test, build, browser regression và browser nội dung được duyệt.
5. Báo phạm vi đã chạy, SHA và giới hạn. Fixture không thay thế duyệt nội dung.

Fixture trong `scripts/fixtures/chapter0.mjs` dùng [TEST A/B] và gán đồ vật chỉ để
kiểm tra pipeline. Nó không được import vào game và không phải đề xuất vị trí ký ức.
