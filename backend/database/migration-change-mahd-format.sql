-- ============================================
-- MIGRATION: Change MaHD Format
-- From: HD0001, HD0002, ... (simple)
-- To:   HD-20251113-0001, HD-20251113-0002, ... (professional)
-- ============================================

USE QuanlyHDBaoHiem;
GO

PRINT '========================================';
PRINT 'MIGRATION: Change MaHD Format';
PRINT 'From: HD0001 → To: HD-YYYYMMDD-XXXX';
PRINT '========================================';
PRINT '';

-- ============================================
-- STEP 1: Backup current data
-- ============================================

PRINT 'Creating backup table...';

IF OBJECT_ID('HopDong_Backup_MaHD', 'U') IS NOT NULL
    DROP TABLE HopDong_Backup_MaHD;

SELECT MaHD, NgayKy, NgayTao, TrangThai
INTO HopDong_Backup_MaHD
FROM HopDong;

DECLARE @BackupCount INT = @@ROWCOUNT;
PRINT '✓ Backed up ' + CAST(@BackupCount AS VARCHAR(10)) + ' contracts to HopDong_Backup_MaHD';
GO

-- ============================================
-- STEP 2: Drop dependent objects
-- ============================================

PRINT '';
PRINT 'Dropping dependent triggers and constraints...';

-- Drop trigger
IF OBJECT_ID('trg_AutoMaHD', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER trg_AutoMaHD;
    PRINT '✓ Dropped trigger: trg_AutoMaHD';
END

-- Drop foreign keys temporarily (will recreate later)
-- ThanhToanHopDong
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ThanhToan_HopDong')
BEGIN
    ALTER TABLE ThanhToanHopDong DROP CONSTRAINT FK_ThanhToan_HopDong;
    PRINT '✓ Dropped FK: ThanhToanHopDong → HopDong';
END

-- HoSoThamDinh
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_HSTD_HopDong')
BEGIN
    ALTER TABLE HoSoThamDinh DROP CONSTRAINT FK_HSTD_HopDong;
    PRINT '✓ Dropped FK: HoSoThamDinh → HopDong';
END

-- HopDongRelation
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_HopDongRelation_Goc')
BEGIN
    ALTER TABLE HopDongRelation DROP CONSTRAINT FK_HopDongRelation_Goc;
    PRINT '✓ Dropped FK: HopDongRelation.MaHD_Goc → HopDong';
END

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_HopDongRelation_Moi')
BEGIN
    ALTER TABLE HopDongRelation DROP CONSTRAINT FK_HopDongRelation_Moi;
    PRINT '✓ Dropped FK: HopDongRelation.MaHD_Moi → HopDong';
END

PRINT '✓ All foreign key constraints dropped';
GO

-- ============================================
-- STEP 3: Modify MaHD column size
-- ============================================

PRINT '';
PRINT 'Resizing MaHD column...';

-- Change MaHD from VARCHAR(10) to VARCHAR(20)
ALTER TABLE HopDong
ALTER COLUMN MaHD VARCHAR(20) NOT NULL;

PRINT '✓ Changed MaHD from VARCHAR(10) to VARCHAR(20)';
GO

-- Resize foreign key columns in related tables
PRINT 'Resizing foreign key columns...';

-- ThanhToanHopDong
IF COL_LENGTH('ThanhToanHopDong', 'MaHD') IS NOT NULL
BEGIN
    ALTER TABLE ThanhToanHopDong ALTER COLUMN MaHD VARCHAR(20) NOT NULL;
    PRINT '✓ Resized ThanhToanHopDong.MaHD to VARCHAR(20)';
END

-- HoSoThamDinh
IF COL_LENGTH('HoSoThamDinh', 'MaHD') IS NOT NULL
BEGIN
    ALTER TABLE HoSoThamDinh ALTER COLUMN MaHD VARCHAR(20) NULL;
    PRINT '✓ Resized HoSoThamDinh.MaHD to VARCHAR(20)';
END

-- HopDongRelation
IF COL_LENGTH('HopDongRelation', 'MaHD_Goc') IS NOT NULL
BEGIN
    ALTER TABLE HopDongRelation ALTER COLUMN MaHD_Goc VARCHAR(20) NOT NULL;
    ALTER TABLE HopDongRelation ALTER COLUMN MaHD_Moi VARCHAR(20) NOT NULL;
    PRINT '✓ Resized HopDongRelation columns to VARCHAR(20)';
END
GO

-- ============================================
-- STEP 4: Update existing MaHD to new format
-- ============================================

PRINT '';
PRINT 'Converting existing MaHD to new format...';

-- Create temporary table to map old → new MaHD
IF OBJECT_ID('tempdb..#MaHD_Mapping', 'U') IS NOT NULL
    DROP TABLE #MaHD_Mapping;

CREATE TABLE #MaHD_Mapping (
    OldMaHD VARCHAR(10),
    NewMaHD VARCHAR(20),
    NgayKy DATE
);

