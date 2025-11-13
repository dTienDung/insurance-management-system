# 🎯 TÓM TẮT HỆ THỐNG VALIDATION

## 📊 TỔNG QUAN

Hệ thống validation được triển khai ở **3 lớp** (3-tier validation):

```
┌─────────────────────────────────────────────────────────┐
│  1. FRONTEND VALIDATION (Client-side)                   │
│     - Kiểm tra ngay khi user nhập                       │
│     - Hiển thị error realtime                           │
│     - Ngăn submit nếu có lỗi                            │
├─────────────────────────────────────────────────────────┤
│  2. BACKEND VALIDATION (Server-side)                    │
│     - Kiểm tra lại TẤT CẢ (không tin client)           │
│     - Business rules phức tạp                           │
│     - Uniqueness check (VIN, CCCD, Email)              │
├─────────────────────────────────────────────────────────┤
│  3. DATABASE VALIDATION (Data integrity)                │
│     - UNIQUE constraints                                │
│     - CHECK constraints                                 │
│     - FOREIGN KEY constraints                           │
│     - Triggers                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ CÁC VALIDATION ĐÃ TRIỂN KHAI

### 1. KHÁCH HÀNG (Customer)

| Trường | Frontend | Backend | Database | Format/Rule |
|--------|----------|---------|----------|-------------|
| **Họ Tên** | ✅ Regex | ✅ Required | - | Chữ cái tiếng Việt, 2-100 ký tự |
| **CCCD** | ✅ Regex | ✅ Unique | ✅ UNIQUE | 9-12 chữ số |
| **SĐT** | ✅ Regex | ✅ Required | - | 0xxxxxxxxx hoặc +84xxxxxxxxx |
| **Email** | ✅ Regex | ✅ Optional | - | RFC 5322 format |
| **Địa Chỉ** | ✅ Min length | - | - | >= 10 ký tự nếu nhập |
| **Ngày Sinh** | ✅ Age 18-100 | - | - | Đủ 18 tuổi, không quá 100 tuổi |

**Frontend**: `frontend/src/utils/validationHelper.js` → `validateCustomer()`
```javascript
// Họ Tên: chỉ chữ cái tiếng Việt
if (!REGEX.fullName.test(data.hoTen.trim())) {
  errors.hoTen = 'Họ tên chỉ được chứa chữ cái (2-100 ký tự)';
}

// CCCD: 9-12 chữ số
if (!REGEX.idCard.test(data.cccd)) {
  errors.cccd = 'CCCD không hợp lệ (9-12 chữ số)';
}

// Tuổi: 18-100
const actualAge = ...;
if (actualAge < 18) {
  errors.ngaySinh = 'Khách hàng phải đủ 18 tuổi';
}
```

**Backend**: `backend/controllers/customerController.js` → `create()`
```javascript
// CCCD uniqueness check
const checkExist = await pool.request()
  .input('cccd', sql.VarChar(12), cccd)
  .query('SELECT MaKH FROM KhachHang WHERE CMND_CCCD = @cccd');

if (checkExist.recordset.length > 0) {
  return res.status(400).json({
    message: 'CCCD đã tồn tại trong hệ thống'
  });
}
```

**NOTE**: ✅ Full validation cho Customer vì đây là dữ liệu nghiệp vụ quan trọng

---

### 2. XE (Vehicle)

| Trường | Frontend | Backend | Database | Format/Rule |
|--------|----------|---------|----------|-------------|
| **VIN (Số Khung)** | ✅ Regex | ✅ Unique | ✅ UNIQUE | 17 ký tự, không có I/O/Q |
| **Số Máy** | ✅ Regex | ✅ Required | - | 6-30 ký tự alphanumeric |
| **Hãng Xe** | ✅ Required | ✅ Required | - | 2-50 ký tự |
| **Dòng Xe** | ✅ Required | ✅ Required | - | 1-100 ký tự |
| **Năm SX** | ✅ Range | ✅ Required | - | 1900 - (năm hiện tại + 1) |
| **Giá Trị Xe** | ✅ Range | - | - | 10 triệu - 50 tỷ VNĐ |
| **Biển Số** | ✅ Regex | - | - | XX[Y]-ZZZZZ (tách module) |

**Frontend**: `frontend/src/utils/validationHelper.js` → `validateVehicle()`
```javascript
// VIN: 17 chars, no I/O/Q
const vin = (data.soKhung || data.chassis_number).trim().toUpperCase();
if (!REGEX.vin.test(vin)) {
  errors.soKhung = 'VIN phải có đúng 17 ký tự (A-Z, 0-9, không chứa I/O/Q)';
}

