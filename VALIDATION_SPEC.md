# 📋 VALIDATION SPECIFICATION
## Đặc tả Format và Validation cho tất cả các trường dữ liệu

---

## 🎯 1. THÔNG TIN KHÁCH HÀNG (Customer)

### 1.1 Họ Tên (HoTen)
- **Format**: Chữ cái tiếng Việt có dấu + khoảng trắng
- **Độ dài**: 2-100 ký tự
- **Regex**: `/^[a-zA-ZÀ-ỹ\s]{2,100}$/`
- **Ví dụ hợp lệ**: 
  - ✅ "Nguyễn Văn An"
  - ✅ "Trần Thị Bích Hằng"
- **Ví dụ không hợp lệ**:
  - ❌ "Nguyen123" (có số)
  - ❌ "A" (quá ngắn)

### 1.2 CCCD/CMND (CMND_CCCD)
- **Format**: Chỉ chữ số
- **Độ dài**: 
  - CMND cũ: 9 số
  - CCCD mới: 12 số
- **Regex hiện tại**: `/^[0-9]{9,12}$/` ✅ ĐÃ CÓ
- **Ví dụ hợp lệ**:
  - ✅ "123456789" (CMND 9 số)
  - ✅ "001234567890" (CCCD 12 số)
- **Ví dụ không hợp lệ**:
  - ❌ "12345" (quá ngắn)
  - ❌ "12345678901" (11 số - không chuẩn)

### 1.3 Số Điện Thoại (SDT)
- **Format**: 
  - Bắt đầu bằng `0` hoặc `+84`
  - 10-11 chữ số (với `0`) hoặc 12-13 ký tự (với `+84`)
- **Regex hiện tại**: `/^(0|\+84)[0-9]{9,10}$/` ✅ ĐÃ CÓ
- **Ví dụ hợp lệ**:
  - ✅ "0912345678"
  - ✅ "+84912345678"
  - ✅ "0281234567" (số cố định)
- **Ví dụ không hợp lệ**:
  - ❌ "84912345678" (thiếu +)
  - ❌ "091234" (quá ngắn)

