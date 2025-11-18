✅ AuditLog (table)
✅ HoSo_XeSnapshot (table)
✅ trg_AuditLog_Xe (trigger)
✅ trg_AuditLog_KhachHang (trigger)
✅ sp_CreateSnapshot (SP helper)
✅ sp_LapHopDong_TuHoSo (SP quan trọng nhất - đã fix theo schema thực tế)-- =============================================
-- PHASE 0: CRITICAL FIXES - MISSING DATABASE OBJECTS
-- =============================================
-- Created: 2025-11-18
-- Purpose: Tạo các Stored Procedures và bảng còn thiếu
--          để hệ thống hoạt động được
-- =============================================

USE [QuanlyHDBaoHiem];
GO

PRINT '========================================';
PRINT 'PHASE 0: CRITICAL FIXES';
PRINT 'Starting at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
GO

-- =============================================
-- PART 1: TẠO BẢNG AUDITLOG
-- =============================================
PRINT 'Creating table: AuditLog...';
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE [dbo].[AuditLog] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [TableName] NVARCHAR(50) NOT NULL,
        [RecordID] NVARCHAR(20) NOT NULL,
        [Action] NVARCHAR(20) NOT NULL, -- INSERT/UPDATE/DELETE
        [FieldName] NVARCHAR(50),
        [OldValue] NVARCHAR(MAX),
        [NewValue] NVARCHAR(MAX),
        [ChangedBy] NVARCHAR(100),
        [ChangedAt] DATETIME DEFAULT GETDATE(),
        [IPAddress] NVARCHAR(50),
        [UserAgent] NVARCHAR(500),
        [ChangeReason] NVARCHAR(500) -- Lý do thay đổi (rule 6.2)
    );

    CREATE INDEX IX_Audit_Table_Record ON [dbo].[AuditLog](TableName, RecordID);
    CREATE INDEX IX_Audit_ChangedBy ON [dbo].[AuditLog](ChangedBy);
    CREATE INDEX IX_Audit_Date ON [dbo].[AuditLog](ChangedAt DESC);
    
    PRINT '✅ Table AuditLog created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ Table AuditLog already exists - skipping';
END
GO

-- =============================================
-- PART 2: TẠO BẢNG HOSO_XESNAPSHOT
-- =============================================
PRINT 'Creating table: HoSo_XeSnapshot...';
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HoSo_XeSnapshot')
BEGIN
    CREATE TABLE [dbo].[HoSo_XeSnapshot] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [MaHS] VARCHAR(10) NOT NULL UNIQUE,
        
        -- Snapshot đầy đủ thông tin xe (theo schema thực tế của bảng Xe)
        [MaXe] VARCHAR(10) NOT NULL,
        [BienSo] VARCHAR(15),                    -- từ BienSoXe
        [HangXe] NVARCHAR(30),                   -- ✅ FIXED: 30 thay vì 50
        [LoaiXe] NVARCHAR(30),                   -- ✅ FIXED: 30 thay vì 50
        [NamSX] INT,
        [GiaTriXe] DECIMAL(18,0),
        [MucDichSuDung] NVARCHAR(20),            -- ✅ FIXED: 20 thay vì 50
        [TinhTrangKT] NVARCHAR(12),              -- ✅ FIXED: 12 thay vì 100
        [TanSuatNam] INT,
        [TanSuatBaoDuong] NVARCHAR(20),          -- ✅ FIXED: 20 thay vì 50
        [SoKhung_VIN] VARCHAR(17),
        [SoMay] VARCHAR(20),                     -- ✅ FIXED: 20 thay vì 50
        
        -- Snapshot thông tin khách hàng (theo schema thực tế của bảng KhachHang)
        [TenKH] NVARCHAR(60),                    -- ✅ FIXED: HoTen là 60
        [NgaySinhKH] DATE,
        [CMND_CCCD] VARCHAR(12),
        
        -- Metadata
        [NgayChupAnh] DATETIME DEFAULT GETDATE(),
        
        CONSTRAINT FK_Snapshot_HoSo 
            FOREIGN KEY (MaHS) 
            REFERENCES HoSoThamDinh(MaHS)
    );

    CREATE INDEX IX_Snapshot_MaHS ON [dbo].[HoSo_XeSnapshot](MaHS);
    CREATE INDEX IX_Snapshot_MaXe ON [dbo].[HoSo_XeSnapshot](MaXe);
    
    PRINT '✅ Table HoSo_XeSnapshot created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ Table HoSo_XeSnapshot already exists - skipping';
