# 🧪 HƯỚNG DẪN TEST - STEP BY STEP

**Ngày:** 21/11/2025, 1:07 AM  
**Người thực hiện:** Developer  
**Thời gian dự kiến:** 30-45 phút

---

## 📋 CHUẨN BỊ

### 1. Yêu cầu
- ✅ SQL Server đã cài đặt
- ✅ Node.js v14+ đã cài đặt
- ✅ Code đã được sửa lỗi frontend (5 lỗi critical)
- ✅ Database schema đã tạo

### 2. Files quan trọng
```
📁 insurance-management-system/
├── 📄 FRONTEND_BUGS_REPORT.md         ← Danh sách 6 lỗi
├── 📄 FRONTEND_FIX_COMPLETE.md        ← Tóm tắt fixes
├── 📄 INTEGRATION_TEST_PLAN.md        ← 7 test cases
├── 📄 HOW_TO_TEST.md                  ← File này
├── 📁 database/
│   └── 📄 INSERT_TEST_DATA.sql        ← Script insert data
├── 📁 frontend/
│   └── 📁 src/pages/Contracts/
│       └── 📄 ContractList.js         ← ĐÃ FIX
│   └── 📁 src/pages/Assesments/
│       └── 📄 AssessmentDetail.js     ← ĐÃ FIX
└── 📁 backend/
```

---

## 🚀 BƯỚC 1: INSERT TEST DATA VÀO DATABASE

### 1.1. Mở SQL Server Management Studio (SSMS)
```bash
# Hoặc dùng Azure Data Studio
```

### 1.2. Kết nối database
```sql
Server: localhost (hoặc server của bạn)
Database: QL_BaoHiemXe
Authentication: Windows Authentication
```

### 1.3. Chạy script insert data
```sql
-- Mở file: database/INSERT_TEST_DATA.sql
-- Execute (F5)

-- Script sẽ tạo:
--   ✓ 5 Khách hàng
--   ✓ 6 Xe
--   ✓ 9 Hồ sơ thẩm định
--   ✓ 8 Hợp đồng (ACTIVE: 5, DRAFT: 1, PARTIAL_PAID: 1, EXPIRED: 1)
--   ✓ Nhiều giao dịch thanh toán
--   ✓ 1 Quan hệ tái tục
```

### 1.4. Verify data đã insert
```sql
-- Check số lượng
SELECT 
    (SELECT COUNT(*) FROM KhachHang) AS SoKhachHang,
    (SELECT COUNT(*) FROM Xe) AS SoXe,
    (SELECT COUNT(*) FROM HoSoThamDinh) AS SoHoSo,
    (SELECT COUNT(*) FROM HopDong) AS SoHopDong;

-- Check hợp đồng theo trạng thái
SELECT TrangThai, COUNT(*) AS SoLuong
FROM HopDong
GROUP BY TrangThai;

-- Expected:
-- ACTIVE: 5
-- DRAFT: 1
-- EXPIRED: 1
-- PARTIAL_PAID: 1
```

---

## 🚀 BƯỚC 2: START BACKEND

### 2.1. Mở Terminal 1
```bash
cd d:\insurance-management-system\backend
npm install  # Nếu chưa install
npm start
```

### 2.2. Verify backend running
```bash
# Terminal output:
Server running on port 5000
Connected to database: QL_BaoHiemXe

# Test bằng browser:
http://localhost:5000/api/contracts
# Should return JSON với danh sách hợp đồng
```

---

## 🚀 BƯỚC 3: START FRONTEND

### 3.1. Mở Terminal 2 (terminal mới)
```bash
cd d:\insurance-management-system\frontend
npm install  # Nếu chưa install
npm start
```

### 3.2. Browser tự động mở
```bash
# URL: http://localhost:3000
# Trang login sẽ hiện ra
```

---

## 🧪 BƯỚC 4: TEST CASE 1 - FILTER & STATS (Quan trọng nhất)

### Mục đích
Test các lỗi đã sửa: Filter tabs, Stats calculation, Status chip

### Steps

#### Step 1: Login
```
Page: http://localhost:3000/login
Username: admin (hoặc user đã tạo)
Password: ***
```

#### Step 2: Vào trang Hợp đồng
```
Click menu: "Hợp đồng" hoặc navigate: /contracts
```

#### Step 3: CHECK STATS CARDS (Lỗi đã sửa #3)
```
✅ Kiểm tra 3 cards:
1. "Đang hiệu lực" → Phải hiển thị: 5 (KHÔNG phải 0)
2. "Cần duyệt" → Phải hiển thị: 1 (DRAFT)
3. "Sắp hết hạn" → Phải hiển thị: 1 (hợp đồng hết hạn 30/11)

❌ TRƯỚC KHI SỬA: Tất cả hiển thị 0
✅ SAU KHI SỬA: Hiển thị số chính xác
```

