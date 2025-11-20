# 🧪 INTEGRATION TEST PLAN - TEST THÔNG LUỒNG

**Ngày:** 21/11/2025, 1:02 AM  
**Mục đích:** Test toàn bộ luồng nghiệp vụ sau khi sửa lỗi frontend  
**Scope:** Test integration giữa Frontend ↔ Backend ↔ Database

---

## 📋 DANH SÁCH LUỒNG CẦN TEST

### 🔥 Priority 1 - CRITICAL FLOWS
1. ✅ Luồng Thẩm định → Lập Hợp đồng
2. ✅ Luồng Tái tục Hợp đồng
3. ✅ Luồng Hủy Hợp đồng
4. ✅ Luồng Thanh toán

### 🟡 Priority 2 - IMPORTANT FLOWS
5. ✅ Luồng Chuyển nhượng Hợp đồng
6. ✅ Luồng Xem Báo cáo
7. ✅ Luồng Quản lý Khách hàng + Xe

---

## 🎯 TEST CASE 1: LUỒNG THẨM ĐỊNH → LẬP HỢP ĐỒNG

### Mục tiêu
Kiểm tra luồng từ tạo hồ sơ thẩm định → Thẩm định tự động → Duyệt → Lập hợp đồng

### Steps

#### Step 1: Tạo Khách hàng mới
```bash
Page: /customers
Action: Click "Thêm khách hàng"

Input:
- Họ tên: "Nguyễn Văn A"
- CCCD: "001234567890"
- Ngày sinh: "01/01/1990"
- Điện thoại: "0912345678"
- Email: "nguyenvana@email.com"
- Địa chỉ: "123 Đường ABC, TP.HCM"

Expected:
✅ Tạo thành công → Alert "✅ Đã thêm khách hàng"
✅ Tự động tạo mã KH (VD: KH-20251121-0001)
✅ Navigate về /customers
```

#### Step 2: Tạo Xe
```bash
Page: /vehicles
Action: Click "Thêm xe"

Input:
- Biển số: "51A-12345"
- Loại xe: "Ô tô con"
- Hãng xe: "Toyota"
- Đời xe: "2020"
- Số khung: "VIN123456789012345"
- Số máy: "ENG12345"

Expected:
✅ Tạo thành công → Alert "✅ Đã thêm xe"
✅ Tự động tạo mã xe (VD: X-20251121-0001)
```

#### Step 3: Tạo Hồ sơ Thẩm định
```bash
Page: /hoso
Action: Click "Tạo hồ sơ thẩm định"

Input:
- Khách hàng: "KH-20251121-0001 - Nguyễn Văn A"
- Xe: "51A-12345"
- Gói bảo hiểm: Chọn từ dropdown

Expected:
✅ Hệ thống tự động thẩm định
✅ Hiển thị kết quả:
   - Risk Score: 0-10
   - Risk Level: CHẤP NHẬN / XEM XÉT / TỪ CHỐI
   - Chi tiết điểm theo từng tiêu chí
✅ Alert "✅ Đã tạo hồ sơ thẩm định"
✅ Tự động tạo mã HS (VD: HS-20251121-0001)
```

#### Step 4: Duyệt Hồ sơ
```bash
Page: /hoso/:id (Chi tiết hồ sơ)
Action: Click "Duyệt"

Expected:
✅ Alert "✅ Đã duyệt hồ sơ thành công"
✅ Hiển thị dialog "Lập hợp đồng bảo hiểm"
✅ Status hồ sơ → "Chấp nhận"
```

#### Step 5: Lập Hợp đồng
```bash
Dialog: "Lập hợp đồng bảo hiểm"
Action: Click "Tạo hợp đồng"

Expected:
✅ Alert hiển thị: "✅ Đã tạo hợp đồng: HD-20251121-0001"
   [KHÔNG hiển thị "undefined"]
✅ Navigate đến: /contracts/HD-20251121-0001
✅ Hiển thị thông tin hợp đồng:
   - Mã HĐ: HD-20251121-0001
   - Trạng thái: DRAFT (Khởi tạo)
   - Khách hàng: Nguyễn Văn A
   - Xe: 51A-12345
   - Gói bảo hiểm
   - Phí bảo hiểm
   - Ngày ký, Ngày hết hạn
```

