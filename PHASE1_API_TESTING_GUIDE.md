# 🧪 PHASE 1 - API TESTING GUIDE
**Ngày tạo:** 19/11/2025  
**Phiên bản:** Phase 1 Backend Enhancements  
**Base URL:** `http://localhost:5000/api`

---

## 📋 TỔNG QUAN

Phase 1 đã thêm **3 controllers mới** với **16 endpoints**:

| Controller | Endpoints | Chức năng |
|-----------|-----------|-----------|
| Assessment Criteria | 6 | CRUD Ma trận thẩm định |
| Pricing Matrix | 7 | CRUD Ma trận định phí + Tính phí |
| Audit Log | 8 | Xem lịch sử thay đổi |

---

## 🔐 AUTHENTICATION

**Tất cả endpoints đều cần token!** (trừ `/pricing/calculate` và `/pricing/matrix`)

### Đăng nhập trước:
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "maTK": "TK001",
    "tenDangNhap": "admin"
  }
}
```

**Sử dụng token:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
```

---

## 1️⃣ ASSESSMENT CRITERIA API (`/api/criteria`)

### 1.1. Lấy danh sách tiêu chí
```http
GET /api/criteria
Authorization: Bearer {token}

# With pagination & search
GET /api/criteria?page=1&limit=20&search=tuổi
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "TieuChi": "Tuổi xe",
      "DieuKien": "< 5 năm",
      "Diem": 10,
      "GhiChu": "Xe mới, ít rủi ro"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

### 1.2. Lấy 1 tiêu chí
```http
GET /api/criteria/1
Authorization: Bearer {token}
```

### 1.3. Tạo tiêu chí mới
```http
POST /api/criteria
Authorization: Bearer {token}
Content-Type: application/json

{
  "TieuChi": "Tần suất bảo dưỡng",
  "DieuKien": "> 2 lần/năm",
  "Diem": 15,
  "GhiChu": "Bảo dưỡng thường xuyên giảm rủi ro"
}
```

**Validation Rules:**
- ✅ TieuChi: Required, max 80 chars
- ✅ DieuKien: Required, max 50 chars
- ✅ Diem: Required, -100 đến +100
- ✅ GhiChu: Optional, max 150 chars
- ✅ Không cho trùng (TieuChi + DieuKien)

**Response:**
```json
{
  "success": true,
  "message": "Tạo tiêu chí thành công",
  "data": {
    "ID": 16
  }
}
```

### 1.4. Cập nhật tiêu chí
```http
PUT /api/criteria/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "Diem": 20,
  "GhiChu": "Tăng điểm cho xe mới"
}
```

### 1.5. Xóa tiêu chí
```http
DELETE /api/criteria/1
Authorization: Bearer {token}
```

**Error nếu đang dùng:**
```json
{
  "success": false,
  "message": "Không thể xóa tiêu chí đang được sử dụng trong hồ sơ thẩm định"
}
```

### 1.6. Thống kê sử dụng
```http
GET /api/criteria/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "TieuChi": "Tuổi xe",
      "DieuKien": "< 5 năm",
      "Diem": 10,
      "SoLuotSuDung": 45,
      "DiemTrungBinh": 8.5
    }
  ]
}
```

---

## 2️⃣ PRICING MATRIX API (`/api/pricing`)

### 2.1. Lấy danh sách hệ số phí
```http
GET /api/pricing
Authorization: Bearer {token}

# Filter by RiskLevel hoặc Gói
GET /api/pricing?riskLevel=HIGH
GET /api/pricing?maGoi=GB001
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "RiskLevel": "LOW",
      "MaGoi": "GB001",
      "TenGoi": "Bảo hiểm vật chất xe ô tô",
      "HeSoPhi": 1.0,
      "GhiChu": "Hệ số chuẩn"
    },
    {
      "ID": 2,
      "RiskLevel": "MEDIUM",
      "MaGoi": "GB001",
      "TenGoi": "Bảo hiểm vật chất xe ô tô",
      "HeSoPhi": 1.5,
      "GhiChu": "Tăng 50%"
    },
    {
      "ID": 3,
      "RiskLevel": "HIGH",
      "MaGoi": "GB001",
      "TenGoi": "Bảo hiểm vật chất xe ô tô",
      "HeSoPhi": 2.5,
      "GhiChu": "Tăng 150%"
    }
  ]
}
```

### 2.2. Lấy 1 hệ số
```http
GET /api/pricing/1
Authorization: Bearer {token}
```

### 2.3. Tạo hệ số mới
```http
POST /api/pricing
Authorization: Bearer {token}
Content-Type: application/json

