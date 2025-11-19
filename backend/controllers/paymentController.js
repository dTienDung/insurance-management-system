const { getConnection, sql } = require('../config/database');

class PaymentController {
  // Lấy tất cả thanh toán của 1 hợp đồng
  async getByContract(req, res, next) {
    try {
      const { maHD } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .query(`
          SELECT * FROM ThanhToanHopDong
          WHERE MaHD = @maHD
          ORDER BY NgayGiaoDich DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy tổng hợp thanh toán của hợp đồng
  async getPaymentSummary(req, res, next) {
    try {
      const { maHD } = req.params;

      const pool = await getConnection();
      
      // Dùng VIEW có sẵn
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .query(`
          SELECT * FROM v_TinhTrangThanhToan_HopDong
          WHERE MaHD = @maHD
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

  // Tạo thanh toán mới
  async createPayment(req, res, next) {
    try {
      const { maHD, soTien, hinhThuc, ghiChu } = req.body;

      if (!maHD || !soTien || !hinhThuc) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
        });
      }

      // Validate hình thức thanh toán
      const validHinhThuc = ['Tiền mặt', 'Chuyển khoản', 'Thẻ'];
      if (!validHinhThuc.includes(hinhThuc)) {
        return res.status(400).json({
          success: false,
          message: 'Hình thức thanh toán không hợp lệ'
        });
      }

      const pool = await getConnection();
      
      // Gọi SP tạo thanh toán
      await pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .input('soTien', sql.Decimal(18, 2), soTien)
        .input('hinhThuc', sql.NVarChar(30), hinhThuc)
        .execute('sp_TaoThanhToan');

      // Lấy thanh toán vừa tạo
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .query(`
          SELECT TOP 1 * FROM ThanhToanHopDong
          WHERE MaHD = @maHD
          ORDER BY NgayGiaoDich DESC
        `);

      if (!result.recordset || result.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Tạo thanh toán thành công nhưng không lấy được thông tin'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Tạo thanh toán thành công',
        data: result.recordset[0]
      });
    } catch (error) {
      next(error);
    }
  }

  // Hoàn tiền
  async createRefund(req, res, next) {
    try {
      const { maHD, soTienHoan, ghiChu } = req.body;

      if (!maHD || !soTienHoan) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin'
        });
      }

      const pool = await getConnection();
      
      // Gọi SP hoàn tiền
      await pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .input('lyDo', sql.NVarChar(255), ghiChu || 'Hoàn tiền theo yêu cầu') // SP cần @LyDo
        .input('soTienHoan', sql.Decimal(18, 2), soTienHoan)
        .execute('sp_HoanTienHopDong');

      res.status(201).json({
        success: true,
        message: 'Hoàn tiền thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy thông tin 1 thanh toán
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maTT', sql.VarChar(10), id)
        .query(`
          SELECT 
            tt.*,
            hd.PhiBaoHiem,
            kh.HoTen as TenKhachHang,
            kh.DiaChi,
            bs.BienSo
          FROM ThanhToanHopDong tt
          JOIN HopDong hd ON tt.MaHD = hd.MaHD
          JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE tt.MaTT = @maTT
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thanh toán'
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

  // Lấy tất cả thanh toán (có phân trang)
  async getAll(req, res, next) {
    try {
      const { loaiGiaoDich, trangThai, fromDate, toDate, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let query = `
        SELECT 
          tt.*,
          hd.MaHD,
          kh.HoTen as TenKhachHang,
          bs.BienSo
        FROM ThanhToanHopDong tt
        JOIN HopDong hd ON tt.MaHD = hd.MaHD
        JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
        LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
        LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
        WHERE 1=1
      `;

      const request = pool.request();

      if (loaiGiaoDich) {
        query += ' AND tt.LoaiGiaoDich = @loaiGiaoDich';
        request.input('loaiGiaoDich', sql.NVarChar(20), loaiGiaoDich);
      }

      if (trangThai) {
        query += ' AND tt.TrangThai = @trangThai';
        request.input('trangThai', sql.NVarChar(20), trangThai);
      }

      if (fromDate) {
        query += ' AND tt.NgayGiaoDich >= @fromDate';
        request.input('fromDate', sql.Date, fromDate);
      }

      if (toDate) {
        query += ' AND tt.NgayGiaoDich <= @toDate';
        request.input('toDate', sql.Date, toDate);
      }

      query += ` 
        ORDER BY tt.NgayGiaoDich DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      let countQuery = 'SELECT COUNT(*) as total FROM ThanhToanHopDong tt WHERE 1=1';
      if (loaiGiaoDich) {countQuery += ' AND tt.LoaiGiaoDich = @loaiGiaoDich';}
      if (trangThai) {countQuery += ' AND tt.TrangThai = @trangThai';}
      if (fromDate) {countQuery += ' AND tt.NgayGiaoDich >= @fromDate';}
      if (toDate) {countQuery += ' AND tt.NgayGiaoDich <= @toDate';}
      
      const countRequest = pool.request();
      if (loaiGiaoDich) {countRequest.input('loaiGiaoDich', sql.NVarChar(20), loaiGiaoDich);}
      if (trangThai) {countRequest.input('trangThai', sql.NVarChar(20), trangThai);}
      if (fromDate) {countRequest.input('fromDate', sql.Date, fromDate);}
      if (toDate) {countRequest.input('toDate', sql.Date, toDate);}
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
  /**
   * KHÔNG CHO PHÉP: UPDATE Payment
   * LUẬT 5.1: Transaction Immutability
   */
  async updatePayment(req, res, next) {
    return res.status(403).json({
      success: false,
      message: 'LUẬT 5.1 VI PHẠM: Không được phép UPDATE giao dịch thanh toán. Transaction Data CRUD Immutability. Nếu sai, hãy ghi nhận giao dịch điều chỉnh mới.'
    });
  }

  /**
   * KHÔNG CHO PHÉP: DELETE Payment
   * LUẬT 5.1: Transaction Immutability
   */
  async deletePayment(req, res, next) {
    return res.status(403).json({
      success: false,
      message: 'LUẬT 5.1 VI PHẠM: Không được phép DELETE giao dịch thanh toán. Transaction Data CRUD Immutability. Dùng createRefund() để hoàn phí.'
    });
  }
}

module.exports = new PaymentController();
