# CLAUDE.md — Tools-Everthing Dashboard

> File này dành cho Claude AI agent. Đọc file này trước khi làm bất kỳ thay đổi nào trong dự án.

---

## Bạn Đang Làm Việc Với Dự Án Gì?

**Tools-Everthing** là một Dashboard web tập hợp các công cụ thiết thực cho kỹ sư DevOps. Giao diện dark theme, premium, không có backend — toàn bộ xử lý ở phía client.

- **Repo:** https://github.com/devops-autotools/devops-project-tools-everthing
- **Deploy:** Vercel (auto deploy khi push `main`)  
- **Local:** `docker compose up -d --build` → http://localhost:8080

---

## Hiện Tại Dự Án Đang Ở Đâu?

### ✅ 11 Tools đã hoàn thiện (4 ẩn 1):

**Nhóm CONTAINERS:**
1. `/helm-converter` — Helm Image Converter

**Nhóm KUBERNETES:**
2. `/kubeconfig-merger` — Kubeconfig Merger
3. `/yaml-formatter` — YAML Formatter & K8s Schema Validator
4. `/cron-builder` — Cron Expression Builder

**Nhóm SECURITY:**
5. `/jwt-decoder` — JWT Decoder
6. `/base64` — Base64 Encode/Decode

**Nhóm UTILITIES:**
7. `/json-yaml` — JSON ↔ YAML Converter

**Nhóm DOMAIN:**
8. `/dns-lookup` — DNS Lookup ✅ Visible
9. `/ssl-checker` — SSL Certificate Checker ✅ Visible
10. `/http-headers` — HTTP Headers Inspector ✅ Visible
11. `/whois` — WHOIS Lookup ✅ Visible
12. `/dns-propagation` — DNS Propagation Checker ⚠️ **HIDDEN** (route tồn tại, ẩn sidebar + Dashboard)

### Đã lên kế hoạch tiếp theo:
- Dockerfile Linter
- K8s Resource Calculator
- SSH Key Generator
- Regex Tester

---

## Khi Thêm Tool Mới, Làm Theo Thứ Tự Này:

```
1. src/pages/<ToolName>.jsx       ← Tạo page component
2. src/App.jsx                    ← Thêm Route
3. src/components/Layout.jsx      ← Thêm NavLink đúng group
4. src/pages/Dashboard.jsx        ← Thêm tool card (mảng tools[])
5. src/index.css                  ← Append CSS mới vào cuối file
6. docs/tool-XX-<name>.md        ← Viết documentation
7. docker compose up -d --build   ← Build và test
8. git add . && git commit && git push
```

---

## Những Điều KHÔNG Được Làm:

❌ Dùng Tailwind CSS  
❌ Dùng hardcoded hex color (phải dùng CSS Variables)  
❌ Gửi dữ liệu nhạy cảm (JWT, kubeconfig, password) ra server  
❌ Thêm thư viện nặng không cần thiết (js-yaml đã đủ cho YAML)  
❌ Dùng `yaml.dump()` với file có comment → sẽ mất comment  

---

## ⚠️ CORS — Lưu Ý Quan Trọng Cho Domain Tools

Các tool nhóm DOMAIN gọi API bên ngoài từ browser. Phải dùng API hỗ trợ CORS native:

| Tool | API | Lý do chọn |
|------|-----|------------|
| DNS Lookup | `dns.google/resolve` | Không cần custom header → không trigger CORS preflight |
| DNS Propagation | `dns.google/resolve` | Cloudflare DoH bị block khi thêm Accept header |
| SSL Checker | `api.certspotter.com` | CORS native, free, không cần key |
| HTTP Headers | `corsproxy.io` | Proxy forward headers qua Response object |
| WHOIS | `rdap.org` | RDAP chuẩn RFC, hỗ trợ CORS |

**KHÔNG dùng:**
- `cloudflare-dns.com/dns-query` (cần `Accept: application/dns-json` → CORS preflight)
- `crt.sh` (không có CORS headers)
- `who-dat.as93.net` (không ổn định)
- `api.allorigins.win` (không trả headers của target site)

---

## CSS Variables Quan Trọng (định nghĩa trong `src/index.css` `:root`):

```css
--bg-primary: #0f172a      /* Nền chính tối nhất */
--bg-secondary: #1e293b    /* Nền panel, card */
--bg-tertiary: #334155     /* Nền chip, badge */
--bg-input: #0b1120        /* Nền textbox code editor */
--accent: #3b82f6          /* Màu xanh accent chính */
--success: #10b981         /* Màu xanh lá cho Valid/OK */
--warning: #f59e0b         /* Màu vàng cho Warning */
--text-primary: #f8fafc
--text-secondary: #94a3b8
--text-muted: #64748b
--font-mono: 'JetBrains Mono', 'Fira Code', monospace
```

---

## CSS Classes Dùng Lại Được:

| Class | Mô tả |
|-------|-------|
| `.tool-page` | Container toàn bộ trang tool |
| `.tool-header` | Header với icon + title + description |
| `.tool-header-icon` | Box icon màu gradient ở header |
| `.column-panel` | Panel cột với border |
| `.column-header` | Header của panel cột |
| `.column-header-row` | Row flex có justify-content: space-between |
| `.code-editor` | Textarea font mono cho code |
| `.btn` | Button cơ bản |
| `.btn-primary` | Button màu accent |
| `.btn-small` | Button nhỏ |
| `.btn-danger` | Button đỏ (Clear) |
| `.badge-success` | Badge xanh lá |
| `.badge-error` | Badge đỏ |
| `.badge-warning` | Badge vàng |
| `.error-container` | Box đỏ hiển thị lỗi |
| `.two-col-layout` | Grid 2 cột với swap button ở giữa |
| `.base64-mode-bar` | Thanh mode switcher với tabs |
| `.mode-tab` | Tab button (dùng chung Base64 & JsonYaml) |

---

## Lưu Ý Về Routing SPA

App dùng React Router với `BrowserRouter`. Khi deploy lên Nginx hoặc Vercel, cần config rewrite/fallback về `index.html`:

- **Nginx:** `nginx.conf` đã có `try_files $uri $uri/ /index.html`
- **Vercel:** `vercel.json` đã có `rewrites` rule
- **Cả 2 file đều cần giữ trong repo**

---

## Files Tài Liệu Dự Án

```
docs/
├── agent.md                         ← File context cho AI agents
├── plan.md                          ← Kế hoạch tổng thể
├── tool-01-helm-converter.md
├── tool-02-kubeconfig-merger.md
├── tool-03-yaml-formatter.md
├── tool-04-cron-builder.md
├── tool-05-jwt-decoder.md
├── tool-06-base64.md
├── tool-07-json-yaml-converter.md
├── tool-08-dns-lookup.md
├── tool-09-ssl-checker.md
├── tool-10-http-headers.md
└── tool-11-whois-lookup.md
```

> DNS Propagation Checker (`/dns-propagation`) đang ẩn — không có trong sidebar/Dashboard nhưng route vẫn hoạt động. Để bật lại: uncomment trong `Layout.jsx` và `Dashboard.jsx`.