#### Step 4: CHECK STATUS CHIP (Lỗi đã sửa #4)
```
✅ Kiểm tra cột "Trạng thái":
- Phải hiển thị TIẾNG VIỆT:
  • "Đang hiệu lực" (màu xanh) - KHÔNG phải "ACTIVE"
  • "Khởi tạo" (màu xám) - KHÔNG phải "DRAFT"
  • "Hết hạn" (màu xám) - KHÔNG phải "EXPIRED"

❌ TRƯỚC: Hiển thị code tiếng Anh "ACTIVE", "DRAFT"
✅ SAU: Hiển thị tiếng Việt "Đang hiệu lực", "Khởi tạo"
```

#### Step 5: CHECK TAB "QUẢN LÝ PHÁT HÀNH" (Lỗi đã sửa #2)
```
Action: Click tab "Quản lý phát hành" (tab thứ 2)

✅ Expected:
- Chỉ hiển thị hợp đồng có status DRAFT (1 hợp đồng)
- KHÔNG hiển thị ACTIVE, EXPIRED

❌ TRƯỚC: Hiển thị tất cả hoặc không có gì
✅ SAU: Chỉ hiển thị DRAFT
```

#### Step 6: CHECK TAB "QUẢN LÝ TÁI TỤC" (Lỗi đã sửa #2)
```
Action: Click tab "Quản lý tái tục" (tab thứ 3)

✅ Expected:
- Hiển thị hợp đồng ACTIVE + EXPIRED (6 hợp đồng)
- KHÔNG hiển thị DRAFT
- Có cột "Còn lại" (số ngày)

❌ TRƯỚC: Không lọc được
✅ SAU: Lọc chính xác
```

### ✅ Acceptance Criteria
- [x] Stats cards hiển thị đúng số (không = 0)
- [x] Status chip hiển thị tiếng Việt
- [x] Tab "Phát hành" chỉ hiển thị DRAFT
- [x] Tab "Tái tục" hiển thị ACTIVE + EXPIRED

---

## 🧪 BƯỚC 5: TEST CASE 2 - TÁI TỤC HỢP ĐỒNG

### Mục đích
Test lỗi đã sửa #1: Field mapping khi tái tục

### Steps

#### Step 1: Vào tab "Quản lý tái tục"
```
Page: /contracts (tab thứ 3)
```

#### Step 2: Chọn 1 hợp đồng ACTIVE
```
Click icon "Tái tục" (icon Autorenew màu xanh)
```

#### Step 3: Xác nhận tái tục
```
Confirm dialog: "Xác nhận tái tục hợp đồng HD-XXXXX?"
Click: OK
```

#### Step 4: CHECK ALERT (Lỗi đã sửa #1)
```
✅ Expected:
Alert hiển thị: "✅ Đã tạo hợp đồng tái tục: HD-20251121-XXXX"

❌ TRƯỚC KHI SỬA:
Alert: "✅ Đã tạo hợp đồng tái tục: undefined"

✅ SAU KHI SỬA:
Alert: "✅ Đã tạo hợp đồng tái tục: HD-20251121-0009" (mã thực)
```

### ✅ Acceptance Criteria
- [x] Alert KHÔNG hiển thị "undefined"
- [x] Alert hiển thị mã HĐ mới chính xác
- [x] Danh sách reload và hiển thị HĐ mới

---

## 🧪 BƯỚC 6: TEST CASE 3 - LẬP HỢP ĐỒNG TỪ HỒ SƠ

### Mục đích
Test lỗi đã sửa #5: Field mapping khi lập hợp đồng

### Steps

#### Step 1: Vào trang Hồ sơ thẩm định
```
Navigate: /hoso
```

#### Step 2: Click vào 1 hồ sơ đã duyệt
```
Status: "Chấp nhận"
Risk Level: "CHẤP NHẬN"
```

#### Step 3: Click "Lập hợp đồng"
```
Button: "Lập hợp đồng" (trong dialog hoặc page)
Click: "Tạo hợp đồng"
```

#### Step 4: CHECK ALERT & NAVIGATION (Lỗi đã sửa #5)
```
✅ Expected:
1. Alert: "✅ Đã tạo hợp đồng: HD-20251121-XXXX"
2. Navigate đến: /contracts/HD-20251121-XXXX
3. Page chi tiết HĐ hiển thị đúng

❌ TRƯỚC KHI SỬA:
1. Alert: "✅ Đã tạo hợp đồng: undefined"
2. Navigate: /contracts/undefined → Lỗi 404

✅ SAU KHI SỬA:
1. Alert: "✅ Đã tạo hợp đồng: HD-20251121-0010"
2. Navigate: /contracts/HD-20251121-0010 → OK
3. Hiển thị chi tiết HĐ
```

### ✅ Acceptance Criteria
- [x] Alert hiển thị đúng mã HĐ (không undefined)
- [x] Navigate đúng URL (không 404)
- [x] Trang chi tiết HĐ load thành công

