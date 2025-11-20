-- ========================================
-- INSERT TEST DATA - TIẾNG VIỆT HỢP LÝ
-- ========================================
-- Ngày tạo: 21/11/2025
-- Mục đích: Tạo dữ liệu test cho Integration Testing
-- Scope: Insert data vào các transaction tables
-- ========================================

USE QL_BaoHiemXe;
GO

-- ========================================
-- 1. INSERT KHÁCH HÀNG (5 khách hàng)
-- ========================================
PRINT N'1. Inserting Khách hàng...'

INSERT INTO KhachHang (HoTen, NgaySinh, GioiTinh, CCCD, DiaChi, SDT, Email, NgayDangKy)
VALUES 
    (N'Nguyễn Văn An', '1985-03-15', N'Nam', '001085123456', N'123 Nguyễn Huệ, Quận 1, TP.HCM', '0901234567', 'nguyenvanan@gmail.com', '2024-01-10'),
    (N'Trần Thị Bình', '1990-07-22', N'Nữ', '001090234567', N'456 Lê Lợi, Quận 3, TP.HCM', '0912345678', 'tranthibinh@gmail.com', '2024-02-15'),
    (N'Lê Hoàng Cường', '1988-11-05', N'Nam', '001088345678', N'789 Trần Hưng Đạo, Quận 5, TP.HCM', '0923456789', 'lehoangcuong@gmail.com', '2024-03-20'),
    (N'Phạm Thị Duyên', '1992-02-28', N'Nữ', '001092456789', N'321 Võ Văn Tần, Quận 3, TP.HCM', '0934567890', 'phamthiduyen@gmail.com', '2024-04-25'),
    (N'Hoàng Văn Em', '1987-09-12', N'Nam', '001087567890', N'654 Điện Biên Phủ, Quận 10, TP.HCM', '0945678901', 'hoangvanem@gmail.com', '2024-05-30');

PRINT N'   ✓ Inserted 5 khách hàng'

-- ========================================
-- 2. INSERT XE (6 xe - một số xe có nhiều chủ)
-- ========================================
PRINT N'2. Inserting Xe...'

DECLARE @MaKH1 VARCHAR(20), @MaKH2 VARCHAR(20), @MaKH3 VARCHAR(20), 
        @MaKH4 VARCHAR(20), @MaKH5 VARCHAR(20);

SELECT @MaKH1 = MaKH FROM KhachHang WHERE CCCD = '001085123456';
SELECT @MaKH2 = MaKH FROM KhachHang WHERE CCCD = '001090234567';
SELECT @MaKH3 = MaKH FROM KhachHang WHERE CCCD = '001088345678';
SELECT @MaKH4 = MaKH FROM KhachHang WHERE CCCD = '001092456789';
SELECT @MaKH5 = MaKH FROM KhachHang WHERE CCCD = '001087567890';

INSERT INTO Xe (BienSo, LoaiXe, HangXe, NamSanXuat, SoKhung, SoMay, MaKH, NgayDangKy)
VALUES 
    ('51A-12345', N'Ô tô con', 'Toyota Vios', 2020, 'MR0FB22G402345678', 'ENG2G1234567', @MaKH1, '2024-01-15'),
    ('59B-67890', N'Ô tô con', 'Honda City', 2019, 'LHGRM5850JY112233', 'ENG1R8223344', @MaKH2, '2024-02-20'),
    ('30C-11111', N'Xe tải nhỏ', 'Hyundai Porter', 2021, 'KMFHA17DPMA334455', 'ENGD4CB445566', @MaKH3, '2024-03-25'),
    ('43D-22222', N'Ô tô con', 'Mazda 3', 2022, 'JM1BM1U78M0556677', 'ENGZYM1667788', @MaKH4, '2024-04-30'),
    ('77E-33333', N'Xe tải nhỏ', 'Isuzu QKR', 2020, 'JALE5B168K7778899', 'ENG4JB1889900', @MaKH5, '2024-05-15'),
    ('92F-44444', N'Ô tô con', 'Kia Morning', 2018, 'LKNCRB1E0JU990011', 'ENGKAPPA991122', @MaKH1, '2024-06-10');

