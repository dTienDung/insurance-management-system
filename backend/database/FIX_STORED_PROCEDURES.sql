-- =============================================
-- FIX STORED PROCEDURES
-- =============================================
-- Created: 2025-11-21
-- Purpose: Fix incorrect column names and add OUTPUT params
-- Status: RUN AFTER CRITICAL_SCHEMA_FIX.sql
-- =============================================

USE [QuanlyHDBaoHiem];
GO

PRINT '========================================';
PRINT 'STORED PROCEDURES FIXES - STARTING';
PRINT 'Time: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
GO

-- =============================================
-- FIX SP 1: sp_TaoThanhToan
-- =============================================
PRINT 'Fixing SP: sp_TaoThanhToan...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_TaoThanhToan' AND type = 'P')
    DROP PROCEDURE sp_TaoThanhToan;
GO

CREATE PROCEDURE sp_TaoThanhToan
    @MaHD VARCHAR(20),
    @SoTien DECIMAL(18,2),
    @HinhThuc NVARCHAR(30),
    @MaTTOut VARCHAR(10) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    TRY
        -- Validate input
        IF @SoTien <= 0
        BEGIN
            THROW 50001, N'Số tiền thanh toán phải lớn hơn 0', 1;
        END
        
        -- Kiểm tra hợp đồng tồn tại
        IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = @MaHD)
        BEGIN
            THROW 50002, N'Không tìm thấy hợp đồng', 1;
        END
        
        -- Tạo thanh toán (trigger sẽ auto-gen MaTT)
        -- ✅ FIX: Dùng HinhThuc, NgayGiaoDich, LoaiGiaoDich, TrangThai
        INSERT INTO ThanhToanHopDong (
            MaHD, 
            SoTien, 
            LoaiGiaoDich,  -- ✅ FIXED
            HinhThuc,      -- ✅ FIXED (không phải PhuongThuc)
            TrangThai      -- ✅ FIXED
        )
        VALUES (
            @MaHD, 
            @SoTien, 
            N'THANH_TOAN',  -- ✅ FIXED
            @HinhThuc, 
            N'THANH_CONG'   -- ✅ FIXED (không phải N'Hoàn thành')
        );
        
        -- Lấy MaTT vừa tạo
        SELECT TOP 1 @MaTTOut = MaTT 
        FROM ThanhToanHopDong 
        WHERE MaHD = @MaHD 
        ORDER BY NgayGiaoDich DESC;  -- ✅ FIXED (không phải NgayThanhToan)
        
        -- Cập nhật trạng thái hợp đồng thành ACTIVE nếu thanh toán đủ
        DECLARE @PhiBaoHiem DECIMAL(18,2);
        DECLARE @TongDaThanhToan DECIMAL(18,2);
        
        SELECT @PhiBaoHiem = PhiBaoHiem FROM HopDong WHERE MaHD = @MaHD;
        
        SELECT @TongDaThanhToan = ISNULL(SUM(SoTien), 0)
        FROM ThanhToanHopDong
        WHERE MaHD = @MaHD 
          AND TrangThai = N'THANH_CONG'
          AND LoaiGiaoDich = N'THANH_TOAN';  -- ✅ FIXED: Chỉ tính giao dịch thanh toán
        
        IF @TongDaThanhToan >= @PhiBaoHiem
        BEGIN
            UPDATE HopDong
            SET TrangThai = N'ACTIVE'
            WHERE MaHD = @MaHD;
        END
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_TaoThanhToan fixed successfully';
GO

-- =============================================
-- FIX SP 2: sp_HoanTienHopDong
-- =============================================
PRINT 'Fixing SP: sp_HoanTienHopDong...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_HoanTienHopDong' AND type = 'P')
    DROP PROCEDURE sp_HoanTienHopDong;
GO

