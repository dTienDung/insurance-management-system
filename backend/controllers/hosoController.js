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
      SELECT hs.*, kh.HoTen AS TenKhach, xe.BienSo
      FROM HoSoThamDinh hs
      JOIN KhachHang kh ON hs.MaKH = kh.MaKH
      JOIN Xe xe ON hs.MaXe = xe.MaXe
      ORDER BY hs.NgayLap DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const countResult = await pool.request()
      .query('SELECT COUNT(*) as total FROM HoSoThamDinh');

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
    const result = await pool.request()
      .query(`SELECT * FROM v_HoSo_ChoThamDinh ORDER BY NgayLap DESC`);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Lỗi getHoSoChoThamDinh:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================
// Lấy chi tiết hồ sơ
// ============================
async getById(req, res, next) {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('MaHS', sql.VarChar(10), id)
      .query(`
        SELECT hs.*, kh.HoTen AS TenKhach, xe.BienSo, td.MucDoRuiRo, td.KetQua AS KetQuaTD
        FROM HoSoThamDinh hs
        JOIN KhachHang kh ON hs.MaKH = kh.MaKH
        JOIN Xe xe ON hs.MaXe = xe.MaXe
        LEFT JOIN ThamDinh td ON hs.MaHS = td.MaHS
        WHERE hs.MaHS = @MaHS
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ'
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

// ============================
// Tạo hồ sơ mới
// ============================
async create(req, res, next) {
  try {
    const { MaKH, MaXe, MaNV_Nhap, PhiDuKien, GhiChu } = req.body;

    if (!MaKH || !MaXe || !MaNV_Nhap) {
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

    const result = await pool.request()
      .input('MaKH', sql.VarChar(10), MaKH)
      .input('MaXe', sql.VarChar(10), MaXe)
      .input('MaNV_Nhap', sql.VarChar(10), MaNV_Nhap)
      .input('PhiDuKien', sql.Decimal(18, 0), PhiDuKien || 0)
      .input('GhiChu', sql.NVarChar(500), GhiChu || null)
      .query(`
        INSERT INTO HoSoThamDinh (MaKH, MaXe, MaNV_Nhap, PhiDuKien, GhiChu, TrangThai)
        OUTPUT INSERTED.MaHS
        VALUES (@MaKH, @MaXe, @MaNV_Nhap, @PhiDuKien, @GhiChu, N'Chờ thẩm định')
      `);

    res.status(201).json({
      success: true,
      message: 'Đã tạo hồ sơ thẩm định mới.',
      data: { MaHS: result.recordset[0].MaHS }
    });
  } catch (error) {
    next(error);
  }
}

// ============================
// Cập nhật kết quả thẩm định
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

    // Kiểm tra hồ sơ tồn tại và đang chờ thẩm định
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

    await pool.request()
      .input('MaHS', sql.VarChar(10), id)
      .input('MaNV_ThamDinh', sql.VarChar(10), MaNV_ThamDinh)
      .input('KetQua', sql.NVarChar(20), KetQua)
      .input('PhiDuKien', sql.Decimal(18, 0), PhiDuKien)
      .input('GhiChu', sql.NVarChar(500), GhiChu)
      .query(`
        UPDATE HoSoThamDinh
        SET MaNV_ThamDinh = @MaNV_ThamDinh,
            KetQua = @KetQua,
            PhiDuKien = @PhiDuKien,
            GhiChu = @GhiChu,
            TrangThai = CASE WHEN @KetQua = N'Đạt' THEN N'Đã thẩm định' ELSE N'Từ chối' END,
            NgayThamDinh = GETDATE()
        WHERE MaHS = @MaHS;

        INSERT INTO ThamDinh (MaHS, NgayThamDinh, KetQua, GhiChu)
        VALUES (@MaHS, GETDATE(), @KetQua, @GhiChu);
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