END
GO

-- =============================================
-- PART 3: STORED PROCEDURE - sp_TinhDiemThamDinh
-- =============================================
PRINT 'Creating SP: sp_TinhDiemThamDinh...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_TinhDiemThamDinh' AND type = 'P')
    DROP PROCEDURE sp_TinhDiemThamDinh;
GO

CREATE PROCEDURE sp_TinhDiemThamDinh
    @MaHS VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TongDiem INT = 0;
    DECLARE @RiskLevel NVARCHAR(20);
    DECLARE @MaXe VARCHAR(10);
    DECLARE @NamSX INT;
    DECLARE @GiaTriXe DECIMAL(18,0);
    DECLARE @TanSuatNam INT;
    
    -- Lấy thông tin xe
    SELECT @MaXe = MaXe FROM HoSoThamDinh WHERE MaHS = @MaHS;
    
    SELECT 
        @NamSX = NamSX,
        @GiaTriXe = GiaTriXe,
        @TanSuatNam = TanSuatNam
    FROM Xe 
    WHERE MaXe = @MaXe;
    
    -- Tính điểm theo ma trận thẩm định
    DECLARE @Diem INT;
    DECLARE @TieuChi NVARCHAR(80);
    DECLARE @DieuKien NVARCHAR(50);
    DECLARE @MaTieuChi INT;
    
    -- Xóa chi tiết cũ nếu có
    DELETE FROM HoSoThamDinh_ChiTiet WHERE MaHS = @MaHS;
    
    -- Cursor để duyệt qua các tiêu chí
    DECLARE criteria_cursor CURSOR FOR
    SELECT ID, TieuChi, DieuKien, Diem
    FROM MaTranThamDinh
    ORDER BY ID;
    
    OPEN criteria_cursor;
    FETCH NEXT FROM criteria_cursor INTO @MaTieuChi, @TieuChi, @DieuKien, @Diem;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @ApDung BIT = 0;
        DECLARE @GiaTri NVARCHAR(100) = '';
        
        -- Đánh giá điều kiện
        IF @TieuChi LIKE N'%Tuổi xe%'
        BEGIN
            DECLARE @TuoiXe INT = YEAR(GETDATE()) - @NamSX;
            SET @GiaTri = CAST(@TuoiXe AS NVARCHAR(10)) + N' năm';
            
            IF @DieuKien LIKE N'%>%'
            BEGIN
                DECLARE @Threshold INT = CAST(REPLACE(REPLACE(@DieuKien, '>', ''), ' ', '') AS INT);
                IF @TuoiXe > @Threshold SET @ApDung = 1;
            END
            ELSE IF @DieuKien LIKE N'%<%'
            BEGIN
                SET @Threshold = CAST(REPLACE(REPLACE(@DieuKien, '<', ''), ' ', '') AS INT);
                IF @TuoiXe < @Threshold SET @ApDung = 1;
            END
        END
        
        IF @TieuChi LIKE N'%Giá trị%'
        BEGIN
            SET @GiaTri = FORMAT(@GiaTriXe, 'N0') + N' VNĐ';
            
            IF @DieuKien LIKE N'%>%'
            BEGIN
                SET @Threshold = CAST(REPLACE(REPLACE(REPLACE(@DieuKien, '>', ''), ' ', ''), N'triệu', '000000') AS DECIMAL(18,0));
                IF @GiaTriXe > @Threshold SET @ApDung = 1;
            END
        END
        
        IF @TieuChi LIKE N'%Tần suất%'
        BEGIN
            SET @GiaTri = CAST(@TanSuatNam AS NVARCHAR(10)) + N' km/năm';
            
            IF @DieuKien LIKE N'%>%'
            BEGIN
                SET @Threshold = CAST(REPLACE(REPLACE(REPLACE(@DieuKien, '>', ''), ' ', ''), 'km', '') AS INT);
                IF @TanSuatNam > @Threshold SET @ApDung = 1;
            END
        END
        
        -- Lưu chi tiết thẩm định
        IF @ApDung = 1
        BEGIN
            INSERT INTO HoSoThamDinh_ChiTiet (MaHS, MaTieuChi, GiaTri, Diem)
            VALUES (@MaHS, @MaTieuChi, @GiaTri, @Diem);
            
            SET @TongDiem = @TongDiem + @Diem;
        END
        
        FETCH NEXT FROM criteria_cursor INTO @MaTieuChi, @TieuChi, @DieuKien, @Diem;
    END
    
    CLOSE criteria_cursor;
    DEALLOCATE criteria_cursor;
    
    -- Xác định RiskLevel
    IF @TongDiem < 30
        SET @RiskLevel = N'LOW';
    ELSE IF @TongDiem < 60
        SET @RiskLevel = N'MEDIUM';
    ELSE
        SET @RiskLevel = N'HIGH';
    
    -- Cập nhật kết quả vào HoSoThamDinh
    UPDATE HoSoThamDinh
    SET RiskLevel = @RiskLevel
    WHERE MaHS = @MaHS;
    
    SELECT @TongDiem AS TongDiem, @RiskLevel AS RiskLevel;
