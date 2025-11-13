-- Tạo tài khoản Admin mặc định
-- Username: admin
-- Password: admin123

USE Insurance_Management_System;
GO

-- 1. Thêm nhân viên (nếu chưa có)
IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE MaNV = 'NV0001')
BEGIN
    SET IDENTITY_INSERT NhanVien ON;
    
    INSERT INTO NhanVien (MaNV, HoTen, ChucVu, PhongBan, SDT, Email)
    VALUES ('NV0001', N'Quản trị viên', N'Giám đốc', N'Ban Giám đốc', '0901234567', 'admin@pjico.com');
    
    SET IDENTITY_INSERT NhanVien OFF;
END
GO

-- 2. Thêm tài khoản Admin
-- Password hash cho 'admin123': $2a$10$YourHashHere
-- Bạn cần chạy: node backend/scripts/hashPassword.js để tạo hash

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'admin')
BEGIN
    -- Sử dụng hash mẫu - THAY ĐỔI NÀY bằng hash thực từ hashPassword.js
    DECLARE @HashedPassword VARCHAR(100) = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8l3h4J0G8A5j3z8z8z8z8z8z8z8z8O';
    
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, TrangThai, MaNV)
    VALUES ('admin', @HashedPassword, N'Admin', 1, 'NV0001');
END
GO

PRINT 'Admin user created successfully!';
PRINT 'Username: admin';
PRINT 'Password: admin123';
PRINT '';
PRINT 'IMPORTANT: Change the @HashedPassword value to the actual hash from hashPassword.js';
GO
