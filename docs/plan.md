# Kế Hoạch Xây Dựng: DevOps AutoTools Dashboard

*(Cập nhật: Tháng 05/2026 - Mở rộng từ một công cụ đơn lẻ thành một nền tảng)*

Dự án ban đầu là một công cụ giúp tự động hóa quá trình phân tích và chuyển đổi các public image trong file `values.yaml` của Helm chart sang private registry. Sau khi hoàn thiện thành công giai đoạn 1, dự án hiện đang được **nâng cấp thành một Dashboard tập trung (Portal)** chứa nhiều công cụ hữu ích cho kỹ sư DevOps.

## 🚀 Giai Đoạn 1: Helm Image Converter (ĐÃ HOÀN THÀNH)

- **Kiến trúc:** 3 cột (Input, Config, Output).
- **Core Logic:** Sử dụng Regex duyệt từng dòng để thay thế domain của image mà không làm vỡ định dạng cấu trúc và không làm mất các comment `#` của file YAML gốc.
- **Tính năng nâng cao:**
  - Hỗ trợ xử lý các chart phức tạp có biến toàn cục như `cert-manager` (chỉ cập nhật `imageRegistry` mà không thay thế trực tiếp vào `name:`).
  - Tự động sinh ra lệnh `docker pull`, `docker tag` và `docker push` cho các images.
  - Tích hợp thanh tìm kiếm nội bộ ở cả cột Input và Output để điều hướng nhanh trong file YAML dài.

## 🚀 Giai Đoạn 2: Xây dựng Dashboard Tổng (ĐÃ HOÀN THÀNH)

Chúng tôi đã tiến hành tái cấu trúc dự án từ Single-Page sang Multi-Page.

- **Thêm hệ thống Routing:** Sử dụng `react-router-dom` để điều hướng mượt mà không load lại trang.
- **Giao diện Sidebar Layout:** Cố định thanh điều hướng bên trái chứa logo và các links chuyển đổi giữa Dashboard và các tools.
- **Dashboard Grid:** Tạo trang chủ hiển thị các thẻ công cụ (Tool Cards). Các công cụ chưa ra mắt được thiết kế ở trạng thái "Coming Soon".
- **Giao diện cao cấp:** Áp dụng Lucide Icons, hiệu ứng kính (Glassmorphism), màu Neon và bảng màu Slate/Dark hiện đại, chuyên nghiệp.

## 🛠 Giai Đoạn 3: Phát triển các công cụ tiếp theo (ĐANG LÊN KẾ HOẠCH)

Dưới đây là lộ trình các công cụ sẽ được tích hợp vào Dashboard trong tương lai:

1. **Kubeconfig Merger:** 
   - Tiện ích cho phép người dùng dán nhiều file `kubeconfig` và hợp nhất (merge) chúng lại thành một file duy nhất để tải về mà không làm hỏng contexts/clusters/users.
   
2. **JWT Decoder:** 
   - Trình phân tích JWT nội bộ, giúp các kỹ sư xem nhanh payload của JWT tokens ở môi trường production một cách an toàn mà không cần gửi dữ liệu qua mạng internet.
   
3. **YAML Formatter & Linter:**
   - Hỗ trợ làm đẹp định dạng file Kubernetes YAML và kiểm tra tính hợp lệ của cấu trúc nhằm tránh lỗi lặt vặt trước khi deploy bằng `kubectl`.

## 📦 Kiến trúc Công Nghệ

- **Core:** React (Vite) + JavaScript thuần túy.
- **Styling:** Vanilla CSS kết hợp hệ thống CSS Variables.
- **Icons:** `lucide-react`.
- **Triển khai:** Docker Compose kết hợp multi-stage build với Nginx để đảm bảo kích thước image siêu nhẹ và hiệu suất phục vụ file tĩnh tốt nhất.

---
*Tài liệu này sẽ liên tục được cập nhật theo tiến trình phát triển của dự án.*
