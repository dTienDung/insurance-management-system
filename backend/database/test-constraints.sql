-- ============================================
-- DATABASE CONSTRAINT TESTS
-- Test tất cả ràng buộc nghiệp vụ ở tầng database
-- Chạy file này trong SQL Server Management Studio hoặc VS Code
-- ============================================

USE QuanlyHDBaoHiem;
GO

PRINT '';
PRINT '========================================';
PRINT 'DATABASE CONSTRAINT TESTING';
PRINT 'Testing all business rules at DB level';
PRINT '========================================';
PRINT '';

-- ============================================
-- TEST 1: Xe.NamSX Constraint (>= 1990)
-- ============================================

PRINT '--- TEST 1: Xe.NamSX >= 1990 ---';
BEGIN TRY
    INSERT INTO Xe (MaXe, SoKhung_VIN, NamSX, LoaiXe, HangXe, GiaTriXe)
    VALUES ('XE_TEST_BAD_YEAR', '12345678901234567', 1980, N'Sedan', N'Toyota', 100000000);
    
    PRINT '❌ FAILED: Database accepted invalid NamSX < 1990';
    DELETE FROM Xe WHERE MaXe = 'XE_TEST_BAD_YEAR';
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected NamSX < 1990';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- TEST 2: Xe.SoKhung_VIN Length = 17
-- ============================================

PRINT '';
PRINT '--- TEST 2: Xe.SoKhung_VIN phải đúng 17 ký tự ---';
BEGIN TRY
    INSERT INTO Xe (MaXe, SoKhung_VIN, NamSX, LoaiXe, HangXe, GiaTriXe)
    VALUES ('XE_TEST_BAD_VIN', '123', 2020, N'Sedan', N'Toyota', 100000000);
    
    PRINT '❌ FAILED: Database accepted VIN with length != 17';
    DELETE FROM Xe WHERE MaXe = 'XE_TEST_BAD_VIN';
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected VIN with invalid length';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- TEST 3: Xe.SoKhung_VIN Unique Constraint
-- ============================================

PRINT '';
PRINT '--- TEST 3: Xe.SoKhung_VIN phải unique ---';
BEGIN TRY
    -- Insert first vehicle
    INSERT INTO Xe (MaXe, SoKhung_VIN, NamSX, LoaiXe, HangXe, GiaTriXe)
    VALUES ('XE_TEST_VIN_1', 'TEST_VIN_12345678', 2020, N'Sedan', N'Toyota', 100000000);
    
    -- Try to insert duplicate VIN
    INSERT INTO Xe (MaXe, SoKhung_VIN, NamSX, LoaiXe, HangXe, GiaTriXe)
    VALUES ('XE_TEST_VIN_2', 'TEST_VIN_12345678', 2021, N'SUV', N'Honda', 200000000);
    
    PRINT '❌ FAILED: Database accepted duplicate VIN';
    DELETE FROM Xe WHERE MaXe IN ('XE_TEST_VIN_1', 'XE_TEST_VIN_2');
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected duplicate VIN';
    PRINT '   Error: ' + ERROR_MESSAGE();
    DELETE FROM Xe WHERE MaXe = 'XE_TEST_VIN_1';
END CATCH;
GO

-- ============================================
-- TEST 4: HopDong.PhiBaoHiem >= 0
-- ============================================

PRINT '';
PRINT '--- TEST 4: HopDong.PhiBaoHiem >= 0 ---';
BEGIN TRY
    INSERT INTO HopDong (MaHD, SoHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi)
    VALUES ('HD_TEST_BAD_FEE', 'HD-20241119-9999', GETDATE(), DATEADD(YEAR, 1, GETDATE()), N'ACTIVE', -1000000, 'KH0001', 'XE0001', 'GOI001');
    
    PRINT '❌ FAILED: Database accepted negative PhiBaoHiem';
    DELETE FROM HopDong WHERE MaHD = 'HD_TEST_BAD_FEE';
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected negative PhiBaoHiem';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- TEST 5: HopDong.MaHD Format (HD-YYYYMMDD-XXXX)
-- ============================================

PRINT '';
PRINT '--- TEST 5: HopDong.MaHD format HD-YYYYMMDD-XXXX ---';
BEGIN TRY
    INSERT INTO HopDong (MaHD, SoHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi)
    VALUES ('INVALID_FORMAT', 'HD-20241119-9998', GETDATE(), DATEADD(YEAR, 1, GETDATE()), N'ACTIVE', 1000000, 'KH0001', 'XE0001', 'GOI001');
    
    PRINT '❌ FAILED: Database accepted invalid MaHD format';
    DELETE FROM HopDong WHERE MaHD = 'INVALID_FORMAT';
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected invalid MaHD format';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- TEST 6: ThanhToanHopDong - Allow Negative (Refund)
-- ============================================

