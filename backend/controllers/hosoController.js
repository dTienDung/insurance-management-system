// controllers/hosoController.js
const { getConnection, sql } = require('../config/database');

class HoSoController {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      const request = pool.request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, parseInt(limit));

      const result = await request.query(`
      SELECT hs.*, 
             kh.HoTen AS TenKhach, 
             xe.HangXe, 
             xe.LoaiXe,
             bs.BienSo,
             nv.HoTen AS NhanVienThamDinh
      FROM HoSoThamDinh hs
      JOIN KhachHang kh ON hs.MaKH = kh.MaKH
      JOIN Xe xe ON hs.MaXe = xe.MaXe
      LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
      LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
      LEFT JOIN NhanVien nv ON hs.MaNV_ThamDinh = nv.MaNV
      ORDER BY hs.NgayLap DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

      const countResult = await pool.request()
        .query('SELECT COUNT(*) as total FROM HoSoThamDinh');

      if (!countResult.recordset || countResult.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi truy vấn database'
        });
      }

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

  async getHoSoChoThamDinh(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT hs.*, kh.HoTen AS TenKhach, xe.HangXe, xe.LoaiXe,
                 bs.BienSo
          FROM HoSoThamDinh hs
          JOIN KhachHang kh ON hs.MaKH = kh.MaKH
          JOIN Xe xe ON hs.MaXe = xe.MaXe
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE hs.TrangThai = N'Chờ thẩm định'
          ORDER BY hs.NgayLap DESC
        `);
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Lấy chi tiết hồ sơ
  // ============================
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const pool = await getConnection();
    
      // Lấy thông tin hồ sơ
      const result = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query(`
        SELECT hs.*, 
               kh.HoTen AS TenKhach, kh.CMND_CCCD, kh.SDT, kh.NgaySinh,
               xe.HangXe, xe.LoaiXe, xe.NamSX, xe.GiaTriXe,
               bs.BienSo
        FROM HoSoThamDinh hs
        JOIN KhachHang kh ON hs.MaKH = kh.MaKH
        JOIN Xe xe ON hs.MaXe = xe.MaXe
        LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
        LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
        WHERE hs.MaHS = @MaHS
      `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ'
        });
      }

      // Lấy chi tiết điểm thẩm định nếu đã được thẩm định
      const scoreResult = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query(`
        SELECT hsd.*, mt.TenTieuChi, mt.MoTa AS MoTaTieuChi
        FROM HoSoThamDinh_ChiTiet hsd
        JOIN MaTranThamDinh mt ON hsd.MaTieuChi = mt.MaTieuChi
        WHERE hsd.MaHS = @MaHS
        ORDER BY hsd.MaTieuChi
      `);

      res.json({
        success: true,
        data: {
          ...result.recordset[0],
          ChiTietDiem: scoreResult.recordset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Tạo hồ sơ mới - TỰ ĐỘNG THẨM ĐỊNH
  // ============================
  async create(req, res, next) {
    try {
      const { MaKH, MaXe, GhiChu } = req.body;
      const { maNV } = req.user;

      if (!MaKH || !MaXe) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
        });
      }

      const pool = await getConnection();

      // Kiểm tra xem có hồ sơ đang chờ thẩm định cho xe này không
      const checkExist = await pool.request()
        .input('MaXe', sql.VarChar(10), MaXe)
        .query(`
        SELECT MaHS FROM HoSoThamDinh 
        WHERE MaXe = @MaXe AND TrangThai = N'Chờ thẩm định'
      `);

      if (checkExist.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Xe này đã có hồ sơ đang chờ thẩm định'
        });
      }

      // Insert hồ sơ
      const result = await pool.request()
        .input('MaKH', sql.VarChar(10), MaKH)
        .input('MaXe', sql.VarChar(10), MaXe)
        .input('MaNV_Nhap', sql.VarChar(10), maNV)
        .input('GhiChu', sql.NVarChar(500), GhiChu || null)
        .query(`
        INSERT INTO HoSoThamDinh (MaKH, MaXe, MaNV_Nhap, GhiChu, TrangThai)
        OUTPUT INSERTED.MaHS
        VALUES (@MaKH, @MaXe, @MaNV_Nhap, @GhiChu, N'Chờ thẩm định')
      `);

      if (!result.recordset || result.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Không thể tạo hồ sơ thẩm định'
        });
      }

      const MaHS = result.recordset[0].MaHS;

      // TỰ ĐỘNG THẨM ĐỊNH - Gọi stored procedure
      try {
        await pool.request()
          .input('MaHS', sql.VarChar(10), MaHS)
          .execute('sp_TinhDiemThamDinh');

        // Lấy kết quả thẩm định
        const assessResult = await pool.request()
          .input('MaHS', sql.VarChar(10), MaHS)
          .query(`
          SELECT RiskLevel, PhiDuKien 
          FROM HoSoThamDinh 
          WHERE MaHS = @MaHS
        `);

        if (!assessResult.recordset || assessResult.recordset.length === 0) {
          return res.status(201).json({
            success: true,
            message: 'Đã tạo hồ sơ nhưng không lấy được kết quả thẩm định',
            data: { MaHS }
          });
        }

        res.status(201).json({
          success: true,
          message: 'Đã tạo hồ sơ thẩm định mới và hoàn tất thẩm định tự động',
          data: {
            MaHS,
            RiskLevel: assessResult.recordset[0].RiskLevel,
            PhiDuKien: assessResult.recordset[0].PhiDuKien
          }
        });
      } catch (assessError) {
      // Nếu thẩm định tự động lỗi, vẫn trả về hồ sơ đã tạo
        console.error('Lỗi thẩm định tự động:', assessError);
        res.status(201).json({
          success: true,
          message: 'Đã tạo hồ sơ nhưng thẩm định tự động gặp lỗi',
          data: { MaHS },
          warning: 'Vui lòng thẩm định thủ công'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Cập nhật kết quả thẩm định (DEPRECATED - use approve/reject instead)
  // ============================
  async updateThamDinh(req, res, next) {
    try {
      const { id } = req.params;
      const { MaNV_ThamDinh, KetQua, PhiDuKien, GhiChu } = req.body;

      if (!MaNV_ThamDinh || !KetQua) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
        });
      }

      const pool = await getConnection();

      // LUẬT NGHIỆP VỤ 5.2: Kiểm tra state locking
      const checkStatus = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query(`
        SELECT hs.TrangThai, 
               (SELECT TOP 1 MaHD FROM HopDong WHERE MaHS = @MaHS) as MaHD
        FROM HoSoThamDinh hs
        WHERE hs.MaHS = @MaHS
      `);

      if (checkStatus.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ'
        });
      }

      const { TrangThai, MaHD } = checkStatus.recordset[0];

      // KHÓA: Chỉ sửa khi 'Chờ thẩm định'
      if (TrangThai !== 'Chờ thẩm định') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ có thể sửa hồ sơ đang chờ thẩm định. Hồ sơ này đã được duyệt/từ chối.'
        });
      }

      // KHÓA: Không sửa nếu đã có hợp đồng
      if (MaHD) {
        return res.status(403).json({
          success: false,
          message: `Hồ sơ đã được tạo hợp đồng (${MaHD}), không thể chỉnh sửa`
        });
      }

      await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .input('MaNV_ThamDinh', sql.VarChar(10), MaNV_ThamDinh)
        .input('KetQua', sql.NVarChar(20), KetQua)
        .input('PhiDuKien', sql.Decimal(18, 0), PhiDuKien)
        .input('GhiChu', sql.NVarChar(500), GhiChu)
        .query(`
        UPDATE HoSoThamDinh
        SET MaNV_ThamDinh = @MaNV_ThamDinh,
            PhiDuKien = @PhiDuKien,
            GhiChu = @GhiChu,
            TrangThai = CASE WHEN @KetQua = N'Đạt' THEN N'Chấp nhận' ELSE N'Từ chối' END
        WHERE MaHS = @MaHS
      `);

      res.json({
        success: true,
        message: 'Đã cập nhật kết quả thẩm định thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Duyệt hồ sơ (APPROVE)
  // ============================
  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const { GhiChu } = req.body;
      const { maNV } = req.user;

      const pool = await getConnection();

      // Kiểm tra trạng thái
      const checkStatus = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query(`
        SELECT TrangThai, RiskLevel 
        FROM HoSoThamDinh 
        WHERE MaHS = @MaHS
      `);

      if (checkStatus.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ'
        });
      }

      if (checkStatus.recordset[0].TrangThai !== 'Chờ thẩm định') {
        return res.status(400).json({
          success: false,
          message: 'Hồ sơ này không trong trạng thái chờ thẩm định'
        });
      }

      // LUẬT NGHIỆP VỤ 2: Phân loại rủi ro và xử lý
      // Điểm >= 26: HIGH (CÓ THỂ từ chối, cần phê duyệt cấp cao)
      // 16-25: MEDIUM
      // <= 15: LOW
      const riskLevel = checkStatus.recordset[0].RiskLevel;
      const warnings = [];
    
      // RiskLevel từ database: 'LOW', 'MEDIUM', 'HIGH'
      if (riskLevel === 'HIGH') {
      // LUẬT NGHIỆP VỤ: HIGH không phải hard-reject, cần cảnh báo
        warnings.push('⚠️ CẢNH BÁO: Hồ sơ có mức rủi ro HIGH (điểm >= 26). Yêu cầu phê duyệt cấp cao hoặc điều kiện bổ sung trước khi lập hợp đồng.');
      // Vẫn cho phép duyệt nhưng cần ghi log cảnh báo
      }
    
      // Kiểm tra thêm nếu có trạng thái 'TỪ CHỐI' (backward compatibility)
      if (riskLevel === 'TỪ CHỐI' || riskLevel === 'REJECT') {
        return res.status(400).json({
          success: false,
          message: 'Hồ sơ đã bị từ chối, không thể duyệt'
        });
      }

      // Cập nhật trạng thái
      await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .input('MaNV_ThamDinh', sql.VarChar(10), maNV)
        .input('GhiChu', sql.NVarChar(500), GhiChu || null)
        .query(`
        UPDATE HoSoThamDinh
        SET TrangThai = N'Chấp nhận',
            MaNV_ThamDinh = @MaNV_ThamDinh,
            GhiChu = ISNULL(@GhiChu, GhiChu)
        WHERE MaHS = @MaHS
      `);

      res.json({
        success: true,
        message: warnings.length > 0 ? 'Đã duyệt hồ sơ (có cảnh báo). Có thể lập hợp đồng.' : 'Đã duyệt hồ sơ thành công. Có thể lập hợp đồng.',
        warnings: warnings.length > 0 ? warnings : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Từ chối hồ sơ (REJECT)
  // ============================
  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { LyDoTuChoi } = req.body;
      const { maNV } = req.user;

      if (!LyDoTuChoi) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập lý do từ chối'
        });
      }

      const pool = await getConnection();

      // Kiểm tra trạng thái
      const checkStatus = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query('SELECT TrangThai FROM HoSoThamDinh WHERE MaHS = @MaHS');

      if (checkStatus.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ'
        });
      }

      if (checkStatus.recordset[0].TrangThai !== 'Chờ thẩm định') {
        return res.status(400).json({
          success: false,
          message: 'Hồ sơ này không trong trạng thái chờ thẩm định'
        });
      }

      // Cập nhật trạng thái
      await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .input('MaNV_ThamDinh', sql.VarChar(10), maNV)
        .input('LyDoTuChoi', sql.NVarChar(500), LyDoTuChoi)
        .query(`
        UPDATE HoSoThamDinh
        SET TrangThai = N'Từ chối',
            MaNV_ThamDinh = @MaNV_ThamDinh,
            GhiChu = @LyDoTuChoi
        WHERE MaHS = @MaHS
      `);

      res.json({
        success: true,
        message: 'Đã từ chối hồ sơ'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Xóa hồ sơ
  // ============================
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const pool = await getConnection();

      // LUẬT NGHIỆP VỤ 5.2: Kiểm tra trạng thái
      const checkHoSo = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query('SELECT TrangThai FROM HoSoThamDinh WHERE MaHS = @MaHS');

      if (checkHoSo.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ'
        });
      }

      const trangThai = checkHoSo.recordset[0].TrangThai;

      // KHÓA: Không xóa nếu đã duyệt/từ chối
      if (trangThai === 'Chấp nhận' || trangThai === 'Từ chối' || trangThai === 'Đã thẩm định') {
        return res.status(403).json({
          success: false,
          message: `Không thể xóa hồ sơ đã được xử lý (Trạng thái: ${trangThai})`
        });
      }

      // Kiểm tra xem có hợp đồng nào liên quan không
      const checkContract = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query('SELECT COUNT(*) as count FROM HopDong WHERE MaHS = @MaHS');

      if (!checkContract.recordset || checkContract.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra hợp đồng liên quan'
        });
      }

      if (checkContract.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa hồ sơ đã có hợp đồng liên quan'
        });
      }

      // Xóa chi tiết thẩm định trước
      await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query('DELETE FROM HoSoThamDinh_ChiTiet WHERE MaHS = @MaHS');

      // Xóa hồ sơ
      await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query('DELETE FROM HoSoThamDinh WHERE MaHS = @MaHS');

      res.json({
        success: true,
        message: 'Đã xóa hồ sơ thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Lập hợp đồng từ hồ sơ
  // ============================
  async lapHopDongTuHoSo(req, res, next) {
    try {
      const { MaHS, MaNV } = req.body;

      if (!MaHS || !MaNV) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ thông tin'
        });
      }

      const pool = await getConnection();

      // Kiểm tra trạng thái hồ sơ
      const checkStatus = await pool.request()
        .input('MaHS', sql.VarChar(10), MaHS)
        .query('SELECT TrangThai FROM HoSoThamDinh WHERE MaHS = @MaHS');

      if (checkStatus.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ'
        });
      }

      if (checkStatus.recordset[0].TrangThai !== 'Đã thẩm định') {
        return res.status(400).json({
          success: false,
          message: 'Hồ sơ chưa được thẩm định hoặc đã bị từ chối'
        });
      }

      // Sử dụng stored procedure có sẵn
      await pool.request()
        .input('MaHS', sql.VarChar(10), MaHS)
        .input('MaNV', sql.VarChar(10), MaNV)
        .execute('sp_LapHopDong_TuHoSo');

      res.json({
        success: true,
        message: 'Đã lập hợp đồng từ hồ sơ thành công'
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new HoSoController();
