# Tóm tắt các vấn đề đã sửa

## 1. ✅ Routes cho Thẩm định (Assessment)
- **Vấn đề:** Route `/assessments/:id` dùng `AssessmentForm` thay vì `AssessmentDetail`
- **Đã sửa:** App.js - Thêm import `AssessmentDetail` và `HoSoList`, sửa route để dùng đúng component
- **Kết quả:** Ấn "Xem chi tiết" sẽ vào đúng trang detail thay vì form

## 2. ✅ Pagination không hoạt động
- **Vấn đề:** DataGrid thiếu prop `paginationMode`
- **Đã sửa:** Table.js - Thêm `paginationMode="client"`
- **Kết quả:** Chọn số bản ghi mỗi trang và pagination hoạt động bình thường

## 3. ⚠️ Font tiếng Việt trong PDF
- **Vấn đề:** PDF dùng Helvetica không hỗ trợ tiếng Việt tốt
- **Đang sửa:** pdfReportService.js - Đã thêm method `setFont()` để hỗ trợ custom font
- **Cần làm tiếp:**
  1. Tải font Roboto từ Google Fonts: https://fonts.google.com/specimen/Roboto
  2. Copy các file .ttf vào `backend/fonts/`:
     - Roboto-Regular.ttf
     - Roboto-Bold.ttf
     - Roboto-Italic.ttf
  3. Restart backend server
  
  **Hoặc:** Chạy lệnh sau trong thư mục backend:
  ```bash
  # Windows PowerShell
  Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Regular.ttf" -OutFile "fonts/Roboto-Regular.ttf"
  Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Bold.ttf" -OutFile "fonts/Roboto-Bold.ttf"
  Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Italic.ttf" -OutFile "fonts/Roboto-Italic.ttf"
  ```

## 4. ✅ Buttons bị xám/disabled
- **Vấn đề:** Data không có field `MaKH`, `MaXe` nên buttons bị disabled
- **Đã sửa:** Thêm defensive check trong CustomerList.js và VehicleList.js
- **Kết quả:** Buttons chỉ disabled khi thực sự thiếu data

## Cần kiểm tra lại:
- [ ] Restart frontend và backend
- [ ] Test vào trang thẩm định
- [ ] Test pagination
- [ ] Test xuất PDF (có thể vẫn lỗi font nếu chưa add font file)
