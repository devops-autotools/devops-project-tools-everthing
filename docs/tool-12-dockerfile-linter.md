# Tool 12 — Dockerfile Linter

**Route:** `/dockerfile-linter`  
**Group:** CONTAINERS  
**File:** `src/pages/DockerfileLinter.jsx`

---

## Mục Đích

Phân tích Dockerfile để phát hiện anti-pattern, vấn đề bảo mật, và vi phạm best practices. Hoạt động hoàn toàn offline — không gửi bất kỳ dữ liệu nào ra ngoài.

**Use case thực tế:**
- Review Dockerfile trước khi merge PR
- Audit security (secrets trong ENV, chạy root...)
- Tối ưu image size (layer optimization, multi-stage)
- Onboard engineer mới với best practices

---

## Tính Năng Chi Tiết

### Editor Panel (trái)
- Textarea với font mono, line count indicator
- Nút **Paste** — đọc từ clipboard
- Nút **Example** — nạp Dockerfile xấu để demo
- Nút **Clear** — xóa sạch
- Kết quả cập nhật real-time khi gõ

### Results Panel (phải)
- **Summary bar:** Score badge (Good/Warning/Error) + số lượng từng loại
- **Nút Download Report:** Xuất file `.txt` với toàn bộ findings
- **Finding cards:** Mỗi issue hiển thị:
  - Icon + màu theo severity
  - Tiêu đề vấn đề
  - Line number (nếu có)
  - Code snippet vi phạm
  - Gợi ý fix cụ thể

### Severity Levels
| Level | Màu | Ý nghĩa |
|-------|-----|---------|
| Error | 🔴 Đỏ | Vấn đề nghiêm trọng (security risk, broken build) |
| Warning | 🟡 Vàng | Nên sửa (reproducibility, best practice) |
| Info | 🔵 Xanh | Gợi ý cải thiện (không bắt buộc) |

---

## 18 Lint Rules

### Errors (nghiêm trọng)
1. **`no-latest-tag`** — `FROM node:latest` → pin phiên bản cụ thể
2. **`apt-no-clean`** — apt-get install thiếu `--no-install-recommends` hoặc clean cache
3. **`secrets-in-env`** — phát hiện secret/password/token trong `ENV` hoặc `ARG`

### Warnings
4. **`no-tag`** — Base image không có tag nào
5. **`use-specific-copy`** — `COPY . .` copy toàn bộ thư mục
6. **`apt-update-separate`** — `RUN apt-get update` một mình trong layer riêng
7. **`no-root-user`** — Không có `USER` directive → container chạy root
8. **`pin-pip`** — `pip install` không có version pin (`==`)
9. **`pin-npm`** — `npm install` không copy `package-lock.json` trước
10. **`cmd-form`** — `CMD node server.js` (shell form) thay vì `CMD ["node", "server.js"]`
11. **`entrypoint-form`** — `ENTRYPOINT ./run.sh` không forward signals
12. **`no-add-for-files`** — `ADD` dùng cho file local (nên dùng `COPY`)

### Info
13. **`run-multiple-commands`** — 3+ `RUN` liên tiếp → nên chain với `&&`
14. **`use-workdir`** — Có `COPY/RUN` nhưng không set `WORKDIR`
15. **`use-npm-ci`** — Dùng `npm install` thay vì `npm ci` trong build
16. **`expose-port`** — Không có `EXPOSE` instruction
17. **`healthcheck`** — Không có `HEALTHCHECK`
18. **`multi-stage`** — Có compile step nhưng chưa dùng multi-stage build

---

## Logic Kỹ Thuật

### Pattern Matching Engine
- Hoàn toàn client-side, không dùng thư viện ngoài
- Mỗi rule là một object `{ id, level, title, check(lines) }`
- `check(lines)` nhận mảng các dòng, trả về array findings
- Findings được sort: errors trước, warnings sau, info cuối → trong cùng level sort theo line number

```javascript
const RULES = [
  {
    id: 'no-latest-tag',
    level: 'error',
    title: 'Avoid using :latest tag',
    check: (lines) => lines.flatMap((line, i) =>
      /^\s*FROM\s+\S+:latest(\s|$)/i.test(line)
        ? [{ line: i + 1, code: line.trim(), suggestion: '...' }] : []
    ),
  },
  // ...
];
```

### Real-time Linting
- `onChange` handler gọi `lint()` mỗi khi content thay đổi
- `useCallback` để tránh re-create function mỗi render

### Download Report
- Tạo Blob text/plain từ findings array
- Tự động download `dockerfile-lint-report.txt`

---

## Ví Dụ — Dockerfile Xấu

```dockerfile
FROM node:latest        # ← Error: :latest tag

WORKDIR /app
COPY . .                # ← Warning: copies everything
RUN npm install         # ← Warning: npm install + Info: use npm ci
RUN npm run build       # ← Info: multiple consecutive RUN

ENV SECRET_KEY=mysecret # ← Error: secret in ENV

CMD node server.js      # ← Warning: shell form CMD
```

**Kết quả:** 2 errors, 4 warnings, 4 info