### 1.4 Email
- **Format**: RFC 5322 standard
- **Regex hiện tại**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` ✅ ĐÃ CÓ (cơ bản)
- **Regex cải tiến**: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
- **Ví dụ hợp lệ**:
  - ✅ "user@example.com"
  - ✅ "nguyen.van.a@company.vn"
- **Ví dụ không hợp lệ**:
  - ❌ "user@" (thiếu domain)
  - ❌ "@example.com" (thiếu local part)

### 1.5 Địa Chỉ (DiaChi)
- **Format**: Văn bản tự do có dấu
- **Độ dài**: 10-500 ký tự
- **Regex**: `/^[a-zA-Z0-9À-ỹ\s,.\-/]{10,500}$/`
- **Ví dụ hợp lệ**:
  - ✅ "123 Nguyễn Huệ, P. Bến Nghé, Q1, TP.HCM"
- **Validation**: Không bắt buộc nhưng nếu có phải >= 10 ký tự

### 1.6 Ngày Sinh (NgaySinh)
- **Format**: 
  - Database: `DATE` type
  - Display: `DD/MM/YYYY`
  - API: `YYYY-MM-DD`
- **Validation**:
  - Phải >= 18 tuổi (khách hàng trưởng thành)
  - Phải <= 100 tuổi
- **Ví dụ hợp lệ**:
  - ✅ "15/05/1990" (34 tuổi)
- **Ví dụ không hợp lệ**:
  - ❌ "15/05/2010" (chưa đủ 18 tuổi)

---

## 🚗 2. THÔNG TIN XE (Vehicle)

### 2.1 Số Khung - VIN (SoKhung_VIN)
- **Format**: ISO 3779 standard
- **Độ dài**: **17 ký tự** (bắt buộc)
- **Ký tự**: Chữ và số (A-Z, 0-9)
- **Loại trừ**: I, O, Q (tránh nhầm với 1, 0)
- **Regex cần thêm**: `/^[A-HJ-NPR-Z0-9]{17}$/i` ⚠️ THIẾU
- **Database**: UNIQUE constraint ✅ ĐÃ CÓ
- **Ví dụ hợp lệ**:
  - ✅ "1HGBH41JXMN109186"
  - ✅ "JM1BL1S58A1234567"
- **Ví dụ không hợp lệ**:
  - ❌ "1HGBH41JXMN10918" (chỉ 16 ký tự)
  - ❌ "1HGBH41JXMN109I86" (có chữ I)
  - ❌ "1HGBH41JXMN109O86" (có chữ O)

**VIN Checksum**: VIN có ký tự thứ 9 là checksum digit theo thuật toán chuẩn.

### 2.2 Số Máy (SoMay)
- **Format**: Alphanumeric
- **Độ dài**: 6-30 ký tự
- **Regex**: `/^[A-Z0-9]{6,30}$/i`
- **Ví dụ hợp lệ**:
  - ✅ "G4FCAE123456"
  - ✅ "1NZ987654"

### 2.3 Biển Số Xe (BienSo) - ⚠️ TÁCH RA MODULE RIÊNG
- **Format**: Biển số Việt Nam
- **Mẫu**:
  - `XX[Y]-ZZZZZ` (XX: tỉnh, Y: loại, ZZZZZ: số)
  - `XX[Y]Z-ZZZZ` (có chữ Z)
- **Regex hiện tại**: `/^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/` ✅ ĐÃ CÓ
- **Ví dụ hợp lệ**:
  - ✅ "29A-12345" (TP.HCM)
  - ✅ "30G-98765" (Hà Nội)
  - ✅ "51F-12345" (xe công vụ)
- **Ví dụ không hợp lệ**:
  - ❌ "9A-12345" (thiếu số đầu)
  - ❌ "29A12345" (thiếu dấu gạch ngang)

**Mã tỉnh thành**: 01-99 (cần validate theo bảng mã chuẩn)

### 2.4 Hãng Xe (HangXe)
- **Format**: Chữ cái và số, khoảng trắng
- **Độ dài**: 2-50 ký tự
- **Regex**: `/^[a-zA-Z0-9\s-]{2,50}$/`
- **Ví dụ**: "Toyota", "Honda", "Mercedes-Benz"

### 2.5 Dòng Xe (LoaiXe / DongXe)
- **Format**: Chữ cái, số, khoảng trắng
- **Độ dài**: 1-100 ký tự
- **Regex**: `/^[a-zA-Z0-9\s\-./]{1,100}$/`
- **Ví dụ**: "Vios 1.5E", "City RS", "E200 Sport"

### 2.6 Năm Sản Xuất (NamSX)
- **Format**: Số nguyên 4 chữ số
- **Range**: 1900 đến (năm hiện tại + 1)
- **Validation**: 
  ```javascript
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear + 1) {
    errors.namSanXuat = `Năm sản xuất không hợp lệ (1900-${currentYear + 1})`;
  }
  ```
- **Ví dụ hợp lệ**:
  - ✅ 2020
  - ✅ 2024
  - ✅ 2025 (xe model năm sau)
- **Ví dụ không hợp lệ**:
  - ❌ 1899
  - ❌ 2030

### 2.7 Giá Trị Xe (GiaTriXe)
- **Format**: Số tiền (VND)
- **Range**: 10,000,000 - 50,000,000,000 (10 triệu - 50 tỷ)
- **Validation**: > 0, kiểm tra giá trị hợp lý
- **Display**: Format với dấu phẩy ngăn cách hàng nghìn

---

## 📄 3. THÔNG TIN HỢP ĐỒNG (Contract)

### 3.1 Số Hợp Đồng (SoHD)
- **Format**: Auto-generated hoặc theo quy ước
- **Pattern**: `HD-YYYYMMDD-XXXX`
  - HD: prefix
  - YYYYMMDD: ngày tạo
  - XXXX: số thứ tự 4 chữ số
- **Ví dụ**: "HD-20240115-0001"
- **Regex**: `/^HD-\d{8}-\d{4}$/`

### 3.2 Ngày Bắt Đầu / Kết Thúc
- **Validation**:
  - `NgayKetThuc > NgayBatDau` ✅ ĐÃ CÓ
  - Khoảng cách tối thiểu: 1 ngày
  - Khoảng cách tối đa: 365 ngày (hợp đồng 1 năm)
  - Ngày bắt đầu không được quá khứ > 30 ngày
- **Format**: `DATE` type, display `DD/MM/YYYY`

### 3.3 Số Tiền Bảo Hiểm (SoTienBaoHiem)
- **Format**: Decimal(18,2)
- **Validation**: > 0 ✅ ĐÃ CÓ
- **Range hợp lý**: 5,000,000 - 1,000,000,000 VND
- **Display**: Format với dấu phẩy + " VNĐ"

### 3.4 Phí Bảo Hiểm (PhiBaoHiem)
- **Format**: Decimal(18,2)
- **Validation**: 
  - > 0 ✅ ĐÃ CÓ
  - Phí <= Số tiền bảo hiểm
  - Tỷ lệ hợp lý: 1-10% số tiền bảo hiểm
- **Business Rule**: Tính theo công thức:
  ```
  PhiBaoHiem = SoTienBaoHiem × TyLe × HeSoRuiRo
  ```

---

## 💰 4. THÔNG TIN THANH TOÁN (Payment)

### 4.1 Số Tiền (SoTien)
- **Format**: Decimal(18,2)
- **Validation**: > 0 ✅ ĐÃ CÓ
- **Business Rule**: 
  - Tổng thanh toán <= Phí bảo hiểm hợp đồng
  - Không được thanh toán dư

### 4.2 Mã Giao Dịch (MaGiaoDich)
- **Format**: Auto hoặc từ cổng thanh toán
- **Pattern**: `TXN-YYYYMMDDHHMMSS-XXX`
- **Regex**: `/^TXN-\d{14}-\d{3}$/`
- **Ví dụ**: "TXN-20240115153045-001"

### 4.3 Ngày Thanh Toán (NgayThanhToan)
- **Validation**:
  - Không được tương lai
  - Phải >= Ngày tạo hợp đồng
  - Phải <= Ngày kết thúc hợp đồng

---

## 📊 5. THÔNG TIN THẨM ĐỊNH (Assessment)

### 5.1 Mức Độ Rủi Ro (MucDoRuiRo)
- **Format**: ENUM
- **Values**: 'LOW', 'MEDIUM', 'HIGH'
- **Database**: VARCHAR(20)

### 5.2 Điểm Thẩm Định (DiemThamDinh)
- **Format**: Integer
- **Range**: 0-100
- **Business Rule**:
  - 80-100: LOW risk
  - 50-79: MEDIUM risk
  - 0-49: HIGH risk

---

## 🔐 6. THÔNG TIN NGƯỜI DÙNG (User)

### 6.1 Tên Đăng Nhập (TenDangNhap)
- **Format**: Alphanumeric + underscore
- **Độ dài**: 5-50 ký tự
- **Regex**: `/^[a-zA-Z0-9_]{5,50}$/`
- **Ví dụ hợp lệ**:
  - ✅ "nguyen_van_a"
  - ✅ "admin2024"
- **Ví dụ không hợp lệ**:
  - ❌ "ab" (quá ngắn)
  - ❌ "user@123" (có ký tự đặc biệt)

### 6.2 Mật Khẩu (MatKhau)
- **Format**: Phức tạp, an toàn
- **Độ dài tối thiểu**: 8 ký tự
- **Yêu cầu**:
  - Ít nhất 1 chữ hoa
  - Ít nhất 1 chữ thường
  - Ít nhất 1 số
  - Ít nhất 1 ký tự đặc biệt
- **Regex**: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`
- **Ví dụ hợp lệ**:
  - ✅ "Pass@123"
  - ✅ "MyP@ssw0rd"