PRINT N'   ✓ Inserted 6 xe'

-- ========================================
-- 3. INSERT HỒ SƠ THẨM ĐỊNH (8 hồ sơ)
-- ========================================
PRINT N'3. Inserting Hồ sơ thẩm định...'

DECLARE @MaXe1 VARCHAR(20), @MaXe2 VARCHAR(20), @MaXe3 VARCHAR(20), 
        @MaXe4 VARCHAR(20), @MaXe5 VARCHAR(20), @MaXe6 VARCHAR(20);
DECLARE @MaGoi1 VARCHAR(20), @MaGoi2 VARCHAR(20), @MaGoi3 VARCHAR(20);

SELECT @MaXe1 = MaXe FROM Xe WHERE BienSo = '51A-12345';
SELECT @MaXe2 = MaXe FROM Xe WHERE BienSo = '59B-67890';
SELECT @MaXe3 = MaXe FROM Xe WHERE BienSo = '30C-11111';
SELECT @MaXe4 = MaXe FROM Xe WHERE BienSo = '43D-22222';
SELECT @MaXe5 = MaXe FROM Xe WHERE BienSo = '77E-33333';
SELECT @MaXe6 = MaXe FROM Xe WHERE BienSo = '92F-44444';

SELECT TOP 1 @MaGoi1 = MaGoiBaoHiem FROM GoiBaoHiem WHERE TenGoi LIKE N'%Cơ bản%';
SELECT TOP 1 @MaGoi2 = MaGoiBaoHiem FROM GoiBaoHiem WHERE TenGoi LIKE N'%Tiêu chuẩn%';
SELECT TOP 1 @MaGoi3 = MaGoiBaoHiem FROM GoiBaoHiem WHERE TenGoi LIKE N'%Cao cấp%';

-- Hồ sơ 1: Đã duyệt, rủi ro thấp
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH1, @MaXe1, @MaGoi1, '2024-01-20', N'Chấp nhận', 3, N'CHẤP NHẬN');

-- Hồ sơ 2: Đã duyệt, rủi ro trung bình
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH2, @MaXe2, @MaGoi2, '2024-02-25', N'Chấp nhận', 5, N'XEM XÉT');

-- Hồ sơ 3: Đã duyệt, xe tải
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH3, @MaXe3, @MaGoi3, '2024-03-30', N'Chấp nhận', 6, N'XEM XÉT');

-- Hồ sơ 4: Đã duyệt, rủi ro thấp
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH4, @MaXe4, @MaGoi2, '2024-05-05', N'Chấp nhận', 2, N'CHẤP NHẬN');

-- Hồ sơ 5: Đã duyệt, xe tải
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH5, @MaXe5, @MaGoi1, '2024-05-20', N'Chấp nhận', 7, N'XEM XÉT');

-- Hồ sơ 6: Đã duyệt
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH1, @MaXe6, @MaGoi1, '2024-06-15', N'Chấp nhận', 4, N'CHẤP NHẬN');

-- Hồ sơ 7: Chờ thẩm định
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH2, @MaXe2, @MaGoi3, '2024-11-20', N'Chờ thẩm định', 0, NULL);

-- Hồ sơ 8: Từ chối (rủi ro cao)
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel, LyDoTuChoi)
VALUES (@MaKH3, @MaXe3, @MaGoi3, '2024-10-10', N'Từ chối', 9, N'TỪ CHỐI', N'Xe quá tuổi, lịch sử tai nạn nhiều');

PRINT N'   ✓ Inserted 8 hồ sơ thẩm định'

-- ========================================
-- 4. INSERT CHI TIẾT THẨM ĐỊNH
-- ========================================
PRINT N'4. Inserting Chi tiết thẩm định...'

DECLARE @MaHS1 VARCHAR(20), @MaHS2 VARCHAR(20), @MaHS3 VARCHAR(20), 
        @MaHS4 VARCHAR(20), @MaHS5 VARCHAR(20), @MaHS6 VARCHAR(20);
