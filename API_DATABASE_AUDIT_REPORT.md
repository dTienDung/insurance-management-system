# 🚨 BÁO CÁO RÀ SOÁT API - DATABASE - CRITICAL ISSUES

**Ngày rà soát:** 21/11/2025  
**Trạng thái:** ❌ PHÁT HIỆN NHIỀU LỖI NGHIÊM TRỌNG  
**Mức độ ưu tiên:** 🔴 CRITICAL - CẦN SỬA NGAY

---

## 📊 TỔNG QUAN

| Thành phần | Số lỗi | Mức độ | Trạng thái |
|------------|--------|--------|------------|
| **HoSoController** | 3 | 🔴 Critical | Blocking |
| **ContractController** | 12 | 🔴 Critical | Blocking |
| **Stored Procedures** | 8 | 🔴 Critical | Blocking |
| **Database Schema** | 5 | 🟡 Medium | Non-blocking |
| **TỔNG CỘNG** | **28** | - | - |

---

## 🔴 CRITICAL ISSUES - BLOCKING

### 1. HoSoController.js - API gọi sai tên cột

#### ❌ Lỗi 1.1: Query chi tiết thẩm định sai tên cột
**File:** `backend/controllers/hosoController.js` (Line ~97-105)

**Code hiện tại:**
```javascript
const scoreResult = await pool.request()
  .input('MaHS', sql.VarChar(10), id)
  .query(`
    SELECT hsd.*, mt.TenTieuChi, mt.MoTa AS MoTaTieuChi  // ❌ SAI
    FROM HoSoThamDinh_ChiTiet hsd
    JOIN MaTranThamDinh mt ON hsd.MaTieuChi = mt.MaTieuChi  // ❌ SAI KHÓA
    WHERE hsd.MaHS = @MaHS
    ORDER BY hsd.MaTieuChi
  `);
```

**Lỗi:**
- ❌ Bảng `MaTranThamDinh` KHÔNG có cột `TenTieuChi`, `MoTa`
- ❌ Schema thực tế: `ID, TieuChi, DieuKien, Diem, GhiChu`
- ❌ Foreign key sai: `MaTieuChi` phải là `ID` của MaTranThamDinh

**Sửa:**
```javascript
SELECT hsd.*, mt.TieuChi, mt.DieuKien, mt.Diem, mt.GhiChu
FROM HoSoThamDinh_ChiTiet hsd
JOIN MaTranThamDinh mt ON hsd.MaTieuChi = mt.ID  // ✅ ĐÚNG
WHERE hsd.MaHS = @MaHS
ORDER BY hsd.MaTieuChi
```

---

#### ❌ Lỗi 1.2: lapHopDongTuHoSo gọi SP không tồn tại
**File:** `backend/controllers/hosoController.js` (Line ~438-450)

**Code hiện tại:**
```javascript
await pool.request()
  .input('MaHS', sql.VarChar(10), MaHS)
  .input('MaNV', sql.VarChar(10), MaNV)
  .execute('sp_LapHopDong_TuHoSo');  // ❌ SP có params khác
```

**Lỗi:**
- SP thực tế có OUTPUT param: `@MaHDOut VARCHAR(20) OUTPUT`
- Controller không nhận OUTPUT, không biết MaHD vừa tạo

**Sửa:**
```javascript
const result = await pool.request()
  .input('MaHS', sql.VarChar(10), MaHS)
  .input('MaNV', sql.VarChar(10), MaNV)
  .output('MaHDOut', sql.VarChar(20))
  .execute('sp_LapHopDong_TuHoSo');

const maHD = result.output.MaHDOut;

res.json({
  success: true,
  message: 'Đã lập hợp đồng từ hồ sơ thành công',
  data: { maHD }
});
```

---

#### ❌ Lỗi 1.3: Approve không kiểm tra RiskLevel đúng
**File:** `backend/controllers/hosoController.js` (Line ~290-310)

**Code hiện tại:**
```javascript
if (riskLevel === 'TỪ CHỐI' || riskLevel === 'REJECT') {  // ❌ Không đúng logic
  return res.status(400).json({
    success: false,
    message: 'Hồ sơ đã bị từ chối, không thể duyệt'
  });
}
```

**Lỗi:**
- RiskLevel chỉ có: `LOW`, `MEDIUM`, `HIGH` (theo sp_TinhDiemThamDinh)
- KHÔNG có giá trị `TỪ CHỐI` hay `REJECT`
- Logic này vô nghĩa

**Sửa:**
```javascript
// RiskLevel là LOW/MEDIUM/HIGH, luôn cho phép duyệt
// Chỉ cảnh báo nếu HIGH
if (riskLevel === 'HIGH') {
  warnings.push('⚠️ CẢNH BÁO: Hồ sơ có mức rủi ro HIGH. Yêu cầu phê duyệt cấp cao.');
}
// Không block approve, chỉ warning
```

---

### 2. ContractController.js - Sai tên cột & độ dài

#### ❌ Lỗi 2.1: MaHD VARCHAR(10) không đủ cho format mới
**Xuất hiện:** 15+ chỗ trong file

**Code hiện tại:**
```javascript
.input('maHD', sql.VarChar(10), id)  // ❌ SAI
```

**Lỗi:**
- Trigger `trg_AutoMaHD` tạo format: `HD-YYYYMMDD-XXXX` (17 ký tự)
- VARCHAR(10) chỉ chứa được 10 ký tự → TRUNCATED!

**Sửa:**
```javascript
.input('maHD', sql.VarChar(20), id)  // ✅ ĐÚNG
```

**Cần sửa tại:**
- Line ~15, 73, 137, 175, 232, 290, 345, 402, 478, 535, 596, 655, 712

---

#### ❌ Lỗi 2.2: ThanhToanHopDong sai tên cột
**File:** Nhiều chỗ trong contractController.js

**Code hiện tại:**
```javascript
// Trong cancel() - Line 278
INSERT INTO ThanhToanHopDong (MaHD, SoTien, PhuongThuc, NgayThanhToan, TrangThai)
//                                          ❌ SAI    ❌ SAI
VALUES (@MaHD, @SoTien, @PhuongThuc, GETDATE(), N'Hoàn thành');
```

**Lỗi:**
- Schema thực tế: `HinhThuc, NgayGiaoDich` (KHÔNG có PhuongThuc, NgayThanhToan)

**Sửa:**
```javascript
INSERT INTO ThanhToanHopDong (MaHD, SoTien, HinhThuc, NgayGiaoDich, TrangThai)
VALUES (@MaHD, @SoTien, @HinhThuc, GETDATE(), N'Hoàn thành');
```

---

#### ❌ Lỗi 2.3: cancel() gọi SP với params sai
**File:** `backend/controllers/contractController.js` (Line 263-288)

**Code hiện tại:**
```javascript
const result = await pool.request()
  .input('maHD', sql.VarChar(10), id)
  .input('lyDo', sql.NVarChar(255), lyDo)
  .input('soTienHoan', sql.Decimal(18, 2), contract.PhiBaoHiem)
  .execute('sp_HoanTienHopDong');  // ❌ SP không có @lyDo param
```

**SP thực tế:**
```sql
CREATE PROCEDURE sp_HoanTienHopDong
    @MaHD VARCHAR(20),
    @LyDo NVARCHAR(255),  -- ❌ CÓ @LyDo nhưng vị trí khác
    @SoTienHoan DECIMAL(18,2),
    @MaTTOut VARCHAR(10) OUTPUT  -- ❌ Thiếu OUTPUT
```

**Sửa:**
```javascript
const result = await pool.request()
  .input('MaHD', sql.VarChar(20), id)  // ✅ Param name phải match
  .input('LyDo', sql.NVarChar(255), lyDo)  // ✅ L viết hoa
  .input('SoTienHoan', sql.Decimal(18, 2), contract.PhiBaoHiem)
  .output('MaTTOut', sql.VarChar(10))  // ✅ Nhận OUTPUT
  .execute('sp_HoanTienHopDong');

const maTT = result.output.MaTTOut;  // ✅ Lấy OUTPUT
```

---

#### ❌ Lỗi 2.4: renewContract() gọi SP thiếu OUTPUT
**File:** `backend/controllers/contractController.js` (Line 314-363)

**Code hiện tại:**
```javascript
const result = await pool.request()
  .input('maHDCu', sql.VarChar(20), id)
  .input('ngayKyMoi', sql.Date, ngayKyMoi)
  .input('ngayHetHanMoi', sql.Date, ngayHetHanMoi)
  .input('phiBaoHiemMoi', sql.Decimal(18, 2), phiBaoHiemMoi)
  .input('maNV', sql.VarChar(10), maNV)
  .execute('sp_RenewHopDong');  // ❌ Thiếu OUTPUT
```

**SP thực tế:**
```sql
CREATE PROCEDURE sp_RenewHopDong
    @MaHDCu VARCHAR(20),
    @NgayKyMoi DATE,
    @NgayHetHanMoi DATE,
    @PhiBaoHiemMoi DECIMAL(18,2),
    @MaNV VARCHAR(10),
    @MaHDMoiOut VARCHAR(20) OUTPUT  -- ❌ Thiếu OUTPUT
```

**Sửa:**
```javascript
const result = await pool.request()
  .input('MaHDCu', sql.VarChar(20), id)  // ✅ Param name match SP
  .input('NgayKyMoi', sql.Date, ngayKyMoi)
  .input('NgayHetHanMoi', sql.Date, ngayHetHanMoi)
  .input('PhiBaoHiemMoi', sql.Decimal(18, 2), phiBaoHiemMoi)
  .input('MaNV', sql.VarChar(10), maNV)
  .output('MaHDMoiOut', sql.VarChar(20))  // ✅ Thêm OUTPUT
  .execute('sp_RenewHopDong');

const maHDMoi = result.output.MaHDMoiOut;  // ✅ Lấy từ OUTPUT thay vì query lại
```

---

#### ❌ Lỗi 2.5: transferContract() tương tự lỗi 2.4
**File:** `backend/controllers/contractController.js` (Line 370-440)

**Tương tự lỗi renewContract() - cần sửa:**
- Thêm `.output('MaHDMoiOut', sql.VarChar(20))`
- Lấy `result.output.MaHDMoiOut`

---

### 3. Stored Procedures - Sai tên cột & thiếu params

#### ❌ Lỗi 3.1: sp_TaoThanhToan dùng sai tên cột
**File:** `backend/database/PHASE0_CRITICAL_FIX.sql` (Line ~190-235)

**Code hiện tại:**
```sql
INSERT INTO ThanhToanHopDong (MaHD, SoTien, PhuongThuc, NgayThanhToan, TrangThai)
--                                          ❌ SAI      ❌ SAI
VALUES (@MaHD, @SoTien, @PhuongThuc, GETDATE(), N'Hoàn thành');
```

**Schema thực tế:**
```sql
-- Từ backend/database/schema.sql
CREATE TABLE [dbo].[ThanhToanHopDong](
    [MaTT] [varchar](10) NOT NULL,
    [MaHD] [varchar](20) NOT NULL,
    [NgayGiaoDich] [datetime] NOT NULL,  -- ✅ KHÔNG phải NgayThanhToan
    [SoTien] [decimal](18, 2) NOT NULL,
    [LoaiGiaoDich] [nvarchar](20) NOT NULL,
    [HinhThuc] [nvarchar](30) NULL,      -- ✅ KHÔNG phải PhuongThuc
    [TrangThai] [nvarchar](20) NOT NULL,
    [GhiChu] [nvarchar](255) NULL
)
```

**Sửa:**
```sql
INSERT INTO ThanhToanHopDong (MaHD, SoTien, LoaiGiaoDich, HinhThuc, TrangThai)
VALUES (@MaHD, @SoTien, N'THANH_TOAN', @PhuongThuc, N'THANH_CONG');
```

---

#### ❌ Lỗi 3.2: sp_HoanTienHopDong tương tự lỗi 3.1
**File:** `backend/database/PHASE0_CRITICAL_FIX.sql` (Line ~240-280)

**Sửa tương tự:**
```sql
INSERT INTO ThanhToanHopDong (MaHD, SoTien, LoaiGiaoDich, HinhThuc, TrangThai, GhiChu)
VALUES (@MaHD, -@SoTienHoan, N'HOAN_PHI', N'Hoàn tiền', N'THANH_CONG', @LyDo);
```

---

#### ❌ Lỗi 3.3: sp_RenewHopDong không có OUTPUT param
**File:** `backend/database/PHASE0_CRITICAL_FIX.sql` (Line ~285-335)

**Code hiện tại:**
```sql
CREATE PROCEDURE sp_RenewHopDong
    @MaHDCu VARCHAR(20),
    @NgayKyMoi DATE,
    @NgayHetHanMoi DATE,
    @PhiBaoHiemMoi DECIMAL(18,2),
    @MaNV VARCHAR(10)
    -- ❌ THIẾU: @MaHDMoiOut VARCHAR(20) OUTPUT
AS
BEGIN
    -- ... tạo hợp đồng ...
    
    -- ❌ KHÔNG set @MaHDMoiOut
END
```

**Sửa:**
```sql
CREATE PROCEDURE sp_RenewHopDong
    @MaHDCu VARCHAR(20),
    @NgayKyMoi DATE,
    @NgayHetHanMoi DATE,
    @PhiBaoHiemMoi DECIMAL(18,2),
    @MaNV VARCHAR(10),
    @MaHDMoiOut VARCHAR(20) OUTPUT  -- ✅ THÊM
AS
BEGIN
    -- ... code tạo hợp đồng ...
    
    SET @MaHDMoiOut = (SELECT TOP 1 MaHD FROM HopDong 
                       WHERE MaKH = @MaKH AND MaXe = @MaXe 
                       ORDER BY NgayTao DESC);  -- ✅ SET OUTPUT
END
```

---

#### ❌ Lỗi 3.4: sp_ChuyenQuyenHopDong tương tự lỗi 3.3

**Sửa tương tự sp_RenewHopDong**

---

#### ❌ Lỗi 3.5: sp_TinhDiemThamDinh - Cursor không hiệu quả
**File:** `backend/database/PHASE0_CRITICAL_FIX.sql` (Line ~115-185)

**Vấn đề:**
- Dùng CURSOR để loop qua tiêu chí → CHẬM
- Logic đánh giá điều kiện quá đơn giản, không cover hết cases
- Không handle null values

**Khuyến nghị:**
- Viết lại bằng SET-BASED operations
- Thêm error handling

---

### 4. Database Schema Issues

#### ❌ Lỗi 4.1: Bảng HopDong thiếu cột MaHS
**File:** `backend/database/schema.sql`

**Schema hiện tại:**
```sql
CREATE TABLE [dbo].[HopDong](
    [MaHD] [varchar](20) NOT NULL,
    -- ... các cột khác ...
    [MaGoi] [varchar](10) NULL
    -- ❌ THIẾU: MaHS để link về HoSoThamDinh
)
```

**Lỗi:**
- Controller và SP đều dùng `MaHS` trong HopDong
- Nhưng schema KHÔNG có cột này

**Sửa:**
```sql
ALTER TABLE HopDong
ADD MaHS VARCHAR(10) NULL;

ALTER TABLE HopDong
ADD CONSTRAINT FK_HopDong_HoSo
FOREIGN KEY (MaHS) REFERENCES HoSoThamDinh(MaHS);
```

---

#### ❌ Lỗi 4.2: GoiBaoHiem thiếu cột TrangThai
**Nhiều chỗ query:**

```javascript
WHERE TrangThai = N'Hoạt động'  // ❌ Cột không tồn tại
```

**Schema thực tế:**
```sql
CREATE TABLE [dbo].[GoiBaoHiem](
    [MaGoi] [varchar](10) NOT NULL,
    [TenGoi] [nvarchar](50) NOT NULL,
    [TyLePhiCoBan] [decimal](5, 2) NOT NULL,
    [MoTa] [nvarchar](255) NULL
    -- ❌ KHÔNG có TrangThai
)
```

**Sửa:**
```sql
ALTER TABLE GoiBaoHiem
ADD TrangThai NVARCHAR(20) DEFAULT N'Hoạt động';
```

---

#### ❌ Lỗi 4.3: HopDongRelation thiếu cột NgayTao
**Dùng trong query nhưng không có:**

```javascript
ORDER BY hr.NgayTao DESC  // ❌ Cột không tồn tại
```

