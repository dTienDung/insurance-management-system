# PHASE 2 TESTING GUIDE
## Master Data Management UI - Hướng dẫn Kiểm thử

**Date:** 2024  
**Version:** 1.0  
**Phase:** 2 - Frontend UI

---

## 🚀 QUICK START

### Khởi động Hệ thống

1. **Start Backend:**
```powershell
cd backend
npm install  # Nếu chưa cài
npm start    # Chạy server trên port 3000
```

2. **Start Frontend:**
```powershell
cd frontend
npm install  # Nếu chưa cài
npm start    # Chạy React app trên port 3001
```

3. **Login:**
- URL: http://localhost:3001/login
- Tài khoản test: (xem trong database hoặc tạo mới)

---

## 📋 TEST CASES

### 1. MA TRẬN THẨM ĐỊNH (Assessment Criteria)

#### TC-AC-001: Xem danh sách Ma trận Thẩm định
**Bước thực hiện:**
1. Đăng nhập thành công
2. Click menu "Cài đặt" (Settings)
3. Tab "Ma trận Thẩm định" đang được chọn (mặc định)

**Kết quả mong đợi:**
- ✅ Hiển thị bảng với các cột: ID, Tiêu chí, Điều kiện, Điểm, Ghi chú, Thao tác
- ✅ Có nút "Thêm mới" ở góc trên phải
- ✅ Hiển thị phân trang nếu có nhiều hơn 10 bản ghi
- ✅ Điểm số hiển thị dưới dạng chip có màu:
  - Xanh lá: điểm dương (+)
  - Đỏ: điểm âm (-)
  - Xám: điểm 0

#### TC-AC-002: Thêm mới Tiêu chí Thẩm định
**Bước thực hiện:**
1. Click nút "Thêm mới"
2. Nhập thông tin:
   - Tiêu chí: "Năm sản xuất"
   - Điều kiện: "< 5 năm"
   - Điểm: 20
   - Ghi chú: "Xe mới ít rủi ro"
3. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Dialog đóng
- ✅ Hiển thị thông báo "Thêm ma trận thẩm định thành công"
- ✅ Bản ghi mới xuất hiện trong bảng
- ✅ Tự động tải lại danh sách

#### TC-AC-003: Validation - Điểm không hợp lệ
**Bước thực hiện:**
1. Click "Thêm mới"
2. Nhập Điểm: 150 (vượt quá giới hạn)
3. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Hiển thị lỗi "Điểm phải từ -100 đến +100"
- ✅ Dialog không đóng
- ✅ Không gọi API

#### TC-AC-004: Validation - Trường bắt buộc
**Bước thực hiện:**
1. Click "Thêm mới"
2. Để trống "Tiêu chí"
3. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Hiển thị lỗi "Vui lòng nhập đầy đủ thông tin bắt buộc"
- ✅ Dialog không đóng

#### TC-AC-005: Chỉnh sửa Tiêu chí
**Bước thực hiện:**
1. Click icon "Edit" (bút chì) trên một bản ghi
2. Thay đổi Điểm: 30 → 40
3. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Dialog đóng
- ✅ Hiển thị thông báo "Cập nhật ma trận thẩm định thành công"
- ✅ Điểm mới hiển thị trong bảng

#### TC-AC-006: Xóa Tiêu chí
**Bước thực hiện:**
1. Click icon "Delete" (thùng rác) trên một bản ghi
2. Confirm dialog xuất hiện
3. Click "OK"

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Xóa ma trận thẩm định thành công"
- ✅ Bản ghi biến mất khỏi bảng
- ✅ Tự động tải lại danh sách

#### TC-AC-007: Phân trang
**Bước thực hiện:**
1. Thêm > 10 bản ghi vào database
2. Reload trang
3. Click "Next page" ở thanh phân trang
4. Thay đổi "Số dòng mỗi trang" thành 25

**Kết quả mong đợi:**
- ✅ Trang 2 hiển thị đúng dữ liệu
- ✅ Thay đổi rows per page tải lại dữ liệu
- ✅ Tổng số bản ghi hiển thị đúng