---

## 🧪 BƯỚC 7: TEST CASE 4 - HỦY HỢP ĐỒNG (BONUS)

### Steps

#### Step 1: Vào tab "Quản lý tái tục"
```
Chọn 1 hợp đồng ACTIVE
```

#### Step 2: Click "Hủy (hoàn phí)"
```
Icon: Cancel (màu đỏ)
Prompt: "Nhập lý do hủy hợp đồng:"
Input: "Khách hàng bán xe"
Click: OK
```

#### Step 3: Verify
```
✅ Expected:
- Alert: "✅ Đã hủy hợp đồng và tính hoàn phí"
- Status chip thành: "Đã hủy" (màu đỏ) - TIẾNG VIỆT
- KHÔNG hiển thị "CANCELLED"
```

---

## 📊 BƯỚC 8: KIỂM TRA KẾT QUẢ TỔNG THỂ

### Checklist
```
✅ TC1: Filter tabs hoạt động
✅ TC1: Stats cards hiển thị chính xác
✅ TC1: Status chip hiển thị tiếng Việt
✅ TC2: Tái tục hiển thị đúng mã HĐ (không undefined)
✅ TC3: Lập HĐ navigate đúng (không 404)
✅ TC4: Hủy HĐ hiển thị status tiếng Việt
```

### Expected Results
| Feature | Before Fix | After Fix | Status |
|---------|------------|-----------|--------|
| Stats cards | 0, 0, 0 | 5, 1, 1 | ✅ |
| Status chip | "ACTIVE" | "Đang hiệu lực" | ✅ |
| Filter tabs | Không hoạt động | Lọc chính xác | ✅ |
| Tái tục alert | "undefined" | "HD-20251121-XXXX" | ✅ |
| Lập HĐ navigate | 404 error | Chi tiết HĐ | ✅ |

---

## 🐛 NẾU GẶP LỖI

### Lỗi 1: Stats vẫn hiển thị 0
```bash
# Nguyên nhân: Database chưa có data
# Fix: Chạy lại INSERT_TEST_DATA.sql

# Hoặc check backend response:
# Chrome DevTools → Network → Filter "contracts" → Check response
```

### Lỗi 2: Status vẫn hiển thị code tiếng Anh
```bash
# Nguyên nhân: Chưa clear cache
# Fix: Hard reload
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Lỗi 3: Filter tabs không hoạt động
```bash
# Check network request:
Chrome DevTools → Network → contracts?trangThai=DRAFT
# Phải thấy trangThai=DRAFT, không phải "Chờ ký"
```

### Lỗi 4: Tái tục vẫn hiển thị undefined
```bash
# Check backend response:
POST /api/contracts/:id/renew
Response: { data: { maHDMoi: "HD-..." } }

# Phải có field "maHDMoi", không phải "MaHD"
```

---

## 📸 SCREENSHOTS GỢI Ý

Chụp screenshots của:
1. Stats cards (hiển thị đúng số)
2. Status chip (tiếng Việt)
3. Tab "Phát hành" (chỉ DRAFT)
4. Alert tái tục (có mã HĐ, không undefined)
5. Trang chi tiết HĐ sau khi lập

---

## ⏱️ TIMELINE DỰ KIẾN

```
Bước 1: Insert data        → 5 phút
Bước 2: Start backend      → 2 phút
Bước 3: Start frontend     → 2 phút
Bước 4: Test Filter/Stats  → 10 phút
Bước 5: Test Tái tục       → 5 phút
Bước 6: Test Lập HĐ        → 5 phút
Bước 7: Test Hủy HĐ        → 5 phút
Bước 8: Verify tổng thể    → 5 phút
---
TOTAL: ~40 - phút
```

---

## 📝 BÁO CÁO TEST

Sau khi test xong, ghi lại kết quả:

```
Test Date: __________
Tester: __________

Test Results:
[ ] PASS - TC1: Filter & Stats
[ ] PASS - TC2: Tái tục
[ ] PASS - TC3: Lập HĐ
[ ] PASS - TC4: Hủy HĐ

Issues Found:
_____________________________________________
_____________________________________________

Screenshots:
[ ] Attached

Notes:
_____________________________________________
_____________________________________________
```

---

## ✅ COMPLETION CHECKLIST

- [ ] Database có đủ test data
- [ ] Backend running OK
- [ ] Frontend running OK
- [ ] Stats cards hiển thị chính xác
- [ ] Status chip tiếng Việt
- [ ] Filter tabs hoạt động
- [ ] Tái tục không hiển thị "undefined"
- [ ] Lập HĐ không bị 404
- [ ] Screenshot đã chụp
- [ ] Báo cáo test đã ghi

---

**Prepared by:** Cline AI Assistant  
**Last updated:** 21/11/2025, 1:07 AM  
**Version:** 1.0

**🎉 Chúc bạn test thành công!**
