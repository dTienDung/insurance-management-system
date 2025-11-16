-- =============================================
-- FIX 3 CRITICAL BUGS - QuanlyHDBaoHiem Database
-- Date: 2025-11-16
-- =============================================

USE QuanlyHDBaoHiem;
GO

PRINT '========================================';
PRINT 'BẮT ĐẦU SỬA 3 LỖI NGHIÊM TRỌNG';
PRINT '========================================';
GO

-- =============================================
-- LỖI 1: sp_TaoHopDong gọi sp_TinhPhiBaoHiem sai tham số
-- =============================================
PRINT '';
PRINT 'LỖI 1: Sửa sp_TaoHopDong - Gọi đúng tham số sp_TinhPhiBaoHiem';
GO

ALTER PROCEDURE [dbo].[sp_TaoHopDong]
    @MaHS VARCHAR(10),
    @MaGoi VARCHAR(10),
    @MaNV VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaKH VARCHAR(10);
    DECLARE @MaXe VARCHAR(10);
    DECLARE @RiskLevel NVARCHAR(20);
    DECLARE @PhiTinhToan DECIMAL(18, 2);
    DECLARE @MaHD VARCHAR(20);
    DECLARE @NgayKy DATE = GETDATE();
    DECLARE @NgayHetHan DATE;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Lấy thông tin từ HoSoThamDinh
        SELECT 
            @MaKH = MaKH,
            @MaXe = MaXe,
            @RiskLevel = RiskLevel
        FROM HoSoThamDinh
        WHERE MaHS = @MaHS;

        IF @MaKH IS NULL OR @MaXe IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy hồ sơ thẩm định hoặc thiếu thông tin khách hàng/xe', 16, 1);
            RETURN;
        END;

        -- ✅ FIX: Gọi đúng với 2 tham số thay vì 4
        EXEC [dbo].[sp_TinhPhiBaoHiem] @MaHS, @MaGoi;

        -- Lấy phí đã tính
        SELECT @PhiTinhToan = PhiDuKien 
        FROM HoSoThamDinh 
        WHERE MaHS = @MaHS;

        IF @PhiTinhToan IS NULL OR @PhiTinhToan <= 0
        BEGIN
            RAISERROR(N'Không thể tính phí bảo hiểm', 16, 1);
            RETURN;
        END;

        -- Tính ngày hết hạn (1 năm từ ngày ký)
        SET @NgayHetHan = DATEADD(YEAR, 1, @NgayKy);

        -- Insert HopDong (MaHD tự động tạo bởi trigger)
        INSERT INTO HopDong (MaKH, MaXe, MaGoi, NgayKy, NgayHetHan, PhiBaoHiem, TrangThai, MaNV, NgayTao)
        VALUES (@MaKH, @MaXe, @MaGoi, @NgayKy, @NgayHetHan, @PhiTinhToan, N'Chờ ký', @MaNV, @NgayKy);

        -- Lấy MaHD vừa tạo
        SELECT @MaHD = MaHD 
        FROM HopDong 
        WHERE MaKH = @MaKH AND MaXe = @MaXe AND NgayKy = @NgayKy AND TrangThai = N'Chờ ký';

        COMMIT TRANSACTION;

        PRINT N'✅ Tạo hợp đồng thành công: ' + @MaHD;
        SELECT @MaHD AS MaHD, @PhiTinhToan AS PhiBaoHiem;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END;
GO

PRINT '✅ LỖI 1: Đã sửa xong sp_TaoHopDong';
GO

-- =============================================
-- LỖI 2: sp_RenewHopDong - VARCHAR(10) -> VARCHAR(20)
-- =============================================
PRINT '';
PRINT 'LỖI 2: Sửa sp_RenewHopDong - Đổi kiểu dữ liệu @MaHD_Cu';
GO

ALTER PROCEDURE [dbo].[sp_RenewHopDong]
    @MaHD_Cu VARCHAR(20),  -- ✅ FIX: Đổi từ VARCHAR(10) thành VARCHAR(20)
    @MaNV_ThucHien VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaKH VARCHAR(10);
    DECLARE @MaXe VARCHAR(10);
    DECLARE @MaGoiBH VARCHAR(10);
    DECLARE @PhiBaoHiem DECIMAL(18, 2);
    DECLARE @MaHD_Moi VARCHAR(20);
    DECLARE @NgayKy DATE = GETDATE();
    DECLARE @NgayHetHan DATE;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Lấy thông tin từ hợp đồng cũ
        SELECT 
            @MaKH = MaKH,
            @MaXe = MaXe,
            @MaGoiBH = MaGoi,
            @PhiBaoHiem = PhiBaoHiem,
            @NgayHetHan = NgayHetHan
        FROM HopDong
        WHERE MaHD = @MaHD_Cu;

        IF @MaKH IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy hợp đồng cần tái tục với mã: %s', 16, 1, @MaHD_Cu);
            RETURN;
        END;

        -- Kiểm tra hợp đồng đã hết hạn chưa
        IF @NgayHetHan > GETDATE()
        BEGIN
            RAISERROR(N'Hợp đồng chưa hết hạn, không thể tái tục', 16, 1);
            RETURN;
        END;

        -- Tạo hợp đồng mới
        SET @NgayHetHan = DATEADD(YEAR, 1, @NgayKy);

        INSERT INTO HopDong (MaKH, MaXe, MaGoi, NgayKy, NgayHetHan, PhiBaoHiem, TrangThai, MaNV, NgayTao)
        VALUES (@MaKH, @MaXe, @MaGoiBH, @NgayKy, @NgayHetHan, @PhiBaoHiem, N'Chờ duyệt', @MaNV_ThucHien, @NgayKy);

        -- Lấy MaHD mới
        SELECT @MaHD_Moi = MaHD 
        FROM HopDong 
        WHERE MaKH = @MaKH AND MaXe = @MaXe AND NgayKy = @NgayKy AND TrangThai = N'Chờ duyệt';

        -- Tạo quan hệ tái tục
        INSERT INTO HopDongRelation (MaHD_Goc, MaHD_Moi, LoaiQuanHe)
        VALUES (@MaHD_Cu, @MaHD_Moi, N'TAI_TUC');

        COMMIT TRANSACTION;

        PRINT N'✅ Tái tục hợp đồng thành công';
        PRINT N'   - HĐ cũ: ' + @MaHD_Cu;
        PRINT N'   - HĐ mới: ' + @MaHD_Moi;

        SELECT @MaHD_Moi AS MaHD_Moi, @PhiBaoHiem AS PhiBaoHiem;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END;