---

### 2. MA TRẬN ĐỊNH PHÍ (Pricing Matrix)

#### TC-PM-001: Xem danh sách Ma trận Định phí
**Bước thực hiện:**
1. Click tab "Ma trận Định phí"

**Kết quả mong đợi:**
- ✅ Hiển thị bảng với các cột: ID, Mức độ rủi ro, Gói bảo hiểm, Hệ số phí, Ghi chú, Thao tác
- ✅ Có 3 nút: "Tính phí", "Xem ma trận", "Thêm mới"
- ✅ Có 2 dropdown lọc: Mức rủi ro, Gói bảo hiểm
- ✅ Hệ số phí hiển thị dưới dạng chip màu:
  - Xanh: < 1.5
  - Vàng: 1.5 - 3.0
  - Đỏ: > 3.0

#### TC-PM-002: Tính phí Bảo hiểm
**Bước thực hiện:**
1. Click nút "Tính phí"
2. Chọn:
   - Mức độ rủi ro: MEDIUM
   - Gói bảo hiểm: STANDARD
   - Giá trị xe: 500000000 (500 triệu)
3. Click "Tính toán"

**Kết quả mong đợi:**
- ✅ Widget mở rộng
- ✅ Hiển thị kết quả tính toán:
  - Phí bảo hiểm: (số tiền VND)
  - Hệ số phí: (số)
  - Tỷ lệ phí cơ bản: (%)
- ✅ Kết quả nằm trong box màu xanh lá
- ✅ Format tiền tệ Việt Nam (1.000.000 ₫)

#### TC-PM-003: Xem Ma trận Đầy đủ
**Bước thực hiện:**
1. Click nút "Xem ma trận"

**Kết quả mong đợi:**
- ✅ Dialog mở ra
- ✅ Hiển thị bảng grid:
  - Hàng: LOW, MEDIUM, HIGH
  - Cột: BASIC, STANDARD, PREMIUM, VIP
- ✅ Mỗi ô hiển thị hệ số phí tương ứng
- ✅ Ô trống hiển thị "-" màu xám

#### TC-PM-004: Lọc theo Mức rủi ro
**Bước thực hiện:**
1. Chọn dropdown "Lọc theo mức rủi ro": HIGH
2. Chờ kết quả

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị bản ghi có RiskLevel = HIGH
- ✅ Pagination reset về trang 1
- ✅ Tổng số bản ghi cập nhật

#### TC-PM-005: Thêm mới Ma trận Định phí
**Bước thực hiện:**
1. Click "Thêm mới"
2. Nhập:
   - Mức độ rủi ro: HIGH
   - Gói bảo hiểm: VIP
   - Hệ số phí: 4.5
   - Ghi chú: "Rủi ro cao, gói cao cấp"
3. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Dialog đóng
- ✅ Thông báo "Thêm ma trận định phí thành công"
- ✅ Bản ghi xuất hiện trong bảng
- ✅ Hệ số phí 4.5 hiển thị chip màu đỏ

#### TC-PM-006: Validation - Hệ số phí không hợp lệ
**Bước thực hiện:**
1. Click "Thêm mới"
2. Nhập Hệ số phí: 6.0 (vượt quá giới hạn 5.0)
3. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Hiển thị lỗi "Hệ số phí phải từ 0.5 đến 5.0"
- ✅ Dialog không đóng

#### TC-PM-007: Unique Constraint - Duplicate (RiskLevel + Package)
**Bước thực hiện:**
1. Thêm bản ghi: HIGH + VIP
2. Thử thêm lại: HIGH + VIP
3. Click "Lưu"

**Kết quả mong đợi:**
- ✅ Backend trả về lỗi 400
- ✅ Hiển thị lỗi từ server (ví dụ: "Đã tồn tại ma trận cho RiskLevel và Package này")

---

### 3. LỊCH SỬ THAY ĐỔI (Audit Log)

#### TC-AL-001: Xem danh sách Audit Log
**Bước thực hiện:**
1. Click tab "Lịch sử thay đổi"

