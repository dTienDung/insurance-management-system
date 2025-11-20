-- =============================================
-- CRITICAL SCHEMA FIXES
-- =============================================
-- Created: 2025-11-21
-- Purpose: Fix missing columns and constraints
-- Status: MUST RUN BEFORE CONTROLLERS
-- =============================================

USE [QuanlyHDBaoHiem];
GO

PRINT '========================================';
PRINT 'CRITICAL SCHEMA FIXES - STARTING';
PRINT 'Time: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
GO

-- =============================================
-- FIX 1: Add MaHS column to HopDong table
-- =============================================
PRINT 'Fix 1: Adding MaHS column to HopDong...';
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('HopDong') 
    AND name = 'MaHS'
)
BEGIN
    ALTER TABLE HopDong
    ADD MaHS VARCHAR(10) NULL;
    
    PRINT '✅ Column MaHS added to HopDong';
END
ELSE
BEGIN
    PRINT '⚠️ Column MaHS already exists - skipping';
END
GO

-- Add foreign key constraint
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_HopDong_HoSo'
)
BEGIN
    ALTER TABLE HopDong
    ADD CONSTRAINT FK_HopDong_HoSo
    FOREIGN KEY (MaHS) REFERENCES HoSoThamDinh(MaHS);
    
    PRINT '✅ Foreign key FK_HopDong_HoSo added';
END
ELSE
BEGIN
    PRINT '⚠️ Foreign key FK_HopDong_HoSo already exists - skipping';
END
GO

-- =============================================
-- FIX 2: Add TrangThai column to GoiBaoHiem
-- =============================================
PRINT 'Fix 2: Adding TrangThai column to GoiBaoHiem...';
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('GoiBaoHiem') 
    AND name = 'TrangThai'
)
BEGIN
    ALTER TABLE GoiBaoHiem
    ADD TrangThai NVARCHAR(20) DEFAULT N'Hoạt động';
    
    PRINT '✅ Column TrangThai added to GoiBaoHiem';
    
    -- Update existing rows
    UPDATE GoiBaoHiem 
    SET TrangThai = N'Hoạt động' 
    WHERE TrangThai IS NULL;
    
    PRINT '✅ Updated existing GoiBaoHiem records';
END
ELSE
BEGIN
    PRINT '⚠️ Column TrangThai already exists - skipping';
END
GO

-- =============================================
-- FIX 3: Add NgayTao column to HopDongRelation
-- =============================================
PRINT 'Fix 3: Adding NgayTao column to HopDongRelation...';
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('HopDongRelation') 
    AND name = 'NgayTao'
)
BEGIN
    ALTER TABLE HopDongRelation
    ADD NgayTao DATETIME DEFAULT GETDATE();
    
    PRINT '✅ Column NgayTao added to HopDongRelation';
    
    -- Update existing rows
    UPDATE HopDongRelation 
    SET NgayTao = GETDATE() 
    WHERE NgayTao IS NULL;
    
    PRINT '✅ Updated existing HopDongRelation records';
END
ELSE
BEGIN
    PRINT '⚠️ Column NgayTao already exists - skipping';
END
GO

-- =============================================
-- FIX 4: Update HopDong TrangThai constraint
-- =============================================
PRINT 'Fix 4: Updating HopDong TrangThai constraint...';
GO

-- Drop old constraint if exists
IF EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CK_HopDong_TrangThai_Old'
)
BEGIN
    ALTER TABLE HopDong
    DROP CONSTRAINT CK_HopDong_TrangThai_Old;
    
    PRINT '✅ Dropped old TrangThai constraint';
END
GO

-- Add new unified constraint
IF NOT EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CK_HopDong_TrangThai_Unified'
)
BEGIN
    ALTER TABLE HopDong
    ADD CONSTRAINT CK_HopDong_TrangThai_Unified
    CHECK (TrangThai IN (
        'DRAFT',        -- Nháp
        'ACTIVE',       -- Hiệu lực  
        'EXPIRED',      -- Hết hạn
        'CANCELLED',    -- Đã hủy
        'RENEWED',      -- Đã tái tục
        'TRANSFERRED',  -- Đã chuyển quyền
        -- Backward compatibility
        N'Nháp',
        N'Hiệu lực',
        N'Hết hạn',
        N'Huỷ'
    ));
    
    PRINT '✅ Added unified TrangThai constraint';
END
ELSE
BEGIN
    PRINT '⚠️ Unified TrangThai constraint already exists - skipping';
END
GO

-- =============================================
-- VERIFICATION
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION RESULTS';
PRINT '========================================';

-- Check MaHS in HopDong
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('HopDong') 
    AND name = 'MaHS'
)
    PRINT '✅ HopDong.MaHS exists';
ELSE
    PRINT '❌ HopDong.MaHS MISSING!';

-- Check TrangThai in GoiBaoHiem
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('GoiBaoHiem') 
    AND name = 'TrangThai'
)
    PRINT '✅ GoiBaoHiem.TrangThai exists';
ELSE
    PRINT '❌ GoiBaoHiem.TrangThai MISSING!';

-- Check NgayTao in HopDongRelation
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('HopDongRelation') 
    AND name = 'NgayTao'
)
    PRINT '✅ HopDongRelation.NgayTao exists';
ELSE
    PRINT '❌ HopDongRelation.NgayTao MISSING!';

PRINT '';
PRINT '========================================';
PRINT 'SCHEMA FIXES COMPLETED!';
PRINT 'Time: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
GO
