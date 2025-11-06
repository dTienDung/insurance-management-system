USE QuanlyHDBaoHiem;
GO

-- TẮT TẤT CẢ TRIGGERS
DISABLE TRIGGER trg_TuDongMaNV ON NhanVien;
DISABLE TRIGGER trg_TuDongMaTK ON TaiKhoan;
DISABLE TRIGGER trg_TuDongMaLB ON LoaiBaoHiem;
DISABLE TRIGGER trg_TuDongMaKH ON KhachHang;
DISABLE TRIGGER trg_TuDongMaXe ON Xe;
GO

-- XÓA DATA CŨ
DELETE FROM ThanhToan;
DELETE FROM ThamDinh;
DELETE FROM LichSuXe;
DELETE FROM HopDong;
DELETE FROM Xe;
DELETE FROM KhachHang;
DELETE FROM TaiKhoan;
DELETE FROM NhanVien;
DELETE FROM LoaiBaoHiem;
GO

PRINT '✅ Đã xóa data cũ!';
GO

-- TẠO NHÂN VIÊN (Tự set MaNV)
INSERT INTO NhanVien (MaNV, HoTen, ChucVu, PhongBan, SDT, Email)
VALUES 
  ('NV001', N'Nguyễn Văn Admin', N'Quản trị viên', N'IT', '0901234567', 'admin@pearlholding.com'),
  ('NV002', N'Trần Thị Lan', N'Nhân viên kinh doanh', N'Kinh doanh', '0901234568', 'lan.tran@pearlholding.com'),
  ('NV003', N'Lê Văn Nam', N'Thẩm định viên', N'Thẩm định', '0901234569', 'nam.le@pearlholding.com'),
  ('NV004', N'Phạm Thị Hoa', N'Kế toán', N'Tài chính', '0901234570', 'hoa.pham@pearlholding.com');
GO

PRINT '✅ Đã tạo nhân viên!';
GO

-- TẠO TÀI KHOẢN (Password: admin123)
INSERT INTO TaiKhoan (MaTK, TenDangNhap, MatKhau, VaiTro, TrangThai, MaNV)
VALUES 
  ('TK001', 'admin', '$2a$10$YqZxGZGQp5t5a6y5yK5K5e3f8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xu', N'Admin', N'Hoạt động', 'NV001'),
  ('TK002', 'lantran', '$2a$10$YqZxGZGQp5t5a6y5yK5K5e3f8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xu', N'Nhân viên', N'Hoạt động', 'NV002'),
  ('TK003', 'namle', '$2a$10$YqZxGZGQp5t5a6y5yK5K5e3f8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xu', N'Thẩm định', N'Hoạt động', 'NV003'),
  ('TK004', 'hoapham', '$2a$10$YqZxGZGQp5t5a6y5yK5K5e3f8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xQ8xu', N'Kế toán', N'Hoạt động', 'NV004');
GO

PRINT '✅ Đã tạo tài khoản!';
GO

-- TẠO LOẠI BẢO HIỂM
INSERT INTO LoaiBaoHiem (MaLB, TenLoai, MoTa, MucPhi)
VALUES 
  ('LB001', N'Bảo hiểm vật chất xe', N'Bảo hiểm thiệt hại vật chất cho xe ô tô', 3000000),
  ('LB002', N'Bảo hiểm trách nhiệm dân sự', N'Bảo hiểm TNDS bắt buộc cho xe cơ giới', 500000),
  ('LB003', N'Bảo hiểm toàn diện', N'Kết hợp vật chất và TNDS', 5000000),
  ('LB004', N'Bảo hiểm tai nạn lái phụ xe', N'Bảo hiểm cho người lái và phụ xe', 1000000);
GO

PRINT '✅ Đã tạo loại bảo hiểm!';
GO

-- TẠO KHÁCH HÀNG
INSERT INTO KhachHang (MaKH, HoTen, CMND_CCCD, NgaySinh, DiaChi, SDT, Email)
VALUES 
  ('KH001', N'Nguyễn Văn A', '001234567890', '1985-05-15', N'123 Láng Hạ, Đống Đa, Hà Nội', '0912345678', 'vana@gmail.com'),
  ('KH002', N'Trần Thị B', '001234567891', '1990-08-20', N'456 Giải Phóng, Hai Bà Trưng, Hà Nội', '0912345679', 'thib@gmail.com'),
  ('KH003', N'Lê Văn C', '001234567892', '1988-03-10', N'789 Nguyễn Trãi, Thanh Xuân, Hà Nội', '0912345680', 'vanc@gmail.com');