**Kết quả mong đợi:**
- ✅ Hiển thị bảng với các cột: Expand, ID, Bảng, Bản ghi, Hành động, Người thay đổi, Thời gian
- ✅ Có 4 nút: "Thống kê", "So sánh", "Xuất CSV", "Hiện/Ẩn lọc"
- ✅ Bộ lọc hiển thị mặc định
- ✅ Hành động hiển thị chip màu:
  - INSERT: Xanh (Thêm mới)
  - UPDATE: Vàng (Cập nhật)
  - DELETE: Đỏ (Xóa)

#### TC-AL-002: Mở rộng Chi tiết Thay đổi
**Bước thực hiện:**
1. Click icon "Expand" (mũi tên xuống) trên một log
2. Xem chi tiết

**Kết quả mong đợi:**
- ✅ Row mở rộng hiển thị bảng so sánh
- ✅ Bảng có 3 cột: Trường, Giá trị cũ, Giá trị mới
- ✅ Giá trị cũ: Chip màu đỏ
- ✅ Giá trị mới: Chip màu xanh
- ✅ Trường không thay đổi hiển thị "-"

#### TC-AL-003: Lọc theo Bảng
**Bước thực hiện:**
1. Chọn dropdown "Bảng": MaTranThamDinh
2. Chờ kết quả

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị log của bảng MaTranThamDinh
- ✅ Reset về trang 1
- ✅ Tổng số log cập nhật

#### TC-AL-004: Lọc theo Khoảng thời gian
**Bước thực hiện:**
1. Chọn "Từ ngày": 2024-01-01
2. Chọn "Đến ngày": 2024-12-31
3. Chờ kết quả

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị log trong khoảng thời gian
- ✅ Thời gian hiển thị định dạng Việt Nam (dd/mm/yyyy hh:mm:ss)

#### TC-AL-005: Xem Thống kê
**Bước thực hiện:**
1. Click nút "Thống kê"
2. Xem kết quả

**Kết quả mong đợi:**
- ✅ Card thống kê mở rộng
- ✅ Hiển thị 4 box màu:
  - Tổng số thay đổi (primary)
  - Thêm mới (green)
  - Cập nhật (yellow)
  - Xóa (red)
- ✅ Hiển thị danh sách "Theo bảng" với số lượng
- ✅ Có nút "Đóng"

#### TC-AL-006: So sánh 2 Phiên bản
**Bước thực hiện:**
1. Click nút "So sánh"
2. Nhập:
   - Bảng: MaTranThamDinh
   - ID bản ghi: 1
   - Phiên bản 1: 10 (log ID cũ)
   - Phiên bản 2: 15 (log ID mới)
3. Click "So sánh"

**Kết quả mong đợi:**
- ✅ Hiển thị bảng so sánh
- ✅ Các trường thay đổi highlight
- ✅ Chip "Đã thay đổi" (warning) cho trường khác
- ✅ Chip "Không đổi" (default) cho trường giống

#### TC-AL-007: Xuất CSV
**Bước thực hiện:**
1. (Tùy chọn) Áp dụng bộ lọc
2. Click nút "Xuất CSV"

**Kết quả mong đợi:**
- ✅ File CSV tự động tải về
- ✅ Tên file: `audit-log-YYYY-MM-DD.csv`
- ✅ Nội dung CSV chứa các log đã lọc
- ✅ Hiển thị thông báo "Xuất file CSV thành công"

#### TC-AL-008: Xóa Bộ lọc
**Bước thực hiện:**
1. Áp dụng nhiều bộ lọc (Bảng, Hành động, Ngày)
2. Click nút "Xóa bộ lọc"

**Kết quả mong đợi:**
- ✅ Tất cả dropdown reset về "Tất cả"
- ✅ Date picker bị xóa
- ✅ Tự động tải lại toàn bộ log

---

### 4. NAVIGATION & INTEGRATION

#### TC-NAV-001: Menu Sidebar
**Bước thực hiện:**
1. Đăng nhập thành công
2. Kiểm tra sidebar menu