// Số Máy: 6-30 alphanumeric
if (!REGEX.engineNumber.test(engineNo)) {
  errors.soMay = 'Số máy phải có 6-30 ký tự (chữ và số)';
}

// Năm SX: 1900 - hiện tại + 1
if (year < 1900 || year > currentYear + 1) {
  errors.namSanXuat = `Năm sản xuất không hợp lệ (1900-${currentYear + 1})`;
}

// Giá trị xe: 10M - 50B
if (value < 10000000 || value > 50000000000) {
  errors.giaTriXe = 'Giá trị xe: 10 triệu - 50 tỷ VNĐ';
}
```

**Backend**: `backend/controllers/vehicleController.js` → `create()`
```javascript
// VIN validation
if (!soKhung || soKhung.trim().length !== 17) {
  return res.status(400).json({ 
    message: 'Số khung (VIN) phải có đúng 17 ký tự' 
  });
}

// VIN uniqueness check
const existing = await request.query`
  SELECT SoKhung_VIN FROM Xe WHERE SoKhung_VIN = ${soKhung}
`;
if (existing.recordset.length > 0) {
  return res.status(400).json({ 
    message: 'Số khung (VIN) đã tồn tại trong hệ thống' 
  });
}
```

**Database**: `CONSTRAINT UQ_Xe_SoKhung UNIQUE (SoKhung_VIN)`

---

### 3. HỢP ĐỒNG (Contract)

| Trường | Frontend | Backend | Database | Format/Rule |
|--------|----------|---------|----------|-------------|
| **Ngày Bắt Đầu** | ✅ Not past > 30 | - | - | Không quá khứ > 30 ngày |
| **Ngày Kết Thúc** | ✅ > Bắt đầu | - | - | Sau ngày bắt đầu |
| **Thời Hạn** | ✅ <= 365 days | - | - | Tối đa 365 ngày |
| **Số Tiền BH** | ✅ Range | ✅ > 0 | - | 5 triệu - 1 tỷ VNĐ |
| **Phí BH** | ✅ Ratio 1-10% | ✅ > 0 | - | <= Số tiền BH, ratio 1-10% |

**Frontend**: `frontend/src/utils/validationHelper.js` → `validateContract()`
```javascript
// Ngày bắt đầu: không quá khứ > 30 ngày
const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
if (daysDiff > 30) {
  errors.ngayBatDau = 'Ngày bắt đầu không được quá 30 ngày trong quá khứ';
}

// Thời hạn hợp đồng: 1-365 ngày
const duration = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
if (duration > 365) {
  errors.ngayKetThuc = 'Thời hạn hợp đồng không được vượt quá 365 ngày';
}

// Phí BH <= Số tiền BH
if (premium > amount) {
  errors.phiBaoHiem = 'Phí bảo hiểm không được lớn hơn số tiền bảo hiểm';
}

// Tỷ lệ phí: 1-10%
const ratio = (premium / amount) * 100;
if (ratio < 1 || ratio > 10) {
  errors.phiBaoHiem = 'Phí bảo hiểm phải trong khoảng 1-10% số tiền bảo hiểm';
}
```

---

### 4. THANH TOÁN (Payment)

| Trường | Frontend | Backend | Database | Format/Rule |
|--------|----------|---------|----------|-------------|
| **Số Tiền** | ✅ <= Phí HĐ | ✅ > 0 | - | Không vượt phí hợp đồng |
| **Ngày TT** | ✅ Not future | - | - | Không ở tương lai |

**Frontend**: `frontend/src/utils/validationHelper.js` → `validatePayment()`
```javascript
// Số tiền thanh toán <= Phí hợp đồng
if (paymentAmount > contractPremium) {
  errors.soTien = 'Số tiền thanh toán không được lớn hơn phí bảo hiểm';
}