### ✅ Acceptance Criteria
- [ ] Tạo KH, Xe, Hồ sơ thành công
- [ ] Thẩm định tự động chạy và hiển thị kết quả
- [ ] Duyệt hồ sơ thành công
- [ ] Lập hợp đồng hiển thị đúng mã HD (không undefined)
- [ ] Navigate đúng URL /contracts/:maHD
- [ ] Không bị lỗi 404

---

## 🎯 TEST CASE 2: LUỒNG TÁI TỤC HỢP ĐỒNG

### Mục tiêu
Kiểm tra chức năng tái tục hợp đồng cũ → Tạo hợp đồng mới

### Precondition
- Đã có 1 hợp đồng với trạng thái ACTIVE hoặc EXPIRED

### Steps

#### Step 1: Tìm hợp đồng cần tái tục
```bash
Page: /contracts
Action: Click tab "Quản lý tái tục"

Expected:
✅ Hiển thị danh sách hợp đồng có status:
   - ACTIVE (Đang hiệu lực)
   - EXPIRED (Hết hạn)
✅ KHÔNG hiển thị hợp đồng DRAFT, CANCELLED
✅ Hiển thị cột "Còn lại" (số ngày còn lại)
```

#### Step 2: Tái tục hợp đồng
```bash
Action: Click icon "Tái tục" (Autorenew icon)

Expected:
✅ Hiển thị confirm: "Xác nhận tái tục hợp đồng HD-XXXXXX?"
```

#### Step 3: Xác nhận tái tục
```bash
Action: Click OK

Expected:
✅ Alert: "✅ Đã tạo hợp đồng tái tục: HD-20251121-XXXX"
   [KHÔNG hiển thị "undefined"]
✅ Reload danh sách hợp đồng
✅ Backend đã tạo:
   - Hợp đồng mới với MaHD mới
   - Liên kết MaHDGoc → MaHD cũ
   - LoaiQuanHe = 'Tái tục'
   - Copy thông tin từ HĐ cũ
```

#### Step 4: Kiểm tra lịch sử quan hệ
```bash
Page: /contracts/:id (Hợp đồng cũ)
Action: Xem tab "Lịch sử tái tục"

Expected:
✅ Hiển thị hợp đồng mới vừa tạo
✅ Hiển thị loại quan hệ: "Tái tục"
✅ Link đến hợp đồng mới
```

### ✅ Acceptance Criteria
- [ ] Tab "Quản lý tái tục" lọc đúng hợp đồng (ACTIVE, EXPIRED)
- [ ] Alert hiển thị đúng mã HĐ mới (không undefined)
- [ ] Tạo được hợp đồng mới với thông tin copy từ HĐ cũ
- [ ] Relationship được lưu đúng (MaHDGoc, LoaiQuanHe)
- [ ] Hiển thị được lịch sử tái tục

---

## 🎯 TEST CASE 3: LUỒNG HỦY HỢP ĐỒNG (HOÀN PHÍ)

### Mục tiêu
Kiểm tra chức năng hủy hợp đồng và tính hoàn phí

### Precondition
- Đã có 1 hợp đồng ACTIVE đã thanh toán

### Steps

#### Step 1: Chọn hợp đồng cần hủy
```bash
Page: /contracts (Tab "Quản lý tái tục")
Action: Click icon "Hủy (hoàn phí)" (Cancel icon màu đỏ)

Expected:
✅ Hiển thị prompt: "Nhập lý do hủy hợp đồng:"
```