{
  "RiskLevel": "HIGH",
  "MaGoi": "GB002",
  "HeSoPhi": 3.0,
  "GhiChu": "Gói trách nhiệm dân sự - rủi ro cao"
}
```

**Validation Rules:**
- ✅ RiskLevel: LOW, MEDIUM, hoặc HIGH
- ✅ MaGoi: Phải tồn tại trong GoiBaoHiem
- ✅ HeSoPhi: 0.5 đến 5.0
- ✅ Không cho trùng (RiskLevel + MaGoi)

### 2.4. Cập nhật hệ số
```http
PUT /api/pricing/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "HeSoPhi": 1.2,
  "GhiChu": "Điều chỉnh theo thị trường"
}
```

### 2.5. Xóa hệ số
```http
DELETE /api/pricing/1
Authorization: Bearer {token}
```

**Error nếu đang dùng:**
```json
{
  "success": false,
  "message": "Không thể xóa hệ số phí đang được sử dụng trong hợp đồng đang hiệu lực"
}
```

### 2.6. ⭐ Tính phí bảo hiểm (PUBLIC - Không cần token)
```http
GET /api/pricing/calculate?riskLevel=MEDIUM&maGoi=GB001&giaTriXe=500000000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "giaTriXe": 500000000,
    "riskLevel": "MEDIUM",
    "maGoi": "GB001",
    "tenGoi": "Bảo hiểm vật chất xe ô tô",
    "tyLePhiCoBan": 1.5,
    "heSoPhi": 1.5,
    "phiBaoHiem": 11250000,
    "congThuc": "500000000 x (1.5% / 100) x 1.5 = 11250000 VNĐ"
  }
}
```

**Công thức:**
```
PhiBaoHiem = GiaTriXe × (TyLePhiCoBan / 100) × HeSoPhi
           = 500,000,000 × (1.5 / 100) × 1.5
           = 11,250,000 VNĐ
```

### 2.7. Lấy ma trận đầy đủ (PUBLIC)
```http
GET /api/pricing/matrix
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaGoi": "GB001",
      "TenGoi": "Bảo hiểm vật chất xe ô tô",
      "TyLePhiCoBan": 1.5,
      "HeSo_Low": 1.0,
      "HeSo_Medium": 1.5,
      "HeSo_High": 2.5
    },
    {
      "MaGoi": "GB002",
      "TenGoi": "Bảo hiểm trách nhiệm dân sự",
      "TyLePhiCoBan": 0.8,
      "HeSo_Low": 1.0,
      "HeSo_Medium": 1.3,
      "HeSo_High": 2.0
    }
  ]
}
```

---

## 3️⃣ AUDIT LOG API (`/api/audit`)

### 3.1. Lấy tất cả logs
```http
GET /api/audit
Authorization: Bearer {token}

# With filters
GET /api/audit?page=1&limit=50
GET /api/audit?tableName=Xe
GET /api/audit?action=UPDATE
GET /api/audit?recordId=XE001
GET /api/audit?fromDate=2025-11-01&toDate=2025-11-19
GET /api/audit?changedBy=admin
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "TableName": "Xe",
      "RecordID": "XE001",
      "Action": "UPDATE",
      "FieldName": "GiaTriXe",
      "OldValue": "500000000",
      "NewValue": "550000000",
      "ChangedBy": "admin",
      "ChangedAt": "2025-11-19T10:30:00",
      "IPAddress": "192.168.1.100",
      "UserAgent": "Mozilla/5.0...",
      "ChangeReason": "Điều chỉnh theo giá thị trường"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 234
  }
}
```

### 3.2. Lấy logs theo bảng
```http
GET /api/audit/table/Xe
Authorization: Bearer {token}
```

### 3.3. Lấy lịch sử 1 record
```http
GET /api/audit/record/Xe/XE001
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "Action": "INSERT",
      "ChangedAt": "2025-11-01T08:00:00",
      "ChangedBy": "admin"
    },
    {
      "ID": 45,
      "Action": "UPDATE",
      "FieldName": "GiaTriXe",
      "OldValue": "500000000",
      "NewValue": "550000000",
      "ChangedAt": "2025-11-19T10:30:00",
      "ChangedBy": "admin"
    }
  ],
  "count": 2
}
```

### 3.4. Thống kê audit logs
```http
GET /api/audit/stats
Authorization: Bearer {token}

