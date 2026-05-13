# Kế Hoạch Xây Dựng: Tools-Everthing Dashboard

*(Cập nhật: Tháng 05/2026)*

Dự án ban đầu là công cụ giúp chuyển đổi Helm image registry. Sau nhiều giai đoạn phát triển, nay đã trở thành một **Dashboard đa công cụ** dành cho kỹ sư DevOps.

## ✅ Giai Đoạn 1 — Helm Image Converter (HOÀN THÀNH)

Công cụ dùng Regex duyệt từng dòng `values.yaml`, thay thế domain registry mà không làm mất comment, đồng thời sinh lệnh `docker pull/tag/push` tự động.

## ✅ Giai Đoạn 2 — Dashboard Multi-page (HOÀN THÀNH)

Tái cấu trúc sang Multi-page SPA với `react-router-dom`, Sidebar cố định, Dashboard card grid, giao diện Glassmorphism/Dark premium.

## ✅ Giai Đoạn 3 — Kubernetes & Security (HOÀN THÀNH)

| # | Tool | Route | Trạng thái |
|---|------|-------|------------|
| 1 | Helm Image Converter | `/helm-converter` | ✅ Active |
| 2 | Kubeconfig Merger | `/kubeconfig-merger` | ✅ Active |
| 3 | YAML Formatter & K8s Validator | `/yaml-formatter` | ✅ Active |
| 4 | Cron Expression Builder | `/cron-builder` | ✅ Active |
| 5 | JWT Decoder | `/jwt-decoder` | ✅ Active |
| 6 | Base64 Encode/Decode | `/base64` | ✅ Active |
| 7 | JSON ↔ YAML Converter | `/json-yaml` | ✅ Active |

## ✅ Giai Đoạn 4 — Nhóm Domain Tools (HOÀN THÀNH)

| # | Tool | Route | Trạng thái |
|---|------|-------|------------|
| 8 | DNS Lookup | `/dns-lookup` | ✅ Active |
| 9 | SSL Certificate Checker | `/ssl-checker` | ✅ Active |
| 10 | HTTP Headers Inspector | `/http-headers` | ✅ Active |
| 11 | WHOIS Lookup | `/whois` | ✅ Active |
| 12 | DNS Propagation Checker | `/dns-propagation` | ⚠️ Hidden (code sẵn, ẩn UI) |

## ✅ Giai Đoạn 5 — Docker & Advanced Utils (HOÀN THÀNH)

| # | Tool | Route | Trạng thái |
|---|------|-------|------------|
| 13 | Dockerfile Linter | `/dockerfile-linter` | ✅ Active (3-panel, Auto-fix) |
| 14 | K8s Resource Calculator | `/k8s-calculator` | ✅ Active (QoS, YAML gen) |
| 15 | SSH Key Generator | `/ssh-generator` | ✅ Active (Local WebCrypto) |
| 16 | Regex Tester | `/regex-tester` | ✅ Active (Real-time highlight) |

## 📦 Kiến Trúc Công Nghệ

- **Core:** React 18 (Vite) + JavaScript thuần túy
- **Styling:** Vanilla CSS + CSS Variables (không Tailwind)
- **Icons:** `lucide-react`
- **YAML:** `js-yaml`
- **Triển khai:** Docker (Nginx) + Vercel
- **Routing SPA fix:** `nginx.conf` + `vercel.json`

---
*Xem chi tiết từng tool trong thư mục `docs/tool-XX-*.md`*