**Kết quả mong đợi:**
- ✅ Menu "Cài đặt" (Settings) hiển thị
- ✅ Icon: Gear (SettingOutlined)
- ✅ Vị trí: Sau "Báo cáo"

#### TC-NAV-002: Click menu Cài đặt
**Bước thực hiện:**
1. Click menu "Cài đặt"

**Kết quả mong đợi:**
- ✅ URL thay đổi: /settings
- ✅ Trang Settings hiển thị
- ✅ Tab "Ma trận Thẩm định" active mặc định

#### TC-NAV-003: Chuyển đổi Tabs
**Bước thực hiện:**
1. Ở trang Settings
2. Click tab "Ma trận Định phí"
3. Click tab "Lịch sử thay đổi"
4. Click lại tab "Ma trận Thẩm định"

**Kết quả mong đợi:**
- ✅ Mỗi tab hiển thị nội dung tương ứng
- ✅ Tab active có underline màu xanh
- ✅ Nội dung tab trước không hiển thị
- ✅ Không bị reload trang

#### TC-NAV-004: Browser Back/Forward
**Bước thực hiện:**
1. Ở trang Settings
2. Click menu "Dashboard"
3. Click nút Back của browser
4. Click nút Forward

**Kết quả mong đợi:**
- ✅ Back: Quay lại Settings
- ✅ Forward: Đến Dashboard
- ✅ State không bị mất

#### TC-NAV-005: Logout
**Bước thực hiện:**
1. Ở trang Settings
2. Click avatar → "Đăng xuất"

**Kết quả mong đợi:**
- ✅ Redirect về /login
- ✅ Token bị xóa
- ✅ Không thể truy cập /settings khi chưa login

---

## 🔥 STRESS TESTING

### ST-001: Large Dataset (1000+ records)
**Mục đích:** Test hiệu năng với dữ liệu lớn

**Bước thực hiện:**
1. Insert 1000 bản ghi vào MaTranThamDinh
2. Mở trang Settings → Ma trận Thẩm định
3. Thực hiện các thao tác: phân trang, tìm kiếm, thêm/sửa/xóa

**Kết quả mong đợi:**
- ✅ Tải trang < 3 giây
- ✅ Phân trang mượt mà
- ✅ Không bị lag khi scroll
- ✅ API response < 500ms

### ST-002: Concurrent Users
**Mục đích:** Test đồng thời nhiều user

**Bước thực hiện:**
1. Mở 5 tab browser khác nhau
2. Đăng nhập 5 tài khoản khác nhau
3. Cùng lúc thêm/sửa/xóa dữ liệu

**Kết quả mong đợi:**
- ✅ Không có conflict
- ✅ Mỗi user thấy thay đổi của user khác sau khi reload
- ✅ Audit log ghi đúng người thay đổi

### ST-003: Network Latency
**Mục đích:** Test với mạng chậm

**Bước thực hiện:**
1. Mở DevTools → Network tab
2. Chọn "Slow 3G"
3. Thực hiện các thao tác CRUD

**Kết quả mong đợi:**
- ✅ Loading spinner hiển thị
- ✅ Không bị double-submit
- ✅ Error timeout sau 30s
- ✅ User không bị stuck

---

## 🐛 EDGE CASES

### EC-001: Empty Database
**Bước thực hiện:**
1. Truncate table MaTranThamDinh
2. Reload trang Settings

**Kết quả mong đợi:**
- ✅ Hiển thị "Không có dữ liệu"
- ✅ Không có error
- ✅ Pagination hiển thị 0 tổng số

### EC-002: Backend Offline
**Bước thực hiện:**
1. Stop backend server
2. Thử thêm mới một bản ghi

**Kết quả mong đợi:**
- ✅ Hiển thị lỗi "Network Error" hoặc "Lỗi khi lưu..."
- ✅ Không crash frontend
- ✅ User có thể retry sau khi restart backend