#### Step 2: Nhập lý do và xác nhận
```bash
Input: "Khách hàng bán xe"
Action: Click OK

Expected:
✅ Alert: "✅ Đã hủy hợp đồng và tính hoàn phí"
✅ Backend thực hiện:
   - Gọi SP sp_HuyHopDong
   - Update TrangThai = CANCELLED
   - Tính số tiền hoàn = PhiBaoHiem * (SoNgayConLai / 365)
   - Tạo bản ghi ThanhToan (loại hoàn phí)
✅ Reload danh sách
```

#### Step 3: Kiểm tra trạng thái
```bash
Page: /contracts/:id

Expected:
✅ Trạng thái: CANCELLED (Đã hủy)
✅ Hiển thị status chip màu đỏ: "Đã hủy"
✅ Hiển thị thông tin hoàn phí:
   - Số tiền hoàn
   - Lý do hủy
   - Ngày hủy
```

### ✅ Acceptance Criteria
- [ ] Hủy hợp đồng thành công
- [ ] Tính hoàn phí chính xác (tỉ lệ theo số ngày còn lại)
- [ ] Lưu lý do hủy
- [ ] Status chip hiển thị "Đã hủy" (tiếng Việt, không phải "CANCELLED")
- [ ] Không thể edit hợp đồng đã hủy

---

## 🎯 TEST CASE 4: LUỒNG LỌC VÀ XEM STATS

### Mục tiêu
Kiểm tra chức năng lọc và thống kê hợp đồng

### Steps

#### Step 1: Test Tab "Quản lý hợp đồng"
```bash
Page: /contracts (Tab đầu tiên)

Expected Stats Cards:
✅ "Đang hiệu lực": Đếm hợp đồng có TrangThai = ACTIVE
✅ "Cần duyệt": Đếm DRAFT + PENDING_PAYMENT
✅ "Sắp hết hạn (15 ngày)": Đếm ACTIVE còn <= 15 ngày

Expected Table:
✅ Hiển thị TẤT CẢ hợp đồng
✅ Status chip hiển thị tiếng Việt:
   - ACTIVE → "Đang hiệu lực" (xanh)
   - DRAFT → "Khởi tạo" (xám)
   - EXPIRED → "Hết hạn" (xám)
   - CANCELLED → "Đã hủy" (đỏ)
```

#### Step 2: Test Tab "Quản lý phát hành"
```bash
Action: Click tab "Quản lý phát hành"

Expected:
✅ Filter gửi params.trangThai = "DRAFT"
✅ Chỉ hiển thị hợp đồng DRAFT
✅ Không hiển thị ACTIVE, EXPIRED
✅ Có nút "In hợp đồng", "In chứng nhận"
```

#### Step 3: Test Tab "Quản lý tái tục"
```bash
Action: Click tab "Quản lý tái tục"

Expected:
✅ Filter gửi params.trangThai = "ACTIVE,EXPIRED"
✅ Hiển thị hợp đồng ACTIVE + EXPIRED
✅ Không hiển thị DRAFT, CANCELLED
✅ Có cột "Còn lại" (số ngày)
✅ Có nút "Tái tục", "Chuyển nhượng", "Hủy"
```

#### Step 4: Test Search
```bash
Action: Nhập "HD-2025" vào search box

Expected:
✅ Filter gửi params.search = "HD-2025"
✅ Hiển thị hợp đồng có mã chứa "HD-2025"
✅ Reset về page 1
```

### ✅ Acceptance Criteria
- [ ] Stats cards đếm chính xác (KHÔNG = 0)
- [ ] Filter tabs hoạt động đúng (dùng constants)
- [ ] Status chip hiển thị tiếng Việt
- [ ] Search hoạt động
- [ ] Pagination hoạt động

---

## 🎯 TEST CASE 5: LUỒNG CHUYỂN NHƯỢNG HỢP ĐỒNG

### Mục tiêu
Test chức năng chuyển nhượng HĐ sang khách hàng mới

### Precondition
- Đã có 2 khách hàng: KH1 (cũ), KH2 (mới)
- Đã có hợp đồng của KH1

### Steps

