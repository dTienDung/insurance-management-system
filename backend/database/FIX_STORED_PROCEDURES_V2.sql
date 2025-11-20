-- =============================================
-- FIX STORED PROCEDURES - VERSION 2
-- =============================================
-- Fixed SQL syntax errors
-- =============================================

USE [QuanlyHDBaoHiem];
GO

PRINT '========================================';
PRINT 'STORED PROCEDURES FIXES V2 - STARTING';
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
    
    DECLARE @PhiBaoHiem DECIMAL(18,2);
    DECLARE @TongDaThanhToan DECIMAL(18,2);
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Validate input
        IF @SoTien <= 0
        BEGIN
            RAISERROR(N'Số tiền thanh toán phải lớn hơn 0', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;
        
        -- Kiểm tra hợp đồng tồn tại
        IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = @MaHD)
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;
        
        -- Tạo thanh toán (trigger sẽ auto-gen MaTT)
        INSERT INTO ThanhToanHopDong (
            MaHD, 
            SoTien, 
            LoaiGiaoDich,
            HinhThuc,
            TrangThai
        )
        VALUES (
            @MaHD, 
            @SoTien, 
            N'THANH_TOAN',
            @HinhThuc, 
            N'THANH_CONG'
        );
        
        -- Lấy MaTT vừa tạo
        SELECT TOP 1 @MaTTOut = MaTT 
        FROM ThanhToanHopDong 
        WHERE MaHD = @MaHD 
        ORDER BY NgayGiaoDich DESC;
        
        -- Cập nhật trạng thái hợp đồng thành ACTIVE nếu thanh toán đủ
        SELECT @PhiBaoHiem = PhiBaoHiem FROM HopDong WHERE MaHD = @MaHD;
        
        SELECT @TongDaThanhToan = ISNULL(SUM(SoTien), 0)
        FROM ThanhToanHopDong
        WHERE MaHD = @MaHD 
          AND TrangThai = N'THANH_CONG'
          AND LoaiGiaoDich = N'THANH_TOAN';
        
        IF @TongDaThanhToan >= @PhiBaoHiem
        BEGIN
            UPDATE HopDong
            SET TrangThai = N'ACTIVE'
            WHERE MaHD = @MaHD;
        END;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        RETURN -1;
    END CATCH;
END;
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
    BEGIN TRY
        -- Validate input
        IF @SoTienHoan <= 0
        BEGIN
            RAISERROR(N'Số tiền hoàn phải lớn hơn 0', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;
        
        -- Kiểm tra hợp đồng tồn tại
        IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = @MaHD)
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;
        
        -- Tạo bản ghi hoàn tiền (số tiền âm)
        INSERT INTO ThanhToanHopDong (
            MaHD, 
            SoTien, 
            LoaiGiaoDich,
            HinhThuc,
            TrangThai, 
            GhiChu
        )
        VALUES (
            @MaHD, 
            -@SoTienHoan,
            N'HOAN_PHI',
            N'Hoàn tiền',
            N'THANH_CONG',
            @LyDo
        );
        
        SELECT TOP 1 @MaTTOut = MaTT 
        FROM ThanhToanHopDong 
        WHERE MaHD = @MaHD 
        ORDER BY NgayGiaoDich DESC;
        
        -- Cập nhật trạng thái hợp đồng thành CANCELLED
        UPDATE HopDong
        SET TrangThai = N'CANCELLED'
        WHERE MaHD = @MaHD;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        RETURN -1;
    END CATCH;
END;
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
    @MaHDMoiOut VARCHAR(20) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaKH VARCHAR(10);
    DECLARE @MaXe VARCHAR(10);
    DECLARE @MaGoi VARCHAR(10);
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Lấy thông tin hợp đồng cũ
        SELECT 
            @MaKH = MaKH, 
            @MaXe = MaXe, 
            @MaGoi = MaGoi
        FROM HopDong
        WHERE MaHD = @MaHDCu;
        
        IF @MaKH IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng cũ', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;
        
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
        
        -- Lấy MaHD vừa tạo và gán vào OUTPUT
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
            N'TAI_TUC'
        );
        
        -- Update trạng thái hợp đồng cũ
        UPDATE HopDong
        SET TrangThai = N'RENEWED'
        WHERE MaHD = @MaHDCu;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        RETURN -1;
    END CATCH;
END;
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
    @MaHDMoiOut VARCHAR(20) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaXe VARCHAR(10);
    DECLARE @MaGoi VARCHAR(10);
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Lấy thông tin hợp đồng cũ
        SELECT 
            @MaXe = MaXe, 
            @MaGoi = MaGoi
        FROM HopDong
        WHERE MaHD = @MaHDCu;
        
        IF @MaXe IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng cũ', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;
        
        -- Kiểm tra khách hàng mới tồn tại
        IF NOT EXISTS (SELECT 1 FROM KhachHang WHERE MaKH = @MaKHMoi)
        BEGIN
            RAISERROR(N'Không tìm thấy khách hàng mới', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;
        
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
            @MaKHMoi,
            @MaXe, 
            @MaGoi, 
            @MaNV
        );
        
        -- Lấy MaHD vừa tạo và gán vào OUTPUT
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
            N'CHUYEN_QUYEN'
        );
        
        -- Update trạng thái hợp đồng cũ
        UPDATE HopDong
        SET TrangThai = N'TRANSFERRED'
        WHERE MaHD = @MaHDCu;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        RETURN -1;
    END CATCH;
END;
GO
PRINT '✅ SP sp_ChuyenQuyenHopDong fixed successfully';
GO

-- =============================================
-- VERIFICATION
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION RESULTS';
PRINT '========================================';

DECLARE @SPCount INT;

SELECT @SPCount = COUNT(*)
FROM sys.objects 
WHERE type = 'P' 
AND name IN (
    'sp_TaoThanhToan',
    'sp_HoanTienHopDong',
    'sp_RenewHopDong',
    'sp_ChuyenQuyenHopDong'
);

PRINT '✅ Fixed ' + CAST(@SPCount AS VARCHAR) + '/4 Stored Procedures';

PRINT '';
PRINT '========================================';
PRINT 'STORED PROCEDURES FIXES COMPLETED!';
PRINT '========================================';
GO
