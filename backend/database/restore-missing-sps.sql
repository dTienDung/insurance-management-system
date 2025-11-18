-- =============================================
-- RESTORE MISSING STORED PROCEDURES
-- =============================================
-- Created: 2025-11-18
-- Purpose: Tạo lại 4 SPs bị xóa do migration
-- =============================================

USE [QuanlyHDBaoHiem];
GO

PRINT '========================================';
PRINT 'RESTORING MISSING STORED PROCEDURES';
PRINT '========================================';
GO

-- =============================================
-- SP 1: sp_TaoThanhToan
-- =============================================
PRINT 'Creating: sp_TaoThanhToan...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_TaoThanhToan' AND type = 'P')
    DROP PROCEDURE sp_TaoThanhToan;
GO

CREATE PROCEDURE sp_TaoThanhToan
    @MaHD VARCHAR(20),
    @SoTien DECIMAL(18,2),
    @PhuongThuc NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaTT VARCHAR(10);
    DECLARE @PhiBaoHiem DECIMAL(18,2);
    DECLARE @TongDaThanhToan DECIMAL(18,2);
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Kiểm tra hợp đồng tồn tại
        IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = @MaHD)
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng', 16, 1);
            RETURN;
        END;
        
        -- Tạo thanh toán (trigger sẽ auto-gen MaTT)
        -- Schema: NgayGiaoDich, HinhThuc, LoaiGiaoDich (không phải PhuongThuc, NgayThanhToan)
        INSERT INTO ThanhToanHopDong (MaHD, SoTien, HinhThuc, NgayGiaoDich, TrangThai, LoaiGiaoDich)
        VALUES (@MaHD, @SoTien, @PhuongThuc, GETDATE(), N'Hoàn thành', N'Thanh toán');
        
        -- Lấy MaTT vừa tạo
        SELECT TOP 1 @MaTT = MaTT 
        FROM ThanhToanHopDong 
        WHERE MaHD = @MaHD 
        ORDER BY NgayGiaoDich DESC;
        
        -- Cập nhật trạng thái hợp đồng thành ACTIVE nếu thanh toán đủ
        SELECT @PhiBaoHiem = PhiBaoHiem FROM HopDong WHERE MaHD = @MaHD;
        
        SELECT @TongDaThanhToan = ISNULL(SUM(SoTien), 0)
        FROM ThanhToanHopDong
        WHERE MaHD = @MaHD AND TrangThai = N'Hoàn thành';
        
        IF @TongDaThanhToan >= @PhiBaoHiem
        BEGIN
            UPDATE HopDong
            SET TrangThai = N'ACTIVE'
            WHERE MaHD = @MaHD;
        END;
        
        COMMIT TRANSACTION;
        
        -- Trả về thông tin thanh toán
        SELECT @MaTT AS MaTT, @SoTien AS SoTien, @TongDaThanhToan AS TongDaThanhToan;
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
PRINT '✅ sp_TaoThanhToan created';
GO

-- =============================================
-- SP 2: sp_HoanTienHopDong
-- =============================================
PRINT 'Creating: sp_HoanTienHopDong...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_HoanTienHopDong' AND type = 'P')
    DROP PROCEDURE sp_HoanTienHopDong;
GO

CREATE PROCEDURE sp_HoanTienHopDong
    @MaHD VARCHAR(20),
    @LyDo NVARCHAR(255),
    @SoTienHoan DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaTT VARCHAR(10);
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Kiểm tra hợp đồng tồn tại
        IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = @MaHD)
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng', 16, 1);
            RETURN;
        END;
        
        -- Tạo bản ghi hoàn tiền (số tiền âm)
        INSERT INTO ThanhToanHopDong (MaHD, SoTien, HinhThuc, NgayGiaoDich, TrangThai, LoaiGiaoDich, GhiChu)
        VALUES (@MaHD, -@SoTienHoan, N'Chuyển khoản', GETDATE(), N'Hoàn thành', N'Hoàn tiền', @LyDo);
        
        SELECT TOP 1 @MaTT = MaTT 
        FROM ThanhToanHopDong 
        WHERE MaHD = @MaHD 
        ORDER BY NgayGiaoDich DESC;
        
        -- Cập nhật trạng thái hợp đồng thành HỦY
        UPDATE HopDong
        SET TrangThai = N'HỦY'
        WHERE MaHD = @MaHD;
        
        COMMIT TRANSACTION;
        
        -- Trả về thông tin hoàn tiền
        SELECT @MaTT AS MaTT, @SoTienHoan AS SoTienHoan;
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
PRINT '✅ sp_HoanTienHopDong created';
GO

-- =============================================
-- SP 3: sp_RenewHopDong
-- =============================================
PRINT 'Creating: sp_RenewHopDong...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_RenewHopDong' AND type = 'P')
    DROP PROCEDURE sp_RenewHopDong;
