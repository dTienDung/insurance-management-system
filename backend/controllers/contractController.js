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
               hd.TrangThaiThanhToan,        -- ← THÊM
               hd.NgayThanhToan,              -- ← THÊM
               hd.HinhThucThanhToan,          -- ← THÊM
               kh.HoTen as TenKhachHang, kh.SDT as SDTKhachHang,
               xe.BienSo, xe.HangXe, xe.LoaiXe,
               lb.TenLoai as TenLoaiBaoHiem,
               nv.HoTen as TenNhanVien
        FROM HopDong hd
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
        LEFT JOIN LoaiBaoHiem lb ON hd.MaLB = lb.MaLB
        LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
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
                 hd.TrangThaiThanhToan,        -- ← THÊM
                 hd.NgayThanhToan,              -- ← THÊM
                 hd.HinhThucThanhToan,          -- ← THÊM
                 hd.GhiChuThanhToan,            -- ← THÊM
                 kh.HoTen as TenKhachHang, kh.CMND_CCCD, kh.SDT as SDTKhachHang, kh.Email as EmailKhachHang, kh.DiaChi as DiaChiKhachHang,
                 xe.BienSo, xe.HangXe, xe.LoaiXe, xe.NamSX, xe.GiaTriXe, xe.MucDichSuDung,
                 lb.TenLoai as TenLoaiBaoHiem, lb.MoTa as MoTaLoaiBaoHiem, lb.MucPhi,
                 nv.HoTen as TenNhanVien, nv.ChucVu, nv.SDT as SDTNhanVien
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN LoaiBaoHiem lb ON hd.MaLB = lb.MaLB
          LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
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
      const { ngayKy, ngayHetHan, phiBaoHiem, maKH, maXe, maLB, maHDCu } = req.body;
      const { maNV } = req.user;

      if (!ngayKy || !ngayHetHan || !phiBaoHiem || !maKH || !maXe || !maLB) {
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
      
      const nextIdResult = await pool.request()
        .query('SELECT ISNULL(MAX(CAST(SUBSTRING(MaHD, 3, 3) AS INT)), 0) + 1 as NextID FROM HopDong');
      
      const nextId = nextIdResult.recordset[0].NextID;
      const maHD = 'HD' + String(nextId).padStart(3, '0');

      await pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .input('ngayKy', sql.Date, ngayKy)
        .input('ngayHetHan', sql.Date, ngayHetHan)
        .input('trangThai', sql.NVarChar(15), 'Hiệu lực')
        .input('phiBaoHiem', sql.Decimal(18, 2), phiBaoHiem)
        .input('maKH', sql.VarChar(10), maKH)
        .input('maXe', sql.VarChar(10), maXe)
        .input('maLB', sql.VarChar(10), maLB)
        .input('maNV', sql.VarChar(10), maNV)
        .input('maHDCu', sql.VarChar(10), maHDCu || null)
        .input('trangThaiTT', sql.NVarChar(20), 'Chưa thanh toán')  // ← THÊM
        .query(`
          INSERT INTO HopDong (MaHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaLB, MaNV, MaHD_Cu, TrangThaiThanhToan)
          VALUES (@maHD, @ngayKy, @ngayHetHan, @trangThai, @phiBaoHiem, @maKH, @maXe, @maLB, @maNV, @maHDCu, @trangThaiTT)
        `);

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
        maLB,
        payment_status,        // ← THÊM - Từ frontend
        payment_date,          // ← THÊM
        payment_method,        // ← THÊM
        payment_notes          // ← THÊM
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

      // ← THÊM: Validation payment
      if (payment_status && !['paid', 'unpaid'].includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: 'payment_status phải là "paid" hoặc "unpaid"'
        });
      }

      if (payment_method && !['cash', 'transfer', 'card'].includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: 'payment_method phải là "cash", "transfer" hoặc "card"'
        });
      }

      // ← THÊM: Convert từ English sang Tiếng Việt (DÙNG MAPPING.JS)
      const trangThaiTT = payment_status ? paymentStatusToDB[payment_status] : undefined;
      const hinhThucTT = payment_method ? paymentMethodToDB[payment_method] : undefined;

      const request = pool.request()
        .input('maHD', sql.VarChar(10), id)
        .input('ngayKy', sql.Date, ngayKy)
        .input('ngayHetHan', sql.Date, ngayHetHan)
        .input('trangThai', sql.NVarChar(15), trangThai)
        .input('phiBaoHiem', sql.Decimal(18, 2), phiBaoHiem)
        .input('maLB', sql.VarChar(10), maLB);

      let updateQuery = `
        UPDATE HopDong 
        SET NgayKy = @ngayKy, 
            NgayHetHan = @ngayHetHan, 
            TrangThai = @trangThai, 
            PhiBaoHiem = @phiBaoHiem, 
            MaLB = @maLB
      `;

      // ← THÊM: Chỉ update payment nếu có trong request
      if (trangThaiTT !== undefined) {
        updateQuery += `, TrangThaiThanhToan = @trangThaiTT`;
        request.input('trangThaiTT', sql.NVarChar(20), trangThaiTT);
      }

      if (payment_date !== undefined) {
        updateQuery += `, NgayThanhToan = @ngayTT`;
        request.input('ngayTT', sql.Date, payment_date);
      }

      if (hinhThucTT !== undefined) {
        updateQuery += `, HinhThucThanhToan = @hinhThucTT`;
        request.input('hinhThucTT', sql.NVarChar(20), hinhThucTT);
      }

      if (payment_notes !== undefined) {
        updateQuery += `, GhiChuThanhToan = @ghiChuTT`;
        request.input('ghiChuTT', sql.NVarChar(sql.MAX), payment_notes);
      }

      updateQuery += ` WHERE MaHD = @maHD`;

      await request.query(updateQuery);

      res.json({
        success: true,
        message: 'Cập nhật hợp đồng thành công',
        payment_updated: payment_status === 'paid'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // THÊM FUNCTION MỚI - UPDATE PAYMENT
  // ============================================
  async updatePaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { payment_date, payment_method, payment_notes } = req.body;

      // Validation
      if (!payment_date) {
        return res.status(400).json({
          success: false,
          message: 'payment_date là bắt buộc'
        });
      }

      if (!payment_method || !['cash', 'transfer', 'card'].includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: 'payment_method phải là "cash", "transfer" hoặc "card"'
        });
      }

      const pool = await getConnection();

      // Kiểm tra hợp đồng tồn tại
      const checkResult = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query('SELECT MaHD, TrangThai, TrangThaiThanhToan FROM HopDong WHERE MaHD = @maHD');

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      const contract = checkResult.recordset[0];

      // Kiểm tra đã thanh toán chưa
      if (contract.TrangThaiThanhToan === 'Đã thanh toán') {
        return res.status(400).json({
          success: false,
          message: 'Hợp đồng đã được thanh toán'
        });
      }

      // Update payment (DÙNG MAPPING.JS)
      await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .input('trangThaiTT', sql.NVarChar(20), 'Đã thanh toán')
        .input('ngayTT', sql.Date, payment_date)
        .input('hinhThucTT', sql.NVarChar(20), paymentMethodToDB[payment_method])
        .input('ghiChuTT', sql.NVarChar(sql.MAX), payment_notes || null)
        .query(`
          UPDATE HopDong
          SET 
            TrangThaiThanhToan = @trangThaiTT,
            NgayThanhToan = @ngayTT,
            HinhThucThanhToan = @hinhThucTT,
            GhiChuThanhToan = @ghiChuTT
          WHERE MaHD = @maHD
        `);

      res.json({
        success: true,
        message: 'Cập nhật thanh toán thành công',
        data: {
          contract_id: id,
          payment_status: 'paid',
          payment_date: payment_date
        }
      });
    } catch (error) {
      next(error);
    }
  }

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
                 hd.TrangThaiThanhToan,        -- ← THÊM
                 kh.HoTen as TenKhachHang, kh.SDT as SDTKhachHang,
                 xe.BienSo, xe.HangXe,
                 DATEDIFF(day, GETDATE(), hd.NgayHetHan) as SoNgayConLai
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          WHERE hd.TrangThai = N'Hiệu lực'
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
      
      const oldContract = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query('SELECT * FROM HopDong WHERE MaHD = @maHD');

      if (oldContract.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng cũ'
        });
      }

      const old = oldContract.recordset[0];

      const nextIdResult = await pool.request()
        .query('SELECT ISNULL(MAX(CAST(SUBSTRING(MaHD, 3, 3) AS INT)), 0) + 1 as NextID FROM HopDong');
      
      const nextId = nextIdResult.recordset[0].NextID;
      const maHDMoi = 'HD' + String(nextId).padStart(3, '0');

      await pool.request()
        .input('maHDMoi', sql.VarChar(10), maHDMoi)
        .input('ngayKy', sql.Date, ngayKy)
        .input('ngayHetHan', sql.Date, ngayHetHan)
        .input('phiBaoHiem', sql.Decimal(18, 2), phiBaoHiem)
        .input('maKH', sql.VarChar(10), old.MaKH)
        .input('maXe', sql.VarChar(10), old.MaXe)
        .input('maLB', sql.VarChar(10), old.MaLB)
        .input('maNV', sql.VarChar(10), maNV)
        .input('maHDCu', sql.VarChar(10), id)
        .input('trangThaiTT', sql.NVarChar(20), 'Chưa thanh toán')  // ← THÊM
        .query(`
          INSERT INTO HopDong (MaHD, NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaLB, MaNV, MaHD_Cu, TrangThaiThanhToan)
          VALUES (@maHDMoi, @ngayKy, @ngayHetHan, N'Hiệu lực', @phiBaoHiem, @maKH, @maXe, @maLB, @maNV, @maHDCu, @trangThaiTT)
        `);

      await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query(`UPDATE HopDong SET TrangThai = N'Hết hạn', DaNhacTaiTuc = 1 WHERE MaHD = @maHD`);

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