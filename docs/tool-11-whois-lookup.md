# Tool 11 — WHOIS Lookup

**Route:** `/whois`  
**Group:** DOMAIN  
**File:** `src/pages/WhoisLookup.jsx`

---

## Mục Đích

Tra cứu thông tin đăng ký domain: chủ sở hữu, registrar, ngày tạo/hết hạn, và nameservers. Sử dụng **RDAP protocol** — giao thức hiện đại thay thế WHOIS cũ, hỗ trợ JSON và CORS native.

**Use case thực tế:**
- Kiểm tra domain còn bao nhiêu ngày trước khi hết hạn (tránh bị drop)
- Xem nameserver đang active để debug DNS
- Xác minh registrar và ownership
- Kiểm tra domain đang ở status gì (clientTransferProhibited...)

---

## Tính Năng Chi Tiết

### Domain Status Badge
- **✅ N days remaining** — xanh lá, còn nhiều ngày
- **⚠️ Expires in Nd** — vàng, dưới 30 ngày
- **❌ Expired** — đỏ, đã hết hạn

### Important Dates Card
- Created (ngày đăng ký)
- Updated (lần cập nhật cuối)
- Expires (ngày hết hạn) — highlight vàng nếu < 30 ngày

### Registrar Card
- Tên Registrar
- IANA ID
- URL website registrar (clickable link)

### Registrant Card (nếu có — không bị ẩn bởi privacy)
- Organization
- Country / State

### Nameservers Card
- Danh sách nameserver đang active (lowercase)

### Domain Status Card
- Danh sách ICANN status codes (clientTransferProhibited, clientUpdateProhibited...)

---

## Logic Kỹ Thuật

### API: RDAP.org
```
GET https://rdap.org/domain/example.com
```
- **RDAP** (Registration Data Access Protocol) — RFC 7482
- Hỗ trợ CORS natively (khác với WHOIS port 43 truyền thống)
- Trả về cấu trúc JSON chuẩn
- `rdap.org` là bootstrap resolver: tự động điều hướng đến đúng RDAP server của registry

### Parse RDAP Events
```javascript
const events = {};
data.events.forEach(e => { events[e.eventAction] = e.eventDate; });
// events['registration'] → created date
// events['expiration']  → expiry date
// events['last changed'] → updated date
```

### Parse vCard (Registrant/Registrar info)
RDAP dùng vCard 4.0 format cho contact info:
```javascript
entity.vcardArray[1].forEach(([type, , , value]) => {
  if (type === 'org') vcard.organization = value;
  if (type === 'fn') vcard.name = value;
});
```

### Giới hạn
- Một số TLD chưa có RDAP server → 404
- Privacy protection ẩn thông tin registrant (phổ biến)
- ccTLD (.vn, .uk...) có thể có RDAP riêng với format khác nhau

---

## Ví Dụ

```
🌐 github.com  ✅ 287 days remaining

Important Dates:
  Created:  13 October 2007
  Updated:  05 September 2024
  Expires:  13 October 2025

Registrar:
  Name:     MarkMonitor Inc.
  IANA ID:  292
  URL:      https://www.markmonitor.com

Nameservers:
  dns1.p08.nsone.net
  dns2.p08.nsone.net
  ns-1283.awsdns-32.org
  ns-421.awsdns-52.com
```