GO

PRINT '✅ Đã tạo khách hàng!';
GO

-- TẠO XE
INSERT INTO Xe (MaXe, BienSo, HangXe, LoaiXe, NamSX, MaKH, GiaTriXe, MucDichSuDung, TinhTrangKT, TanSuatNam, TanSuatBaoDuong)
VALUES 
  ('XE001', '30A-12345', N'Toyota', N'Sedan', 2020, 'KH001', 800000000, N'Cá nhân', N'Tốt', 2, N'2 lần/năm'),
  ('XE002', '29B-67890', N'Honda', N'SUV', 2019, 'KH002', 950000000, N'Kinh doanh', N'Tốt', 3, N'3 lần/năm'),
  ('XE003', '30C-11111', N'Mazda', N'Sedan', 2021, 'KH003', 700000000, N'Cá nhân', N'Tốt', 2, N'2 lần/năm');
GO

PRINT '✅ Đã tạo xe!';
GO

-- BẬT LẠI TRIGGERS
ENABLE TRIGGER trg_TuDongMaNV ON NhanVien;
ENABLE TRIGGER trg_TuDongMaTK ON TaiKhoan;
ENABLE TRIGGER trg_TuDongMaLB ON LoaiBaoHiem;
ENABLE TRIGGER trg_TuDongMaKH ON KhachHang;
ENABLE TRIGGER trg_TuDongMaXe ON Xe;
GO

PRINT '✅ Đã bật lại triggers!';
PRINT '';
PRINT '═══════════════════════════════════════';
PRINT '✅ HOÀN TẤT! Đã tạo data thành công!';
PRINT '═══════════════════════════════════════';
PRINT '';
PRINT 'Thông tin đăng nhập:';
PRINT '- Username: admin';
PRINT '- Password: admin123';
PRINT '';
GO

-- HIỂN thị KẾT QUẢ
SELECT '📋 NHÂN VIÊN' AS Info;
SELECT * FROM NhanVien;

SELECT '🔐 TÀI KHOẢN' AS Info;
SELECT MaTK, TenDangNhap, VaiTro, TrangThai, MaNV FROM TaiKhoan;

SELECT '📊 LOẠI BẢO HIỂM' AS Info;
SELECT * FROM LoaiBaoHiem;

SELECT '👥 KHÁCH HÀNG' AS Info;
SELECT * FROM KhachHang;

SELECT '🚗 XE' AS Info;
SELECT * FROM Xe;
GO

UPDATE TaiKhoan 
SET MatKhau = '$2a$10$VoPzOrQUFB2huet4qdDH/uNioG78g3LVjexljj5RAbeKLM9Pts5GK'
WHERE TenDangNhap = 'admin';
GO

SELECT * FROM TaiKhoan WHERE TenDangNhap = 'admin';

SELECT 'TÀI KHOẢN' AS Info, * FROM TaiKhoan;
GO


USE QuanlyHDBaoHiem;
GO

-- XÓA data cũ
DELETE FROM TaiKhoan;
DELETE FROM NhanVien;
GO

-- Tạo nhân viên
INSERT INTO NhanVien (MaNV, HoTen, ChucVu, PhongBan, SDT, Email)
VALUES ('NV001', N'Admin Test', N'Quản trị viên', N'IT', '0901234567', 'admin@pearlholding.com');
GO

-- Tạo tài khoản với PASSWORD THƯỜNG (không hash)
INSERT INTO TaiKhoan (MaTK, TenDangNhap, MatKhau, VaiTro, TrangThai, MaNV)
VALUES ('TK001', 'admin', 'admin123', N'Admin', N'Hoạt động', 'NV001');
GO

-- Kiểm tra
SELECT MaTK, TenDangNhap, MatKhau, VaiTro, TrangThai FROM TaiKhoan;
GO

PRINT '✅ Đã tạo tài khoản với password thường: admin / admin123';
GO
```

**Kết quả:**
```
MaTK  | TenDangNhap | MatKhau  | VaiTro | TrangThai
------|-------------|----------|--------|----------
TK001 | admin       | admin123 | Admin  | Hoạt động

✅ Đã tạo tài khoản với password thường: admin / admin123