// Ngày thanh toán: không tương lai
if (paymentDate > today) {
  errors.ngayThanhToan = 'Ngày thanh toán không được ở tương lai';
}
```

---

### 5. BIỂN SỐ XE (License Plate) - ⚠️ DEPRECATED

| Trường | Frontend | Backend | Database | Format/Rule |
|--------|----------|---------|----------|-------------|
| **Biển Số** | ⚠️ No validation | - | ✅ UNIQUE | Bất kỳ (random/tách module) |

**Frontend**: `frontend/src/utils/validationHelper.js` → `validateLicensePlate()`
```javascript
// DEPRECATED: No format validation - allow any non-empty string
if (!bienSo?.trim()) {
  return { isValid: false, error: 'Vui lòng nhập biển số' };
}
return { isValid: true, error: null };
```

**NOTE**: ⚠️ Biển số không validate format vì:
- Biển số được random/auto-generate
- Module BienSoXe tách riêng
- Chỉ cần UNIQUE constraint trong database

---

### 6. TÀI KHOẢN/ĐĂNG NHẬP (User/Account) - ⚠️ DEMO MODE

| Trường | Frontend | Backend | Database | Format/Rule |
|--------|----------|---------|----------|-------------|
| **Username** | ❌ No validation | - | ✅ UNIQUE | Bất kỳ (demo mode) |
| **Password** | ❌ No validation | ✅ Hash only | - | Bất kỳ (demo mode) |

**NOTE**: ⚠️ Không validate user/account vì:
- Đây là sản phẩm DEMO
- Username/Password không cần format phức tạp
- Backend chỉ hash password, không check complexity
- Database có UNIQUE constraint cho username

---

## 📁 CẤU TRÚC FILE

### Frontend
```
frontend/src/
├── config.js
│   └── REGEX: Tất cả regex patterns
│       ├── email, phone, idCard
│       ├── vin, engineNumber
│       ├── fullName, address
│       ├── licensePlate
│       └── username, password
│
└── utils/
    └── validationHelper.js
        ├── validateCustomer()
        ├── validateVehicle()
        ├── validateContract()
        ├── validatePayment()
        └── validateLicensePlate()
```

### Backend
```
backend/controllers/
├── customerController.js
│   ├── create(): CCCD uniqueness check
│   └── update(): không cho sửa CCCD
│
├── vehicleController.js
│   ├── create(): VIN uniqueness check
│   └── update(): VIN change validation
│
└── contractController.js
    └── (business rules validation)
```

### Database
```sql
-- UNIQUE Constraints
ALTER TABLE Xe ADD CONSTRAINT UQ_Xe_SoKhung UNIQUE (SoKhung_VIN);

-- CHECK Constraints (cần bổ sung)
ALTER TABLE Xe ADD CONSTRAINT CHK_Xe_NamSX 
  CHECK (NamSX >= 1900 AND NamSX <= YEAR(GETDATE()) + 1);

ALTER TABLE Xe ADD CONSTRAINT CHK_Xe_GiaTriXe 
  CHECK (GiaTriXe > 0);

ALTER TABLE HopDong ADD CONSTRAINT CHK_HD_PhiBaoHiem 
  CHECK (PhiBaoHiem > 0);

-- Triggers
CREATE TRIGGER trg_AutoMaXe ... (auto-generate MaXe)
```

---

## 🔧 REGEX PATTERNS

### Định nghĩa trong `config.js`:

```javascript
export const REGEX = {
  // Email - RFC 5322
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Phone - Vietnam (0xxxxxxxxx or +84xxxxxxxxx)
  phone: /^(0|\+84)[0-9]{9,10}$/,
  
  // ID Card - CMND 9 digits or CCCD 12 digits
  idCard: /^[0-9]{9,12}$/,
  
  // License Plate - Vietnam format (29A-12345)
  licensePlate: /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/,
  
  // VIN - ISO 3779: 17 chars, no I/O/Q
  vin: /^[A-HJ-NPR-Z0-9]{17}$/i,
  
  // Engine Number - 6-30 alphanumeric
  engineNumber: /^[A-Z0-9]{6,30}$/i,
  
  // Full Name - Vietnamese letters + spaces (2-100 chars)
  fullName: /^[a-zA-ZÀ-ỹ\s]{2,100}$/,
  
  // Address - Vietnamese text with numbers, punctuation (10-500 chars)
  address: /^[a-zA-Z0-9À-ỹ\s,.\-/]{10,500}$/,
  
  // Username - alphanumeric + underscore (5-50 chars)
  username: /^[a-zA-Z0-9_]{5,50}$/,
  
  // Password - min 8, 1 upper, 1 lower, 1 digit, 1 special
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};
```

---

## 🚨 CẦN LÀM THÊM

### Priority 1: Database Constraints

```sql
-- 1. CHECK constraints cho Xe
ALTER TABLE Xe ADD CONSTRAINT CHK_Xe_NamSX 
  CHECK (NamSX >= 1900 AND NamSX <= YEAR(GETDATE()) + 1);

ALTER TABLE Xe ADD CONSTRAINT CHK_Xe_GiaTriXe 
  CHECK (GiaTriXe > 0);

-- 2. CHECK constraints cho HopDong
ALTER TABLE HopDong ADD CONSTRAINT CHK_HD_SoTienBaoHiem 
  CHECK (SoTienBaoHiem > 0);