CREATE PROCEDURE sp_HoanTienHopDong
    @MaHD VARCHAR(20),
    @LyDo NVARCHAR(255),
    @SoTienHoan DECIMAL(18,2),
    @MaTTOut VARCHAR(10) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    TRY
        -- Validate input
        IF @SoTienHoan <= 0
        BEGIN
            THROW 50001, N'Số tiền hoàn phải lớn hơn 0', 1;
        END
        
        -- Kiểm tra hợp đồng tồn tại
        IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = @MaHD)
        BEGIN
            THROW 50002, N'Không tìm thấy hợp đồng', 1;
        END
        
        -- Tạo bản ghi hoàn tiền (số tiền âm)
        -- ✅ FIX: Dùng HinhThuc, NgayGiaoDich, LoaiGiaoDich
        INSERT INTO ThanhToanHopDong (
            MaHD, 
            SoTien, 
            LoaiGiaoDich,  -- ✅ FIXED
            HinhThuc,      -- ✅ FIXED
            TrangThai, 
            GhiChu
        )
        VALUES (
            @MaHD, 
            -@SoTienHoan,    -- Số âm để đánh dấu hoàn tiền
            N'HOAN_PHI',     -- ✅ FIXED
            N'Hoàn tiền',    -- ✅ FIXED
            N'THANH_CONG',   -- ✅ FIXED
            @LyDo
        );
        
        SELECT TOP 1 @MaTTOut = MaTT 
        FROM ThanhToanHopDong 
        WHERE MaHD = @MaHD 
        ORDER BY NgayGiaoDich DESC;  -- ✅ FIXED
        
        -- Cập nhật trạng thái hợp đồng thành CANCELLED
        UPDATE HopDong
        SET TrangThai = N'CANCELLED'  -- ✅ FIXED (không phải N'HỦY')
        WHERE MaHD = @MaHD;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_HoanTienHopDong fixed successfully';
GO

-- =============================================
-- FIX SP 3: sp_RenewHopDong
-- =============================================
PRINT 'Fixing SP: sp_RenewHopDong...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_RenewHopDong' AND type = 'P')
    DROP PROCEDURE sp_RenewHopDong;
GO

CREATE PROCEDURE sp_RenewHopDong
    @MaHDCu VARCHAR(20),
    @NgayKyMoi DATE,
    @NgayHetHanMoi DATE,
    @PhiBaoHiemMoi DECIMAL(18,2),
    @MaNV VARCHAR(10),
    @MaHDMoiOut VARCHAR(20) OUTPUT  -- ✅ ADDED OUTPUT param
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    TRY
        DECLARE @MaKH VARCHAR(10);
        DECLARE @MaXe VARCHAR(10);
        DECLARE @MaGoi VARCHAR(10);
        
        -- Lấy thông tin hợp đồng cũ
        SELECT 
            @MaKH = MaKH, 
            @MaXe = MaXe, 
            @MaGoi = MaGoi
        FROM HopDong
        WHERE MaHD = @MaHDCu;
        
        IF @MaKH IS NULL
        BEGIN
            THROW 50001, N'Không tìm thấy hợp đồng cũ', 1;
        END
        
        -- Tạo hợp đồng mới
        INSERT INTO HopDong (
            NgayKy, 
            NgayHetHan, 
            TrangThai, 
            PhiBaoHiem, 
            MaKH, 
            MaXe, 
            MaGoi, 
            MaNV
        )
        VALUES (
            @NgayKyMoi, 
            @NgayHetHanMoi, 
            N'DRAFT', 
            @PhiBaoHiemMoi, 
            @MaKH, 
            @MaXe, 
            @MaGoi, 
            @MaNV
        );
        
        -- ✅ FIX: Lấy MaHD vừa tạo và gán vào OUTPUT
        SELECT TOP 1 @MaHDMoiOut = MaHD
        FROM HopDong
        WHERE MaKH = @MaKH AND MaXe = @MaXe
        ORDER BY NgayTao DESC;
        
        -- Tạo relation
        INSERT INTO HopDongRelation (
            MaHD_Goc, 
            MaHD_Moi, 
            LoaiQuanHe
        )
        VALUES (
            @MaHDCu, 
            @MaHDMoiOut, 
            N'TAI_TUC'  -- ✅ FIXED (phải match với check constraint)
        );
        
        -- Update trạng thái hợp đồng cũ
        UPDATE HopDong
        SET TrangThai = N'RENEWED'
        WHERE MaHD = @MaHDCu;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_RenewHopDong fixed successfully';
GO

-- =============================================
-- FIX SP 4: sp_ChuyenQuyenHopDong
-- =============================================
PRINT 'Fixing SP: sp_ChuyenQuyenHopDong...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_ChuyenQuyenHopDong' AND type = 'P')
    DROP PROCEDURE sp_ChuyenQuyenHopDong;
GO

