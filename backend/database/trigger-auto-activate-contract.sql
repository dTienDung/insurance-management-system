-- =============================================
-- TRIGGER: Auto-activate Contract when fully paid
-- LUẬT 3.2: Contract Status Lifecycle - DRAFT → ACTIVE
-- Created: 2025-11-19
-- =============================================

USE [QLBaoHiemXe];
GO

-- Drop existing trigger if exists
IF OBJECT_ID('trg_AutoActivateContract', 'TR') IS NOT NULL
    DROP TRIGGER trg_AutoActivateContract;
GO

CREATE TRIGGER trg_AutoActivateContract
ON ThanhToanHopDong
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- LUẬT NGHIỆP VỤ 3.2: Tự động chuyển DRAFT → ACTIVE khi thanh toán đủ phí
    -- Logic: 
    -- 1. Khi có giao dịch thanh toán mới được INSERT
    -- 2. Tính tổng tiền đã thanh toán cho hợp đồng
    -- 3. Nếu TrangThai = 'DRAFT' VÀ TongThanhToan >= PhiBaoHiem
    -- 4. Chuyển TrangThai → 'ACTIVE' và set NgayHieuLuc = GETDATE()

    DECLARE @MaHD VARCHAR(10);
    DECLARE @SoTien DECIMAL(18, 0);
    DECLARE @LoaiGiaoDich NVARCHAR(20);

    -- Lấy thông tin từ bản ghi vừa INSERT
    SELECT 
        @MaHD = MaHD,
        @SoTien = SoTien,
        @LoaiGiaoDich = LoaiGiaoDich
    FROM inserted;

    -- Chỉ xử lý nếu là giao dịch THANH_TOAN (không phải HOAN_PHI)
    IF @LoaiGiaoDich = N'THANH_TOAN' AND @SoTien > 0
    BEGIN
        -- Lấy thông tin hợp đồng
        DECLARE @TrangThai NVARCHAR(20);
        DECLARE @PhiBaoHiem DECIMAL(18, 0);

        SELECT 
            @TrangThai = TrangThai,
            @PhiBaoHiem = PhiBaoHiem
        FROM HopDong
        WHERE MaHD = @MaHD;

        -- Chỉ xử lý hợp đồng ở trạng thái DRAFT
        IF @TrangThai = 'DRAFT'
        BEGIN
            -- Tính tổng đã thanh toán (bao gồm cả giao dịch vừa INSERT)
            DECLARE @TongThanhToan DECIMAL(18, 0);

            SELECT @TongThanhToan = ISNULL(SUM(SoTien), 0)
            FROM ThanhToanHopDong
            WHERE MaHD = @MaHD;

            -- Nếu đã thanh toán đủ hoặc thừa
            IF @TongThanhToan >= @PhiBaoHiem
            BEGIN
                -- Chuyển trạng thái DRAFT → ACTIVE
                UPDATE HopDong
                SET 
                    TrangThai = 'ACTIVE',
                    NgayHieuLuc = GETDATE()
                WHERE MaHD = @MaHD;

                -- Ghi log vào AuditLog (nếu bảng tồn tại)
                IF OBJECT_ID('AuditLog', 'U') IS NOT NULL
                BEGIN
                    INSERT INTO AuditLog (TableName, RecordID, Action, OldValue, NewValue, ChangedBy, ChangeReason)
                    VALUES (
                        'HopDong',
                        @MaHD,
                        'AUTO_UPDATE',
                        'DRAFT',
                        'ACTIVE',
                        'TRIGGER_trg_AutoActivateContract',
                        N'Tự động kích hoạt hợp đồng khi thanh toán đủ phí (' + 
                        CAST(@TongThanhToan AS NVARCHAR(20)) + '/' + 
                        CAST(@PhiBaoHiem AS NVARCHAR(20)) + ' VNĐ)'
                    );
                END
            END
        END
    END
END
GO

-- Test trigger
PRINT 'Trigger trg_AutoActivateContract created successfully!';
PRINT '';
PRINT 'USAGE:';
PRINT '  Khi INSERT vào ThanhToanHopDong với LoaiGiaoDich = THANH_TOAN';
PRINT '  Nếu SUM(SoTien) >= PhiBaoHiem của HopDong có TrangThai = DRAFT';
PRINT '  Tự động chuyển TrangThai → ACTIVE và set NgayHieuLuc = GETDATE()';
PRINT '';
PRINT 'LUẬT TUÂN THỦ:';
PRINT '  - LUẬT 3.2: Contract Status Lifecycle';
PRINT '  - LUẬT 5.3: Auto-status Update on Payment';
GO