- **Ví dụ không hợp lệ**:
  - ❌ "password" (thiếu chữ hoa, số, ký tự đặc biệt)
  - ❌ "Pass123" (thiếu ký tự đặc biệt)

---

## 📁 7. FILE UPLOAD

### 7.1 File Ảnh
- **Types**: JPEG, PNG, GIF
- **Max Size**: 5MB ✅ ĐÃ CÓ
- **Extensions**: .jpg, .jpeg, .png, .gif ✅ ĐÃ CÓ
- **Dimensions**: Tối thiểu 200x200px

### 7.2 File Tài Liệu
- **Types**: PDF, DOC, DOCX ✅ ĐÃ CÓ
- **Max Size**: 10MB
- **Extensions**: .pdf, .doc, .docx ✅ ĐÃ CÓ

---

## 🚨 8. CÁC TRƯỜNG THIẾU VALIDATION

### ⚠️ Cần bổ sung NGAY:

1. **VIN Validation** (Frontend):
   - ❌ THIẾU regex `/^[A-HJ-NPR-Z0-9]{17}$/i`
   - ❌ THIẾU validation loại trừ I, O, Q
   - ✅ Backend đã có uniqueness check

2. **Họ Tên Validation**:
   - ❌ THIẾU regex chỉ cho phép chữ cái tiếng Việt
   - ❌ Hiện tại chỉ check `.trim()` required

