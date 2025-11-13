const { getConnection, sql } = require('../config/database');

class CustomerController {
  async getAll(req, res, next) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let query = `
        SELECT kh.*, COUNT(hd.MaHD) as TongHopDong
        FROM KhachHang kh
        LEFT JOIN HopDong hd ON kh.MaKH = hd.MaKH
        WHERE 1=1
      `;

      const request = pool.request();

      if (search) {
        query += ` AND (kh.HoTen LIKE @search OR kh.CMND_CCCD LIKE @search OR kh.SDT LIKE @search)`;
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      query += ` 
        GROUP BY kh.MaKH, kh.HoTen, kh.CMND_CCCD, kh.NgaySinh, kh.DiaChi, kh.SDT, kh.Email
        ORDER BY kh.MaKH DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      const countQuery = `SELECT COUNT(*) as total FROM KhachHang WHERE 1=1
        ${search ? `AND (HoTen LIKE @search OR CMND_CCCD LIKE @search OR SDT LIKE @search)` : ''}`;
      
      const countRequest = pool.request();
      if (search) {
        countRequest.input('search', sql.NVarChar, `%${search}%`);
      }
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
      
      // Lấy thông tin khách hàng
      const result = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query(`
          SELECT kh.*, 
                 (SELECT COUNT(*) FROM HopDong WHERE MaKH = kh.MaKH AND TrangThai IN (N'ACTIVE', N'PENDING')) as SoHDHieuLuc,
                 (SELECT COUNT(DISTINCT kxe.MaXe) FROM KhachHangXe kxe WHERE kxe.MaKH = kh.MaKH AND kxe.NgayKetThucSoHuu IS NULL) as SoXeSoHuu
          FROM KhachHang kh
          WHERE kh.MaKH = @maKH
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      // Lấy danh sách xe của khách hàng (qua KhachHangXe)
      const vehiclesResult = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query(`
          SELECT 
            xe.MaXe, 
            xe.HangXe, 
            xe.LoaiXe, 
            xe.NamSX,
            xe.GiaTriXe,
            bs.BienSo,
            kxe.NgayBatDauSoHuu,
            kxe.NgayKetThucSoHuu
          FROM KhachHangXe kxe
          INNER JOIN Xe xe ON kxe.MaXe = xe.MaXe
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE kxe.MaKH = @maKH AND kxe.NgayKetThucSoHuu IS NULL
          ORDER BY kxe.NgayBatDauSoHuu DESC
        `);

      // Lấy danh sách hợp đồng của khách hàng
      const contractsResult = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query(`
          SELECT 
            hd.MaHD,
            hd.SoHD,
            hd.NgayBatDau,
            hd.NgayKetThuc,
            hd.TrangThai,
            hd.PhiBH,
            xe.HangXe,
            xe.LoaiXe,
            bs.BienSo,
            goi.TenGoi
          FROM HopDong hd
          INNER JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN BienSoXe bs ON hd.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          LEFT JOIN GoiBaoHiem goi ON hd.MaGoi = goi.MaGoi
          WHERE hd.MaKH = @maKH
          ORDER BY hd.NgayBatDau DESC
        `);

      res.json({
        success: true,
        data: {
          ...result.recordset[0],
          Vehicles: vehiclesResult.recordset,
          Contracts: contractsResult.recordset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { hoTen, cccd, ngaySinh, diaChi, sdt, email } = req.body;

      if (!hoTen || !cccd || !sdt) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
        });
      }

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('cccd', sql.VarChar(12), cccd)
        .query('SELECT MaKH FROM KhachHang WHERE CCCD = @cccd');

      if (checkExist.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'CCCD đã tồn tại trong hệ thống'
        });
      }

      const nextIdResult = await pool.request()
        .query('SELECT ISNULL(MAX(CAST(SUBSTRING(MaKH, 3, 3) AS INT)), 0) + 1 as NextID FROM KhachHang');
      
      const nextId = nextIdResult.recordset[0].NextID;
      const maKH = 'KH' + String(nextId).padStart(3, '0');

      await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .input('hoTen', sql.NVarChar(60), hoTen)
        .input('cccd', sql.VarChar(12), cccd)
        .input('ngaySinh', sql.Date, ngaySinh || null)
        .input('diaChi', sql.NVarChar(120), diaChi || null)
        .input('sdt', sql.VarChar(12), sdt)
        .input('email', sql.VarChar(80), email || null)
        .query(`
          INSERT INTO KhachHang (MaKH, HoTen, CCCD, NgaySinh, DiaChi, SDT, Email)
          VALUES (@maKH, @hoTen, @cccd, @ngaySinh, @diaChi, @sdt, @email)
        `);

      res.status(201).json({
        success: true,
        message: 'Thêm khách hàng thành công',
        data: { maKH }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { hoTen, ngaySinh, diaChi, sdt, email } = req.body;

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query('SELECT MaKH FROM KhachHang WHERE MaKH = @maKH');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .input('hoTen', sql.NVarChar(60), hoTen)
        .input('ngaySinh', sql.Date, ngaySinh || null)
        .input('diaChi', sql.NVarChar(120), diaChi || null)
        .input('sdt', sql.VarChar(12), sdt)
        .input('email', sql.VarChar(80), email || null)
        .query(`
          UPDATE KhachHang 
          SET HoTen = @hoTen, NgaySinh = @ngaySinh, DiaChi = @diaChi, 
              SDT = @sdt, Email = @email
          WHERE MaKH = @maKH
        `);

      res.json({
        success: true,
        message: 'Cập nhật thông tin khách hàng thành công'
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
        .input('maKH', sql.VarChar(10), id)
        .query('SELECT COUNT(*) as count FROM HopDong WHERE MaKH = @maKH');

      if (checkContracts.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa khách hàng đã có hợp đồng'
        });
      }

      const result = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query('DELETE FROM KhachHang WHERE MaKH = @maKH');

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      res.json({
        success: true,
        message: 'Xóa khách hàng thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
