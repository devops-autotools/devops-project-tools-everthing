# Tool 01 — Helm Image Converter

**Route:** `/helm-converter`  
**Group:** CONTAINERS  
**File:** `src/pages/HelmConverter.jsx`

---

## Mục Đích

Công cụ này giúp tự động hóa việc thay thế domain registry của các container images trong file `values.yaml` của Helm chart. Thay vì chỉnh tay từng dòng image trong file YAML phức tạp (có thể lên đến hàng nghìn dòng), tool này phân tích toàn bộ file và thực hiện chuyển đổi hàng loạt chỉ trong vài giây.

**Use case thực tế:** Khi bạn cần đưa Helm chart từ môi trường public (DockerHub, gcr.io...) vào môi trường air-gap hoặc private registry (Harbor, ECR, GHCR...).

---

## Tính Năng Chi Tiết

### Input (Cột 1 — Raw values.yaml)
- Paste trực tiếp nội dung file `values.yaml`
- Thanh tìm kiếm nội bộ để điều hướng nhanh trong file dài
- Nút **Clear** để xóa toàn bộ input

### Config (Cột 2 — Cấu hình chuyển đổi)
- **Source Registry:** Registry nguồn cần thay thế (ví dụ: `docker.io`)
- **Target Registry:** Registry đích private (ví dụ: `harbor.company.com`)
- Nút **Convert** kích hoạt quá trình xử lý

### Output (Cột 3 — Kết quả)
- Hiển thị file YAML sau khi đã thay thế registry
- **Quan trọng:** Toàn bộ comment `#` trong file gốc được GIỮ NGUYÊN
- Sinh tự động các lệnh Docker:
  ```bash
  docker pull <original-image>
  docker tag  <original-image> <target-image>
  docker push <target-image>
  ```
- Nút Copy và Download file kết quả

---

## Logic Kỹ Thuật

Tool sử dụng Regex duyệt từng dòng thay vì parse toàn bộ cây YAML. Lý do: đảm bảo giữ nguyên format gốc và comment — điều mà `yaml.dump()` thông thường sẽ xóa mất.

**Xử lý chart đặc biệt (cert-manager):** Một số chart phức tạp không đặt image trực tiếp trong `repository:` mà dùng biến toàn cục `imageRegistry:`. Tool nhận diện pattern này và cập nhật đúng trường `imageRegistry` thay vì tìm-và-thay-thế mù quáng.

---

## Ví Dụ Sử Dụng

**Input:**
```yaml
image:
  repository: docker.io/bitnami/nginx
  tag: "1.25"
```

**Config:** Source = `docker.io`, Target = `harbor.mycompany.com`

**Output:**
```yaml
image:
  repository: harbor.mycompany.com/bitnami/nginx
  tag: "1.25"
```

**Docker commands generated:**
```bash
docker pull docker.io/bitnami/nginx:1.25
docker tag  docker.io/bitnami/nginx:1.25 harbor.mycompany.com/bitnami/nginx:1.25
docker push harbor.mycompany.com/bitnami/nginx:1.25
```