GO

CREATE PROCEDURE sp_RenewHopDong
    @MaHDCu VARCHAR(20),
    @NgayKyMoi DATE,
    @NgayHetHanMoi DATE,
    @PhiBaoHiemMoi DECIMAL(18,2),
    @MaNV VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaKH VARCHAR(10);
    DECLARE @MaXe VARCHAR(10);
    DECLARE @MaGoi VARCHAR(10);
    DECLARE @MaHDMoi VARCHAR(20);
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Lấy thông tin hợp đồng cũ
        SELECT @MaKH = MaKH, @MaXe = MaXe, @MaGoi = MaGoi
        FROM HopDong
        WHERE MaHD = @MaHDCu;
        
        IF @MaKH IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng cũ', 16, 1);
            RETURN;
        END;
        
        -- Tạo hợp đồng mới (trigger auto-gen MaHD)
        INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi, MaNV, NgayTao)
        VALUES (@NgayKyMoi, @NgayHetHanMoi, N'DRAFT', @PhiBaoHiemMoi, @MaKH, @MaXe, @MaGoi, @MaNV, GETDATE());
        
        -- Lấy MaHD vừa tạo
        SELECT TOP 1 @MaHDMoi = MaHD
        FROM HopDong
        WHERE MaKH = @MaKH AND MaXe = @MaXe
        ORDER BY NgayTao DESC;
        
        -- Tạo relation
        INSERT INTO HopDongRelation (MaHD_Goc, MaHD_Moi, LoaiQuanHe)
        VALUES (@MaHDCu, @MaHDMoi, N'Tái tục');
        
        COMMIT TRANSACTION;
        
        -- Trả về MaHD mới
        SELECT @MaHDMoi AS MaHD;
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
PRINT '✅ sp_RenewHopDong created';
GO

-- =============================================
-- SP 4: sp_ChuyenQuyenHopDong
-- =============================================
PRINT 'Creating: sp_ChuyenQuyenHopDong...';
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
    @MaNV VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaXe VARCHAR(10);
    DECLARE @MaGoi VARCHAR(10);
    DECLARE @MaHDMoi VARCHAR(20);
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Lấy thông tin hợp đồng cũ
        SELECT @MaXe = MaXe, @MaGoi = MaGoi
        FROM HopDong
        WHERE MaHD = @MaHDCu;
        
        IF @MaXe IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng cũ', 16, 1);
            RETURN;
        END;
        
        -- Tạo hợp đồng mới với khách hàng mới
        INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi, MaNV, NgayTao)
        VALUES (@NgayKyMoi, @NgayHetHanMoi, N'DRAFT', @PhiBaoHiemMoi, @MaKHMoi, @MaXe, @MaGoi, @MaNV, GETDATE());
        
        -- Lấy MaHD vừa tạo
        SELECT TOP 1 @MaHDMoi = MaHD
        FROM HopDong
        WHERE MaKH = @MaKHMoi AND MaXe = @MaXe
        ORDER BY NgayTao DESC;
        
        -- Tạo relation
        INSERT INTO HopDongRelation (MaHD_Goc, MaHD_Moi, LoaiQuanHe)
        VALUES (@MaHDCu, @MaHDMoi, N'Chuyển quyền');
        
        COMMIT TRANSACTION;
        
        -- Trả về MaHD mới
        SELECT @MaHDMoi AS MaHD;
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
PRINT '✅ sp_ChuyenQuyenHopDong created';
GO

-- =============================================
-- VERIFICATION
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION';
PRINT '========================================';

DECLARE @SPCount INT;
SELECT @SPCount = COUNT(*)
FROM sys.objects 
WHERE type = 'P' 
AND name IN ('sp_TaoThanhToan', 'sp_HoanTienHopDong', 'sp_RenewHopDong', 'sp_ChuyenQuyenHopDong');

IF @SPCount = 4
BEGIN
    PRINT '✅ All 4 stored procedures restored successfully!';
    
    SELECT 
        name AS StoredProcedure,
        CONVERT(varchar, create_date, 120) AS CreatedAt
    FROM sys.objects 
    WHERE type = 'P' 
    AND name IN ('sp_TaoThanhToan', 'sp_HoanTienHopDong', 'sp_RenewHopDong', 'sp_ChuyenQuyenHopDong')
    ORDER BY name;
END
ELSE
BEGIN
    PRINT '❌ Some stored procedures failed to create!';
    PRINT 'Created: ' + CAST(@SPCount AS VARCHAR) + '/4';
END;

PRINT '';
PRINT '========================================';
PRINT 'RESTORE COMPLETED';
PRINT '========================================';
GO
