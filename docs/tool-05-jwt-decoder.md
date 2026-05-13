# Tool 05 — JWT Decoder

**Route:** `/jwt-decoder`  
**Group:** SECURITY  
**File:** `src/pages/JwtDecoder.jsx`

---

## Mục Đích

Giải mã và kiểm tra nội dung của JSON Web Token (JWT) ngay trên trình duyệt mà không cần kết nối internet. Hữu ích khi debug authentication issues ở môi trường production mà không muốn paste token lên các trang web bên ngoài như jwt.io (rủi ro bảo mật).

**Use case thực tế:** API trả về 401 Unauthorized — paste JWT vào đây để kiểm tra `exp` đã hết hạn chưa, `iss` có đúng không, `scope` có chứa permission cần thiết không.

---

## Tính Năng Chi Tiết

### Input
- Textbox paste JWT token (format: `header.payload.signature`)
- Tự động trim whitespace khi paste
- Nút **Clear**

### Decoded Content (3 section)

#### Header
- Hiển thị JSON được decode từ phần đầu của JWT
- Thường chứa `alg` (thuật toán ký) và `typ`
- Màu nền: hồng nhạt

#### Payload
- Hiển thị toàn bộ claims trong token
- Màu nền: tím nhạt
- **Tự động phân tích trường thời gian:**
  - `iat` (issued at) → hiển thị datetime đọc được
  - `exp` (expiration) → hiển thị datetime + Badge trạng thái:
    - 🟢 **Valid** — token còn hạn
    - 🔴 **Expired** — token đã hết hạn, kèm thời điểm hết hạn cụ thể
    - 🟡 **Expiring soon** — còn hạn nhưng sắp hết (trong vòng 5 phút)

#### Signature
- Hiển thị phần signature (chưa decode — đây là hash đã mã hóa)
- Lưu ý rõ: Tool này chỉ DECODE, không VERIFY chữ ký (vì không có secret key)
- Màu nền: xanh dương nhạt

---

## Logic Kỹ Thuật

### Base64Url Decode
JWT sử dụng **Base64Url** (thay `-` cho `+` và `_` cho `/`, không có padding `=`). Tool xử lý theo thứ tự:
1. Thay `-` → `+` và `_` → `/`
2. Thêm padding `=` để đảm bảo độ dài là bội số của 4
3. Dùng `atob()` → `decodeURIComponent(escape())` để hỗ trợ Unicode

### Tính toán thời gian `exp`
```javascript
const expDate = new Date(payload.exp * 1000); // exp là Unix timestamp (giây)
const now = new Date();
const isExpired = now > expDate;
```

**Zero-trust:** Không gửi token ra ngoài. Toàn bộ xử lý bằng JavaScript thuần trong browser.

---

## Ví Dụ Token Test

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Kết quả decode:
- **Header:** `{ "alg": "HS256", "typ": "JWT" }`
- **Payload:** `{ "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }`
- **iat:** 2018-01-18 01:30:22 UTC
- **exp:** _(không có trong token này — không hiển thị badge)_
