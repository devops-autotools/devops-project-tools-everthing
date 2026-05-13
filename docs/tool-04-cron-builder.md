# Tool 04 — Cron Expression Builder

**Route:** `/cron-builder`  
**Group:** KUBERNETES  
**File:** `src/pages/CronBuilder.jsx`

---

## Mục Đích

Giúp DevOps xây dựng và kiểm tra biểu thức Cron trực quan. Đặc biệt hữu ích khi thiết lập lịch cho Kubernetes `CronJob`, GitLab CI schedules, hoặc GitHub Actions `schedule` trigger.

**Use case thực tế:** Bạn muốn chạy backup mỗi ngày lúc 2:30 sáng vào các ngày trong tuần — thay vì phải nhớ `30 2 * * 1-5`, bạn chọn từ giao diện và xem ngay lịch chạy 5 lần tiếp theo để xác nhận.

---

## Tính Năng Chi Tiết

### Ô Nhập Biểu Thức Cron
- Input trực tiếp chuỗi Cron 5 trường (Minute Hour Day Month Weekday)
- Hiển thị nhãn từng trường ngay bên dưới (Minute / Hour / Day / Month / Weekday)
- Validation: báo lỗi ngay nếu không đủ 5 trường
- Nút **Copy** để sao chép biểu thức

### Expression Breakdown
- Tự động parse và hiển thị giá trị từng trường dưới dạng "chip" có màu xanh accent
- Giúp kiểm tra nhanh khi đọc biểu thức phức tạp (ví dụ `*/5`, `1-5`, `0,6`)

### Quick Presets (12 preset)
- Every minute: `* * * * *`
- Every 5 minutes: `*/5 * * * *`
- Every 15/30 minutes
- Every hour / Every 6 hours
- Daily at midnight / noon
- Every Monday / Every weekday (Mon-Fri)
- Weekly Sunday / Monthly 1st
- Preset đang được chọn được highlight màu xanh

### Preview Next 5 Runs
- Tính toán chính xác 5 thời điểm chạy tiếp theo từ thời điểm hiện tại
- Hiển thị đầy đủ: Thứ, ngày, tháng, giờ, phút, giây
- Thuật toán pure JavaScript, không dùng thư viện — hoạt động offline hoàn toàn

### Syntax Cheatsheet
- Bảng tra nhanh các ký tự đặc biệt: `*`, `,`, `-`, `/`
- Quy ước ngày trong tuần: Sun=0, Mon=1...Sat=6

---

## Logic Kỹ Thuật

### Thuật toán tính Next Runs
Sử dụng vòng lặp duyệt từng phút từ `now + 1 phút`, kiểm tra từng trường của cron expression bằng hàm `matchField()`. Hỗ trợ:
- `*` → any
- `*/5` → step (mỗi 5 đơn vị)  
- `1-5` → range
- `1,3,5` → list

Giới hạn max 50,000 lần thử để tránh vòng lặp vô tận với biểu thức không hợp lệ.

---

## Ví Dụ Biểu Thức Phổ Biến

| Biểu thức | Ý nghĩa |
|-----------|---------|
| `0 2 * * *` | Hàng ngày lúc 2:00 AM |
| `*/15 * * * *` | Mỗi 15 phút |
| `0 9 * * 1-5` | 9:00 AM mỗi ngày trong tuần |
| `0 0 1 * *` | 12:00 AM ngày 1 hàng tháng |
| `30 23 * * 5` | 11:30 PM mỗi thứ Sáu |
| `0 */6 * * *` | Mỗi 6 tiếng (0h, 6h, 12h, 18h) |