-- Generate new MaHD for each contract
INSERT INTO #MaHD_Mapping (OldMaHD, NewMaHD, NgayKy)
SELECT 
    MaHD AS OldMaHD,
    'HD-' + 
    FORMAT(ISNULL(NgayKy, NgayTao), 'yyyyMMdd') + '-' + 
    RIGHT('0000' + CAST(
        ROW_NUMBER() OVER (
            PARTITION BY CONVERT(DATE, ISNULL(NgayKy, NgayTao))
            ORDER BY MaHD
        ) AS VARCHAR(4)
    ), 4) AS NewMaHD,
    ISNULL(NgayKy, NgayTao) AS NgayKy
FROM HopDong;

DECLARE @MappingCount INT = @@ROWCOUNT;
PRINT '✓ Generated ' + CAST(@MappingCount AS VARCHAR(10)) + ' new MaHD values';

-- Show sample mappings
PRINT '';
PRINT 'Sample mappings:';
SELECT TOP 5 * FROM #MaHD_Mapping ORDER BY OldMaHD;
GO

-- Update foreign key tables FIRST (before updating primary key)
PRINT '';
PRINT 'Updating foreign key references...';

-- Update ThanhToanHopDong
IF OBJECT_ID('ThanhToanHopDong', 'U') IS NOT NULL
BEGIN
    UPDATE tt
    SET tt.MaHD = m.NewMaHD
    FROM ThanhToanHopDong tt
    INNER JOIN #MaHD_Mapping m ON tt.MaHD = m.OldMaHD;
    PRINT '✓ Updated ThanhToanHopDong.MaHD: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';
END

-- Update HoSoThamDinh
IF OBJECT_ID('HoSoThamDinh', 'U') IS NOT NULL
BEGIN
    UPDATE hs
    SET hs.MaHD = m.NewMaHD
    FROM HoSoThamDinh hs
    INNER JOIN #MaHD_Mapping m ON hs.MaHD = m.OldMaHD
    WHERE hs.MaHD IS NOT NULL;
    PRINT '✓ Updated HoSoThamDinh.MaHD: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';
END

-- Update HopDongRelation
IF OBJECT_ID('HopDongRelation', 'U') IS NOT NULL
BEGIN
    UPDATE rel
    SET rel.MaHD_Goc = m.NewMaHD
    FROM HopDongRelation rel
    INNER JOIN #MaHD_Mapping m ON rel.MaHD_Goc = m.OldMaHD;
    
    UPDATE rel
    SET rel.MaHD_Moi = m.NewMaHD
    FROM HopDongRelation rel
    INNER JOIN #MaHD_Mapping m ON rel.MaHD_Moi = m.OldMaHD;
    
    PRINT '✓ Updated HopDongRelation: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows';
END
GO

-- Update primary table (HopDong) LAST
PRINT '';
PRINT 'Updating HopDong.MaHD...';

UPDATE hd
SET hd.MaHD = m.NewMaHD
FROM HopDong hd
INNER JOIN #MaHD_Mapping m ON hd.MaHD = m.OldMaHD;

DECLARE @UpdatedCount INT = @@ROWCOUNT;
PRINT '✓ Updated HopDong.MaHD: ' + CAST(@UpdatedCount AS VARCHAR(10)) + ' contracts';
GO

-- ============================================
-- STEP 5: Recreate foreign key constraints
-- ============================================

PRINT '';
PRINT 'Recreating foreign key constraints...';

