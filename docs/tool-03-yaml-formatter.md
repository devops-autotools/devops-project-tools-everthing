# Tool 03 — YAML Formatter & Kubernetes Schema Validator

**Route:** `/yaml-formatter`  
**Group:** KUBERNETES  
**File:** `src/pages/YamlFormatter.jsx`  
**Utility:** `src/utils/yaml-formatter.js`

---

## Mục Đích

Công cụ 2-trong-1 giúp kiểm tra và làm đẹp file YAML Kubernetes:
1. **YAML Linter:** Bắt lỗi cú pháp YAML ngay lập tức (missing colon, bad indent...)
2. **K8s Schema Validator:** Kiểm tra tính đúng đắn của cấu trúc đặc thù Kubernetes (containers phải là array, thiếu field bắt buộc...)

**Use case thực tế:** Trước khi `kubectl apply -f`, paste file manifest vào đây để đảm bảo không có lỗi ngớ ngẩn nào.

---

## Tính Năng Chi Tiết

### Cột Trái — Raw Input
- Paste YAML hoặc JSON vào textbox
- Nút **Clear** để reset

### Cột Phải — Formatted Output

#### Trường hợp 1: YAML hợp lệ + K8s Schema OK
- Badge màu xanh lá: **"Valid YAML"**
- Hiển thị YAML đã được format lại đẹp đẽ (indent 2 spaces, key order giữ nguyên)
- Nút **Copy** và **Download**

#### Trường hợp 2: YAML hợp lệ nhưng K8s Schema SAI
- Badge màu xanh (Valid YAML) + Badge màu vàng: **"K8s Schema Error"**
- Vẫn hiển thị YAML đã format
- Hiển thị bảng cảnh báo màu vàng liệt kê từng lỗi Schema, ví dụ:
  - `[spec.containers]: Must be a List/Array`
  - `[spec.containers[0].image]: Missing required field`

#### Trường hợp 3: YAML sai cú pháp
- Badge màu đỏ: **"Syntax Error"**
- Bảng đỏ hiển thị: Mô tả lỗi + Số dòng lỗi + Raw error từ parser
- **Auto-fix Suggestion:** Nếu thuật toán có thể tự sửa lỗi, hiển thị thêm khung xanh lá với YAML đề xuất sửa + nút **"Apply Fix"**

---

## Logic Kỹ Thuật

### YAML Linting
Sử dụng thư viện `js-yaml`. Khi parse thất bại, `YAMLException` chứa `e.mark.line` và `e.reason` để hiển thị chi tiết.

### Auto-fix Heuristic
Khi YAML lỗi, tool thử sửa tự động theo thứ tự:
1. Thay thế tab → spaces
2. Thêm space sau dấu `:` thiếu (chỉ với dictionary keys)
3. Thêm `:` cuối dòng nếu dòng tiếp theo thụt lề sâu hơn (bắt lỗi thiếu `:` sau key)
4. Căn chỉnh lại indentation của các item trong list bằng cách scan xuống từ dấu `-`

### K8s Schema Validation (Heuristic, không dùng thư viện nặng)
Sau khi YAML parse thành công, kiểm tra:
- `kind` có tồn tại không → nếu không thì bỏ qua K8s validation
- **Pod:** `spec.containers` và `spec.initContainers` phải là Array; mỗi item phải có `name` và `image`
- **Deployment/DaemonSet/StatefulSet/Job/ReplicaSet:** Kiểm tra tại `spec.template.spec.containers`
- **Service:** `spec.ports` phải là Array

---

## Ví Dụ — Auto-fix

**Input (lỗi):**
```yaml
metadata    # thiếu dấu hai chấm
  name: my-app
restartPolicy:Always  # thiếu space
```

**Auto-fix suggestion:**
```yaml
metadata:
  name: my-app
restartPolicy: Always
```