### EC-003: Invalid Token
**Bước thực hiện:**
1. Đăng nhập
2. Trong DevTools, xóa token từ localStorage
3. Thử thêm mới bản ghi

**Kết quả mong đợi:**
- ✅ API trả về 401 Unauthorized
- ✅ Frontend redirect về /login
- ✅ Hiển thị "Phiên đăng nhập hết hạn"

### EC-004: SQL Injection Attempt
**Bước thực hiện:**
1. Click "Thêm mới" Ma trận Thẩm định
2. Nhập Tiêu chí: `'; DROP TABLE MaTranThamDinh; --`
3. Click "Lưu"

**Kết quả mong đợi:**
- ✅ String được escape
- ✅ Lưu thành công hoặc validation lỗi
- ✅ Table KHÔNG bị xóa
- ✅ Backend sử dụng parameterized query

### EC-005: XSS Attempt
**Bước thực hiện:**
1. Nhập Ghi chú: `<script>alert('XSS')</script>`
2. Lưu và reload trang

**Kết quả mong đợi:**
- ✅ Script KHÔNG được thực thi
- ✅ Hiển thị dưới dạng plain text
- ✅ React tự động escape

---

## 📱 RESPONSIVE TESTING

### Mobile (375px - iPhone SE)
**Test trên:**
- Chrome DevTools → Toggle device toolbar
- Chọn iPhone SE

**Kiểm tra:**
- ✅ Bảng không bị vỡ layout
- ✅ Button không bị overlap
- ✅ Dialog fit màn hình
- ✅ Form input đủ lớn để nhập
- ✅ Pagination không bị che

### Tablet (768px - iPad)
**Test trên:**
- Chrome DevTools → iPad

**Kiểm tra:**
- ✅ Grid layout 2 cột
- ✅ Tabs hiển thị đầy đủ
- ✅ Bảng scroll ngang nếu cần

### Desktop (1920px)
**Test trên:**
- Full HD monitor

**Kiểm tra:**
- ✅ Không có khoảng trắng thừa
- ✅ Max-width cho container
- ✅ Font size phù hợp

---

## ✅ ACCEPTANCE CRITERIA

**Để Phase 2 được chấp nhận, TẤT CẢ điều kiện sau phải đạt:**

- [ ] Tất cả 30+ test cases PASS
- [ ] Không có compilation error
- [ ] Không có ESLint warning
- [ ] Tất cả CRUD operations hoạt động
- [ ] Tính phí bảo hiểm chính xác
- [ ] Audit log ghi đúng thông tin
- [ ] Responsive trên 3 kích thước màn hình
- [ ] Vietnamese localization 100%
- [ ] No XSS/SQL injection vulnerability
- [ ] Loading states hoạt động
- [ ] Error handling đầy đủ
- [ ] Pagination chính xác
- [ ] Filter/Search hoạt động
- [ ] CSV export thành công

---

## 📞 BÁO CÁO LỖI

**Nếu phát hiện lỗi, vui lòng ghi nhận:**

1. **Test Case ID:** (ví dụ: TC-PM-005)
2. **Mô tả lỗi:** (chi tiết lỗi gì)
3. **Bước tái hiện:** (các bước để tái hiện lỗi)
4. **Kết quả thực tế:** (điều gì đã xảy ra)
5. **Kết quả mong đợi:** (điều gì nên xảy ra)
6. **Screenshot:** (nếu có)
7. **Console log:** (lỗi trong browser console)
8. **Môi trường:** (browser, OS, screen size)

**Mẫu báo cáo:**
```
TC-PM-005: Thêm mới Ma trận Định phí
Lỗi: Không lưu được khi HeSoPhi = 5.0
Bước: Nhập 5.0 → Click Lưu
Thực tế: Hiển thị lỗi "Hệ số phí phải từ 0.5 đến 5.0"
Mong đợi: Lưu thành công (5.0 là giá trị hợp lệ)
Browser: Chrome 120, Windows 11
```

---

**Happy Testing! 🎉**

*Tài liệu này là phần bổ sung cho PHASE2_COMPLETION_REPORT.md*
