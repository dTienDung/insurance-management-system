-- =============================================
-- Script: Cập nhật trigger trg_AutoMaXe để hỗ trợ SoKhung_VIN và SoMay
-- Ngày: 2025-11-13
-- Mô tả: Thêm SoKhung_VIN và SoMay vào INSERT statement trong trigger
-- =============================================

USE [QuanlyHDBaoHiem];
GO

-- Xóa trigger cũ
DROP TRIGGER IF EXISTS [dbo].[trg_AutoMaXe];
GO

-- Tạo lại trigger với field mới
CREATE TRIGGER [dbo].[trg_AutoMaXe] ON [dbo].[Xe] INSTEAD OF INSERT AS
BEGIN
    SET NOCOUNT ON;
    
    -- Case 1: MaXe đã có (INSERT với MaXe cụ thể)
    INSERT INTO Xe (
        MaXe, HangXe, LoaiXe, NamSX, GiaTriXe, 
        MucDichSuDung, TinhTrangKT, TanSuatNam, TanSuatBaoDuong,
        SoKhung_VIN, SoMay
    )
    SELECT 
        i.MaXe, i.HangXe, i.LoaiXe, i.NamSX, i.GiaTriXe, 
        i.MucDichSuDung, i.TinhTrangKT, i.TanSuatNam, i.TanSuatBaoDuong,
        i.SoKhung_VIN, i.SoMay
    FROM inserted i 
    WHERE i.MaXe IS NOT NULL;

    -- Case 2: MaXe NULL → Auto generate từ sequence
    INSERT INTO Xe (
        MaXe, HangXe, LoaiXe, NamSX, GiaTriXe, 
        MucDichSuDung, TinhTrangKT, TanSuatNam, TanSuatBaoDuong,
        SoKhung_VIN, SoMay
    )
    SELECT 
        'XE' + RIGHT('0000' + CAST(NEXT VALUE FOR seq_MaXe AS VARCHAR(10)), 4),
        i.HangXe, i.LoaiXe, i.NamSX, i.GiaTriXe, 
        i.MucDichSuDung, i.TinhTrangKT, i.TanSuatNam, i.TanSuatBaoDuong,
        i.SoKhung_VIN, i.SoMay
    FROM inserted i 
    WHERE i.MaXe IS NULL;
END;
GO

-- Enable trigger
ALTER TABLE [dbo].[Xe] ENABLE TRIGGER [trg_AutoMaXe];
GO

PRINT N'✅ Đã cập nhật trigger trg_AutoMaXe thành công!';
PRINT N'✅ Trigger bây giờ hỗ trợ SoKhung_VIN và SoMay';
GO