END
GO
PRINT '✅ SP sp_TinhDiemThamDinh created successfully';
GO

-- =============================================
-- PART 4: STORED PROCEDURE - sp_TaoThanhToan
-- =============================================
PRINT 'Creating SP: sp_TaoThanhToan...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_TaoThanhToan' AND type = 'P')
    DROP PROCEDURE sp_TaoThanhToan;
GO

CREATE PROCEDURE sp_TaoThanhToan
    @MaHD VARCHAR(20),
    @SoTien DECIMAL(18,2),
    @PhuongThuc NVARCHAR(30),
    @MaTTOut VARCHAR(10) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    TRY
        -- Kiểm tra hợp đồng tồn tại
        IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = @MaHD)
        BEGIN
            THROW 50001, N'Không tìm thấy hợp đồng', 1;
        END
        
        -- Tạo thanh toán (trigger sẽ auto-gen MaTT)
        INSERT INTO ThanhToanHopDong (MaHD, SoTien, PhuongThuc, NgayThanhToan, TrangThai)
        VALUES (@MaHD, @SoTien, @PhuongThuc, GETDATE(), N'Hoàn thành');
        
        -- Lấy MaTT vừa tạo
        SELECT TOP 1 @MaTTOut = MaTT 
        FROM ThanhToanHopDong 
        WHERE MaHD = @MaHD 
        ORDER BY NgayThanhToan DESC;
        
        -- Cập nhật trạng thái hợp đồng thành ACTIVE nếu thanh toán đủ
        DECLARE @PhiBaoHiem DECIMAL(18,2);
        DECLARE @TongDaThanhToan DECIMAL(18,2);
        
        SELECT @PhiBaoHiem = PhiBaoHiem FROM HopDong WHERE MaHD = @MaHD;
        
        SELECT @TongDaThanhToan = ISNULL(SUM(SoTien), 0)
        FROM ThanhToanHopDong
        WHERE MaHD = @MaHD AND TrangThai = N'Hoàn thành';
        
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
PRINT '✅ SP sp_TaoThanhToan created successfully';
GO

-- =============================================
-- PART 5: STORED PROCEDURE - sp_HoanTienHopDong
-- =============================================
PRINT 'Creating SP: sp_HoanTienHopDong...';
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
        -- Kiểm tra hợp đồng tồn tại
        IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = @MaHD)
        BEGIN
            THROW 50001, N'Không tìm thấy hợp đồng', 1;
        END
        
        -- Tạo bản ghi hoàn tiền (số tiền âm)
        INSERT INTO ThanhToanHopDong (MaHD, SoTien, PhuongThuc, NgayThanhToan, TrangThai, GhiChu)
        VALUES (@MaHD, -@SoTienHoan, N'Hoàn tiền', GETDATE(), N'Hoàn thành', @LyDo);
        
        SELECT TOP 1 @MaTTOut = MaTT 
        FROM ThanhToanHopDong 
        WHERE MaHD = @MaHD 
        ORDER BY NgayThanhToan DESC;
        
        -- Cập nhật trạng thái hợp đồng thành HỦY
        UPDATE HopDong
        SET TrangThai = N'HỦY'
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
PRINT '✅ SP sp_HoanTienHopDong created successfully';
GO