# Theo khoảng thời gian
GET /api/audit/stats?fromDate=2025-11-01&toDate=2025-11-19
```

**Response:**
```json
{
  "success": true,
  "data": {
    "byTable": [
      {
        "TableName": "Xe",
        "TotalChanges": 120,
        "AffectedRecords": 45,
        "FirstChange": "2025-11-01T08:00:00",
        "LastChange": "2025-11-19T14:23:00"
      },
      {
        "TableName": "KhachHang",
        "TotalChanges": 78,
        "AffectedRecords": 32
      }
    ],
    "byAction": [
      {"Action": "UPDATE", "Count": 145},
      {"Action": "INSERT", "Count": 53}
    ],
    "byUser": [
      {"ChangedBy": "admin", "Changes": 98, "LastActivity": "2025-11-19T14:23:00"},
      {"ChangedBy": "nhanvien", "Changes": 54}
    ],
    "recentChanges": [ /* 10 thay đổi gần nhất */ ]
  }
}
```

### 3.5. Danh sách bảng có audit
```http
GET /api/audit/tables
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {"TableName": "Xe", "TotalLogs": 120},
    {"TableName": "KhachHang", "TotalLogs": 78}
  ]
}
```

### 3.6. So sánh 2 versions
```http
GET /api/audit/compare?table=Xe&id=XE001&version1=1&version2=45
Authorization: Bearer {token}
```

### 3.7. Export to CSV
```http
GET /api/audit/export
Authorization: Bearer {token}

# With filters
GET /api/audit/export?tableName=Xe&fromDate=2025-11-01&toDate=2025-11-19
```

**Response:** CSV file download

---

## 📊 TEST SCENARIOS

### Scenario 1: Quản lý Ma trận Thẩm định
```bash
# 1. Tạo tiêu chí mới
POST /api/criteria
{
  "TieuChi": "Lịch sử tai nạn",
  "DieuKien": "Không có tai nạn",
  "Diem": 20,
  "GhiChu": "Chưa từng gặp tai nạn"
}

# 2. Tạo tiêu chí âm điểm
POST /api/criteria
{
  "TieuChi": "Lịch sử tai nạn",
  "DieuKien": "> 2 vụ trong 2 năm",
  "Diem": -30,
  "GhiChu": "Rủi ro cao"
}

# 3. Xem thống kê
GET /api/criteria/stats

# 4. Cập nhật điểm
PUT /api/criteria/1
{
  "Diem": 25
}

# 5. Test validation: Điểm ngoài range
POST /api/criteria
{
  "TieuChi": "Test",
  "DieuKien": "Test",
  "Diem": 150  # ERROR: Phải từ -100 đến +100
}
```

### Scenario 2: Định phí cho các mức rủi ro
```bash
# 1. Tạo hệ số cho gói GB001
POST /api/pricing
{"RiskLevel": "LOW", "MaGoi": "GB001", "HeSoPhi": 1.0}

POST /api/pricing
{"RiskLevel": "MEDIUM", "MaGoi": "GB001", "HeSoPhi": 1.5}

POST /api/pricing
{"RiskLevel": "HIGH", "MaGoi": "GB001", "HeSoPhi": 2.5}

# 2. Xem ma trận
GET /api/pricing/matrix

# 3. Tính phí cho xe 500 triệu, rủi ro MEDIUM
GET /api/pricing/calculate?riskLevel=MEDIUM&maGoi=GB001&giaTriXe=500000000
# Expected: 11,250,000 VNĐ