ALTER TABLE HopDong ADD CONSTRAINT CHK_HD_PhiBaoHiem 
  CHECK (PhiBaoHiem > 0 AND PhiBaoHiem <= SoTienBaoHiem);

-- 3. CHECK constraints cho ThanhToan
ALTER TABLE ThanhToan ADD CONSTRAINT CHK_TT_SoTien 
  CHECK (SoTien > 0);
```

### Priority 2: Backend Business Rules

**contractController.js**: Cần bổ sung validation:
- Kiểm tra thời hạn hợp đồng <= 365 ngày
- Kiểm tra tỷ lệ phí/số tiền 1-10%
- Kiểm tra ngày bắt đầu không quá khứ > 30 ngày

**paymentController.js**: Cần bổ sung:
- Kiểm tra tổng thanh toán <= phí hợp đồng
- Kiểm tra ngày thanh toán không tương lai
- Kiểm tra ngày thanh toán >= ngày tạo hợp đồng

### Priority 3: Advanced Features

1. **VIN Checksum Validation**: Thuật toán check digit ISO 3779
2. **License Plate Advanced**: Validate mã tỉnh thành theo bảng chuẩn
3. **Password Strength Meter**: UI hiển thị độ mạnh mật khẩu
4. **Phone Number International**: Hỗ trợ nhiều quốc gia

---

## 📖 VÍ DỤ LUỒNG VALIDATION

### User tạo mới xe:

```
1. User nhập VIN: "1HGBH41JXMN109186" trên form
   ↓
2. [Frontend] onChange → validationHelper.validateVehicle()
   - Check REGEX.vin: /^[A-HJ-NPR-Z0-9]{17}$/i
   - ✅ PASS: 17 ký tự, không có I/O/Q
   ↓
3. User click "Lưu"
   ↓
4. [Frontend] Submit form → API POST /api/vehicles
   ↓
5. [Backend] vehicleController.create()
   - Kiểm tra lại: soKhung.length === 17
   - Query: SELECT SoKhung_VIN FROM Xe WHERE SoKhung_VIN = '1HGBH41JXMN109186'
   - Nếu đã tồn tại → Return 400 "VIN đã tồn tại"
   - ✅ PASS: VIN chưa tồn tại
   ↓
6. [Backend] Execute INSERT INTO Xe
   ↓
7. [Database] Check CONSTRAINT UQ_Xe_SoKhung
   - ✅ PASS: VIN unique
   ↓
8. [Database] Trigger trg_AutoMaXe
   - Auto-generate MaXe = 'X001'
   - INSERT với MaXe, SoKhung_VIN, SoMay
   ↓
9. ✅ Success → Return 201 Created
   ↓
10. [Frontend] Hiển thị "Thêm xe thành công" + reload danh sách
```

### User nhập sai VIN:

```
1. User nhập VIN: "1HGBH41JXM" (chỉ 10 ký tự)
   ↓
2. [Frontend] onChange → validationHelper.validateVehicle()
   - Check REGEX.vin.test("1HGBH41JXM")
   - ❌ FAIL: Chỉ 10 ký tự, cần 17
   - Hiển thị error: "VIN phải có đúng 17 ký tự (A-Z, 0-9, không chứa I/O/Q)"
   ↓
3. Button "Lưu" bị disable (form invalid)
   ↓
4. User không thể submit cho đến khi sửa đúng
```

---

## 📝 CHECKLIST TRIỂN KHAI

### ✅ Đã Hoàn Thành

- [x] Frontend: REGEX patterns đầy đủ (config.js)
- [x] Frontend: validateCustomer() - đầy đủ (fullName, age, address)
- [x] Frontend: validateVehicle() - đầy đủ (VIN, engineNumber, year, value)
- [x] Frontend: validateContract() - đầy đủ (dates, amounts, ratio)
- [x] Frontend: validatePayment() - đầy đủ (amount <= premium, date not future)
- [x] Backend: customerController - CCCD uniqueness
- [x] Backend: vehicleController - VIN uniqueness
- [x] Database: UNIQUE constraint SoKhung_VIN

### ⚠️ Cần Làm

- [ ] Database: CHECK constraints (NamSX, GiaTriXe, PhiBaoHiem, SoTien)
- [ ] Backend: contractController - business rules validation
- [ ] Backend: paymentController - total payment validation
- [ ] Advanced: VIN checksum algorithm
- [ ] Advanced: License plate province code validation
- [ ] Advanced: Password strength meter UI
- [ ] Test: End-to-end validation flow testing

---

**📅 Cập nhật**: 2024-01-15  
**👤 Tác giả**: GitHub Copilot  
**📌 Version**: 1.0.0
