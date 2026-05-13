# Tool 09 — SSL Certificate Checker

**Route:** `/ssl-checker`  
**Group:** DOMAIN  
**File:** `src/pages/SslChecker.jsx`

---

## Mục Đích

Kiểm tra thông tin chứng chỉ SSL/TLS của bất kỳ domain nào: ngày hết hạn, issuer, Subject Alternative Names. Cực kỳ hữu ích để theo dõi cert trước khi hết hạn gây downtime.

**Use case thực tế:**
- Kiểm tra cert Let's Encrypt đã renew thành công chưa
- Theo dõi cert sắp hết hạn (warning dưới 30 ngày)
- Xem danh sách SANs để xác nhận wildcard cert bao phủ đúng subdomain
- Kiểm tra cert sau khi migrate domain

---

## Tính Năng Chi Tiết

### Status Banner (Nổi bật)
- **🟢 Valid · N days left** — còn hơn 30 ngày
- **🟡 Expires in Nd — Renew Soon** — dưới 30 ngày
- **🔴 Expires in Nd — Critical!** — dưới 14 ngày  
- **🔴 Expired** — đã hết hạn
- Vòng tròn countdown hiển thị số ngày còn lại/đã hết hạn

### Certificate Details Card
- Common Name (CN)
- Issuer (Organization từ issuer DN)
- Link trực tiếp đến crt.sh để xem full certificate chain

### Validity Period Card
- Ngày phát hành (Issued)
- Ngày hết hạn (Expires) — màu vàng nếu < 30 ngày
- Tổng số certificates tìm thấy trong Certificate Transparency logs

### Subject Alternative Names (SANs)
- Hiển thị tất cả domain được bao phủ bởi cert
- Tối đa 30 SANs hiển thị, phần còn lại hiển thị "+N more"
- Rất hữu ích để kiểm tra wildcard cert

---

## Logic Kỹ Thuật

### API: Certspotter (Sectigo)
```
GET https://api.certspotter.com/v1/issuances?domain=example.com
    &include_subdomains=false&expand=dns_names&expand=cert
```
- **Hỗ trợ CORS native** — không cần proxy
- Free tier, không cần API key
- Trả về Certificate Transparency log data
- Sort by `not_after` descending để lấy cert mới nhất

> **Lưu ý:** Certspotter tra CT logs nên kết quả là cert **đã được issued**, không phải cert đang serve trực tiếp từ server. Trong hầu hết trường hợp đây là giống nhau.

---

## Ví Dụ Kết Quả

```
✅ Valid · 287 days left
github.com

Certificate Details:
  Common Name:  github.com
  Issuer:       DigiCert Inc
  crt.sh:       #12345678

Validity:
  Issued:   15 October 2024
  Expires:  15 October 2025
  Total:    42 certs in logs

SANs (2):
  *.github.com    github.com
```