# 4. Tính phí cho xe 1 tỷ, rủi ro HIGH
GET /api/pricing/calculate?riskLevel=HIGH&maGoi=GB001&giaTriXe=1000000000
# Expected: 37,500,000 VNĐ (1 tỷ x 1.5% x 2.5)
```

### Scenario 3: Xem Audit Trail
```bash
# 1. Tạo xe mới (sẽ trigger audit)
POST /api/vehicles
{
  "HangXe": "Toyota",
  "LoaiXe": "Sedan",
  "NamSX": 2023,
  "GiaTriXe": 500000000,
  "SoKhung": "JT2BG28K930012345",
  "SoMay": "1NXBR32E03Z123456"
}

# 2. Cập nhật giá trị xe (trigger audit)
PUT /api/vehicles/XE001
{
  "GiaTriXe": 550000000
}

# 3. Xem lịch sử thay đổi
GET /api/audit/record/Xe/XE001

# 4. Xem tất cả thay đổi về xe
GET /api/audit/table/Xe

# 5. Thống kê
GET /api/audit/stats
```

---

## ✅ EXPECTED RESULTS

### Test 1: CRUD Ma trận Thẩm định
- ✅ Tạo được tiêu chí mới
- ✅ Validation đúng (-100 đến +100)
- ✅ Không cho trùng (TieuChi + DieuKien)
- ✅ Không xóa được nếu đang dùng
- ✅ Stats hiển thị đúng

### Test 2: CRUD Ma trận Định Phí
- ✅ Tạo được hệ số cho 3 mức rủi ro
- ✅ Validation RiskLevel (LOW/MEDIUM/HIGH)
- ✅ Validation HeSoPhi (0.5-5.0)
- ✅ Tính phí chính xác
- ✅ Ma trận hiển thị đầy đủ

### Test 3: Audit Logs
- ✅ Tự động ghi log khi UPDATE Xe
- ✅ Tự động ghi log khi UPDATE KhachHang
- ✅ Hiển thị đúng OldValue → NewValue
- ✅ Filter theo bảng, record, action
- ✅ Export CSV thành công

---

## 🐛 COMMON ERRORS

### Error 1: Token không hợp lệ
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```
**Fix:** Đăng nhập lại để lấy token mới

### Error 2: Validation failed
```json
{
  "success": false,
  "message": "Điểm phải nằm trong khoảng -100 đến +100"
}
```
**Fix:** Kiểm tra dữ liệu input

### Error 3: Duplicate entry
```json
{
  "success": false,
  "message": "Tiêu chí với điều kiện này đã tồn tại"
}
```
**Fix:** Kiểm tra xem đã tồn tại chưa

### Error 4: Foreign key constraint
```json
{
  "success": false,
  "message": "Gói bảo hiểm không tồn tại"
}
```
**Fix:** Tạo gói bảo hiểm trước

---

## 📝 NOTES

1. **Authentication:** Tất cả endpoints cần token (trừ `/pricing/calculate` và `/pricing/matrix`)
2. **Audit Auto-Trigger:** Chỉ Xe và KhachHang có audit triggers tự động
3. **Soft Delete:** Không dùng soft delete cho Master Data (hard delete)
4. **Decimal Precision:** HeSoPhi có 2 chữ số thập phân (e.g., 1.50)
5. **RiskLevel:** Phải viết HOA (LOW/MEDIUM/HIGH)

---

## 🎯 COMPLETION CHECKLIST

- [ ] Tạo được tiêu chí thẩm định
- [ ] Validation -100 đến +100 hoạt động
- [ ] Tạo được hệ số phí cho 3 mức rủi ro
- [ ] Tính phí đúng công thức
- [ ] Audit log ghi khi update Xe
- [ ] Audit log ghi khi update KhachHang
- [ ] Filter audit logs theo bảng
- [ ] Export CSV thành công
- [ ] Thống kê hiển thị đúng
- [ ] Tất cả validations hoạt động

**🚀 SAU KHI TEST XONG: Chuyển sang Phase 2 (Frontend UI)**