-- =============================================
-- PART 6: STORED PROCEDURE - sp_RenewHopDong
-- =============================================
PRINT 'Creating SP: sp_RenewHopDong...';
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
    BEGIN TRANSACTION;
    
    TRY
        DECLARE @MaKH VARCHAR(10);
        DECLARE @MaXe VARCHAR(10);
        DECLARE @MaGoi VARCHAR(10);
        
        -- Lấy thông tin hợp đồng cũ
        SELECT @MaKH = MaKH, @MaXe = MaXe, @MaGoi = MaGoi
        FROM HopDong
        WHERE MaHD = @MaHDCu;
        
        IF @MaKH IS NULL
        BEGIN
            THROW 50001, N'Không tìm thấy hợp đồng cũ', 1;
        END
        
        -- Tạo hợp đồng mới
        INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi, MaNV)
        VALUES (@NgayKyMoi, @NgayHetHanMoi, N'DRAFT', @PhiBaoHiemMoi, @MaKH, @MaXe, @MaGoi, @MaNV);
        
        -- Lấy MaHD vừa tạo
        SELECT TOP 1 @MaHDMoiOut = MaHD
        FROM HopDong
        WHERE MaKH = @MaKH AND MaXe = @MaXe
        ORDER BY NgayTao DESC;
        
        -- Tạo relation
        INSERT INTO HopDongRelation (MaHD_Goc, MaHD_Moi, LoaiQuanHe)
        VALUES (@MaHDCu, @MaHDMoiOut, N'Tái tục');
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_RenewHopDong created successfully';
GO

-- =============================================
-- PART 7: STORED PROCEDURE - sp_ChuyenQuyenHopDong
-- =============================================
PRINT 'Creating SP: sp_ChuyenQuyenHopDong...';
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
    BEGIN TRANSACTION;
    
    TRY
        DECLARE @MaXe VARCHAR(10);
        DECLARE @MaGoi VARCHAR(10);
        
        -- Lấy thông tin hợp đồng cũ
        SELECT @MaXe = MaXe, @MaGoi = MaGoi
        FROM HopDong
        WHERE MaHD = @MaHDCu;
        
        IF @MaXe IS NULL
        BEGIN
            THROW 50001, N'Không tìm thấy hợp đồng cũ', 1;
        END
        
        -- Tạo hợp đồng mới với khách hàng mới
        INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi, MaNV)
        VALUES (@NgayKyMoi, @NgayHetHanMoi, N'DRAFT', @PhiBaoHiemMoi, @MaKHMoi, @MaXe, @MaGoi, @MaNV);
        
        SELECT TOP 1 @MaHDMoiOut = MaHD
        FROM HopDong
        WHERE MaKH = @MaKHMoi AND MaXe = @MaXe
        ORDER BY NgayTao DESC;
        
        -- Tạo relation
        INSERT INTO HopDongRelation (MaHD_Goc, MaHD_Moi, LoaiQuanHe)
        VALUES (@MaHDCu, @MaHDMoiOut, N'Chuyển quyền');
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_ChuyenQuyenHopDong created successfully';
GO

-- =============================================
-- PART 8: STORED PROCEDURE - sp_LapHopDong_TuHoSo
-- =============================================
PRINT 'Creating SP: sp_LapHopDong_TuHoSo...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_LapHopDong_TuHoSo' AND type = 'P')
    DROP PROCEDURE sp_LapHopDong_TuHoSo;
GO

