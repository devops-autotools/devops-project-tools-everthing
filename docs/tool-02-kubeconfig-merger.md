# Tool 02 — Kubeconfig Merger

**Route:** `/kubeconfig-merger`  
**Group:** KUBERNETES  
**File:** `src/pages/KubeconfigMerger.jsx`

---

## Mục Đích

Công cụ hợp nhất nhiều file `kubeconfig` thành một file duy nhất. Rất cần thiết khi bạn quản lý nhiều Kubernetes cluster (dev, staging, prod, on-prem) và muốn dùng một file kubeconfig duy nhất với `kubectl`.

**Use case thực tế:** DevOps quản lý 5-10 cluster khác nhau — thay vì phải chạy `export KUBECONFIG=...` mỗi lần, có thể merge tất cả vào 1 file và dùng `kubectl config use-context` để chuyển đổi.

---

## Tính Năng Chi Tiết

### Upload / Paste kubeconfig
- **Drag & Drop:** Kéo thả trực tiếp nhiều file kubeconfig cùng lúc vào vùng upload
- **Manual Paste:** Paste nội dung YAML của kubeconfig vào textbox
- Hỗ trợ xử lý nhiều file cùng lúc (batch merge)

### Xử lý xung đột (Conflict Resolution)
- **Tự động đổi tên:** Nếu 2 file có cluster/user/context trùng tên, tool sẽ tự động thêm suffix `_2`, `_3`... để tránh ghi đè
- Người dùng được thông báo rõ về các xung đột đã xử lý

### Output
- Hiển thị file kubeconfig đã merge trong textbox
- Nút **Download** tải về file `merged-kubeconfig.yaml`
- Nút **Copy** sao chép vào clipboard

---

## Logic Kỹ Thuật

1. Parse từng file kubeconfig bằng `js-yaml`
2. Tổng hợp 3 mảng chính: `clusters[]`, `users[]`, `contexts[]`
3. Kiểm tra trùng lặp theo trường `name` trong từng mảng
4. Gộp và xây dựng object kubeconfig mới hoàn chỉnh
5. Serialize lại bằng `yaml.dump()` với format chuẩn

**Xử lý bảo mật:** Toàn bộ quá trình diễn ra 100% trên trình duyệt. File kubeconfig chứa credentials nhạy cảm — không có byte nào được gửi qua mạng.

---

## Ví Dụ Sử Dụng

**File 1 (dev-cluster):**
```yaml
apiVersion: v1
clusters:
  - name: dev
    cluster:
      server: https://dev.k8s.company.com
contexts:
  - name: dev-context
    context:
      cluster: dev
      user: dev-user
```

**File 2 (prod-cluster):**
```yaml
apiVersion: v1
clusters:
  - name: prod
    cluster:
      server: https://prod.k8s.company.com
```

**Output merged:**
```yaml
apiVersion: v1
clusters:
  - name: dev
    ...
  - name: prod
    ...
contexts:
  - name: dev-context
    ...
```