DECLARE @MaTC1 VARCHAR(20), @MaTC2 VARCHAR(20), @MaTC3 VARCHAR(20), @MaTC4 VARCHAR(20);

-- Lấy mã hồ sơ
SELECT TOP 1 @MaHS1 = MaHS FROM HoSoThamDinh WHERE MaKH = @MaKH1 AND MaXe = @MaXe1;
SELECT TOP 1 @MaHS2 = MaHS FROM HoSoThamDinh WHERE MaKH = @MaKH2 AND MaXe = @MaXe2 AND TrangThai = N'Chấp nhận';
SELECT TOP 1 @MaHS3 = MaHS FROM HoSoThamDinh WHERE MaKH = @MaKH3 AND MaXe = @MaXe3 AND TrangThai = N'Chấp nhận';
SELECT TOP 1 @MaHS4 = MaHS FROM HoSoThamDinh WHERE MaKH = @MaKH4 AND MaXe = @MaXe4;
SELECT TOP 1 @MaHS5 = MaHS FROM HoSoThamDinh WHERE MaKH = @MaKH5 AND MaXe = @MaXe5;
SELECT TOP 1 @MaHS6 = MaHS FROM HoSoThamDinh WHERE MaKH = @MaKH1 AND MaXe = @MaXe6;

-- Lấy mã tiêu chí
SELECT TOP 1 @MaTC1 = MaTieuChi FROM TieuChiThamDinh WHERE TenTieuChi LIKE N'%Tuổi xe%';
SELECT TOP 1 @MaTC2 = MaTieuChi FROM TieuChiThamDinh WHERE TenTieuChi LIKE N'%Lịch sử%';
SELECT TOP 1 @MaTC3 = MaTieuChi FROM TieuChiThamDinh WHERE TenTieuChi LIKE N'%Loại xe%';
SELECT TOP 1 @MaTC4 = MaTieuChi FROM TieuChiThamDinh WHERE TenTieuChi LIKE N'%Kinh nghiệm%';

-- Chi tiết HS1 (Risk score = 3)
INSERT INTO ChiTietThamDinh (MaHS, MaTieuChi, MucDo, Diem)
VALUES 
    (@MaHS1, @MaTC1, N'Thấp', 1),
    (@MaHS1, @MaTC2, N'Thấp', 1),
    (@MaHS1, @MaTC3, N'Thấp', 0),
    (@MaHS1, @MaTC4, N'Thấp', 1);

-- Chi tiết HS2 (Risk score = 5)
INSERT INTO ChiTietThamDinh (MaHS, MaTieuChi, MucDo, Diem)
VALUES 
    (@MaHS2, @MaTC1, N'Trung bình', 2),
    (@MaHS2, @MaTC2, N'Trung bình', 2),
    (@MaHS2, @MaTC3, N'Thấp', 0),
    (@MaHS2, @MaTC4, N'Thấp', 1);

-- Chi tiết HS3 (Risk score = 6 - Xe tải)
INSERT INTO ChiTietThamDinh (MaHS, MaTieuChi, MucDo, Diem)
VALUES 
    (@MaHS3, @MaTC1, N'Trung bình', 2),
    (@MaHS3, @MaTC2, N'Thấp', 1),
    (@MaHS3, @MaTC3, N'Cao', 3),  -- Xe tải
    (@MaHS3, @MaTC4, N'Thấp', 0);

PRINT N'   ✓ Inserted chi tiết thẩm định'

-- ========================================
-- 5. INSERT HỢP ĐỒNG (7 hợp đồng)
-- ========================================
PRINT N'5. Inserting Hợp đồng...'

DECLARE @MaNV VARCHAR(20);
SELECT TOP 1 @MaNV = MaNV FROM NhanVien WHERE Ten LIKE N'%Admin%' OR ChucVu LIKE N'%Quản lý%';

