# Tool 07 — JSON ↔ YAML Converter

**Route:** `/json-yaml`  
**Group:** UTILITIES  
**File:** `src/pages/JsonYamlConverter.jsx`

---

## Mục Đích

Chuyển đổi 2 chiều giữa JSON và YAML ngay lập tức. Khác với YAML Formatter (tập trung vào K8s validation), tool này chuyên biệt cho việc chuyển đổi định dạng đơn thuần.

**Use case thực tế:**
- Config file viết bằng JSON, cần convert sang YAML để dùng với Helm
- Nhận API response dạng JSON, cần convert sang YAML để lưu vào Kubernetes ConfigMap
- Đồng nghiệp gửi config YAML, cần convert sang JSON để đưa vào code JavaScript

---

## Tính Năng Chi Tiết

### Direction Switcher
- **JSON → YAML** tab
- **YAML → JSON** tab
- Nút hoán đổi (↔) ở giữa hai cột: swap cả chiều chuyển đổi lẫn nội dung input/output

### Real-time Conversion
- Convert tự động khi người dùng gõ/paste (không cần bấm nút)
- Debounce xử lý để tránh lag khi paste file lớn

### Error Display
- Nếu input không parse được → badge đỏ + error message chi tiết
- Output area ẩn khi có lỗi (không hiện text rác)

### Output Actions
- Nút **Copy** sao chép kết quả vào clipboard
- Badge **Done** màu xanh khi convert thành công

---

## Logic Kỹ Thuật

### JSON → YAML
```javascript
const parsed = JSON.parse(input);
const output = yaml.dump(parsed, {
  indent: 2,
  lineWidth: -1,  // không wrap line
  noRefs: true,   // không dùng YAML aliases
  sortKeys: false // giữ nguyên thứ tự key
});
```

### YAML → JSON
```javascript
const parsed = yaml.load(input); // js-yaml parse
const output = JSON.stringify(parsed, null, 2); // pretty print
```

**Thư viện:** Tận dụng `js-yaml` đã được cài sẵn (dùng chung với YAML Formatter) — không thêm dependency mới.

---

## Ví Dụ

**JSON → YAML:**

Input:
```json
{
  "apiVersion": "v1",
  "kind": "ConfigMap",
  "metadata": {
    "name": "app-config"
  },
  "data": {
    "LOG_LEVEL": "info",
    "MAX_CONNECTIONS": "100"
  }
}
```

Output:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: info
  MAX_CONNECTIONS: '100'
```

**YAML → JSON:** Chiều ngược lại, hữu ích khi cần đưa cấu hình vào API body.