GO

PRINT '✅ LỖI 2: Đã sửa xong sp_RenewHopDong';
GO

-- =============================================
-- LỖI 3: CHECK Constraint xung đột với Trigger
-- =============================================
PRINT '';
PRINT 'LỖI 3: Sửa CHECK constraint cho TrangThai';
GO

-- Tìm tên constraint hiện tại
DECLARE @ConstraintName NVARCHAR(200);

SELECT @ConstraintName = name
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('HopDong')
  AND definition LIKE '%TrangThai%';

IF @ConstraintName IS NOT NULL
BEGIN
    DECLARE @SQL NVARCHAR(MAX);
    SET @SQL = 'ALTER TABLE HopDong DROP CONSTRAINT ' + QUOTENAME(@ConstraintName);
    
    EXEC sp_executesql @SQL;
    PRINT N'✅ Đã xóa constraint cũ: ' + @ConstraintName;
END
ELSE
BEGIN
    PRINT N'⚠️ Không tìm thấy constraint cũ';
END;
GO

-- ✅ FIX: Tạo constraint mới với ĐẦY ĐỦ các trạng thái
ALTER TABLE HopDong ADD CONSTRAINT CHK_HopDong_TrangThai_Full
CHECK (TrangThai IN (
    -- Tiếng Việt
    N'Hiệu lực',
    N'Hết hạn',
    N'Huỷ',
    N'Đã hủy',
    N'Chờ ký',
    N'Chờ duyệt',
    -- English (cho trigger và SP)
    N'ACTIVE',
    N'PARTIAL_PAID',
    N'DRAFT',
    N'RENEWED',
    N'TRANSFERRED',
    N'EXPIRED',
    N'CANCELLED'
));
GO

PRINT '✅ LỖI 3: Đã tạo constraint mới với đầy đủ trạng thái';
GO

-- =============================================
-- KIỂM TRA KẾT QUẢ
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'KIỂM TRA KẾT QUẢ SAU KHI SỬA';
PRINT '========================================';
GO

-- Test 1: Kiểm tra sp_TaoHopDong
PRINT '';
PRINT 'TEST 1: sp_TaoHopDong';
SELECT 
    OBJECT_NAME(p.object_id) AS [Stored Procedure],
    p.name AS [Parameter],
    TYPE_NAME(p.user_type_id) AS [Type],
    p.max_length AS [Length]
FROM sys.parameters p
WHERE OBJECT_NAME(p.object_id) = 'sp_TaoHopDong'
ORDER BY p.parameter_id;
GO

-- Test 2: Kiểm tra sp_RenewHopDong
PRINT '';
PRINT 'TEST 2: sp_RenewHopDong - Kiểm tra @MaHD_Cu';
SELECT 
    p.name AS [Parameter],
    TYPE_NAME(p.user_type_id) AS [Type],
    p.max_length AS [Length],
    CASE 
        WHEN p.name = '@MaHD_Cu' AND p.max_length = 20 THEN N'✅ ĐÚNG'
        WHEN p.name = '@MaHD_Cu' AND p.max_length != 20 THEN N'❌ SAI'
        ELSE ''
    END AS [Status]
FROM sys.parameters p
WHERE OBJECT_NAME(p.object_id) = 'sp_RenewHopDong'
  AND p.name = '@MaHD_Cu';
GO

-- Test 3: Kiểm tra CHECK constraint
PRINT '';
PRINT 'TEST 3: CHECK Constraint - Danh sách trạng thái được phép';
SELECT 
    name AS [Constraint Name],
    definition AS [Allowed Values]
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('HopDong')
  AND name = 'CHK_HopDong_TrangThai_Full';
GO

PRINT '';
PRINT '========================================';
PRINT '✅ HOÀN TẤT SỬA 3 LỖI';
PRINT '========================================';
PRINT '';
PRINT 'Tóm tắt:';
PRINT '1. ✅ sp_TaoHopDong: Gọi sp_TinhPhiBaoHiem với 2 tham số';
PRINT '2. ✅ sp_RenewHopDong: @MaHD_Cu đổi thành VARCHAR(20)';
PRINT '3. ✅ CHECK constraint: Cho phép 13 trạng thái';
PRINT '';
PRINT 'Khuyến nghị:';
PRINT '- Test tạo hợp đồng mới từ assessment';
PRINT '- Test tái tục hợp đồng đã hết hạn';
PRINT '- Test thanh toán để trigger tự động set ACTIVE';
GO
