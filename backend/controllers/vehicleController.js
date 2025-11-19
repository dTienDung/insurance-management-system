const { getConnection, sql } = require('../config/database');

class VehicleController {
  async getAll(req, res, next) {
    try {
      const { search, maKH, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let query = `
        SELECT DISTINCT
          xe.*,
          kh.HoTen as TenChuXe,
          kh.SDT as SDTChuXe,
          bs.BienSo
        FROM Xe xe
        LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
        LEFT JOIN KhachHang kh ON kxe.MaKH = kh.MaKH
        LEFT JOIN BienSoXe bs ON kh.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
        WHERE 1=1
      `;

      const request = pool.request();

      if (search) {
        query += ' AND (bs.BienSo LIKE @search OR xe.HangXe LIKE @search OR kh.HoTen LIKE @search)';
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      if (maKH) {
        query += ' AND kh.MaKH = @maKH';
        request.input('maKH', sql.VarChar(10), maKH);
      }

      query += ` 
        ORDER BY xe.MaXe DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      console.log('=== SAMPLE VEHICLE DATA ===');
      if (result.recordset.length > 0) {
        console.log('First vehicle LoaiXe:', result.recordset[0].LoaiXe);
        console.log('Sample vehicles:', result.recordset.slice(0, 3).map(v => ({ MaXe: v.MaXe, LoaiXe: v.LoaiXe, HangXe: v.HangXe })));
      }
      console.log('===========================');

      let countQuery = `
        SELECT COUNT(DISTINCT xe.MaXe) as total 
        FROM Xe xe
        LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
        LEFT JOIN KhachHang kh ON kxe.MaKH = kh.MaKH
        LEFT JOIN BienSoXe bs ON kh.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
        WHERE 1=1
      `;
      if (search) {countQuery += ' AND (bs.BienSo LIKE @search OR xe.HangXe LIKE @search OR kh.HoTen LIKE @search)';}
      if (maKH) {countQuery += ' AND kh.MaKH = @maKH';}
      
      const countRequest = pool.request();
      if (search) {countRequest.input('search', sql.NVarChar, `%${search}%`);}
      if (maKH) {countRequest.input('maKH', sql.VarChar(10), maKH);}
      const countResult = await countRequest.query(countQuery);

      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .query(`
          SELECT 
            xe.*,
            kh.HoTen as TenChuXe, 
            kh.SDT as SDTChuXe, 
            kh.DiaChi as DiaChiChuXe,
            kh.MaKH,
            bs.BienSo,
            bs.MaBienSo,
            bs.TrangThai as TrangThaiBienSo
          FROM Xe xe
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN KhachHang kh ON kxe.MaKH = kh.MaKH
          LEFT JOIN BienSoXe bs ON kh.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE xe.MaXe = @maXe
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phương tiện'
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { 
        HangXe, LoaiXe, NamSX, GiaTriXe, 
        MucDichSuDung, TinhTrangKT, TanSuatNam, TanSuatBaoDuong,
        SoKhung, SoMay, MauSac, GhiChu
      } = req.body;

      // Validation: Required fields for vehicle only (no customer)
      console.log('=== DEBUG CREATE VEHICLE ===');
      console.log('HangXe:', HangXe, 'Type:', typeof HangXe);
      console.log('LoaiXe:', LoaiXe, 'Type:', typeof LoaiXe);
      console.log('NamSX:', NamSX, 'Type:', typeof NamSX);
      console.log('===========================');
      
      if (!HangXe || !LoaiXe || !NamSX || NamSX === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (Hãng xe, Loại xe, Năm SX)'
        });
      }

      // Validation: VIN is required and must be unique
      if (!SoKhung) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập số khung (VIN)'
        });
      }

      // LUẬT NGHIỆP VỤ: VIN phải đúng 17 ký tự (null-safe)
      if (SoKhung.trim().length !== 17) {
        return res.status(400).json({
          success: false,
          message: 'Số khung (VIN) phải có đúng 17 ký tự'
        });
      }

      // LUẬT NGHIỆP VỤ: Năm sản xuất >= 1990 và <= năm hiện tại
      const currentYear = new Date().getFullYear();
      if (NamSX < 1990) {
        return res.status(400).json({
          success: false,
          message: 'Năm sản xuất phải từ 1990 trở về sau'
        });
      }
      if (NamSX > currentYear) {
        return res.status(400).json({
          success: false,
          message: `Năm sản xuất không được vượt quá năm hiện tại (${currentYear})`
        });
      }

      if (!SoMay) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập số máy'
        });
      }

      const pool = await getConnection();
      
      // Check if VIN already exists
      const checkVIN = await pool.request()
        .input('soKhung', sql.VarChar(17), SoKhung)
        .query('SELECT MaXe FROM Xe WHERE SoKhung_VIN = @soKhung');

      if (checkVIN.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Số khung (VIN) đã tồn tại trong hệ thống'
        });
      }

      // Create vehicle (no customer relationship here - handled via KhachHangXe)
      const request = pool.request()
        .input('hangXe', sql.NVarChar(30), HangXe)
        .input('loaiXe', sql.NVarChar(30), LoaiXe)
        .input('namSX', sql.Int, NamSX)
        .input('giaTriXe', sql.Decimal(18, 0), GiaTriXe || null)
        .input('mucDichSuDung', sql.NVarChar(20), MucDichSuDung || null)
        .input('tinhTrangKT', sql.NVarChar(12), TinhTrangKT || null)
        .input('tanSuatNam', sql.Int, TanSuatNam || null)
        .input('tanSuatBaoDuong', sql.NVarChar(20), TanSuatBaoDuong || null)
        .input('soKhung', sql.VarChar(17), SoKhung)
        .input('soMay', sql.VarChar(30), SoMay);
        // Removed MauSac and GhiChu - not in schema

      const result = await request.query(`
        DECLARE @OutputTable TABLE (MaXe INT);
        
        INSERT INTO Xe (HangXe, LoaiXe, NamSX, GiaTriXe, 
                       MucDichSuDung, TinhTrangKT, TanSuatNam, TanSuatBaoDuong,
                       SoKhung_VIN, SoMay)
        OUTPUT INSERTED.MaXe INTO @OutputTable
        VALUES (@hangXe, @loaiXe, @namSX, @giaTriXe,
                @mucDichSuDung, @tinhTrangKT, @tanSuatNam, @tanSuatBaoDuong,
                @soKhung, @soMay);
        
        SELECT MaXe FROM @OutputTable;
      `);

      const maXe = result.recordset[0].MaXe;

      // NOTE: Customer ownership is managed separately via KhachHangXe junction table
      // This should be handled when creating assessments or contracts

      res.status(201).json({
        success: true,
        message: 'Thêm phương tiện thành công',
        data: { MaXe: maXe }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        HangXe, LoaiXe, NamSX, GiaTriXe, 
        MucDichSuDung, TinhTrangKT, TanSuatNam, TanSuatBaoDuong,
        SoKhung, SoMay, MauSac, GhiChu
      } = req.body;

      // LUẬT NGHIỆP VỤ 1: VIN phải đúng 17 ký tự (null-safe validation)
      if (SoKhung !== undefined && SoKhung !== null) {
        if (SoKhung.trim().length !== 17) {
          return res.status(400).json({
            success: false,
            message: 'Số khung (VIN) phải có đúng 17 ký tự'
          });
        }
      }

      // LUẬT NGHIỆP VỤ: Năm sản xuất >= 1990 và <= năm hiện tại + 1
      if (NamSX !== undefined) {
        const currentYear = new Date().getFullYear();
        if (NamSX < 1990) {
          return res.status(400).json({
            success: false,
            message: 'Năm sản xuất phải từ 1990 trở về sau'
          });
        }
        if (NamSX > currentYear + 1) {
          return res.status(400).json({
            success: false,
            message: `Năm sản xuất không được vượt quá ${currentYear + 1}`
          });
        }
      }

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .query('SELECT MaXe, SoKhung_VIN, NamSX, LoaiXe, HangXe FROM Xe WHERE MaXe = @maXe');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phương tiện'
        });
      }

      const oldData = checkExist.recordset[0];
      const warnings = [];

      // LUẬT NGHIỆP VỤ 6.3: Cảnh báo thay đổi risk-sensitive fields
      const activeContractsCheck = await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .query(`
          SELECT COUNT(*) as count 
          FROM HopDong 
          WHERE MaXe = @maXe AND TrangThai = N'ACTIVE'
        `);

      const hasActiveContracts = activeContractsCheck.recordset[0].count > 0;

      if (hasActiveContracts) {
        // Cảnh báo thay đổi các trường nhạy cảm với rủi ro
        if (NamSX && NamSX !== oldData.NamSX) {
          const warningMsg = `⚠️ Xe có hợp đồng đang hiệu lực. Thay đổi Năm SX (${oldData.NamSX} → ${NamSX}) sẽ ảnh hưởng tới tính phí tái tục.`;
          warnings.push(warningMsg);
          
          // LUẬT 6.3: Ghi audit log cho risk-sensitive changes
          await pool.request()
            .input('tableName', sql.NVarChar(50), 'Xe')
            .input('recordID', sql.VarChar(10), id)
            .input('action', sql.NVarChar(20), 'UPDATE')
            .input('oldValue', sql.NVarChar(sql.MAX), oldData.NamSX?.toString() || '')
            .input('newValue', sql.NVarChar(sql.MAX), NamSX.toString())
            .input('userName', sql.NVarChar(50), req.user?.username || 'system')
            .input('reason', sql.NVarChar(255), warningMsg)
            .query(`
              INSERT INTO AuditLog (TableName, RecordID, Action, OldValue, NewValue, ChangedBy, ChangeReason)
              VALUES (@tableName, @recordID, @action, @oldValue, @newValue, @userName, @reason)
            `);
        }
        if (LoaiXe && LoaiXe !== oldData.LoaiXe) {
          const warningMsg = `⚠️ Thay đổi Loại xe (${oldData.LoaiXe} → ${LoaiXe}) sẽ thay đổi mức rủi ro và ảnh hưởng tới hợp đồng hiện tại.`;
          warnings.push(warningMsg);
          
          await pool.request()
            .input('tableName', sql.NVarChar(50), 'Xe')
            .input('recordID', sql.VarChar(10), id)
            .input('action', sql.NVarChar(20), 'UPDATE')
            .input('oldValue', sql.NVarChar(sql.MAX), oldData.LoaiXe || '')
            .input('newValue', sql.NVarChar(sql.MAX), LoaiXe)
            .input('userName', sql.NVarChar(50), req.user?.username || 'system')
            .input('reason', sql.NVarChar(255), warningMsg)
            .query(`
              INSERT INTO AuditLog (TableName, RecordID, Action, OldValue, NewValue, ChangedBy, ChangeReason)
              VALUES (@tableName, @recordID, @action, @oldValue, @newValue, @userName, @reason)
            `);
        }
        if (HangXe && HangXe !== oldData.HangXe) {
          const warningMsg = '⚠️ Thay đổi Hãng xe có thể ảnh hưởng đến đánh giá rủi ro.';
          warnings.push(warningMsg);
          
          await pool.request()
            .input('tableName', sql.NVarChar(50), 'Xe')
            .input('recordID', sql.VarChar(10), id)
            .input('action', sql.NVarChar(20), 'UPDATE')
            .input('oldValue', sql.NVarChar(sql.MAX), oldData.HangXe || '')
            .input('newValue', sql.NVarChar(sql.MAX), HangXe)
            .input('userName', sql.NVarChar(50), req.user?.username || 'system')
            .input('reason', sql.NVarChar(255), warningMsg)
            .query(`
              INSERT INTO AuditLog (TableName, RecordID, Action, OldValue, NewValue, ChangedBy, ChangeReason)
              VALUES (@tableName, @recordID, @action, @oldValue, @newValue, @userName, @reason)
            `);
        }
      }

      // If changing VIN, check if new VIN already exists
      if (SoKhung && SoKhung !== checkExist.recordset[0].SoKhung_VIN) {
        const checkVIN = await pool.request()
          .input('soKhung', sql.VarChar(17), SoKhung)
          .input('maXe', sql.VarChar(10), id)
          .query('SELECT MaXe FROM Xe WHERE SoKhung_VIN = @soKhung AND MaXe != @maXe');

        if (checkVIN.recordset.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Số khung (VIN) đã tồn tại trong hệ thống'
          });
        }
      }

      await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .input('hangXe', sql.NVarChar(30), HangXe)
        .input('loaiXe', sql.NVarChar(30), LoaiXe)
        .input('namSX', sql.Int, NamSX)
        .input('giaTriXe', sql.Decimal(18, 0), GiaTriXe || null)
        .input('mucDichSuDung', sql.NVarChar(20), MucDichSuDung || null)
        .input('tinhTrangKT', sql.NVarChar(12), TinhTrangKT || null)
        .input('tanSuatNam', sql.Int, TanSuatNam || null)
        .input('tanSuatBaoDuong', sql.NVarChar(20), TanSuatBaoDuong || null)
        .input('soKhung', sql.VarChar(17), SoKhung || null)
        .input('soMay', sql.VarChar(30), SoMay || null)
        .input('mauSac', sql.NVarChar(20), MauSac || null)
        .input('ghiChu', sql.NVarChar(sql.MAX), GhiChu || null)
        .query(`
          UPDATE Xe 
          SET HangXe = @hangXe, LoaiXe = @loaiXe, NamSX = @namSX, 
              GiaTriXe = @giaTriXe, MucDichSuDung = @mucDichSuDung,
              TinhTrangKT = @tinhTrangKT, TanSuatNam = @tanSuatNam,
              TanSuatBaoDuong = @tanSuatBaoDuong,
              SoKhung_VIN = @soKhung, SoMay = @soMay,
              MauSac = @mauSac, GhiChu = @ghiChu
          WHERE MaXe = @maXe
        `);

      res.json({
        success: true,
        message: warnings.length > 0 ? 'Đã cập nhật (có cảnh báo)' : 'Cập nhật thông tin phương tiện thành công',
        warnings: warnings.length > 0 ? warnings : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      
      const checkContracts = await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .query('SELECT COUNT(*) as count FROM HopDong WHERE MaXe = @maXe');

      if (!checkContracts.recordset || checkContracts.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra hợp đồng'
        });
      }

      if (checkContracts.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa phương tiện đã có hợp đồng'
        });
      }

      const result = await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .query('DELETE FROM Xe WHERE MaXe = @maXe');

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phương tiện'
        });
      }

      res.json({
        success: true,
        message: 'Xóa phương tiện thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .query(`
          SELECT 
            MaLS,
            MaXe,
            SuKien as LoaiSuKien,
            NgayXayRa as Ngay,
            MucDoThietHai as MoTa,
            CASE 
              WHEN ChiPhiUocTinh IS NOT NULL THEN 1
              ELSE 0
            END as HasDoc
          FROM LS_TaiNan
          WHERE MaXe = @maXe
          ORDER BY NgayXayRa DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleController();