3. **Địa Chỉ Validation**:
   - ❌ THIẾU validation độ dài tối thiểu
   - ❌ THIẾU validation ký tự hợp lệ

4. **Số Máy Validation**:
   - ❌ THIẾU regex
   - ❌ Hiện tại chỉ check `.trim()` required

5. **Năm Sản Xuất**:
   - ✅ ĐÃ CÓ validation range
   - ⚠️ Cần cải thiện: không cho nhập chữ

6. **Phí Bảo Hiểm vs Số Tiền Bảo Hiểm**:
   - ❌ THIẾU validation tỷ lệ hợp lý (1-10%)
   - ❌ THIẾU check PhiBaoHiem <= SoTienBaoHiem

7. **Tổng Thanh Toán**:
   - ❌ THIẾU validation tổng thanh toán <= phí hợp đồng
   - ❌ THIẾU check không được thanh toán dư

8. **Biển Số Xe**:
   - ✅ ĐÃ CÓ regex cơ bản
   - ⚠️ CẦN CẢI TIẾN: Validate theo bảng mã tỉnh thành (01-99)

9. **Ngày Tháng Business Rules**:
   - ❌ THIẾU check ngày bắt đầu không quá khứ > 30 ngày
   - ❌ THIẾU check khoảng cách hợp đồng <= 365 ngày
   - ❌ THIẾU check ngày thanh toán không tương lai

10. **Mật Khẩu**:
    - ❌ THIẾU validation độ phức tạp (chữ hoa, thường, số, ký tự đặc biệt)
    - ⚠️ Chỉ hash không đủ, cần validate trước khi hash

---

## 📐 9. KIẾN TRÚC VALIDATION

### 9.1 Frontend Validation (Client-side)
**File**: `frontend/src/utils/validationHelper.js`

**Chức năng**:
- Kiểm tra format ngay khi user nhập (real-time)
- Hiển thị error message ngay lập tức
- Ngăn submit form nếu có lỗi

**Phương pháp**:
- Regex pattern matching
- Range checking
- Required field validation
- Cross-field validation (VD: ngày kết thúc > ngày bắt đầu)

**Ví dụ**:
```javascript
export const validateVehicle = (data) => {
  const errors = {};

  // VIN validation ⚠️ CẦN BỔ SUNG
  if (!data.chassis_number?.trim()) {
    errors.chassis_number = 'Vui lòng nhập số khung (VIN)';
  } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(data.chassis_number)) {
    errors.chassis_number = 'VIN phải có đúng 17 ký tự (không chứa I, O, Q)';
  }

  // Engine number validation ⚠️ CẦN BỔ SUNG
  if (!data.engine_number?.trim()) {
    errors.engine_number = 'Vui lòng nhập số máy';
  } else if (!/^[A-Z0-9]{6,30}$/i.test(data.engine_number)) {
    errors.engine_number = 'Số máy phải có 6-30 ký tự (chữ và số)';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
```

### 9.2 Backend Validation (Server-side)
**File**: `backend/controllers/*Controller.js`

**Chức năng**:
- **Kiểm tra lại** tất cả frontend validation (không tin client)
- Validate business rules phức tạp
- Kiểm tra uniqueness (VD: VIN, CCCD, Email)
- Kiểm tra foreign key constraints
- Validate permissions

**Ví dụ**:
```javascript
// vehicleController.js - create method
if (!soKhung || soKhung.trim().length !== 17) {
  return res.status(400).json({ 
    message: 'Số khung (VIN) phải có đúng 17 ký tự' 
  });
}

// Check VIN uniqueness
const existing = await request.query`
  SELECT SoKhung_VIN FROM Xe WHERE SoKhung_VIN = ${soKhung}
`;
if (existing.recordset.length > 0) {
  return res.status(400).json({ 
    message: 'Số khung (VIN) đã tồn tại trong hệ thống' 
  });
}
```

### 9.3 Database Validation (Data integrity)
**Files**: SQL CREATE TABLE, CONSTRAINTS, TRIGGERS

**Chức năng**:
- UNIQUE constraints (VIN, CCCD, Email, SoHD)
- CHECK constraints (giá trị > 0, range)
- NOT NULL constraints
- FOREIGN KEY constraints
- DEFAULT values
- Triggers (auto-generate codes, audit)

