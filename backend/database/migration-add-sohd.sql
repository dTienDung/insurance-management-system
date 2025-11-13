-- ============================================
-- MIGRATION: Add SoHD (Contract Number) Support
-- Thay thế MaHD đơn giản bằng SoHD chuyên nghiệp
-- Format: HD-YYYYMMDD-XXXX
-- ============================================

USE QuanlyHDBaoHiem;
GO

PRINT '========================================';
PRINT 'MIGRATION: Add SoHD Support';
PRINT '========================================';
PRINT '';

-- ============================================
-- STEP 1: Add SoHD column
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('HopDong') AND name = 'SoHD')
BEGIN
    ALTER TABLE HopDong
    ADD SoHD VARCHAR(20) NULL;
    PRINT '✓ Added column: HopDong.SoHD VARCHAR(20)';
END
ELSE
    PRINT '- Column HopDong.SoHD already exists';
GO

-- ============================================
-- STEP 2: Generate SoHD for existing contracts
-- ============================================

PRINT '';
PRINT 'Generating SoHD for existing contracts...';

-- Update existing records with SoHD pattern: HD-YYYYMMDD-XXXX
WITH NumberedContracts AS (
    SELECT 
        MaHD,
        NgayKy,
        ROW_NUMBER() OVER (
            PARTITION BY CONVERT(DATE, ISNULL(NgayKy, NgayTao))
            ORDER BY MaHD
        ) AS RowNum
    FROM HopDong
    WHERE SoHD IS NULL
)
UPDATE nc
SET SoHD = 'HD-' + 
           FORMAT(ISNULL(nc.NgayKy, GETDATE()), 'yyyyMMdd') + '-' + 
           RIGHT('0000' + CAST(nc.RowNum AS VARCHAR(4)), 4)
FROM NumberedContracts nc
INNER JOIN HopDong hd ON nc.MaHD = hd.MaHD;

DECLARE @UpdatedCount INT = @@ROWCOUNT;
PRINT '✓ Generated SoHD for ' + CAST(@UpdatedCount AS VARCHAR(10)) + ' existing contracts';
GO

-- ============================================
-- STEP 3: Add UNIQUE constraint
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_HopDong_SoHD')
BEGIN
    ALTER TABLE HopDong
    ADD CONSTRAINT UQ_HopDong_SoHD UNIQUE (SoHD);
    PRINT '✓ Added UNIQUE constraint: UQ_HopDong_SoHD';
END
ELSE
    PRINT '- Constraint UQ_HopDong_SoHD already exists';
GO

-- ============================================
-- STEP 4: Add CHECK constraint for format
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_HopDong_SoHD_Format')
BEGIN
    ALTER TABLE HopDong
    ADD CONSTRAINT CHK_HopDong_SoHD_Format
        CHECK (SoHD IS NULL OR SoHD LIKE 'HD-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]');
    PRINT '✓ Added CHECK constraint: CHK_HopDong_SoHD_Format (HD-YYYYMMDD-XXXX)';
END
ELSE
    PRINT '- Constraint CHK_HopDong_SoHD_Format already exists';
GO

-- ============================================
-- STEP 5: Update trg_AutoMaHD trigger
-- ============================================

PRINT '';
PRINT 'Updating trigger trg_AutoMaHD to support SoHD...';