-- HĐ1: ACTIVE - Còn dài hạn
INSERT INTO HopDong (MaHS, MaKH, MaXe, MaGoiBaoHiem, NgayKy, NgayHieuLuc, NgayHetHan, PhiBaoHiem, TrangThai, MaNV)
VALUES (@MaHS1, @MaKH1, @MaXe1, @MaGoi1, '2024-01-25', '2024-01-25', '2025-01-24', 3500000, 'ACTIVE', @MaNV);

-- HĐ2: ACTIVE - Gần hết hạn (10 ngày nữa)
INSERT INTO HopDong (MaHS, MaKH, MaXe, MaGoiBaoHiem, NgayKy, NgayHieuLuc, NgayHetHan, PhiBaoHiem, TrangThai, MaNV)
VALUES (@MaHS2, @MaKH2, @MaXe2, @MaGoi2, '2023-12-01', '2023-12-01', '2024-11-30', 4200000, 'ACTIVE', @MaNV);

-- HĐ3: ACTIVE - Xe tải
INSERT INTO HopDong (MaHS, MaKH, MaXe, MaGoiBaoHiem, NgayKy, NgayHieuLuc, NgayHetHan, PhiBaoHiem, TrangThai, MaNV)
VALUES (@MaHS3, @MaKH3, @MaXe3, @MaGoi3, '2024-04-05', '2024-04-05', '2025-04-04', 6500000, 'ACTIVE', @MaNV);

-- HĐ4: DRAFT - Chưa thanh toán
INSERT INTO HopDong (MaHS, MaKH, MaXe, MaGoiBaoHiem, NgayKy, NgayHieuLuc, NgayHetHan, PhiBaoHiem, TrangThai, MaNV)
VALUES (@MaHS4, @MaKH4, @MaXe4, @MaGoi2, '2024-11-18', NULL, NULL, 4000000, 'DRAFT', @MaNV);

-- HĐ5: PARTIAL_PAID - Thanh toán 1 phần
INSERT INTO HopDong (MaHS, MaKH, MaXe, MaGoiBaoHiem, NgayKy, NgayHieuLuc, NgayHetHan, PhiBaoHiem, TrangThai, MaNV)
VALUES (@MaHS5, @MaKH5, @MaXe5, @MaGoi1, '2024-11-10', NULL, NULL, 5000000, 'PARTIAL_PAID', @MaNV);

-- HĐ6: EXPIRED - Đã hết hạn
INSERT INTO HopDong (MaHS, MaKH, MaXe, MaGoiBaoHiem, NgayKy, NgayHieuLuc, NgayHetHan, PhiBaoHiem, TrangThai, MaNV)
VALUES (@MaHS6, @MaKH1, @MaXe6, @MaGoi1, '2023-06-20', '2023-06-20', '2024-06-19', 3200000, 'EXPIRED', @MaNV);

-- HĐ7: ACTIVE - Mới ký gần đây
DECLARE @MaHS_New VARCHAR(20);
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH2, @MaXe2, @MaGoi1, '2024-10-01', N'Chấp nhận', 3, N'CHẤP NHẬN');
SELECT @MaHS_New = SCOPE_IDENTITY();

INSERT INTO HopDong (MaHS, MaKH, MaXe, MaGoiBaoHiem, NgayKy, NgayHieuLuc, NgayHetHan, PhiBaoHiem, TrangThai, MaNV)
VALUES (@MaHS_New, @MaKH2, @MaXe2, @MaGoi1, '2024-10-10', '2024-10-10', '2025-10-09', 3500000, 'ACTIVE', @MaNV);

PRINT N'   ✓ Inserted 7 hợp đồng'

-- ========================================
-- 6. INSERT THANH TOÁN
-- ========================================
PRINT N'6. Inserting Thanh toán...'

DECLARE @MaHD1 VARCHAR(20), @MaHD2 VARCHAR(20), @MaHD3 VARCHAR(20), 
        @MaHD4 VARCHAR(20), @MaHD5 VARCHAR(20);