CREATE PROCEDURE sp_ChuyenQuyenHopDong
    @MaHDCu VARCHAR(20),
    @MaKHMoi VARCHAR(10),
    @NgayKyMoi DATE,
    @NgayHetHanMoi DATE,
    @PhiBaoHiemMoi DECIMAL(18,2),
    @MaNV VARCHAR(10),
    @MaHDMoiOut VARCHAR(20) OUTPUT  -- ✅ ADDED OUTPUT param
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    TRY
        DECLARE @MaXe VARCHAR(10);
        DECLARE @MaGoi VARCHAR(10);
        
        -- Lấy thông tin hợp đồng cũ
        SELECT 
            @MaXe = MaXe, 
            @MaGoi = MaGoi
        FROM HopDong
        WHERE MaHD = @MaHDCu;
        
        IF @MaXe IS NULL
        BEGIN
            THROW 50001, N'Không tìm thấy hợp đồng cũ', 1;
        END
        
        -- Kiểm tra khách hàng mới tồn tại
        IF NOT EXISTS (SELECT 1 FROM KhachHang WHERE MaKH = @MaKHMoi)
        BEGIN
            THROW 50002, N'Không tìm thấy khách hàng mới', 1;
        END
        
        -- Tạo hợp đồng mới với khách hàng mới
        INSERT INTO HopDong (
            NgayKy, 
            NgayHetHan, 
            TrangThai, 
            PhiBaoHiem, 
            MaKH, 
            MaXe, 
            MaGoi, 
            MaNV
        )
        VALUES (
            @NgayKyMoi, 
            @NgayHetHanMoi, 
            N'DRAFT', 
            @PhiBaoHiemMoi, 
            @MaKHMoi,  -- Khách hàng mới
            @MaXe, 
            @MaGoi, 
            @MaNV
        );
        
        -- ✅ FIX: Lấy MaHD vừa tạo và gán vào OUTPUT
        SELECT TOP 1 @MaHDMoiOut = MaHD
        FROM HopDong
        WHERE MaKH = @MaKHMoi AND MaXe = @MaXe
        ORDER BY NgayTao DESC;
        
        -- Tạo relation
        INSERT INTO HopDongRelation (
            MaHD_Goc, 
            MaHD_Moi, 
            LoaiQuanHe
        )
        VALUES (
            @MaHDCu, 
            @MaHDMoiOut, 
            N'CHUYEN_QUYEN'  -- ✅ FIXED
        );
        
        -- Update trạng thái hợp đồng cũ
        UPDATE HopDong
        SET TrangThai = N'TRANSFERRED'
        WHERE MaHD = @MaHDCu;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_ChuyenQuyenHopDong fixed successfully';
GO

-- =============================================
-- FIX SP 5: sp_LapHopDong_TuHoSo (already correct in PHASE0, just verify)
-- =============================================
PRINT 'Verifying SP: sp_LapHopDong_TuHoSo...';
GO

-- This SP is already correct in PHASE0_CRITICAL_FIX.sql
-- Just verify it exists with OUTPUT param

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_LapHopDong_TuHoSo' AND type = 'P')
BEGIN
    -- Check if it has OUTPUT parameter
    DECLARE @HasOutput INT;
    SELECT @HasOutput = COUNT(*)
    FROM sys.parameters
    WHERE object_id = OBJECT_ID('sp_LapHopDong_TuHoSo')
      AND parameter_name = '@MaHDOut'
      AND is_output = 1;
    
    IF @HasOutput > 0
        PRINT '✅ SP sp_LapHopDong_TuHoSo has correct OUTPUT parameter';
    ELSE
        PRINT '⚠️ WARNING: SP sp_LapHopDong_TuHoSo missing OUTPUT parameter - run PHASE0_CRITICAL_FIX.sql';
END
ELSE
BEGIN
    PRINT '❌ ERROR: SP sp_LapHopDong_TuHoSo not found - run PHASE0_CRITICAL_FIX.sql first!';
END
GO

-- =============================================
-- VERIFICATION
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION RESULTS';
PRINT '========================================';

DECLARE @SPCount INT;

-- Count fixed SPs
SELECT @SPCount = COUNT(*)
FROM sys.objects 
WHERE type = 'P' 
AND name IN (
    'sp_TaoThanhToan',
    'sp_HoanTienHopDong',
    'sp_RenewHopDong',
    'sp_ChuyenQuyenHopDong',
    'sp_LapHopDong_TuHoSo'
);

PRINT '✅ Found ' + CAST(@SPCount AS VARCHAR) + '/5 Stored Procedures';

IF @SPCount = 5
    PRINT '✅ ALL STORED PROCEDURES READY';
ELSE
    PRINT '⚠️ WARNING: Some stored procedures are missing!';

PRINT '';
PRINT '========================================';
PRINT 'STORED PROCEDURES FIXES COMPLETED!';
PRINT 'Time: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
PRINT '';
PRINT 'NEXT STEPS:';
PRINT '1. Fix controllers (hosoController.js, contractController.js)';
PRINT '2. Run integration tests';
PRINT '3. Deploy to staging environment';
GO
