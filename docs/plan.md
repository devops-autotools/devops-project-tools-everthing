# Kế Hoạch Xây Dựng Công Cụ Chuyển Đổi Helm Values Image

Dự án này nhằm xây dựng một giao diện Web (Web App) giúp tự động hóa quá trình phân tích và chuyển đổi các public image trong file `values.yaml` của Helm chart sang private registry. Công cụ sẽ giúp tiết kiệm thời gian, giảm thiểu sai sót và cung cấp các câu lệnh hỗ trợ pull/tag/push image.

## User Review Required

> [!IMPORTANT]
> **Quyết định về công nghệ và cấu trúc:**
> 1. **Framework:** Tôi đề xuất sử dụng **React (Vite)** vì ứng dụng có tính tương tác cao giữa 3 cột (gõ text ở cột 1 -> parse logic ở cột 2 -> render text ở cột 3). Việc quản lý state bằng React sẽ mượt mà và dễ mở rộng.
> 2. **Xử lý YAML:** File YAML thường có các dòng comment (`#`). Nếu dùng thư viện parse chuẩn (như JSON) thì khi in ra sẽ bị mất comment. Bạn muốn dùng phương pháp **Regex (quét từng dòng như bạn nói)** để giữ nguyên định dạng và comment, hay dùng thư viện phân tích AST (Abstract Syntax Tree) để đảm bảo độ chính xác tuyệt đối cấu trúc YAML? (Tôi đề xuất dùng Regex kết hợp với cơ chế quét từng dòng để giữ nguyên được 100% comment và định dạng gốc).

## Open Questions

> [!NOTE]
> 1. Bạn có muốn ở Cột 2, ngoài việc hiển thị danh sách các images, tool sẽ **tự động sinh ra các lệnh script (docker pull, docker tag, docker push)** để bạn dễ dàng copy và chạy trên terminal không?
> 2. Bạn có muốn lưu trữ lịch sử hoặc thiết lập mặc định cho "Private Registry URL" (vd: `harbor.mycompany.com/myproject/`) trên trình duyệt (Local Storage) để lần sau dùng không cần nhập lại?

## Proposed Changes

### 1. Kiến trúc & Giao diện (UI/UX)
Giao diện sẽ được thiết kế hiện đại (Premium Design), hỗ trợ Dark Mode và các hiệu ứng mượt mà. Khung màn hình được chia làm 3 cột (Grid Layout):

*   **Cột 1: Input Layer (Original Values)**
    *   Khu vực Textarea (có thể tích hợp thư viện code editor nhẹ hoặc thẻ textarea custom đẹp mắt) để người dùng dán nội dung file `values.yaml`.
    *   Hỗ trợ cuộn độc lập.

*   **Cột 2: Processing Layer (Image Extraction & Config)**
    *   **Cấu hình:** Một ô input để nhập domain của Private Registry (ví dụ: `registry.private.local/apps`).
    *   **Danh sách hiển thị:** Quét theo thời gian thực (Real-time) và liệt kê các images tìm thấy theo dạng bảng hoặc thẻ (Card).
    *   Hiển thị chi tiết: `Repository` gốc và `Tag` hiện tại -> `Repository` mới sau khi đổi.
    *   *(Đề xuất thêm)*: Nút "Generate Migration Script" để xuất ra các lệnh Docker cho toàn bộ image.

*   **Cột 3: Output Layer (Converted Values)**
    *   Khu vực hiển thị nội dung `values.yaml` đã được thay thế đường dẫn image.
    *   Có nút "Copy to Clipboard" hoặc "Download .yaml" để lưu về máy nhanh chóng.

### 2. Logic cốt lõi (Core Logic)
*   **Nhận diện Image:** File Helm values thường định nghĩa image dưới dạng:
    ```yaml
    image:
      repository: bitnami/nginx
      tag: "1.21.0"
    ```
    Hoặc dạng chuỗi gộp:
    ```yaml
    image: "bitnami/nginx:1.21.0"
    ```
*   **Thuật toán Quét:** Duyệt qua từng dòng. Kết hợp Regex để tìm các key `repository:` hoặc key `image:` (hoặc các format khai báo image phổ biến trong Helm). 
*   **Logic Thay thế:** Cột 3 sẽ là kết quả của việc thay thế trực tiếp trên bản text gốc của Cột 1. Việc này giúp khoảng trắng (indentation) và các comment `#` được bảo toàn nguyên vẹn.

### 3. Công nghệ sử dụng
*   **Core:** React (khởi tạo qua Vite) + JavaScript.
*   **Styling:** Vanilla CSS (tận dụng CSS Grid cho layout 3 cột, CSS Variables cho màu sắc và Dark Mode, CSS Transitions cho micro-animations). Đảm bảo giao diện trông thật "Premium".

## Verification Plan

### Manual Verification
1.  Người dùng dán một file `values.yaml` phức tạp từ một Helm chart mã nguồn mở (như Prometheus, Nginx Ingress).
2.  Kiểm tra xem Cột 2 có liệt kê chính xác 100% các hình ảnh không.
3.  Nhập Private Registry URL.
4.  Sao chép kết quả từ Cột 3, lưu thành file `.yaml` mới và chạy thử lệnh `helm lint` hoặc `helm template` để đảm bảo file YAML không bị lỗi cú pháp.
5.  Kiểm tra giao diện xem các cột có cuộn (scroll) độc lập hay không để thuận tiện quan sát khi file dài.