**Ví dụ**:
```sql
ALTER TABLE Xe
ADD CONSTRAINT UQ_Xe_SoKhung UNIQUE (SoKhung_VIN);

ALTER TABLE Xe
ADD CONSTRAINT CHK_Xe_NamSX CHECK (NamSX >= 1900 AND NamSX <= YEAR(GETDATE()) + 1);

ALTER TABLE Xe
ADD CONSTRAINT CHK_Xe_GiaTriXe CHECK (GiaTriXe > 0);
```

---

## 🎨 10. LUỒNG VALIDATION HOÀN CHỈNH

### Khi User Submit Form:

```
1. [Frontend] Material-UI TextField onChange
   ↓
2. [Frontend] validationHelper.validateXXX()
   ├─ Regex check
   ├─ Range check
   ├─ Required check
   └─ Cross-field check
   ↓
3. [Frontend] Hiển thị error nếu có
   ↓
4. [Frontend] Nếu valid → Submit API request
   ↓
5. [Backend] Controller nhận request
   ├─ Kiểm tra lại tất cả validation
   ├─ Kiểm tra uniqueness (database query)
   ├─ Kiểm tra business rules
   └─ Kiểm tra permissions
   ↓
6. [Backend] Nếu invalid → Return 400 với error message
   ↓
7. [Backend] Nếu valid → Execute SQL
   ↓
8. [Database] Check constraints, triggers
   ├─ UNIQUE constraint
   ├─ CHECK constraint
   ├─ FOREIGN KEY constraint
   └─ Trigger validation
   ↓
9. [Database] Success → Return data
   ↓
10. [Backend] Return 200/201 với data
    ↓
11. [Frontend] Hiển thị success message + reload
```

---

## 📝 11. DANH SÁCH CẦN LÀM

### 🔴 Priority 1: CRITICAL (Làm ngay)

1. **Cập nhật `validationHelper.js`**:
   - Thêm VIN regex validation
   - Thêm Số Máy regex validation
   - Thêm Họ Tên regex validation (chữ cái tiếng Việt)
   - Thêm validation tỷ lệ phí/số tiền bảo hiểm

2. **Cập nhật `config.js` REGEX**:
   - Thêm `vin: /^[A-HJ-NPR-Z0-9]{17}$/i`
   - Thêm `engineNumber: /^[A-Z0-9]{6,30}$/i`
   - Thêm `fullName: /^[a-zA-ZÀ-ỹ\s]{2,100}$/`
   - Thêm `address: /^[a-zA-Z0-9À-ỹ\s,.\-/]{10,500}$/`

3. **Cập nhật Backend Controllers**:
   - ✅ vehicleController.js: VIN uniqueness ĐÃ CÓ
   - ⚠️ customerController.js: CCCD uniqueness cần kiểm tra
   - ⚠️ contractController.js: Business rules phí bảo hiểm

### 🟡 Priority 2: IMPORTANT (Làm sớm)

4. **Database Constraints**:
   - Thêm CHECK constraint cho NamSX
   - Thêm CHECK constraint cho GiaTriXe > 0
   - Thêm CHECK constraint cho PhiBaoHiem > 0
   - ✅ UNIQUE constraint SoKhung_VIN ĐÃ CÓ

5. **Business Rules Validation**:
   - Validate hợp đồng: khoảng cách ngày <= 365
   - Validate thanh toán: tổng <= phí hợp đồng
   - Validate ngày bắt đầu: không quá khứ > 30 ngày

### 🟢 Priority 3: NICE TO HAVE (Làm sau)

6. **VIN Checksum Validation**:
   - Implement thuật toán checksum digit VIN
   - Kiểm tra ký tự thứ 9 (check digit)

7. **Biển Số Xe Advanced**:
   - Validate mã tỉnh thành theo bảng chuẩn (01-99)
   - Validate loại xe theo chữ cái (A-Z)

8. **Password Strength Meter**:
   - Hiển thị độ mạnh mật khẩu khi nhập
   - Gợi ý cải thiện mật khẩu

---

## 📖 12. TÀI LIỆU THAM KHẢO

- **VIN Standard**: ISO 3779:2009
- **Email RFC**: RFC 5322
- **Vietnam Phone**: Theo Bộ TT&TT Việt Nam
- **CCCD Format**: Theo Bộ Công an Việt Nam (Nghị định 137/2015/NĐ-CP)
- **License Plate**: Thông tư 15/2014/TT-BCA

---

**📅 Tạo**: 2024-01-15  
**👤 Người tạo**: GitHub Copilot  
**📌 Version**: 1.0.0  
**🔄 Cập nhật cuối**: 2024-01-15
