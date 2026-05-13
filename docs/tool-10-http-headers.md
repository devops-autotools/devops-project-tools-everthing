# Tool 10 — HTTP Headers Inspector

**Route:** `/http-headers`  
**Group:** DOMAIN  
**File:** `src/pages/HttpHeaders.jsx`

---

## Mục Đích

Kiểm tra toàn bộ HTTP response headers của một URL và đánh giá Security Score dựa trên sự hiện diện của các security headers quan trọng. Thay thế nhanh cho việc dùng `curl -I` hoặc DevTools.

**Use case thực tế:**
- Security audit cơ bản: kiểm tra HSTS, CSP, X-Frame-Options...
- Debug nginx config (cache headers, CORS headers)
- Kiểm tra redirect chain
- Xác nhận Content-Type và encoding đúng

---

## Tính Năng Chi Tiết

### Security Score Card
- Điểm từ 0-7 dựa trên số security headers có mặt
- **Good** (≥5/7) — màu xanh lá
- **Fair** (3-4/7) — màu vàng
- **Poor** (0-2/7) — màu đỏ
- Hiển thị HTTP status code màu tương ứng (2xx xanh, 3xx vàng, 4xx cam, 5xx đỏ)

### Security Headers Audit (7 headers được kiểm tra)

| Header | Bảo vệ khỏi |
|--------|-------------|
| `Strict-Transport-Security` | Downgrade attack, cookie hijack |
| `Content-Security-Policy` | XSS, data injection |
| `X-Frame-Options` | Clickjacking |
| `X-Content-Type-Options` | MIME sniffing |
| `Referrer-Policy` | Information leakage |
| `Permissions-Policy` | Browser feature abuse |
| `X-XSS-Protection` | Legacy XSS (deprecated nhưng vẫn kiểm tra) |

- ✅ Xanh = có header, hiển thị giá trị rút gọn
- ❌ Đỏ = thiếu header

### All Response Headers Panel
- Liệt kê toàn bộ headers từ response
- Header name màu accent (xanh), value màu secondary
- Tự động lọc bỏ proxy-injected headers (CORS)

---

## Logic Kỹ Thuật

### CORS Proxy
```
GET https://corsproxy.io/?url=https://example.com
```
- **corsproxy.io** forwards request và expose headers qua `res.headers`
- Đọc headers trực tiếp từ Response object (không phải JSON body)

### Giới hạn
- Một số site chặn proxy requests (anti-bot, rate limiting)
- HTTPS-only sites hoạt động tốt nhất
- Không phải tất cả headers từ origin đều được forward qua proxy

---

## Ví Dụ Security Audit

```
Security: Good (6/7)
HTTP 200 · 15 headers

Security Headers Audit:
✅ HSTS        strict-transport-security: max-age=31536000; includeSubDomains
✅ CSP         content-security-policy: default-src 'self'...
✅ X-Frame     x-frame-options: DENY
✅ XCTO        x-content-type-options: nosniff
✅ Referrer    referrer-policy: strict-origin-when-cross-origin
❌ Permissions  (missing)
✅ XSS         x-xss-protection: 1; mode=block
```