#### Step 1: Chọn hợp đồng cần chuyển nhượng
```bash
Page: /contracts (Tab "Quản lý tái tục")
Action: Click icon "Chuyển nhượng"

Expected:
✅ Navigate đến: /contracts/:id/transfer
✅ Hiển thị form chuyển nhượng
```

#### Step 2: Nhập thông tin chuyển nhượng
```bash
Input:
- Khách hàng mới: Chọn từ dropdown
- Lý do: "Bán xe cho người khác"

Action: Click "Xác nhận chuyển nhượng"

Expected:
✅ Backend tạo:
   - Hồ sơ thẩm định mới (cho KH mới + xe cũ)
   - Thẩm định tự động
   - Link với HĐ cũ (LoaiQuanHe = 'Chuyển nhượng')
✅ Alert với mã hồ sơ mới
✅ Navigate về /hoso/:id (hồ sơ mới)
```

#### Step 3: Kiểm tra hồ sơ mới
```bash
Page: /hoso/:id (Hồ sơ vừa tạo)

Expected:
✅ Khách hàng = KH mới
✅ Xe = xe cũ
✅ Đã thẩm định tự động
✅ Có link về HĐ cũ
```

### ✅ Acceptance Criteria
- [ ] Tạo được hồ sơ thẩm định mới
- [ ] Chuyển đổi khách hàng đúng
- [ ] Thẩm định tự động cho KH mới
- [ ] Relationship được lưu

---

## 🎯 TEST CASE 6: LUỒNG XEM BÁO CÁO

### Mục tiêu
Test các chức năng báo cáo

### Steps

#### Step 1: Báo cáo Doanh thu
```bash
Page: /reports
Tab: "Doanh thu"

Input:
- Từ ngày: 01/01/2025
- Đến ngày: 31/12/2025

Action: Click "Xem báo cáo"

Expected:
✅ Hiển thị bảng:
   - Tổng doanh thu
   - Doanh thu theo tháng
   - Doanh thu theo gói bảo hiểm
✅ Có nút "Xuất PDF"
```

#### Step 2: Xuất PDF
```bash
Action: Click "Xuất PDF"

Expected:
✅ Download file: BaoCao_DoanhThu_2025.pdf
✅ File chứa:
   - Header với logo, tiêu đề
   - Bảng dữ liệu
   - Chart (nếu có)
   - Footer với ngày xuất
```

#### Step 3: Báo cáo Thẩm định
```bash
Tab: "Thẩm định"
Input: Chọn khoảng thời gian

Expected:
✅ Hiển thị:
   - Số lượng hồ sơ: Chấp nhận / Từ chối
   - Risk Level distribution
   - Top xe high risk
✅ Có nút "Xuất PDF"
```

### ✅ Acceptance Criteria
- [ ] Các báo cáo hiển thị đúng dữ liệu
- [ ] Xuất PDF thành công
- [ ] PDF format đẹp, có tiếng Việt

---

## 🎯 TEST CASE 7: LUỒNG THANH TOÁN

### Mục tiêu
Test luồng thanh toán hợp đồng

### Steps

#### Step 1: Chọn hợp đồng cần thanh toán
```bash
Page: /contracts/:id (Hợp đồng DRAFT)
Action: Click "Thanh toán"

Expected:
✅ Hiển thị modal thanh toán
✅ Hiển thị:
   - Số tiền cần thanh toán
   - Các phương thức: Tiền mặt / Chuyển khoản / Thẻ
```

#### Step 2: Thực hiện thanh toán
```bash
Input:
- Phương thức: "Tiền mặt"
- Số tiền: 5,000,000
- Ghi chú: "Thanh toán đợt 1"

Action: Click "Xác nhận thanh toán"

Expected:
✅ Backend:
   - Tạo bản ghi ThanhToan
   - Update TongDaTra
   - Nếu đủ → TrangThai = ACTIVE
✅ Alert: "✅ Đã thanh toán thành công"
✅ Reload thông tin HĐ
```

