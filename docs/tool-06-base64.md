# Tool 06 — Base64 Encode / Decode

**Route:** `/base64`  
**Group:** SECURITY  
**File:** `src/pages/Base64Tool.jsx`

---

## Mục Đích

Encode và Decode Base64 ngay trên trình duyệt. Rất hay dùng khi làm việc với Kubernetes Secrets (dữ liệu trong Secret phải được lưu dưới dạng Base64), HTTP Basic Auth headers, hoặc bất kỳ trường hợp nào cần mã hóa/giải mã Base64.

**Use case thực tế:**
- `kubectl create secret` lưu password dưới dạng Base64 → cần decode để đọc
- Kiểm tra header `Authorization: Basic <base64>` trong API call
- Encode file config để embed vào biến môi trường

---

## Tính Năng Chi Tiết

### Mode Switcher
- **Encode → Base64:** Chuyển plain text thành chuỗi Base64
- **Base64 → Decode:** Giải mã Base64 thành plain text
- Nút Switch ở giữa (↔) để hoán đổi ngược input/output

### URL-safe Base64
- Toggle checkbox **"URL-safe Base64"**
- Khi bật: dùng `+` → `-` và `/` → `_`, bỏ padding `=`
- Tương thích với JWT, OAuth tokens, và các URL parameter

### Auto-detect
- Nếu bạn paste một chuỗi trông có vẻ là Base64 nhưng đang ở chế độ Encode, tool sẽ hiển thị gợi ý: _"Looks like Base64 — switch to Decode?"_ với nút Switch nhanh

### Error Handling
- Nếu decode một chuỗi không phải Base64 hợp lệ → hiển thị thông báo lỗi rõ ràng màu đỏ
- Không crash, không hiển thị output sai

---

## Logic Kỹ Thuật

### Encode
```javascript
// Hỗ trợ Unicode (tiếng Việt, emoji...)
let encoded = btoa(unescape(encodeURIComponent(text)));
// URL-safe variant
encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
```

### Decode
```javascript
// Normalize URL-safe chars trước khi decode
let normalized = text.replace(/-/g, '+').replace(/_/g, '/');
while (normalized.length % 4 !== 0) normalized += '='; // re-add padding
const decoded = decodeURIComponent(escape(atob(normalized)));
```

**Offline:** Toàn bộ dùng Web API `btoa()`/`atob()` — không cần server.

---

## Ví Dụ

**Encode:**
- Input: `admin:P@ssw0rd`
- Output: `YWRtaW46UEBzc3cwcmQ=`

**Decode K8s Secret:**
```bash
# kubectl get secret my-secret -o yaml hiển thị:
data:
  password: cGFzc3dvcmQxMjM=

# Paste vào tool → decode → "password123"
```

**URL-safe (JWT payload):**
- Input: `{"sub":"123","name":"John Doe"}`
- Output: `eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiBEb2UifQ` _(không có `=` ở cuối)_