SELECT TOP 1 @MaHD1 = MaHD FROM HopDong WHERE TrangThai = 'ACTIVE' AND MaKH = @MaKH1 AND MaXe = @MaXe1;
SELECT TOP 1 @MaHD2 = MaHD FROM HopDong WHERE TrangThai = 'ACTIVE' AND MaKH = @MaKH2 AND NgayKy = '2023-12-01';
SELECT TOP 1 @MaHD3 = MaHD FROM HopDong WHERE TrangThai = 'ACTIVE' AND MaKH = @MaKH3;
SELECT TOP 1 @MaHD4 = MaHD FROM HopDong WHERE TrangThai = 'DRAFT';
SELECT TOP 1 @MaHD5 = MaHD FROM HopDong WHERE TrangThai = 'PARTIAL_PAID';

-- Thanh toán HĐ1 (Đầy đủ)
INSERT INTO ThanhToan (MaHD, LoaiGiaoDich, SoTien, PhuongThuc, NgayThanhToan, TrangThai, GhiChu)
VALUES (@MaHD1, N'Thu phí', 3500000, N'Chuyển khoản', '2024-01-25', N'Thành công', N'Thanh toán toàn bộ phí bảo hiểm');

-- Thanh toán HĐ2 (Đầy đủ)
INSERT INTO ThanhToan (MaHD, LoaiGiaoDich, SoTien, PhuongThuc, NgayThanhToan, TrangThai, GhiChu)
VALUES (@MaHD2, N'Thu phí', 4200000, N'Tiền mặt', '2023-12-01', N'Thành công', N'Thanh toán toàn bộ phí bảo hiểm');

-- Thanh toán HĐ3 (Chia 2 lần)
INSERT INTO ThanhToan (MaHD, LoaiGiaoDich, SoTien, PhuongThuc, NgayThanhToan, TrangThai, GhiChu)
VALUES 
    (@MaHD3, N'Thu phí', 3500000, N'Chuyển khoản', '2024-04-05', N'Thành công', N'Thanh toán đợt 1 - 50%'),
    (@MaHD3, N'Thu phí', 3000000, N'Chuyển khoản', '2024-05-05', N'Thành công', N'Thanh toán đợt 2 - còn lại');

-- Thanh toán HĐ5 (1 phần)
INSERT INTO ThanhToan (MaHD, LoaiGiaoDich, SoTien, PhuongThuc, NgayThanhToan, TrangThai, GhiChu)
VALUES (@MaHD5, N'Thu phí', 2500000, N'Tiền mặt', '2024-11-12', N'Thành công', N'Thanh toán đợt 1 - 50%');

PRINT N'   ✓ Inserted thanh toán'

-- ========================================
-- 7. INSERT QUAN HỆ HỢP ĐỒNG (Tái tục)
-- ========================================
PRINT N'7. Inserting Quan hệ hợp đồng...'

-- Tạo 1 HĐ tái tục từ HĐ6 (đã hết hạn)
DECLARE @MaHD6 VARCHAR(20), @MaHD_TaiTuc VARCHAR(20);
SELECT TOP 1 @MaHD6 = MaHD FROM HopDong WHERE TrangThai = 'EXPIRED';

-- Tạo hồ sơ mới cho tái tục
INSERT INTO HoSoThamDinh (MaKH, MaXe, MaGoiBaoHiem, NgayLap, TrangThai, RiskScore, RiskLevel)
VALUES (@MaKH1, @MaXe6, @MaGoi1, '2024-06-25', N'Chấp nhận', 3, N'CHẤP NHẬN');

DECLARE @MaHS_TaiTuc VARCHAR(20);
SELECT @MaHS_TaiTuc = SCOPE_IDENTITY();

-- Tạo HĐ tái tục
INSERT INTO HopDong (MaHS, MaKH, MaXe, MaGoiBaoHiem, NgayKy, NgayHieuLuc, NgayHetHan, PhiBaoHiem, TrangThai, MaNV)
VALUES (@MaHS_TaiTuc, @MaKH1, @MaXe6, @MaGoi1, '2024-07-01', '2024-07-01', '2025-06-30', 3300000, 'ACTIVE', @MaNV);