PRINT '';
PRINT '--- TEST 6: ThanhToanHopDong cho phép số âm (hoàn phí) ---';
BEGIN TRY
    -- Lấy MaHD hợp lệ từ database
    DECLARE @TestMaHD VARCHAR(20);
    SELECT TOP 1 @TestMaHD = MaHD FROM HopDong WHERE TrangThai = N'ACTIVE';
    
    IF @TestMaHD IS NOT NULL
    BEGIN
        INSERT INTO ThanhToanHopDong (MaTT, MaHD, LoaiGiaoDich, SoTien, HinhThucThanhToan, NgayGiaoDich)
        VALUES ('TT_TEST_REFUND', @TestMaHD, N'HOAN_PHI', -500000, N'Chuyển khoản', GETDATE());
        
        PRINT '✅ PASSED: Database accepted negative SoTien for refund';
        DELETE FROM ThanhToanHopDong WHERE MaTT = 'TT_TEST_REFUND';
    END
    ELSE
    BEGIN
        PRINT '⚠️  SKIPPED: No active contract found for testing';
    END
END TRY
BEGIN CATCH
    PRINT '❌ FAILED: Database rejected negative SoTien (should allow for refund)';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- TEST 7: KhachHang.CMND_CCCD Unique
-- ============================================

PRINT '';
PRINT '--- TEST 7: KhachHang.CMND_CCCD phải unique ---';
BEGIN TRY
    -- Insert first customer
    INSERT INTO KhachHang (MaKH, HoTen, CMND_CCCD, NgaySinh, DiaChi, SDT)
    VALUES ('KH_TEST_DUP_1', N'Nguyễn Test 1', '999999999', '1990-01-01', N'Hà Nội', '0900000001');
    
    -- Try duplicate CMND
    INSERT INTO KhachHang (MaKH, HoTen, CMND_CCCD, NgaySinh, DiaChi, SDT)
    VALUES ('KH_TEST_DUP_2', N'Nguyễn Test 2', '999999999', '1985-01-01', N'TP.HCM', '0900000002');
    
    PRINT '❌ FAILED: Database accepted duplicate CMND_CCCD';
    DELETE FROM KhachHang WHERE MaKH IN ('KH_TEST_DUP_1', 'KH_TEST_DUP_2');
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected duplicate CMND_CCCD';
    PRINT '   Error: ' + ERROR_MESSAGE();
    DELETE FROM KhachHang WHERE MaKH = 'KH_TEST_DUP_1';
END CATCH;
GO

-- ============================================
-- TEST 8: MaTranThamDinh.Diem in range [-5, 5]
-- ============================================

PRINT '';
PRINT '--- TEST 8: MaTranThamDinh.Diem phải trong khoảng [-5, 5] ---';
BEGIN TRY
    INSERT INTO MaTranThamDinh (TieuChi, DieuKien, Diem)
    VALUES (N'Test Tiêu chí', N'Test điều kiện', 10);
    
    PRINT '❌ FAILED: Database accepted Diem > 5';
    DELETE FROM MaTranThamDinh WHERE TieuChi = N'Test Tiêu chí';
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected Diem > 5';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

BEGIN TRY
    INSERT INTO MaTranThamDinh (TieuChi, DieuKien, Diem)
    VALUES (N'Test Tiêu chí 2', N'Test điều kiện 2', -10);
    
    PRINT '❌ FAILED: Database accepted Diem < -5';
    DELETE FROM MaTranThamDinh WHERE TieuChi = N'Test Tiêu chí 2';
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected Diem < -5';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- TEST 9: Foreign Key Constraints
-- ============================================

PRINT '';
PRINT '--- TEST 9: Foreign Key Constraints ---';
BEGIN TRY
    INSERT INTO HopDong (MaHD, SoHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi)
    VALUES ('HD_TEST_FK', 'HD-20241119-9997', GETDATE(), DATEADD(YEAR, 1, GETDATE()), N'ACTIVE', 1000000, 'KH_NOT_EXIST', 'XE0001', 'GOI001');
    
    PRINT '❌ FAILED: Database accepted invalid foreign key (MaKH)';
    DELETE FROM HopDong WHERE MaHD = 'HD_TEST_FK';
END TRY
BEGIN CATCH
    PRINT '✅ PASSED: Database rejected invalid foreign key (MaKH)';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- TEST 10: Valid Data Insert (Positive Test)
-- ============================================

PRINT '';
PRINT '--- TEST 10: Valid Data Insert (Positive Test) ---';
BEGIN TRY
    -- Insert valid vehicle
    INSERT INTO Xe (MaXe, SoKhung_VIN, NamSX, LoaiXe, HangXe, Model, SoMay, GiaTriXe)
    VALUES ('XE_TEST_VALID', 'VALID_VIN_1234567', 2020, N'Sedan', N'Toyota', N'Camry', N'ABC123', 500000000);
    
    PRINT '✅ PASSED: Database accepted valid vehicle data';
    
    -- Cleanup
    DELETE FROM Xe WHERE MaXe = 'XE_TEST_VALID';
END TRY
BEGIN CATCH
    PRINT '❌ FAILED: Database rejected valid data';
    PRINT '   Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- SUMMARY
-- ============================================

PRINT '';
PRINT '========================================';
PRINT 'TEST SUMMARY';
PRINT '========================================';
PRINT '';
PRINT '✅ Expected Result: All constraint tests should PASS';
PRINT '✅ Valid data test should also PASS';
PRINT '';
PRINT 'If any test shows ❌ FAILED:';
PRINT '  1. Check if constraints are properly created';
PRINT '  2. Run add-check-constraints.sql';
PRINT '  3. Verify database schema';
PRINT '';
PRINT '========================================';
PRINT 'TEST COMPLETED';
PRINT '========================================';
GO
