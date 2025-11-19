const { getConnection, sql } = require('../config/database');

class AssessmentController {
  // Tính điểm thẩm định cho hồ sơ
  async calculateRiskScore(req, res, next) {
    try {
      const { maHS } = req.body;

      if (!maHS) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mã hồ sơ'
        });
      }

      const pool = await getConnection();
      
      // Gọi SP tính điểm thẩm định
      await pool.request()
        .input('maHS', sql.VarChar(10), maHS)
        .execute('sp_TinhDiemThamDinh');

      // Lấy kết quả sau khi tính
      const result = await pool.request()
        .input('maHS', sql.VarChar(10), maHS)
        .query(`
          SELECT 
            hs.MaHS,
            hs.RiskLevel,
            hs.KetQua,
            hs.PhiDuKien,
            kh.HoTen as TenKhach,
            xe.HangXe,
            xe.LoaiXe
          FROM HoSoThamDinh hs
          JOIN KhachHang kh ON hs.MaKH = kh.MaKH
          JOIN Xe xe ON hs.MaXe = xe.MaXe
          WHERE hs.MaHS = @maHS
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ'
        });
      }

      const hoSo = result.recordset[0];

      // Lấy chi tiết điểm theo từng tiêu chí
      const detailResult = await pool.request()
        .input('maHS', sql.VarChar(10), maHS)
        .query(`
          SELECT 
            mt.TieuChi,
            mt.DieuKien,
            hsc.GiaTri,
            hsc.Diem
          FROM HoSoThamDinh_ChiTiet hsc
          JOIN MaTranThamDinh mt ON hsc.MaTieuChi = mt.ID
          WHERE hsc.MaHS = @maHS
        `);

      res.json({
        success: true,
        data: {
          maHS: hoSo.MaHS,
          riskLevel: hoSo.RiskLevel,
          ketQua: hoSo.KetQua,
          phiDuKien: hoSo.PhiDuKien,
          thongTinKhach: {
            tenKhach: hoSo.TenKhach
          },
          thongTinXe: {
            hangXe: hoSo.HangXe,
            loaiXe: hoSo.LoaiXe
          },
          chiTietDiem: detailResult.recordset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Tạo bản ghi thẩm định (không còn dùng - dùng sp_TinhDiemThamDinh thay thế)
  async createAssessment(req, res, next) {
    try {
      const { maHS, ghiChu } = req.body;

      if (!maHS) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin'
        });
      }

      const pool = await getConnection();
      
      // Gọi SP thẩm định
      await pool.request()
        .input('maHS', sql.VarChar(10), maHS)
        .execute('sp_TinhDiemThamDinh');

      // Cập nhật ghi chú nếu có
      if (ghiChu) {
        await pool.request()
          .input('maHS', sql.VarChar(10), maHS)
          .input('ghiChu', sql.NVarChar(255), ghiChu)
          .query('UPDATE HoSoThamDinh SET GhiChu = @ghiChu WHERE MaHS = @maHS');
      }

      res.status(201).json({
        success: true,
        message: 'Thẩm định thành công',
        data: { maHS }
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy thông tin thẩm định theo hồ sơ
  async getByHoSo(req, res, next) {
    try {
      const { maHS } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maHS', sql.VarChar(10), maHS)
        .query(`
          SELECT 
            hs.*,
            kh.HoTen as TenKhach,
            xe.HangXe,
            xe.LoaiXe
          FROM HoSoThamDinh hs
          JOIN KhachHang kh ON hs.MaKH = kh.MaKH
          JOIN Xe xe ON hs.MaXe = xe.MaXe
          WHERE hs.MaHS = @maHS
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ thẩm định'
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

  async getAll(req, res, next) {
    try {
      const { riskLevel, fromDate, toDate, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let query = `
        SELECT 
          hs.MaHS,
          hs.NgayLap,
          hs.TrangThai,
          hs.RiskLevel,
          hs.KetQua,
          hs.PhiDuKien,
          kh.HoTen as TenKhach,
          xe.HangXe,
          xe.LoaiXe,
          nv.HoTen as NhanVienThamDinh
        FROM HoSoThamDinh hs
        LEFT JOIN KhachHang kh ON hs.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hs.MaXe = xe.MaXe
        LEFT JOIN NhanVien nv ON hs.MaNV_ThamDinh = nv.MaNV
        WHERE 1=1
      `;

      const request = pool.request();

      if (riskLevel) {
        query += ' AND hs.RiskLevel = @riskLevel';
        request.input('riskLevel', sql.NVarChar(20), riskLevel);
      }

      if (fromDate) {
        query += ' AND hs.NgayLap >= @fromDate';
        request.input('fromDate', sql.Date, fromDate);
      }

      if (toDate) {
        query += ' AND hs.NgayLap <= @toDate';
        request.input('toDate', sql.Date, toDate);
      }

      query += ` 
        ORDER BY hs.NgayLap DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      let countQuery = 'SELECT COUNT(*) as total FROM HoSoThamDinh hs WHERE 1=1';
      if (riskLevel) {countQuery += ' AND hs.RiskLevel = @riskLevel';}
      if (fromDate) {countQuery += ' AND hs.NgayLap >= @fromDate';}
      if (toDate) {countQuery += ' AND hs.NgayLap <= @toDate';}
      
      const countRequest = pool.request();
      if (riskLevel) {countRequest.input('riskLevel', sql.NVarChar(20), riskLevel);}
      if (fromDate) {countRequest.input('fromDate', sql.Date, fromDate);}
      if (toDate) {countRequest.input('toDate', sql.Date, toDate);}
      const countResult = await countRequest.query(countQuery);

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

  // Cập nhật thông tin thẩm định
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { ghiChu, riskLevel, ketQua } = req.body;

      const pool = await getConnection();

      // LUẬT NGHIỆP VỤ 5.2: Kiểm tra state locking
      const checkHoSo = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query(`
          SELECT hs.TrangThai, 
                 (SELECT TOP 1 MaHD FROM HopDong WHERE MaHS = @MaHS) as MaHD
          FROM HoSoThamDinh hs
          WHERE hs.MaHS = @MaHS
        `);

      if (checkHoSo.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hồ sơ thẩm định'
        });
      }

      const { TrangThai, MaHD } = checkHoSo.recordset[0];

      // KHÓA: Chỉ sửa khi 'Chờ thẩm định'
      if (TrangThai !== 'Chờ thẩm định') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ có thể sửa hồ sơ đang chờ thẩm định. Hồ sơ này đã được xử lý.'
        });
      }

      // KHÓA: Không sửa nếu đã có hợp đồng
      if (MaHD) {
        return res.status(403).json({
          success: false,
          message: `Hồ sơ đã được tạo hợp đồng (${MaHD}), không thể chỉnh sửa`
        });
      }

      // Cập nhật thông tin
      const request = pool.request().input('MaHS', sql.VarChar(10), id);
      
      const updateFields = [];
      if (ghiChu !== undefined) {
        updateFields.push('GhiChu = @ghiChu');
        request.input('ghiChu', sql.NVarChar(255), ghiChu);
      }
      if (riskLevel !== undefined) {
        updateFields.push('RiskLevel = @riskLevel');
        request.input('riskLevel', sql.NVarChar(20), riskLevel);
      }
      if (ketQua !== undefined) {
        updateFields.push('KetQua = @ketQua');
        request.input('ketQua', sql.NVarChar(50), ketQua);
      }

      if (updateFields.length > 0) {
        await request.query(`
          UPDATE HoSoThamDinh 
          SET ${updateFields.join(', ')}
          WHERE MaHS = @MaHS
        `);
      }

      res.json({
        success: true,
        message: 'Đã cập nhật thông tin thẩm định'
      });
    } catch (error) {
      next(error);
    }
  }

  // Xóa bản ghi thẩm định
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
          message: 'Không tìm thấy hồ sơ thẩm định'
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

      // Kiểm tra có hợp đồng liên quan không
      const checkContract = await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query('SELECT COUNT(*) as count FROM HopDong WHERE MaHS = @MaHS');

      if (!checkContract.recordset || checkContract.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra hợp đồng'
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

      // Reset các trường thẩm định thay vì xóa hồ sơ
      await pool.request()
        .input('MaHS', sql.VarChar(10), id)
        .query(`
          UPDATE HoSoThamDinh 
          SET RiskLevel = NULL, 
              KetQua = NULL, 
              PhiDuKien = NULL,
              TrangThai = N'Chờ thẩm định'
          WHERE MaHS = @MaHS
        `);

      res.json({
        success: true,
        message: 'Đã xóa kết quả thẩm định'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentController();