SELECT @MaHD_TaiTuc = SCOPE_IDENTITY();

-- Insert quan hệ
INSERT INTO QuanHeHopDong (MaHDGoc, MaHDMoi, LoaiQuanHe, NgayChuyenDoi, LyDo)
VALUES (@MaHD6, @MaHD_TaiTuc, N'Tái tục', '2024-07-01', N'Tái tục hợp đồng sau khi hết hạn');

-- Thanh toán cho HĐ tái tục
INSERT INTO ThanhToan (MaHD, LoaiGiaoDich, SoTien, PhuongThuc, NgayThanhToan, TrangThai, GhiChu)
VALUES (@MaHD_TaiTuc, N'Thu phí', 3300000, N'Chuyển khoản', '2024-07-01', N'Thành công', N'Thanh toán hợp đồng tái tục');

PRINT N'   ✓ Inserted quan hệ tái tục'

-- ========================================
-- 8. UPDATE TỔNG ĐÃ TRẢ CHO HỢP ĐỒNG
-- ========================================
PRINT N'8. Updating TongDaTra cho các hợp đồng...'

-- Update HĐ1
UPDATE HopDong 
SET TongDaTra = 3500000
WHERE MaHD = @MaHD1;

-- Update HĐ2
UPDATE HopDong 
SET TongDaTra = 4200000
WHERE MaHD = @MaHD2;

-- Update HĐ3
UPDATE HopDong 
SET TongDaTra = 6500000
WHERE MaHD = @MaHD3;

-- Update HĐ5 (partial)
UPDATE HopDong 
SET TongDaTra = 2500000
WHERE MaHD = @MaHD5;

-- Update HĐ tái tục
UPDATE HopDong 
SET TongDaTra = 3300000
WHERE MaHD = @MaHD_TaiTuc;

PRINT N'   ✓ Updated TongDaTra'

-- ========================================
-- 9. VERIFY DATA
-- ========================================
PRINT N''
PRINT N'========================================='
PRINT N'DATA SUMMARY'
PRINT N'========================================='

SELECT 
    (SELECT COUNT(*) FROM KhachHang) AS SoKhachHang,
    (SELECT COUNT(*) FROM Xe) AS SoXe,
    (SELECT COUNT(*) FROM HoSoThamDinh) AS SoHoSo,
    (SELECT COUNT(*) FROM HopDong) AS SoHopDong,
    (SELECT COUNT(*) FROM ThanhToan) AS SoGiaoDichThanhToan,
    (SELECT COUNT(*) FROM QuanHeHopDong) AS SoQuanHe;

PRINT N''
PRINT N'Hợp đồng theo trạng thái:'
SELECT 
    TrangThai,
    COUNT(*) AS SoLuong,
    SUM(PhiBaoHiem) AS TongPhiBH,
    SUM(TongDaTra) AS TongDaTra
FROM HopDong
GROUP BY TrangThai
ORDER BY TrangThai;

PRINT N''
PRINT N'========================================='
PRINT N'✅ INSERT TEST DATA COMPLETED!'
PRINT N'========================================='
PRINT N''
PRINT N'Dữ liệu đã được tạo:'
PRINT N'  ✓ 5 Khách hàng'
PRINT N'  ✓ 6 Xe'
PRINT N'  ✓ 9 Hồ sơ thẩm định'
PRINT N'  ✓ 8 Hợp đồng (ACTIVE: 5, DRAFT: 1, PARTIAL_PAID: 1, EXPIRED: 1)'
PRINT N'  ✓ Nhiều giao dịch thanh toán'
PRINT N'  ✓ 1 Quan hệ tái tục'
PRINT N''
PRINT N'Bạn có thể test các luồng:'
PRINT N'  • Lập hợp đồng từ hồ sơ đã duyệt'
PRINT N'  • Tái tục hợp đồng'
PRINT N'  • Hủy hợp đồng (hoàn phí)'
PRINT N'  • Filter theo trạng thái'
PRINT N'  • Xem báo cáo'
PRINT N''
GO