-- ThanhToanHopDong
IF OBJECT_ID('ThanhToanHopDong', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ThanhToan_HopDong')
    BEGIN
        ALTER TABLE ThanhToanHopDong
        ADD CONSTRAINT FK_ThanhToan_HopDong
        FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD);
        PRINT '✓ Created FK: ThanhToanHopDong → HopDong';
    END
END

-- HoSoThamDinh
IF OBJECT_ID('HoSoThamDinh', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_HSTD_HopDong')
    BEGIN
        ALTER TABLE HoSoThamDinh
        ADD CONSTRAINT FK_HSTD_HopDong
        FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD);
        PRINT '✓ Created FK: HoSoThamDinh → HopDong';
    END
END

-- HopDongRelation
IF OBJECT_ID('HopDongRelation', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_HopDongRelation_Goc')
    BEGIN
        ALTER TABLE HopDongRelation
        ADD CONSTRAINT FK_HopDongRelation_Goc
        FOREIGN KEY (MaHD_Goc) REFERENCES HopDong(MaHD);
        PRINT '✓ Created FK: HopDongRelation.MaHD_Goc → HopDong';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_HopDongRelation_Moi')
    BEGIN
        ALTER TABLE HopDongRelation
        ADD CONSTRAINT FK_HopDongRelation_Moi
        FOREIGN KEY (MaHD_Moi) REFERENCES HopDong(MaHD);
        PRINT '✓ Created FK: HopDongRelation.MaHD_Moi → HopDong';
    END
END
GO

-- ============================================
-- STEP 6: Add CHECK constraint for format
-- ============================================

PRINT '';
PRINT 'Adding CHECK constraint for MaHD format...';

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_HopDong_MaHD_Format')
BEGIN
    ALTER TABLE HopDong
    ADD CONSTRAINT CHK_HopDong_MaHD_Format
        CHECK (MaHD LIKE 'HD-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]');
    PRINT '✓ Added CHECK constraint: CHK_HopDong_MaHD_Format (HD-YYYYMMDD-XXXX)';
END
ELSE
    PRINT '- Constraint CHK_HopDong_MaHD_Format already exists';
GO

-- ============================================
-- STEP 7: Create new trigger with new format
-- ============================================

PRINT '';
PRINT 'Creating new trigger with professional format...';

-- Drop trigger if exists (to avoid conflict)
IF OBJECT_ID('trg_AutoMaHD', 'TR') IS NOT NULL
    DROP TRIGGER trg_AutoMaHD;
GO

CREATE TRIGGER trg_AutoMaHD ON HopDong INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    
    -- Case 1: MaHD already provided (manual insert)
    INSERT INTO HopDong (
        MaHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, 
        MaKH, MaXe, MaNV, NgayTao, DaNhacTaiTuc, HinhThucThanhToan, 
        GhiChuThanhToan, MaGoi
    )
    SELECT 
        i.MaHD,
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

    -- Case 2: MaHD NULL → Auto generate with new format HD-YYYYMMDD-XXXX
    INSERT INTO HopDong (
        MaHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, 
        MaKH, MaXe, MaNV, NgayTao, DaNhacTaiTuc, HinhThucThanhToan, 
        GhiChuThanhToan, MaGoi
    )
    SELECT 
        -- Generate MaHD: HD-YYYYMMDD-XXXX
        'HD-' + FORMAT(ISNULL(i.NgayKy, GETDATE()), 'yyyyMMdd') + '-' + 
        RIGHT('0000' + CAST(
            (SELECT COUNT(*) + 1 
             FROM HopDong 
             WHERE MaHD LIKE 'HD-' + FORMAT(ISNULL(i.NgayKy, GETDATE()), 'yyyyMMdd') + '-%'
            ) AS VARCHAR(4)
        ), 4),
        i.NgayKy, 
        i.NgayHetHan, 
        ISNULL(i.TrangThai, N'Hiệu lực'), 
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
PRINT '✓ Created new trigger: trg_AutoMaHD (with HD-YYYYMMDD-XXXX format)';
GO

-- ============================================
-- STEP 8: Drop sequence (no longer needed)
-- ============================================

PRINT '';
PRINT 'Cleaning up old sequence...';

IF OBJECT_ID('seq_MaHD', 'SO') IS NOT NULL
BEGIN
    DROP SEQUENCE seq_MaHD;
    PRINT '✓ Dropped sequence: seq_MaHD (no longer needed with date-based format)';
END
ELSE
    PRINT '- Sequence seq_MaHD does not exist';
GO

-- ============================================
-- STEP 9: Test the new trigger
-- ============================================

PRINT '';
PRINT 'Testing new MaHD generation...';

BEGIN TRANSACTION;

DECLARE @TestMaKH VARCHAR(10) = (SELECT TOP 1 MaKH FROM KhachHang);
DECLARE @TestMaXe VARCHAR(10) = (SELECT TOP 1 MaXe FROM Xe);
DECLARE @TestMaGoi VARCHAR(10) = (SELECT TOP 1 MaGoi FROM GoiBaoHiem);

-- Test insert without MaHD (should auto-generate)
INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi)
VALUES (GETDATE(), DATEADD(YEAR, 1, GETDATE()), N'Hiệu lực', 5000000, @TestMaKH, @TestMaXe, @TestMaGoi);

