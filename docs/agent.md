# AGENT.md — Tools-Everthing Dashboard

Đây là file hướng dẫn cho AI agent để hiểu rõ trạng thái và tiếp tục phát triển dự án một cách liền mạch.

---

## 📁 Tổng Quan Dự Án

**Tên dự án:** Tools-Everthing Dashboard  
**Mô tả:** Nền tảng web tập hợp nhiều công cụ hữu ích cho kỹ sư DevOps. Giao diện dark theme, SPA (Single Page Application).  
**Repo:** https://github.com/devops-autotools/devops-project-tools-everthing  
**Deploy:** Vercel (tự động khi push lên `main`)  
**Local dev:** Docker Compose → http://localhost:8080

---

## 🛠 Stack Công Nghệ

| Layer | Công nghệ |
|-------|-----------|
| Framework | React 18 + Vite |
| Routing | react-router-dom v6 |
| Styling | Vanilla CSS + CSS Variables (KHÔNG dùng Tailwind) |
| Icons | lucide-react |
| YAML parsing | js-yaml |
| Build | Docker multi-stage (node:22-alpine → nginx:alpine) |
| Deploy | Vercel + vercel.json |

---

## 📂 Cấu Trúc File Quan Trọng

```
src/
├── App.jsx              # Đăng ký tất cả routes
├── index.css            # Toàn bộ CSS (dùng CSS Variables)
├── components/
│   └── Layout.jsx       # Sidebar navigation + Outlet
├── pages/
│   ├── Dashboard.jsx    # Trang chủ - hiển thị tool cards
│   ├── HelmConverter.jsx
│   ├── KubeconfigMerger.jsx
│   ├── YamlFormatter.jsx
│   ├── CronBuilder.jsx
│   ├── JwtDecoder.jsx
│   ├── Base64Tool.jsx
│   └── JsonYamlConverter.jsx
└── utils/
    └── yaml-formatter.js  # Logic YAML + K8s schema validation

docs/                    # Tài liệu chi tiết từng tool
nginx.conf               # Config cho Nginx (SPA routing: try_files)
vercel.json              # Config cho Vercel (SPA routing: rewrites)
```

---

## ✅ Công Cụ Đã Hoàn Thiện (7/7 đợt 1)

| # | Tool | Route | Group |
|---|------|-------|-------|
| 1 | Helm Image Converter | `/helm-converter` | CONTAINERS |
| 2 | Kubeconfig Merger | `/kubeconfig-merger` | KUBERNETES |
| 3 | YAML Formatter & K8s Validator | `/yaml-formatter` | KUBERNETES |
| 4 | Cron Expression Builder | `/cron-builder` | KUBERNETES |
| 5 | JWT Decoder | `/jwt-decoder` | SECURITY |
| 6 | Base64 Encode/Decode | `/base64` | SECURITY |
| 7 | JSON ↔ YAML Converter | `/json-yaml` | UTILITIES |

---

## 📋 Công Cụ Đã Lên Kế Hoạch (Đợt 2)

| # | Tool | Mô tả |
|---|------|-------|
| 8 | Dockerfile Linter | Bắt anti-pattern trong Dockerfile |
| 9 | K8s Resource Calculator | Tính tổng CPU/Memory từ manifest |
| 10 | SSH Key Generator | Tạo cặp khóa SSH bằng WebCrypto |
| 11 | Regex Tester | Test regex với highlight real-time |

---

## 🔧 Quy Tắc Quan Trọng Khi Phát Triển

### Thêm Tool Mới — Checklist
1. Tạo file `src/pages/<ToolName>.jsx`
2. Import và đăng ký route trong `src/App.jsx`
3. Thêm NavLink vào `src/components/Layout.jsx` (đúng group label)
4. Thêm tool card vào mảng `tools` trong `src/pages/Dashboard.jsx`
5. Thêm CSS mới vào cuối `src/index.css`
6. Tạo file docs `docs/tool-XX-<name>.md`
7. Build + test: `docker compose up -d --build`
8. Commit + push: `git add . && git commit -m "feat: ..." && git push`

### CSS — Nguyên Tắc Bắt Buộc
- **KHÔNG dùng Tailwind**
- **KHÔNG dùng inline styles** (ngoại trừ style động cần JS)
- Tất cả màu sắc dùng CSS Variables: `var(--accent)`, `var(--bg-secondary)`...
- Thêm CSS mới vào cuối `src/index.css`

### Routing SPA
- **Nginx:** File `nginx.conf` → `try_files $uri $uri/ /index.html`
- **Vercel:** File `vercel.json` → `rewrites` về `/index.html`
- Cả 2 file phải có mặt trong repo để hoạt động đúng trên cả 2 môi trường

### Bảo Mật — Quy Tắc Bất Di Bất Dịch
- Các tool xử lý dữ liệu nhạy cảm (JWT, kubeconfig, Base64...) phải **100% client-side**
- Không gọi API bên ngoài, không gửi dữ liệu ra server
- Ghi rõ "100% offline" hoặc "Zero-trust" trong UI description

---

## 🚀 Lệnh Triển Khai

```bash
# Build và chạy local
docker compose up -d --build

# Commit và push lên Vercel
git add . && git commit -m "feat: mô tả thay đổi" && git push
```