#### Step 3: Kiểm tra trạng thái
```bash
Expected:
✅ Nếu thanh toán đủ:
   - TrangThai = ACTIVE
   - NgayHieuLuc = ngày thanh toán
✅ Nếu thanh toán 1 phần:
   - TrangThai = PARTIAL_PAID
✅ Hiển thị lịch sử thanh toán
```

### ✅ Acceptance Criteria
- [ ] Thanh toán thành công
- [ ] Status tự động chuyển ACTIVE khi đủ tiền
- [ ] Lưu lịch sử thanh toán
- [ ] Tính tổng đã trả chính xác

---

## 📊 TEST MATRIX

| Test Case | Status | Browser | Notes |
|-----------|--------|---------|-------|
| TC1: Thẩm định → HĐ | ⬜ | Chrome | Test field mapping |
| TC2: Tái tục | ⬜ | Chrome | Test maHDMoi |
| TC3: Hủy HĐ | ⬜ | Chrome | Test hoàn phí |
| TC4: Filter & Stats | ⬜ | Chrome | Test constants |
| TC5: Chuyển nhượng | ⬜ | Chrome | Test workflow |
| TC6: Báo cáo | ⬜ | Chrome | Test PDF export |
| TC7: Thanh toán | ⬜ | Chrome | Test payment flow |

---

## 🚨 EXPECTED ISSUES (Đã sửa)

### ❌ Trước khi sửa
1. TC1: Alert hiển thị "undefined" → ✅ ĐÃ SỬA
2. TC4: Stats = 0 → ✅ ĐÃ SỬA
3. TC4: Filter tabs không hoạt động → ✅ ĐÃ SỬA
4. TC4: Status hiển thị "ACTIVE" thay vì "Đang hiệu lực" → ✅ ĐÃ SỬA

### ✅ Sau khi sửa
1. TC1: Alert hiển thị "HD-20251121-0001" → OK
2. TC4: Stats đếm chính xác → OK
3. TC4: Filter hoạt động (DRAFT, ACTIVE, EXPIRED) → OK
4. TC4: Status hiển thị tiếng Việt → OK

---

## 🔧 TEST ENVIRONMENT

### Frontend
```bash
cd frontend
npm start
# Running on http://localhost:3000
```

### Backend
```bash
cd backend
npm start
# Running on http://localhost:5000
```

### Database
```bash
SQL Server
Database: QL_BaoHiemXe
```

---

## 📝 TEST EXECUTION LOG

### Ngày: __________
### Người test: __________

| Test Case | Result | Issues Found | Notes |
|-----------|--------|--------------|-------|
| TC1 | ⬜ PASS / ⬜ FAIL | | |
| TC2 | ⬜ PASS / ⬜ FAIL | | |
| TC3 | ⬜ PASS / ⬜ FAIL | | |
| TC4 | ⬜ PASS / ⬜ FAIL | | |
| TC5 | ⬜ PASS / ⬜ FAIL | | |
| TC6 | ⬜ PASS / ⬜ FAIL | | |
| TC7 | ⬜ PASS / ⬜ FAIL | | |

---

## 🎯 REGRESSION TEST CHECKLIST

Sau khi test xong, verify các chức năng cũ vẫn hoạt động:

- [ ] Login/Logout
- [ ] CRUD Khách hàng
- [ ] CRUD Xe
- [ ] CRUD Gói bảo hiểm
- [ ] Quản lý nhân viên
- [ ] Audit logs
- [ ] Tìm kiếm
- [ ] Phân trang
- [ ] Sorting

---

## 📌 NOTES

### Debug Tips
```javascript
// 1. Check network requests
Chrome DevTools → Network tab → Filter by "Fetch/XHR"

// 2. Check console for errors
Chrome DevTools → Console tab

// 3. Check state
React DevTools → Components → State

// 4. Check API response
console.log('API Response:', result);
```

### Known Limitations
- Backend response format chưa nhất quán (Lỗi 6 - không critical)
- Một số API trả về `{data}`, một số `{success, data, pagination}`

---

**Prepared by:** Cline AI Assistant  
**Last updated:** 21/11/2025, 1:02 AM  
**Version:** 1.0
