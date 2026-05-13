# Tool 08 — DNS Lookup

**Route:** `/dns-lookup`  
**Group:** DOMAIN  
**File:** `src/pages/DnsLookup.jsx`

---

## Mục Đích

Tra cứu bản ghi DNS của bất kỳ domain nào trực tiếp từ trình duyệt, không cần mở terminal hay cài `dig`. Sử dụng **DNS-over-HTTPS (DoH)** — kết quả chính xác và bảo mật hơn DNS thông thường.

**Use case thực tế:**
- Xác nhận bản ghi A/CNAME sau khi trỏ domain mới
- Kiểm tra bản ghi MX của mail server
- Debug SPF/DKIM/DMARC (TXT records)
- Kiểm tra nameserver đang active (NS records)

---

## Tính Năng Chi Tiết

### Search Bar
- Nhập domain → chọn loại record → chọn resolver → bấm Lookup hoặc Enter
- Hỗ trợ 10 loại record: `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`, `SOA`, `SRV`, `PTR`, `CAA`
- Chọn resolver: **Google (8.8.8.8)**, **Cloudflare (1.1.1.1)**, **Google Backup**

### Kết Quả — Bảng Màu Sắc
- Mỗi loại record có màu riêng (A=xanh, MX=vàng, TXT=tím, NS=cyan...)
- Hiển thị đầy đủ: Name, Type, TTL (giây), Value
- MX records hiển thị Priority rõ ràng: `Priority: 10 → mail.example.com`
- TXT records tự động bỏ dấu ngoặc kép

### Authority Section
- Nếu domain không có record nhưng có authority servers → hiển thị danh sách authority

### Error Handling
- NXDOMAIN → thông báo rõ "Non-Existent Domain"
- Server failure → mô tả lỗi cụ thể từ DNS status code

---

## Logic Kỹ Thuật

### API: Google DNS-over-HTTPS
```
GET https://dns.google/resolve?name=example.com&type=A
```
- Không cần custom header → không trigger CORS preflight → hoạt động từ browser
- Trả về JSON natively (không cần `Accept: application/dns-json`)
- Google anycast tự định tuyến đến điểm gần nhất

> **Lưu ý CORS:** Cloudflare DoH (`cloudflare-dns.com/dns-query`) yêu cầu `Accept: application/dns-json` header → browser block CORS preflight. Vì vậy tool chỉ dùng Google DNS API.

---

## Ví Dụ

**Query A record của google.com:**
```
Name            Type  TTL    Value
google.com.     A     300    142.250.198.46
```

**Query MX record:**
```
Name            Type  TTL    Value
gmail.com.      MX    300    Priority: 5  →  gmail-smtp-in.l.google.com.
gmail.com.      MX    300    Priority: 10 →  alt1.gmail-smtp-in.l.google.com.
```