CREATE PROCEDURE sp_LapHopDong_TuHoSo
    @MaHS VARCHAR(10),
    @MaNV VARCHAR(10),
    @MaHDOut VARCHAR(20) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    TRY
        DECLARE @MaKH VARCHAR(10);
        DECLARE @MaXe VARCHAR(10);
        DECLARE @MaGoi VARCHAR(10);
        DECLARE @PhiDuKien DECIMAL(18,2);
        DECLARE @TrangThai NVARCHAR(30);
        DECLARE @NgayKy DATE = GETDATE();
        DECLARE @NgayHetHan DATE = DATEADD(YEAR, 1, @NgayKy);
        
        -- Lấy thông tin hồ sơ
        SELECT 
            @MaKH = hs.MaKH,
            @MaXe = hs.MaXe,
            @PhiDuKien = hs.PhiDuKien,
            @TrangThai = hs.TrangThai,
            @MaGoi = (SELECT TOP 1 MaGoi FROM GoiBaoHiem WHERE TrangThai = N'Hoạt động')
        FROM HoSoThamDinh hs
        WHERE hs.MaHS = @MaHS;
        
        IF @MaKH IS NULL
        BEGIN
            THROW 50001, N'Không tìm thấy hồ sơ', 1;
        END
        
        IF @TrangThai <> N'Chấp nhận'
        BEGIN
            THROW 50002, N'Hồ sơ chưa được chấp nhận', 1;
        END
        
        -- Kiểm tra đã có hợp đồng chưa
        IF EXISTS (SELECT 1 FROM HopDong WHERE MaHS = @MaHS)
        BEGIN
            THROW 50003, N'Hồ sơ này đã được tạo hợp đồng', 1;
        END
        
        -- Tạo hợp đồng
        INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi, MaNV, MaHS)
        VALUES (@NgayKy, @NgayHetHan, N'DRAFT', @PhiDuKien, @MaKH, @MaXe, @MaGoi, @MaNV, @MaHS);
        
        SELECT TOP 1 @MaHDOut = MaHD
        FROM HopDong
        WHERE MaHS = @MaHS
        ORDER BY NgayTao DESC;
        
        -- Cập nhật MaHD vào HoSoThamDinh
        UPDATE HoSoThamDinh
        SET MaHD = @MaHDOut
        WHERE MaHS = @MaHS;
        
        COMMIT TRANSACTION;
        RETURN 0;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_LapHopDong_TuHoSo created successfully';
GO

-- =============================================
-- PART 9: AUDIT TRIGGERS
-- =============================================
PRINT 'Creating audit triggers...';
GO

-- Trigger: Audit Xe
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_AuditLog_Xe')
    DROP TRIGGER trg_AuditLog_Xe;
GO

CREATE TRIGGER trg_AuditLog_Xe
ON Xe
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Chỉ log các trường sensitive
    IF UPDATE(NamSX) OR UPDATE(GiaTriXe) OR UPDATE(MucDichSuDung) OR UPDATE(LoaiXe) OR UPDATE(HangXe)
    BEGIN
        INSERT INTO AuditLog (TableName, RecordID, Action, FieldName, OldValue, NewValue, ChangedBy)
        SELECT 
            'Xe',
            i.MaXe,
            'UPDATE',
            'SensitiveFields',
            CONCAT('NamSX:', d.NamSX, ',GiaTriXe:', d.GiaTriXe, ',LoaiXe:', d.LoaiXe),
            CONCAT('NamSX:', i.NamSX, ',GiaTriXe:', i.GiaTriXe, ',LoaiXe:', i.LoaiXe),
            SUSER_SNAME()
        FROM inserted i
        INNER JOIN deleted d ON i.MaXe = d.MaXe
        WHERE 
            i.NamSX != d.NamSX OR
            ISNULL(i.GiaTriXe, 0) != ISNULL(d.GiaTriXe, 0) OR
            i.MucDichSuDung != d.MucDichSuDung OR
            i.LoaiXe != d.LoaiXe OR
            i.HangXe != d.HangXe;
    END
END
GO
PRINT '✅ Trigger trg_AuditLog_Xe created successfully';
GO

-- Trigger: Audit KhachHang
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_AuditLog_KhachHang')
    DROP TRIGGER trg_AuditLog_KhachHang;
GO