DECLARE @TestMaHD VARCHAR(20) = (SELECT TOP 1 MaHD FROM HopDong WHERE MaKH = @TestMaKH ORDER BY NgayTao DESC);
PRINT '✓ Test MaHD generated: ' + ISNULL(@TestMaHD, 'NULL');

-- Verify format
IF @TestMaHD LIKE 'HD-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]'
    PRINT '✓ Format validation: PASSED';
ELSE
    PRINT '✗ Format validation: FAILED';

ROLLBACK TRANSACTION;
PRINT '- Test transaction rolled back';
GO

-- ============================================
-- VERIFICATION
-- ============================================

PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION: Updated Contracts';
PRINT '========================================';

-- Show updated contracts
SELECT TOP 10
    MaHD,
    NgayKy,
    NgayTao,
    TrangThai,
    PhiBaoHiem,
    MaKH,
    MaXe
FROM HopDong
ORDER BY NgayTao DESC;
GO

-- Verify all MaHD follow new format
PRINT '';
PRINT 'Verifying format compliance...';

DECLARE @InvalidCount INT = (
    SELECT COUNT(*) 
    FROM HopDong 
    WHERE MaHD NOT LIKE 'HD-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]'
);

IF @InvalidCount = 0
    PRINT '✓ All MaHD values follow the new format (HD-YYYYMMDD-XXXX)';
ELSE
    PRINT '✗ Found ' + CAST(@InvalidCount AS VARCHAR(10)) + ' invalid MaHD values!';
GO

-- Verify foreign key integrity
PRINT '';
PRINT 'Verifying foreign key integrity...';

DECLARE @OrphanPayments INT = (
    SELECT COUNT(*) 
    FROM ThanhToanHopDong tt
    LEFT JOIN HopDong hd ON tt.MaHD = hd.MaHD
    WHERE hd.MaHD IS NULL
);

DECLARE @OrphanAssessments INT = (
    SELECT COUNT(*) 
    FROM HoSoThamDinh hs
    LEFT JOIN HopDong hd ON hs.MaHD = hd.MaHD
    WHERE hs.MaHD IS NOT NULL AND hd.MaHD IS NULL
);

IF @OrphanPayments = 0 AND @OrphanAssessments = 0
    PRINT '✓ Foreign key integrity: PASSED';
ELSE
    PRINT '✗ Found orphan records: Payments=' + CAST(@OrphanPayments AS VARCHAR(10)) + 
          ', Assessments=' + CAST(@OrphanAssessments AS VARCHAR(10));
GO

PRINT '';
PRINT '✅ Migration completed successfully!';
PRINT '';
PRINT '📝 SUMMARY:';
PRINT '   - MaHD column: VARCHAR(10) → VARCHAR(20)';
PRINT '   - Format changed: HD0001 → HD-YYYYMMDD-XXXX';
PRINT '   - Trigger updated: Auto-generates professional format';
PRINT '   - Foreign keys: Updated and recreated';
PRINT '   - Backup table: HopDong_Backup_MaHD (can drop after verification)';
PRINT '';
PRINT '⚠️  NEXT STEPS:';
PRINT '   1. Update backend code to handle new MaHD format';
PRINT '   2. Update frontend displays to show new format';
PRINT '   3. Test contract creation flow end-to-end';
PRINT '   4. After verification, drop backup: DROP TABLE HopDong_Backup_MaHD;';
PRINT '';
GO
