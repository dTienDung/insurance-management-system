const { getConnection, sql } = require('../config/database');
const { 
  paymentStatusToDB, 
  paymentMethodToDB 
} = require('../utils/mapping');  // ← IMPORT MAPPING

class ContractController {
  async getAll(req, res, next) {
    try {
      const { search, trangThai, fromDate, toDate, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let query = `
        SELECT hd.*, 
               kh.HoTen as TenKhachHang, kh.SDT as SDTKhachHang,
               xe.HangXe, xe.LoaiXe,
               gb.TenGoi as TenGoiBaoHiem,
               nv.HoTen as TenNhanVien,
               bs.BienSo
        FROM HopDong hd
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
        LEFT JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
        LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
        LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
        LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
        WHERE 1=1
      `;

      const request = pool.request();

      if (search) {
        query += ` AND (hd.MaHD LIKE @search OR kh.HoTen LIKE @search OR xe.BienSo LIKE @search)`;
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      if (trangThai) {
        query += ` AND hd.TrangThai = @trangThai`;
        request.input('trangThai', sql.NVarChar(15), trangThai);
      }

      if (fromDate) {
        query += ` AND hd.NgayKy >= @fromDate`;
        request.input('fromDate', sql.Date, fromDate);
      }

      if (toDate) {
        query += ` AND hd.NgayKy <= @toDate`;
        request.input('toDate', sql.Date, toDate);
      }

      query += ` 
        ORDER BY hd.NgayTao DESC, hd.MaHD DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      let countQuery = `
        SELECT COUNT(*) as total 
        FROM HopDong hd
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
        WHERE 1=1
      `;
      if (search) countQuery += ` AND (hd.MaHD LIKE @search OR kh.HoTen LIKE @search OR xe.BienSo LIKE @search)`;
      if (trangThai) countQuery += ` AND hd.TrangThai = @trangThai`;
      if (fromDate) countQuery += ` AND hd.NgayKy >= @fromDate`;
      if (toDate) countQuery += ` AND hd.NgayKy <= @toDate`;
      
      const countRequest = pool.request();
      if (search) countRequest.input('search', sql.NVarChar, `%${search}%`);
      if (trangThai) countRequest.input('trangThai', sql.NVarChar(15), trangThai);
      if (fromDate) countRequest.input('fromDate', sql.Date, fromDate);
      if (toDate) countRequest.input('toDate', sql.Date, toDate);
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
        .input('maHD', sql.VarChar(10), id)
        .query(`
          SELECT hd.*, 
                 kh.HoTen as TenKhachHang, kh.CMND_CCCD, kh.SDT as SDTKhachHang, kh.Email as EmailKhachHang, kh.DiaChi as DiaChiKhachHang,
                 xe.HangXe, xe.LoaiXe, xe.NamSX, xe.GiaTriXe, xe.MucDichSuDung,
                 gb.TenGoi as TenGoiBaoHiem, gb.MoTa as MoTaGoiBaoHiem, gb.TyLePhiCoBan,
                 nv.HoTen as TenNhanVien, nv.ChucVu, nv.SDT as SDTNhanVien,
                 bs.BienSo
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
          LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE hd.MaHD = @maHD
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
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
      const { ngayKy, ngayHetHan, phiBaoHiem, maKH, maXe, maGoi, maHDCu } = req.body;
      const { maNV } = req.user;

      if (!ngayKy || !ngayHetHan || !phiBaoHiem || !maKH || !maXe || !maGoi) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
        });
      }

      if (new Date(ngayHetHan) <= new Date(ngayKy)) {
        return res.status(400).json({
          success: false,
          message: 'Ngày hết hạn phải sau ngày ký'
        });
      }

      const pool = await getConnection();

      await pool.request()
        .input('ngayKy', sql.Date, ngayKy)
        .input('ngayHetHan', sql.Date, ngayHetHan)
        .input('trangThai', sql.NVarChar(15), 'DRAFT')
        .input('phiBaoHiem', sql.Decimal(18, 2), phiBaoHiem)
        .input('maKH', sql.VarChar(10), maKH)
        .input('maXe', sql.VarChar(10), maXe)
        .input('maGoi', sql.VarChar(10), maGoi)
        .input('maNV', sql.VarChar(10), maNV)
        .query(`
          INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi, MaNV, NgayTao)
          VALUES (@ngayKy, @ngayHetHan, @trangThai, @phiBaoHiem, @maKH, @maXe, @maGoi, @maNV, GETDATE())
        `);

      // Lấy MaHD vừa tạo
      const result = await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .input('maXe', sql.VarChar(10), maXe)
        .query(`
          SELECT TOP 1 MaHD 
          FROM HopDong 
          WHERE MaKH = @maKH AND MaXe = @maXe
          ORDER BY NgayTao DESC
        `);

      const maHD = result.recordset[0].MaHD;

      res.status(201).json({
        success: true,
        message: 'Tạo hợp đồng thành công',
        data: { maHD }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        ngayKy, 
        ngayHetHan, 
        trangThai, 
        phiBaoHiem, 
        maGoi
      } = req.body;

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query('SELECT MaHD FROM HopDong WHERE MaHD = @maHD');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      if (ngayHetHan && ngayKy && new Date(ngayHetHan) <= new Date(ngayKy)) {
        return res.status(400).json({
          success: false,
          message: 'Ngày hết hạn phải sau ngày ký'
        });
      }

      await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .input('ngayKy', sql.Date, ngayKy)
        .input('ngayHetHan', sql.Date, ngayHetHan)
        .input('trangThai', sql.NVarChar(15), trangThai)
        .input('phiBaoHiem', sql.Decimal(18, 2), phiBaoHiem)
        .input('maGoi', sql.VarChar(10), maGoi)
        .query(`
          UPDATE HopDong 
          SET NgayKy = @ngayKy, 
              NgayHetHan = @ngayHetHan, 
              TrangThai = @trangThai, 
              PhiBaoHiem = @phiBaoHiem, 
              MaGoi = @maGoi
          WHERE MaHD = @maHD
        `);

      res.json({
        success: true,
        message: 'Cập nhật hợp đồng thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // XÓA FUNCTION updatePaymentStatus - DÙNG paymentController
  // ============================================

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { lyDo } = req.body;

      const pool = await getConnection();
      
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query(`
          UPDATE HopDong 
          SET TrangThai = N'Huỷ'
          WHERE MaHD = @maHD AND TrangThai = N'Hiệu lực'
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy hợp đồng này'
        });
      }

      res.json({
        success: true,
        message: 'Hủy hợp đồng thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringContracts(req, res, next) {
    try {
      const { days = 30 } = req.query;

      const pool = await getConnection();
      const result = await pool.request()
        .input('days', sql.Int, parseInt(days))
        .query(`
          SELECT hd.*, 
                 kh.HoTen as TenKhachHang, kh.SDT as SDTKhachHang,
                 xe.HangXe,
                 bs.BienSo,
                 DATEDIFF(day, GETDATE(), hd.NgayHetHan) as SoNgayConLai
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE hd.TrangThai = N'ACTIVE'
            AND hd.NgayHetHan BETWEEN GETDATE() AND DATEADD(day, @days, GETDATE())
            AND hd.DaNhacTaiTuc = 0
          ORDER BY hd.NgayHetHan ASC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async renewContract(req, res, next) {
    try {
      const { id } = req.params;
      const { ngayKy, ngayHetHan, phiBaoHiem } = req.body;
      const { maNV } = req.user;

      const pool = await getConnection();
      
      // Sử dụng SP tái tục
      await pool.request()
        .input('maHDCu', sql.VarChar(10), id)
        .input('maNV', sql.VarChar(10), maNV)
        .execute('sp_RenewHopDong');

      // Lấy hợp đồng mới vừa tạo
      const result = await pool.request()
        .input('maHDCu', sql.VarChar(10), id)
        .query(`
          SELECT MaHD_Moi 
          FROM HopDongRelation 
          WHERE MaHD_Goc = @maHDCu AND LoaiQuanHe = 'TAI_TUC'
          ORDER BY ID DESC
        `);

      const maHDMoi = result.recordset[0]?.MaHD_Moi;

      res.status(201).json({
        success: true,
        message: 'Tái tục hợp đồng thành công',
        data: { maHDMoi }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContractController();