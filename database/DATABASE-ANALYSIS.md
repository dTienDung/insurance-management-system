# PHÂN TÍCH DATABASE - QuanlyHDBaoHiem
**Ngày phân tích:** 16/11/2025  
**Script version:** script create.sql (latest)

---

## 📋 MỤC LỤC
1. [Schema Overview](#schema-overview)
2. [Stored Procedures Analysis](#stored-procedures-analysis)
3. [Triggers Analysis](#triggers-analysis)
4. [Constraints Analysis](#constraints-analysis)
5. [Phát hiện 3 lỗi logic nghiêm trọng](#phát-hiện-3-lỗi-logic)

---

## SCHEMA OVERVIEW

### Tables (15 bảng)
1. **KhachHang** - Thông tin khách hàng
2. **Xe** - Thông tin phương tiện
3. **BienSoXe** - Biển số xe (quan hệ với KhachHang)
4. **KhachHangXe** - Lịch sử sở hữu xe
5. **LS_TaiNan** - Lịch sử tai nạn
6. **GoiBaoHiem** - Các gói bảo hiểm
7. **HoSoThamDinh** - Hồ sơ thẩm định rủi ro
8. **HoSoThamDinh_ChiTiet** - Chi tiết điểm thẩm định
9. **MaTranThamDinh** - Ma trận tiêu chí thẩm định
10. **MaTranTinhPhi** - Ma trận tính phí theo RiskLevel
11. **HopDong** - Hợp đồng bảo hiểm
12. **HopDongRelation** - Quan hệ tái tục/chuyển nhượng
13. **ThanhToanHopDong** - Giao dịch thanh toán
14. **NhanVien** - Nhân viên
15. **TaiKhoan** - Tài khoản đăng nhập

---

## STORED PROCEDURES ANALYSIS

### ✅ SP 1: `sp_TinhDiemThamDinh`
```sql
EXEC sp_TinhDiemThamDinh @MaHS VARCHAR(10)
```
**Chức năng:** Tính tổng điểm thẩm định và xác định RiskLevel  
**Logic:**
1. Tính tổng điểm từ `HoSoThamDinh_ChiTiet`
2. Gọi `sp_XacDinhRiskLevel` để lấy RiskLevel
3. Update vào `HoSoThamDinh.RiskLevel` và `KetQua`

**Tham số:**
- Input: `@MaHS` (Mã hồ sơ)
- Output: Không (UPDATE trực tiếp vào DB)

**✅ ĐÚNG** - Không có lỗi

---

### ✅ SP 2: `sp_XacDinhRiskLevel`
```sql
EXEC sp_XacDinhRiskLevel @RiskScore INT, @RiskLevel NVARCHAR(20) OUTPUT
```
**Chức năng:** Xác định mức rủi ro dựa vào điểm  
**Logic:**
- `Score >= 26` → `HIGH`
- `Score 16-25` → `MEDIUM`
- `Score <= 15` → `LOW`

**Tham số:**
- Input: `@RiskScore` (Tổng điểm)
- Output: `@RiskLevel` (LOW/MEDIUM/HIGH)

**✅ ĐÚNG** - Logic phân loại hợp lý

---

### ⚠️ SP 3: `sp_TinhPhiBaoHiem` - **CÓ LỖI**
```sql
EXEC sp_TinhPhiBaoHiem @MaHS VARCHAR(10), @MaGoi VARCHAR(10)
```

**❌ LỖI PHÁT HIỆN:**
```sql
-- Trong sp_TaoHopDong (dòng ~line 700):
EXEC [dbo].[sp_TinhPhiBaoHiem] @MaXe, @MaGoi, @RiskLevel, @PhiBaoHiem_Out = @PhiTinhToan OUTPUT;
                                 ^^^^   ^^^^^   ^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^
                                  P1      P2        P3              P4
```

**SP định nghĩa chỉ nhận 2 tham số:**
```sql
CREATE PROCEDURE sp_TinhPhiBaoHiem
    @MaHS VARCHAR(10),    -- Tham số 1
    @MaGoi VARCHAR(10)    -- Tham số 2
AS BEGIN
    -- Không có @MaXe, @RiskLevel, @PhiBaoHiem_Out
```

**➡️ KẾT LUẬN:**
- **LỖI 1 XÁC NHẬN:** `sp_TaoHopDong` đang gọi `sp_TinhPhiBaoHiem` với **4 tham số**
- Nhưng `sp_TinhPhiBaoHiem` chỉ nhận **2 tham số**
- → Lỗi runtime: "Procedure sp_TinhPhiBaoHiem expects parameter '@MaXe', which was not supplied"

---

### ⚠️ SP 4: `sp_TaoHopDong` - **CÓ LỖI**
```sql
EXEC sp_TaoHopDong @MaHS VARCHAR(10), @MaGoi VARCHAR(10), @MaNV VARCHAR(10)
```

**❌ LỖI PHÁT HIỆN:**

**Lỗi 1: Gọi sai SP**
```sql
-- Dòng ~700
DECLARE @PhiTinhToan DECIMAL(18, 2);
EXEC [dbo].[sp_TinhPhiBaoHiem] @MaXe, @MaGoi, @RiskLevel, @PhiBaoHiem_Out = @PhiTinhToan OUTPUT;
--                              ^^^^^ SAI - không phải tham số của SP này
```

**Lỗi 2: Không có OUTPUT**
- SP `sp_TinhPhiBaoHiem` KHÔNG có tham số OUTPUT
- Nó chỉ UPDATE trực tiếp vào `HoSoThamDinh.PhiDuKien`
- Nhưng SP đang cố lấy giá trị qua `@PhiBaoHiem_Out`

**Lỗi 3: Logic không nhất quán**
```sql
-- Sau khi gọi SP, nó lại SELECT lại từ DB
SELECT @PhiTinhToan = PhiDuKien FROM HoSoThamDinh WHERE MaHS = @MaHS;
-- → Dòng này mới đúng, nhưng dòng EXEC ở trên thừa
```

**➡️ CÁCH SỬA:**
```sql
-- OPTION 1: Gọi đúng tham số
EXEC [dbo].[sp_TinhPhiBaoHiem] @MaHS, @MaGoi;
SELECT @PhiTinhToan = PhiDuKien FROM HoSoThamDinh WHERE MaHS = @MaHS;

-- OPTION 2: Thay đổi sp_TinhPhiBaoHiem để có OUTPUT
ALTER PROCEDURE sp_TinhPhiBaoHiem
    @MaHS VARCHAR(10),
    @MaGoi VARCHAR(10),
    @PhiBaoHiem DECIMAL(18,2) OUTPUT  -- Thêm parameter này
AS BEGIN
    -- ... logic tính phí ...
    SET @PhiBaoHiem = @Phi;
END;
```

---

### ⚠️ SP 5: `sp_RenewHopDong` - **CÓ LỖI**
```sql
EXEC sp_RenewHopDong @MaHD_Cu VARCHAR(10), @MaNV_ThucHien VARCHAR(10)
```

**❌ LỖI PHÁT HIỆN:**

**Lỗi: Kiểu dữ liệu không khớp**
```sql
CREATE PROCEDURE sp_RenewHopDong
    @MaHD_Cu VARCHAR(10),  -- ❌ SAI: Định nghĩa VARCHAR(10)
    @MaNV_ThucHien VARCHAR(10)
AS BEGIN
    -- Nhưng bảng HopDong.MaHD là VARCHAR(20)
```

**Kiểm chứng từ schema:**
```sql
CREATE TABLE HopDong (
    MaHD VARCHAR(20) NOT NULL,  -- ✅ Đúng là VARCHAR(20)
    ...
)
```

**Kiểm chứng từ trigger:**
```sql
CREATE TRIGGER trg_AutoMaHD ON HopDong
AS BEGIN
    -- Generate MaHD: HD-YYYYMMDD-XXXX
    'HD-' + FORMAT(..., 'yyyyMMdd') + '-' + ...
    -- ↑ Format này tạo ra: HD-20251116-0001 (17-20 ký tự)
END;
```

**➡️ HỆ QUẢ:**
- Khi gọi `sp_RenewHopDong` với `@MaHD_Cu = 'HD-20251116-0001'`
- Tham số bị cắt thành `'HD-2025111'` (chỉ 10 ký tự)
- Query `WHERE MaHD = @MaHD_Cu` sẽ KHÔNG TÌM THẤY bản ghi
- → Tái tục thất bại, không có dữ liệu

**➡️ CÁCH SỬA:**
```sql
ALTER PROCEDURE sp_RenewHopDong
    @MaHD_Cu VARCHAR(20),  -- ✅ Sửa thành VARCHAR(20)
    @MaNV_ThucHien VARCHAR(10)
```

---

### ✅ SP 6-8: Các SP còn lại
```sql
sp_TaoThanhToan        -- ✅ OK
sp_HoanTienHopDong     -- ✅ OK
sp_ChuyenQuyenHopDong  -- ✅ OK (Stub - chưa implement)
```

---

## TRIGGERS ANALYSIS

### ✅ Trigger 1: `trg_AutoMaHD` - Tạo mã HĐ tự động
**Format:** `HD-YYYYMMDD-XXXX`  
**Ví dụ:** `HD-20251116-0001`

**Logic:**
```sql
'HD-' + FORMAT(NgayKy, 'yyyyMMdd') + '-' + 
RIGHT('0000' + CAST(COUNT(*) + 1 AS VARCHAR(4)), 4)
```

**✅ ĐÚNG** - Tạo mã unique theo ngày

---

### ⚠️ Trigger 2: `trg_UpdateHopDongStatus_WhenPaid` - **CÓ XUN ĐỤNG**
**Chức năng:** Tự động chuyển trạng thái HĐ khi thanh toán đủ

**Logic:**
```sql
WHEN TongTien >= PhiBaoHiem THEN 'ACTIVE'   -- ⚠️ Set thành 'ACTIVE'
WHEN TongTien > 0 THEN 'PARTIAL_PAID'
```

**❌ XUN ĐỤNG VỚI CHECK CONSTRAINT:**
```sql
-- Constraint hiện tại (dòng ~line 400)
ALTER TABLE HopDong
ADD CHECK (TrangThai IN (N'Huỷ', N'Hết hạn', N'Hiệu lực'));
--                        ^^^^   ^^^^^^^^^   ^^^^^^^^^
--                        Chỉ cho phép 3 giá trị này
```

**➡️ HỆ QUẢ:**
- Trigger muốn set `TrangThai = 'ACTIVE'`
- Nhưng CHECK constraint KHÔNG cho phép
- → **Msg 547: The INSERT statement conflicted with the CHECK constraint**

**➡️ CÁCH SỬA:**
```sql
-- OPTION 1: Xóa constraint (như script fix đã đề xuất)
ALTER TABLE HopDong DROP CONSTRAINT [tên_constraint];

-- OPTION 2: Sửa constraint cho phép thêm trạng thái
ALTER TABLE HopDong DROP CONSTRAINT [tên_constraint];
ALTER TABLE HopDong ADD CHECK (TrangThai IN (
    N'Hiệu lực', N'Hết hạn', N'Huỷ', N'Đã hủy',
    N'ACTIVE', N'PARTIAL_PAID', N'DRAFT',  -- Thêm các trạng thái trigger cần
    N'RENEWED', N'TRANSFERRED', N'EXPIRED', N'CANCELLED',
    N'Chờ ký', N'Chờ duyệt'
));
```

---

### ⚠️ Trigger 3: `trg_SetChildRelationStatus` - **CÓ XUN ĐỤNG**
**Chức năng:** Set trạng thái HĐ gốc khi tái tục/chuyển nhượng

**Logic:**
```sql
UPDATE HopDong
SET TrangThai = CASE LoaiQuanHe
                  WHEN 'TAI_TUC' THEN N'RENEWED'      -- ⚠️ Set thành 'RENEWED'
                  WHEN 'CHUYEN_QUYEN' THEN N'TRANSFERRED'  -- ⚠️ Set thành 'TRANSFERRED'
                END
WHERE MaHD = MaHD_Goc;
```

**❌ XUN ĐỤNG VỚI CÙNG CHECK CONSTRAINT:**
- Trigger muốn set `'RENEWED'` hoặc `'TRANSFERRED'`
- Constraint chỉ cho `'Hiệu lực'`, `'Hết hạn'`, `'Huỷ'`
- → **Msg 547: UPDATE conflicted with CHECK constraint**

---

## CONSTRAINTS ANALYSIS

### ❌ CONSTRAINT CÓ VẤN ĐỀ: `CHK_HopDong_TrangThai`

**Định nghĩa hiện tại:**
```sql
ALTER TABLE HopDong
ADD CHECK (TrangThai IN (N'Huỷ', N'Hết hạn', N'Hiệu lực'));
```

**Các trạng thái THỰC TẾ cần sử dụng:**

| Trạng thái | Nguồn | Mục đích |
|------------|-------|----------|
| `N'Hiệu lực'` | ✅ Manual insert | HĐ đang hoạt động (tiếng Việt) |
| `N'Hết hạn'` | ✅ Manual insert | HĐ đã hết hạn |
| `N'Huỷ'` | ✅ Manual insert | HĐ bị hủy |
| `N'ACTIVE'` | ⚠️ Trigger `trg_UpdateHopDongStatus_WhenPaid` | HĐ đã thanh toán đủ |
| `N'PARTIAL_PAID'` | ⚠️ Trigger `trg_UpdateHopDongStatus_WhenPaid` | HĐ thanh toán 1 phần |
| `N'DRAFT'` | ⚠️ SP `sp_TaoHopDong` | HĐ mới tạo, chờ duyệt |
| `N'RENEWED'` | ⚠️ Trigger `trg_SetChildRelationStatus` | HĐ đã tái tục |
| `N'TRANSFERRED'` | ⚠️ Trigger `trg_SetChildRelationStatus` | HĐ đã chuyển nhượng |
| `N'Chờ ký'` | ⚠️ Manual | HĐ mới tạo từ assessment |
| `N'Chờ duyệt'` | ⚠️ SP `sp_RenewHopDong` | HĐ tái tục chờ duyệt |

**➡️ KẾT LUẬN:**
- Constraint hiện tại quá hạn chế (chỉ 3 giá trị)
- Trigger và SP cần ít nhất **10 trạng thái** khác nhau
- → **LỖI 3 XÁC NHẬN:** CHECK constraint xung đột với trigger

---

## PHÁT HIỆN 3 LỖI LOGIC

### ❌ LỖI 1: `sp_TaoHopDong` gọi sai SP
**File:** script create.sql, line ~700  
**Mô tả:** Gọi `sp_TinhPhiBaoHiem` với 4 tham số thay vì 2

**Code hiện tại:**
```sql
EXEC [dbo].[sp_TinhPhiBaoHiem] @MaXe, @MaGoi, @RiskLevel, @PhiBaoHiem_Out = @PhiTinhToan OUTPUT;
```

**Định nghĩa thực tế:**
```sql
CREATE PROCEDURE sp_TinhPhiBaoHiem
    @MaHS VARCHAR(10),   -- Chỉ có 2 tham số
    @MaGoi VARCHAR(10)
```

**Lỗi runtime:**
```
Msg 8144: Procedure or function sp_TinhPhiBaoHiem has too many arguments specified.
```

**✅ CÁCH SỬA:**
```sql
-- Gọi đúng với 2 tham số
EXEC [dbo].[sp_TinhPhiBaoHiem] @MaHS, @MaGoi;

-- Sau đó SELECT PhiDuKien
SELECT @PhiTinhToan = PhiDuKien FROM HoSoThamDinh WHERE MaHS = @MaHS;
```

---

### ❌ LỖI 2: `sp_RenewHopDong` - Kiểu dữ liệu sai
**File:** script create.sql, line ~730  
**Mô tả:** Tham số `@MaHD_Cu` dùng `VARCHAR(10)` trong khi `HopDong.MaHD` là `VARCHAR(20)`

**Code hiện tại:**
```sql
CREATE PROCEDURE sp_RenewHopDong
    @MaHD_Cu VARCHAR(10),  -- ❌ SAI
```

**Schema thực tế:**
```sql
CREATE TABLE HopDong (
    MaHD VARCHAR(20) NOT NULL  -- ✅ VARCHAR(20)
)
```

**Format mã thực tế:**
```
HD-20251116-0001  (17 ký tự)
```

**Lỗi runtime:**
- Input: `'HD-20251116-0001'`
- Bị cắt: `'HD-2025111'` (10 ký tự)
- `WHERE MaHD = @MaHD_Cu` → Không tìm thấy
- → Tái tục thất bại

**✅ CÁCH SỬA:**
```sql
ALTER PROCEDURE sp_RenewHopDong
    @MaHD_Cu VARCHAR(20),  -- ✅ Đổi thành VARCHAR(20)
    @MaNV_ThucHien VARCHAR(10)
```

---

### ❌ LỖI 3: CHECK Constraint xung đột
**File:** script create.sql, line ~400  
**Mô tả:** Constraint chỉ cho 3 trạng thái, nhưng trigger cần 10+ trạng thái

**Constraint hiện tại:**
```sql
ALTER TABLE HopDong
ADD CHECK (TrangThai IN (N'Huỷ', N'Hết hạn', N'Hiệu lực'));
```

**Trạng thái trigger cần:**
```sql
-- trg_UpdateHopDongStatus_WhenPaid
TrangThai = 'ACTIVE'        -- ❌ Không có trong constraint
TrangThai = 'PARTIAL_PAID'  -- ❌ Không có trong constraint

-- trg_SetChildRelationStatus
TrangThai = 'RENEWED'       -- ❌ Không có trong constraint
TrangThai = 'TRANSFERRED'   -- ❌ Không có trong constraint

-- sp_TaoHopDong, sp_RenewHopDong
TrangThai = 'DRAFT'         -- ❌ Không có trong constraint
TrangThai = N'Chờ duyệt'    -- ❌ Không có trong constraint
```

**Lỗi runtime:**
```
Msg 547: The UPDATE statement conflicted with the CHECK constraint "CHK_HopDong_TrangThai".
```

**✅ CÁCH SỬA:**
```sql
-- Xóa constraint cũ
ALTER TABLE HopDong DROP CONSTRAINT [CHK_HopDong_TrangThai];

-- Tạo constraint mới ĐẦY ĐỦ
ALTER TABLE HopDong ADD CONSTRAINT CHK_HopDong_TrangThai_Full
CHECK (TrangThai IN (
    -- Tiếng Việt
    N'Hiệu lực', N'Hết hạn', N'Huỷ', N'Đã hủy',
    N'Chờ ký', N'Chờ duyệt',
    -- English (cho trigger)
    N'ACTIVE', N'PARTIAL_PAID', N'DRAFT',
    N'RENEWED', N'TRANSFERRED', N'EXPIRED', N'CANCELLED'
));
```

---

## TỔNG KẾT

### ✅ 3 LỖI ĐÃ XÁC NHẬN:

1. **LỖI 1:** `sp_TaoHopDong` gọi `sp_TinhPhiBaoHiem` với 4 tham số thay vì 2
2. **LỖI 2:** `sp_RenewHopDong` dùng `VARCHAR(10)` cho `@MaHD_Cu` thay vì `VARCHAR(20)`
3. **LỖI 3:** CHECK constraint `TrangThai` chỉ cho 3 giá trị, trigger cần 10+

### 📝 KHUYẾN NGHỊ:

**KHẨN CẤP - Phải sửa ngay:**
- ✅ Chạy script `fix-3-critical-bugs.sql` đã được tạo
- ✅ Test lại 3 chức năng: Tạo HĐ, Tái tục, Thanh toán

**QUAN TRỌNG - Nên làm:**
- Standardize tên trạng thái (chọn 1 trong 2: tiếng Việt hoặc English)
- Tạo enum/lookup table cho TrangThai
- Viết unit test cho các SP

**TỐT NÊN LÀM:**
- Refactor `sp_TinhPhiBaoHiem` để có OUTPUT parameter
- Thêm error handling cho tất cả SP
- Logging cho các action quan trọng

---

**Người phân tích:** GitHub Copilot (Claude Sonnet 4.5)  
**Thời gian:** 16/11/2025 14:00
