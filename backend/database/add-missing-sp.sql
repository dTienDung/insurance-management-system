-- =============================================
-- MISSING STORED PROCEDURE: sp_LapHopDong_TuHoSo
-- =============================================
-- Created: 2025-11-18
-- Purpose: Tạo hợp đồng từ hồ sơ đã được thẩm định
-- =============================================

USE [QuanlyHDBaoHiem];
GO

PRINT '========================================';
PRINT 'Creating: sp_LapHopDong_TuHoSo';
PRINT '========================================';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_LapHopDong_TuHoSo' AND type = 'P')
BEGIN
    DROP PROCEDURE sp_LapHopDong_TuHoSo;
    PRINT '⚠️ Dropped existing procedure';
END
GO

CREATE PROCEDURE sp_LapHopDong_TuHoSo
    @MaHS VARCHAR(10),
    @MaNV VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    DECLARE @MaHD VARCHAR(20);
    DECLARE @MaKH VARCHAR(10);
    DECLARE @MaXe VARCHAR(10);
    DECLARE @MaGoi VARCHAR(10);
    DECLARE @PhiDuKien DECIMAL(18,2);
    DECLARE @TrangThai NVARCHAR(30);
    DECLARE @RiskLevel NVARCHAR(20);
    DECLARE @NgayKy DATE = GETDATE();
    DECLARE @NgayHetHan DATE = DATEADD(YEAR, 1, @NgayKy);
    
    BEGIN TRY
        -- Lấy thông tin hồ sơ
        SELECT 
            @MaKH = hs.MaKH,
            @MaXe = hs.MaXe,
            @PhiDuKien = hs.PhiDuKien,
            @TrangThai = hs.TrangThai,
            @RiskLevel = hs.RiskLevel,
            @MaHD = hs.MaHD
        FROM HoSoThamDinh hs
        WHERE hs.MaHS = @MaHS;
        
        -- Kiểm tra hồ sơ tồn tại
        IF @MaKH IS NULL
        BEGIN
            THROW 50001, N'Không tìm thấy hồ sơ', 1;
        END
        
        -- Kiểm tra trạng thái hồ sơ
        IF @TrangThai NOT IN (N'Chấp nhận', N'Đã thẩm định')
        BEGIN
            THROW 50002, N'Hồ sơ chưa được duyệt hoặc đã bị từ chối', 1;
        END
        
        -- Kiểm tra RiskLevel (không tạo HĐ cho HIGH risk)
        IF @RiskLevel = 'HIGH'
        BEGIN
            THROW 50003, N'Không thể tạo hợp đồng cho hồ sơ có mức rủi ro cao (HIGH)', 1;
        END
        
        -- Kiểm tra đã có hợp đồng chưa
        IF @MaHD IS NOT NULL
        BEGIN
            THROW 50004, N'Hồ sơ này đã được tạo hợp đồng', 1;
        END
        
        -- Lấy gói bảo hiểm (GoiBaoHiem không có TrangThai, lấy gói đầu tiên)
        SELECT TOP 1 @MaGoi = MaGoi 
        FROM GoiBaoHiem 
        ORDER BY TyLePhiCoBan ASC; -- Lấy gói có phí thấp nhất làm mặc định
        
        IF @MaGoi IS NULL
        BEGIN
            THROW 50005, N'Không tìm thấy gói bảo hiểm khả dụng', 1;
        END
        
        -- Tính phí bảo hiểm nếu chưa có
        IF @PhiDuKien IS NULL OR @PhiDuKien = 0
        BEGIN
            -- Gọi SP tính phí
            EXEC sp_TinhPhiBaoHiem @MaXe = @MaXe, @MaGoi = @MaGoi;
            
            -- Lấy phí vừa tính
            SELECT @PhiDuKien = PhiDuKien 
            FROM HoSoThamDinh 
            WHERE MaHS = @MaHS;
        END
        
        -- Tạo hợp đồng (trigger sẽ auto-gen MaHD) - HopDong KHÔNG CÓ MaHS!
        INSERT INTO HopDong (
            NgayKy, 
            NgayHetHan, 
            TrangThai, 
            PhiBaoHiem, 
            MaKH, 
            MaXe, 
            MaGoi, 
            MaNV,
            NgayTao
        )
        VALUES (
            @NgayKy, 
            @NgayHetHan, 
            N'DRAFT',           -- Trạng thái ban đầu là DRAFT
            @PhiDuKien, 
            @MaKH, 
            @MaXe, 
            @MaGoi, 
            @MaNV,
            GETDATE()
        );
        
        -- Lấy MaHD vừa tạo (theo MaKH + MaXe + NgayTao mới nhất)
        SELECT TOP 1 @MaHD = MaHD
        FROM HopDong
        WHERE MaKH = @MaKH AND MaXe = @MaXe
        ORDER BY NgayTao DESC;
        
        -- Cập nhật MaHD vào HoSoThamDinh
        UPDATE HoSoThamDinh
        SET MaHD = @MaHD,
            TrangThai = N'Đã thẩm định'  -- Cập nhật trạng thái
        WHERE MaHS = @MaHS;
        
        COMMIT TRANSACTION;
        
        -- Trả về thông tin hợp đồng vừa tạo
        SELECT 
            @MaHD AS MaHD,
            @MaKH AS MaKH,
            @MaXe AS MaXe,
            @PhiDuKien AS PhiBaoHiem,
            N'DRAFT' AS TrangThai,
            @NgayKy AS NgayKy,
            @NgayHetHan AS NgayHetHan;
        
        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Re-throw error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
        RETURN -1;
    END CATCH
END
GO

-- =============================================
-- VERIFICATION
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_LapHopDong_TuHoSo' AND type = 'P')
BEGIN
    PRINT '✅ sp_LapHopDong_TuHoSo created successfully';
    
    -- Hiển thị thông tin SP
    SELECT 
        ROUTINE_NAME,
        CREATED,
        LAST_ALTERED
    FROM INFORMATION_SCHEMA.ROUTINES
    WHERE ROUTINE_NAME = 'sp_LapHopDong_TuHoSo';
END
ELSE
BEGIN
    PRINT '❌ Failed to create sp_LapHopDong_TuHoSo';
END
GO

PRINT '========================================';
PRINT 'Script completed';
PRINT '========================================';
GO
