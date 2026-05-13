# Kế Hoạch Xây Dựng: Tools-Everthing Dashboard

*(Cập nhật: Tháng 05/2026)*

Dự án ban đầu là công cụ giúp chuyển đổi Helm image registry. Sau nhiều giai đoạn phát triển, nay đã trở thành một **Dashboard đa công cụ** dành cho kỹ sư DevOps.

## ✅ Giai Đoạn 1 — Helm Image Converter (HOÀN THÀNH)

Công cụ dùng Regex duyệt từng dòng `values.yaml`, thay thế domain registry mà không làm mất comment, đồng thời sinh lệnh `docker pull/tag/push` tự động.

## ✅ Giai Đoạn 2 — Dashboard Multi-page (HOÀN THÀNH)

Tái cấu trúc sang Multi-page SPA với `react-router-dom`, Sidebar cố định, Dashboard card grid, giao diện Glassmorphism/Dark premium.

## ✅ Giai Đoạn 3 — 7 Công Cụ Đầu Tiên (HOÀN THÀNH)

| # | Tool | Route | Trạng thái |
|---|------|-------|------------|
| 1 | Helm Image Converter | `/helm-converter` | ✅ Active |
| 2 | Kubeconfig Merger | `/kubeconfig-merger` | ✅ Active |
| 3 | YAML Formatter & K8s Validator | `/yaml-formatter` | ✅ Active |
| 4 | Cron Expression Builder | `/cron-builder` | ✅ Active |
| 5 | JWT Decoder | `/jwt-decoder` | ✅ Active |
| 6 | Base64 Encode/Decode | `/base64` | ✅ Active |
| 7 | JSON ↔ YAML Converter | `/json-yaml` | ✅ Active |

## 🚧 Giai Đoạn 4 — Mở Rộng (ĐÃ LÊN KẾ HOẠCH)

| # | Tool | Nhóm |
|---|------|-------|
| 8 | Dockerfile Linter | Containers |
| 9 | K8s Resource Calculator | Kubernetes |
| 10 | SSH Key Generator | Security |
| 11 | Regex Tester | Utilities |

## 📦 Kiến Trúc Công Nghệ

- **Core:** React 18 (Vite) + JavaScript thuần túy
- **Styling:** Vanilla CSS + CSS Variables (không Tailwind)
- **Icons:** `lucide-react`
- **YAML:** `js-yaml`
- **Triển khai:** Docker (Nginx) + Vercel
- **Routing SPA fix:** `nginx.conf` + `vercel.json`

---
*Xem chi tiết từng tool trong thư mục `docs/tool-XX-*.md`*