CREATE TRIGGER trg_AuditLog_KhachHang
ON KhachHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO AuditLog (TableName, RecordID, Action, FieldName, OldValue, NewValue, ChangedBy)
    SELECT 
        'KhachHang',
        i.MaKH,
        'UPDATE',
        'AllFields',
        CONCAT('HoTen:', d.HoTen, ',NgaySinh:', d.NgaySinh, ',CCCD:', d.CMND_CCCD),
        CONCAT('HoTen:', i.HoTen, ',NgaySinh:', i.NgaySinh, ',CCCD:', i.CMND_CCCD),
        SUSER_SNAME()
    FROM inserted i
    INNER JOIN deleted d ON i.MaKH = d.MaKH;
END
GO
PRINT '✅ Trigger trg_AuditLog_KhachHang created successfully';
GO

-- =============================================
-- PART 10: HELPER SP - sp_CreateSnapshot
-- =============================================
PRINT 'Creating SP: sp_CreateSnapshot...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_CreateSnapshot' AND type = 'P')
    DROP PROCEDURE sp_CreateSnapshot;
GO

CREATE PROCEDURE sp_CreateSnapshot
    @MaHS VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra đã có snapshot chưa
    IF EXISTS (SELECT 1 FROM HoSo_XeSnapshot WHERE MaHS = @MaHS)
    BEGIN
        PRINT N'⚠️ Snapshot already exists for ' + @MaHS;
        RETURN 0;
    END
    
    -- Tạo snapshot (theo cấu trúc bảng thực tế)
    INSERT INTO HoSo_XeSnapshot (
        MaHS, MaXe, BienSo, HangXe, LoaiXe, NamSX, 
        GiaTriXe, MucDichSuDung, TinhTrangKT, TanSuatNam, 
        TanSuatBaoDuong, SoKhung_VIN, SoMay,
        TenKH, NgaySinhKH, CMND_CCCD
    )
    SELECT 
        hs.MaHS,
        x.MaXe,
        bs.BienSo,
        x.HangXe,
        x.LoaiXe,
        x.NamSX,
        x.GiaTriXe,
        x.MucDichSuDung,
        x.TinhTrangKT,
        x.TanSuatNam,
        x.TanSuatBaoDuong,
        x.SoKhung_VIN,
        x.SoMay,
        kh.HoTen,
        kh.NgaySinh,
        kh.CMND_CCCD
    FROM HoSoThamDinh hs
    INNER JOIN Xe x ON hs.MaXe = x.MaXe
    INNER JOIN KhachHang kh ON hs.MaKH = kh.MaKH
    LEFT JOIN BienSoXe bs ON bs.MaKH = kh.MaKH AND bs.TrangThai = N'Hoạt động'
    WHERE hs.MaHS = @MaHS;
    
    PRINT N'✅ Snapshot created for ' + @MaHS;
END
GO
PRINT '✅ SP sp_CreateSnapshot created successfully';
GO

-- =============================================
-- VERIFICATION
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION';
PRINT '========================================';

-- Check tables
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
    PRINT '✅ Table AuditLog exists';
ELSE
    PRINT '❌ Table AuditLog MISSING!';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'HoSo_XeSnapshot')
    PRINT '✅ Table HoSo_XeSnapshot exists';
ELSE
    PRINT '❌ Table HoSo_XeSnapshot MISSING!';

-- Check SPs
DECLARE @SPCount INT;
SELECT @SPCount = COUNT(*)
FROM sys.objects 
WHERE type = 'P' 
AND name IN (
    'sp_TinhDiemThamDinh',
    'sp_TaoThanhToan',
    'sp_HoanTienHopDong',
    'sp_RenewHopDong',
    'sp_ChuyenQuyenHopDong',
    'sp_LapHopDong_TuHoSo',
    'sp_CreateSnapshot'
);

PRINT '✅ Created ' + CAST(@SPCount AS VARCHAR) + '/7 Stored Procedures';

-- Check Triggers
DECLARE @TriggerCount INT;
SELECT @TriggerCount = COUNT(*)
FROM sys.triggers
WHERE name IN ('trg_AuditLog_Xe', 'trg_AuditLog_KhachHang');

PRINT '✅ Created ' + CAST(@TriggerCount AS VARCHAR) + '/2 Audit Triggers';

PRINT '';
PRINT '========================================';
PRINT 'PHASE 0 COMPLETED!';
PRINT 'Completed at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================';
GO
