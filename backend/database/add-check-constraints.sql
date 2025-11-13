-- ============================================
-- DATABASE CHECK CONSTRAINTS
-- Đồng bộ với database schema hiện tại
-- ============================================

USE QuanlyHDBaoHiem;
GO

PRINT 'Adding CHECK constraints to ensure data integrity...';
GO

-- ============================================
-- TABLE: Xe (Vehicle)
-- ============================================

-- 1. NamSX: Match existing DB constraint (1990 to current year)
-- DB already has: CHECK (NamSX >= 1990 AND NamSX <= YEAR(GETDATE()))
PRINT '✓ Xe.NamSX: Already has constraint (1990 to current year)';
GO

-- 2. SoKhung_VIN: Must be exactly 17 characters
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Xe_VIN_Length')
BEGIN
    ALTER TABLE Xe
    ADD CONSTRAINT CHK_Xe_VIN_Length 
        CHECK (LEN(SoKhung_VIN) = 17);
    PRINT '✓ Added CHECK constraint: CHK_Xe_VIN_Length (17 chars)';
END
ELSE
    PRINT '- Constraint CHK_Xe_VIN_Length already exists';
GO

-- NOTE: DB already has UNIQUE constraint on SoKhung_VIN (UQ_Xe_SoKhung)
PRINT '✓ Xe.SoKhung_VIN: Already has UNIQUE constraint';
GO

-- ============================================
-- TABLE: HopDong (Contract)
-- ============================================

-- 3. PhiBaoHiem: Match existing DB constraint (>= 0)
-- DB already has: CHECK (PhiBaoHiem >= 0)
PRINT '✓ HopDong.PhiBaoHiem: Already has constraint (>= 0)';
GO

-- 4. TrangThai: Match existing DB constraint
-- DB already has: CHECK (TrangThai IN (N'Hiệu lực', N'Hết hạn', N'Huỷ'))
PRINT '✓ HopDong.TrangThai: Already has constraint';
GO

-- 5. HinhThucThanhToan: Match existing DB constraint
-- DB already has: CK_HopDong_HinhThucThanhToan
PRINT '✓ HopDong.HinhThucThanhToan: Already has constraint';
GO

-- ============================================
-- MaHD Format Constraint
-- ============================================

-- 6. CHECK constraint for MaHD format: HD-YYYYMMDD-XXXX
-- NOTE: Run migration-change-mahd-format.sql first to convert existing data
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_HopDong_MaHD_Format')
BEGIN
    ALTER TABLE HopDong
    ADD CONSTRAINT CHK_HopDong_MaHD_Format
        CHECK (MaHD LIKE 'HD-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]');
    PRINT '✓ Added CHECK constraint: CHK_HopDong_MaHD_Format (HD-YYYYMMDD-XXXX)';
    PRINT '  NOTE: Existing data must be migrated first!';
END
ELSE
    PRINT '- Constraint CHK_HopDong_MaHD_Format already exists';
GO

-- ============================================
-- TABLE: ThanhToanHopDong (Payment)
-- ============================================

-- 10. SoTien: ALLOW NEGATIVE (for refunds - HOAN_PHI)
-- Không thêm constraint > 0, cho phép số âm
PRINT '✓ ThanhToanHopDong.SoTien: No constraint - allows negative for refunds';
GO

-- 11. LoaiGiaoDich validation
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_TT_LoaiGiaoDich')
BEGIN
    ALTER TABLE ThanhToanHopDong
    ADD CONSTRAINT CHK_TT_LoaiGiaoDich
        CHECK (LoaiGiaoDich IN (N'THANH_TOAN', N'HOAN_PHI', N'Thanh toán', N'Hoàn phí'));
    PRINT '✓ Added CHECK constraint: CHK_TT_LoaiGiaoDich';
END
ELSE
    PRINT '- Constraint CHK_TT_LoaiGiaoDich already exists';
GO

-- ============================================
-- TABLE: KhachHang (Customer)
-- ============================================

-- 12. CMND_CCCD: Already has UNIQUE constraint
PRINT '✓ KhachHang.CMND_CCCD: Already has UNIQUE constraint';
GO

-- NOTE: Không thêm validation format cho demo mode

-- ============================================
-- TABLE: MaTranThamDinh
-- ============================================

-- 13. Diem: Match existing constraint (-5 to 5)
-- DB already has: CHECK (Diem >= -5 AND Diem <= 5)
PRINT '✓ MaTranThamDinh.Diem: Already has constraint (-5 to 5)';
GO

-- ============================================
-- TABLE: TaiKhoan
-- ============================================

-- 14. VaiTro: Match existing constraint
-- DB already has: CHECK (VaiTro IN (N'Admin', N'Nhân viên', N'Thẩm định', N'Kế toán'))
PRINT '✓ TaiKhoan.VaiTro: Already has constraint';
GO

-- ============================================
-- VERIFY CONSTRAINTS
-- ============================================

PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION: List all CHECK constraints';
PRINT '========================================';

SELECT 
    t.name AS TableName,
    c.name AS ConstraintName,
    cc.definition AS ConstraintDefinition
FROM sys.check_constraints c
INNER JOIN sys.tables t ON c.parent_object_id = t.object_id
INNER JOIN sys.check_constraints cc ON c.object_id = cc.object_id
WHERE t.name IN ('Xe', 'HopDong', 'ThanhToanHopDong', 'KhachHang', 'MaTranThamDinh', 'TaiKhoan')
ORDER BY t.name, c.name;
GO

PRINT '';
PRINT '✅ CHECK constraints setup completed!';
PRINT '';
PRINT '📝 NOTES:';
PRINT '   - HopDong.SoHD: Auto-generated with format HD-YYYYMMDD-XXXX';
PRINT '   - ThanhToanHopDong.SoTien: Allows negative values for refunds (HOAN_PHI)';
PRINT '   - Customer validation: Simplified for demo mode (no strict format checks)';
PRINT '   - NamSX: Database constraint is 1990-current year (matches frontend)';
PRINT '';
GO