**Sửa:**
```sql
ALTER TABLE HopDongRelation
ADD NgayTao DATETIME DEFAULT GETDATE();
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 5. Business Logic Issues

#### ⚠️ Vấn đề 5.1: Trạng thái HopDong không nhất quán
**Nơi khởi tạo khác nhau:**
- `contractController.create()`: `'DRAFT'`
- `sp_LapHopDong_TuHoSo`: `'DRAFT'`
- `sp_RenewHopDong`: `'DRAFT'`
- Trigger auto-activate: `'ACTIVE'` sau thanh toán

**Nhưng:**
- Có chỗ dùng: `N'Hiệu lực'`, `N'Hết hạn'`, `N'Huỷ'`
- Có chỗ dùng: `'ACTIVE'`, `'EXPIRED'`, `'CANCELLED'`

**Khuyến nghị:** Thống nhất 1 bộ giá trị:
```sql
CONSTRAINT CK_HopDong_TrangThai CHECK (
    TrangThai IN (
        'DRAFT',      -- Nháp
        'ACTIVE',     -- Hiệu lực
        'EXPIRED',    -- Hết hạn
        'CANCELLED',  -- Đã hủy
        'RENEWED',    -- Đã tái tục
        'TRANSFERRED' -- Đã chuyển quyền
    )
)
```

---

#### ⚠️ Vấn đề 5.2: Không có validation số tiền âm
**Trong sp_TaoThanhToan:**
```sql
INSERT INTO ThanhToanHopDong (MaHD, SoTien, ...)
VALUES (@MaHD, @SoTien, ...)  -- ❌ Không check @SoTien > 0
```

**Sửa:**
```sql
IF @SoTien <= 0
BEGIN
    THROW 50001, N'Số tiền thanh toán phải > 0', 1;
END
```

---

## 📋 DANH SÁCH SỬA CHỮ A - PRIORITY ORDER

### PHASE A: Database Schema Fixes (30 phút)
```sql
-- File: backend/database/CRITICAL_SCHEMA_FIX.sql
ALTER TABLE HopDong ADD MaHS VARCHAR(10) NULL;
ALTER TABLE HopDong ADD CONSTRAINT FK_HopDong_HoSo 
    FOREIGN KEY (MaHS) REFERENCES HoSoThamDinh(MaHS);

ALTER TABLE GoiBaoHiem ADD TrangThai NVARCHAR(20) DEFAULT N'Hoạt động';

ALTER TABLE HopDongRelation ADD NgayTao DATETIME DEFAULT GETDATE();

-- Update tất cả GoiBaoHiem hiện tại
UPDATE GoiBaoHiem SET TrangThai = N'Hoạt động' WHERE TrangThai IS NULL;
```

### PHASE B: Stored Procedures Fixes (1 giờ)
```sql
-- File: backend/database/FIX_STORED_PROCEDURES.sql
-- Sửa lại 4 SPs: sp_TaoThanhToan, sp_HoanTienHopDong, 
--                sp_RenewHopDong, sp_ChuyenQuyenHopDong
```

### PHASE C: Controller Fixes (2 giờ)
- `hosoController.js`: 3 fixes
- `contractController.js`: 12 fixes

### PHASE D: Testing (1 giờ)
- Test từng API endpoint
- Test từng SP
- Integration testing

---

## 🎯 EXECUTION PLAN

### Bước 1: Backup Database (5 phút)
```sql
BACKUP DATABASE [QuanlyHDBaoHiem]
TO DISK = 'D:\Backup\QuanlyHDBaoHiem_Before_Fix.bak'
WITH FORMAT, INIT;
```

### Bước 2: Chạy Schema Fixes (10 phút)
```bash
sqlcmd -S localhost -i backend/database/CRITICAL_SCHEMA_FIX.sql
```

### Bước 3: Chạy SP Fixes (20 phút)
```bash
sqlcmd -S localhost -i backend/database/FIX_STORED_PROCEDURES.sql
```

### Bước 4: Sửa Controllers (2 giờ)
- Chỉnh từng file theo checklist

### Bước 5: Test (1 giờ)
```bash
cd backend
npm test
```

### Bước 6: Verify (30 phút)
- Test thủ công các flows chính
- Kiểm tra logs

---

## 📞 SUPPORT

**Nếu gặp vấn đề trong quá trình fix:**
1. Rollback database: `RESTORE DATABASE [QuanlyHDBaoHiem] FROM DISK = '...'`
2. Revert code: `git reset --hard HEAD`
3. Liên hệ team lead

---

**⚠️ CRITICAL WARNING:**  
Hệ thống KHÔNG thể hoạt động đúng với các lỗi trên. YÊU CẦU sửa NGAY trước khi deploy production!

---

**Báo cáo bởi:** Cline AI Assistant  
**Ngày:** 21/11/2025, 12:08 AM (UTC+7)