-- Drop existing trigger
IF OBJECT_ID('trg_AutoMaHD', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER trg_AutoMaHD;
    PRINT '- Dropped old trigger: trg_AutoMaHD';
END
GO

-- Create new trigger with SoHD support
CREATE TRIGGER trg_AutoMaHD ON HopDong INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    
    -- Case 1: MaHD đã có (manual insert with MaHD)
    INSERT INTO HopDong (
        MaHD, SoHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, 
        MaKH, MaXe, MaNV, NgayTao, DaNhacTaiTuc, HinhThucThanhToan, 
        GhiChuThanhToan, MaGoi
    )
    SELECT 
        i.MaHD, 
        -- Generate SoHD if not provided
        ISNULL(i.SoHD, 
            'HD-' + FORMAT(ISNULL(i.NgayKy, GETDATE()), 'yyyyMMdd') + '-' + 
            RIGHT('0000' + CAST(
                (SELECT COUNT(*) + 1 
                 FROM HopDong 
                 WHERE CONVERT(DATE, ISNULL(NgayKy, NgayTao)) = CONVERT(DATE, ISNULL(i.NgayKy, GETDATE()))
                ) AS VARCHAR(4)
            ), 4)
        ),
        i.NgayKy, 
        i.NgayHetHan, 
        i.TrangThai, 
        i.PhiBaoHiem, 
        i.MaKH, 
        i.MaXe, 
        i.MaNV, 
        i.NgayTao, 
        i.DaNhacTaiTuc, 
        i.HinhThucThanhToan, 
        i.GhiChuThanhToan, 
        i.MaGoi
    FROM inserted i 
    WHERE i.MaHD IS NOT NULL;

    -- Case 2: MaHD NULL → Auto generate both MaHD and SoHD
    INSERT INTO HopDong (
        MaHD, SoHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, 
        MaKH, MaXe, MaNV, NgayTao, DaNhacTaiTuc, HinhThucThanhToan, 
        GhiChuThanhToan, MaGoi
    )
    SELECT 
        'HD' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_MaHD AS VARCHAR(10)), 4),
        -- Auto-generate SoHD: HD-YYYYMMDD-XXXX
        'HD-' + FORMAT(ISNULL(i.NgayKy, GETDATE()), 'yyyyMMdd') + '-' + 
        RIGHT('0000' + CAST(
            (SELECT COUNT(*) + 1 
             FROM HopDong 
             WHERE CONVERT(DATE, ISNULL(NgayKy, NgayTao)) = CONVERT(DATE, ISNULL(i.NgayKy, GETDATE()))
            ) AS VARCHAR(4)
        ), 4),
        i.NgayKy, 
        i.NgayHetHan, 
        ISNULL(i.TrangThai, N'Chờ duyệt'), 
        i.PhiBaoHiem, 
        i.MaKH, 
        i.MaXe, 
        i.MaNV, 
        ISNULL(i.NgayTao, GETDATE()), 
        ISNULL(i.DaNhacTaiTuc, 0), 
        i.HinhThucThanhToan, 
        i.GhiChuThanhToan, 
        i.MaGoi
    FROM inserted i 
    WHERE i.MaHD IS NULL;
END;
GO
PRINT '✓ Created new trigger: trg_AutoMaHD (with SoHD support)';
GO

-- ============================================
-- STEP 6: Test the trigger
-- ============================================

PRINT '';
PRINT 'Testing SoHD generation...';

-- Test insert (will be rolled back)
BEGIN TRANSACTION;

DECLARE @TestMaKH VARCHAR(10) = (SELECT TOP 1 MaKH FROM KhachHang);
DECLARE @TestMaXe VARCHAR(10) = (SELECT TOP 1 MaXe FROM Xe);
DECLARE @TestMaGoi VARCHAR(10) = (SELECT TOP 1 MaGoi FROM GoiBaoHiem);

INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi)
VALUES (GETDATE(), DATEADD(YEAR, 1, GETDATE()), N'DRAFT', 5000000, @TestMaKH, @TestMaXe, @TestMaGoi);

DECLARE @TestSoHD VARCHAR(20) = (SELECT TOP 1 SoHD FROM HopDong ORDER BY NgayTao DESC);
PRINT '✓ Test SoHD generated: ' + ISNULL(@TestSoHD, 'NULL');

ROLLBACK TRANSACTION;
PRINT '- Test transaction rolled back';
GO

-- ============================================
-- VERIFICATION
-- ============================================

PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION: Contract Numbers';
PRINT '========================================';

SELECT TOP 10
    MaHD,
    SoHD,
    NgayKy,
    NgayTao,
    TrangThai,
    PhiBaoHiem
FROM HopDong
ORDER BY NgayTao DESC;
GO

PRINT '';
PRINT '✅ Migration completed successfully!';
PRINT '';
PRINT '📝 USAGE:';
PRINT '   - MaHD: Internal ID (HD0001, HD0002, ...) - for database relationships';
PRINT '   - SoHD: Professional contract number (HD-20251113-0001) - for display/reports';
PRINT '   - Format: HD-YYYYMMDD-XXXX (where XXXX is daily sequence)';
PRINT '   - Trigger automatically generates SoHD on INSERT';
PRINT '';
GO
