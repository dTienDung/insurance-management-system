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
        query += ` AND (bs.BienSo LIKE @search OR xe.HangXe LIKE @search OR kh.HoTen LIKE @search)`;
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      if (maKH) {
        query += ` AND kh.MaKH = @maKH`;
        request.input('maKH', sql.VarChar(10), maKH);
      }

      query += ` 
        ORDER BY xe.MaXe DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      let countQuery = `
        SELECT COUNT(DISTINCT xe.MaXe) as total 
        FROM Xe xe
        LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
        LEFT JOIN KhachHang kh ON kxe.MaKH = kh.MaKH
        LEFT JOIN BienSoXe bs ON kh.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
        WHERE 1=1
      `;
      if (search) countQuery += ` AND (bs.BienSo LIKE @search OR xe.HangXe LIKE @search OR kh.HoTen LIKE @search)`;
      if (maKH) countQuery += ` AND kh.MaKH = @maKH`;
      
      const countRequest = pool.request();
      if (search) countRequest.input('search', sql.NVarChar, `%${search}%`);
      if (maKH) countRequest.input('maKH', sql.VarChar(10), maKH);
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
        hangXe, loaiXe, namSX, maKH, giaTriXe, 
        mucDichSuDung, tinhTrangKT, tanSuatNam, tanSuatBaoDuong,
        bienSo // Thêm biển số từ request
      } = req.body;

      if (!hangXe || !loaiXe || !namSX || !maKH || !giaTriXe) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
        });
      }

      const pool = await getConnection();
      
      // Kiểm tra biển số đã tồn tại chưa (nếu có nhập)
      if (bienSo) {
        const checkBienSo = await pool.request()
          .input('bienSo', sql.VarChar(15), bienSo)
          .query('SELECT MaBienSo FROM BienSoXe WHERE BienSo = @bienSo');

        if (checkBienSo.recordset.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Biển số xe đã tồn tại trong hệ thống'
          });
        }
      }

      // 1. Tạo xe (không có BienSo và MaKH)
      const request = pool.request()
        .input('hangXe', sql.NVarChar(30), hangXe)
        .input('loaiXe', sql.NVarChar(30), loaiXe)
        .input('namSX', sql.Int, namSX)
        .input('giaTriXe', sql.Decimal(18, 0), giaTriXe)
        .input('mucDichSuDung', sql.NVarChar(20), mucDichSuDung || null)
        .input('tinhTrangKT', sql.NVarChar(12), tinhTrangKT || null)
        .input('tanSuatNam', sql.Int, tanSuatNam || null)
        .input('tanSuatBaoDuong', sql.NVarChar(20), tanSuatBaoDuong || null);

      const result = await request.query(`
        INSERT INTO Xe (HangXe, LoaiXe, NamSX, GiaTriXe, 
                       MucDichSuDung, TinhTrangKT, TanSuatNam, TanSuatBaoDuong)
        OUTPUT INSERTED.MaXe
        VALUES (@hangXe, @loaiXe, @namSX, @giaTriXe,
                @mucDichSuDung, @tinhTrangKT, @tanSuatNam, @tanSuatBaoDuong)
      `);

      const maXe = result.recordset[0].MaXe;

      // 2. Tạo quan hệ KhachHangXe
      await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .input('maXe', sql.VarChar(10), maXe)
        .query(`
          INSERT INTO KhachHangXe (MaKH, MaXe, NgayBatDauSoHuu)
          VALUES (@maKH, @maXe, GETDATE())
        `);

      // 3. Tạo BienSoXe (nếu có)
      if (bienSo) {
        await pool.request()
          .input('maKH', sql.VarChar(10), maKH)
          .input('bienSo', sql.VarChar(15), bienSo)
          .query(`
            INSERT INTO BienSoXe (MaKH, BienSo, TrangThai)
            VALUES (@maKH, @bienSo, N'Hoạt động')
          `);
      }

      res.status(201).json({
        success: true,
        message: 'Thêm phương tiện thành công',
        data: { maXe }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        hangXe, loaiXe, namSX, giaTriXe, 
        mucDichSuDung, tinhTrangKT, tanSuatNam, tanSuatBaoDuong 
      } = req.body;

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .query('SELECT MaXe FROM Xe WHERE MaXe = @maXe');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phương tiện'
        });
      }

      await pool.request()
        .input('maXe', sql.VarChar(10), id)
        .input('hangXe', sql.NVarChar(30), hangXe)
        .input('loaiXe', sql.NVarChar(30), loaiXe)
        .input('namSX', sql.Int, namSX)
        .input('giaTriXe', sql.Decimal(18, 0), giaTriXe)
        .input('mucDichSuDung', sql.NVarChar(20), mucDichSuDung || null)
        .input('tinhTrangKT', sql.NVarChar(12), tinhTrangKT || null)
        .input('tanSuatNam', sql.Int, tanSuatNam || null)
        .input('tanSuatBaoDuong', sql.NVarChar(20), tanSuatBaoDuong || null)
        .query(`
          UPDATE Xe 
          SET HangXe = @hangXe, LoaiXe = @loaiXe, NamSX = @namSX, 
              GiaTriXe = @giaTriXe, MucDichSuDung = @mucDichSuDung,
              TinhTrangKT = @tinhTrangKT, TanSuatNam = @tanSuatNam,
              TanSuatBaoDuong = @tanSuatBaoDuong
          WHERE MaXe = @maXe
        `);

      res.json({
        success: true,
        message: 'Cập nhật thông tin phương tiện thành công'
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
          SELECT * FROM LS_TaiNan
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
