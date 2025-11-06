const { getConnection, sql } = require('../config/database');

class AssessmentController {
  async calculateRiskScore(req, res, next) {
    try {
      const { maXe, taiTuc } = req.body;

      if (!maXe) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mã xe'
        });
      }

      const pool = await getConnection();
      
      const xeResult = await pool.request()
        .input('maXe', sql.VarChar(10), maXe)
        .query(`
          SELECT xe.*, 
                 (SELECT COUNT(*) FROM LichSuXe WHERE MaXe = xe.MaXe) as SoLanTaiNan
          FROM Xe xe
          WHERE xe.MaXe = @maXe
        `);

      if (xeResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy xe'
        });
      }

      const xe = xeResult.recordset[0];
      
      const decisionRules = await pool.request()
        .query('SELECT * FROM DecisionTable');

      let totalScore = 0;
      const appliedRules = [];

      for (const rule of decisionRules.recordset) {
        let isApplicable = false;
        const tieuChi = rule.TieuChi;
        const dieuKien = rule.DieuKien;

        if (tieuChi.includes('Giá trị xe')) {
          if (dieuKien.includes('> 1 tỷ') && xe.GiaTriXe > 1000000000) {
            isApplicable = true;
          } else if (dieuKien.includes('< 500 triệu') && xe.GiaTriXe < 500000000) {
            isApplicable = true;
          }
        }

        if (tieuChi.includes('Loại xe')) {
          if (dieuKien.includes(xe.LoaiXe)) {
            isApplicable = true;
          }
        }

        if (tieuChi.includes('Năm sản xuất')) {
          if (dieuKien.includes('< 2015') && xe.NamSX < 2015) {
            isApplicable = true;
          }
        }

        if (tieuChi.includes('Tần suất bảo dưỡng')) {
          const tanSuat = parseInt(xe.TanSuatBaoDuong) || 0;
          if (dieuKien.includes('Ít hơn 2') && tanSuat < 2) {
            isApplicable = true;
          } else if (dieuKien.includes('>= 2') && tanSuat >= 2) {
            isApplicable = true;
          }
        }

        if (tieuChi.includes('Tái tục')) {
          if ((dieuKien.includes('Có') && taiTuc === true) || 
              (dieuKien.includes('Không') && taiTuc === false)) {
            isApplicable = true;
          }
        }

        if (isApplicable) {
          totalScore += rule.Diem;
          appliedRules.push({
            tieuChi: rule.TieuChi,
            dieuKien: rule.DieuKien,
            diem: rule.Diem,
            ghiChu: rule.GhiChu
          });
        }
      }

      let mucDoRuiRo, ketQua, phiBoSung = 0;
      if (totalScore <= -2) {
        mucDoRuiRo = 'Thấp';
        ketQua = 'Chấp nhận';
        phiBoSung = 0;
      } else if (totalScore >= -1 && totalScore <= 2) {
        mucDoRuiRo = 'Trung bình';
        ketQua = 'Chấp nhận có điều kiện';
        phiBoSung = totalScore * 500000;
      } else {
        mucDoRuiRo = 'Cao';
        ketQua = 'Từ chối hoặc yêu cầu phí cao';
        phiBoSung = totalScore * 1000000;
      }

      res.json({
        success: true,
        data: {
          tongDiem: totalScore,
          mucDoRuiRo,
          ketQua,
          phiBoSung,
          appliedRules,
          thongTinXe: {
            bienSo: xe.BienSo,
            hangXe: xe.HangXe,
            loaiXe: xe.LoaiXe,
            namSX: xe.NamSX,
            giaTriXe: xe.GiaTriXe,
            soLanTaiNan: xe.SoLanTaiNan
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async createAssessment(req, res, next) {
    try {
      const { maHD, mucDoRuiRo, ketQua, ghiChu } = req.body;

      if (!maHD || !mucDoRuiRo || !ketQua) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin'
        });
      }

      const pool = await getConnection();
      
      const request = pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .input('ngayThamDinh', sql.Date, new Date())
        .input('mucDoRuiRo', sql.NVarChar(50), mucDoRuiRo)
        .input('ketQua', sql.NVarChar(100), ketQua)
        .input('ghiChu', sql.NVarChar(255), ghiChu || null);

      const result = await request.query(`
        INSERT INTO ThamDinh (MaHD, NgayThamDinh, MucDoRuiRo, KetQua, GhiChu)
        OUTPUT INSERTED.MaTD
        VALUES (@maHD, @ngayThamDinh, @mucDoRuiRo, @ketQua, @ghiChu)
      `);

      res.status(201).json({
        success: true,
        message: 'Tạo thẩm định thành công',
        data: { maTD: result.recordset[0].MaTD }
      });
    } catch (error) {
      next(error);
    }
  }

  async getByContract(req, res, next) {
    try {
      const { maHD } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .query(`
          SELECT * FROM ThamDinh
          WHERE MaHD = @maHD
          ORDER BY NgayThamDinh DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { mucDoRuiRo, fromDate, toDate, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let query = `
        SELECT td.*, 
               hd.MaHD, hd.NgayKy,
               kh.HoTen as TenKhachHang,
               xe.BienSo, xe.HangXe
        FROM ThamDinh td
        LEFT JOIN HopDong hd ON td.MaHD = hd.MaHD
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
        WHERE 1=1
      `;

      const request = pool.request();

      if (mucDoRuiRo) {
        query += ` AND td.MucDoRuiRo = @mucDoRuiRo`;
        request.input('mucDoRuiRo', sql.NVarChar(50), mucDoRuiRo);
      }

      if (fromDate) {
        query += ` AND td.NgayThamDinh >= @fromDate`;
        request.input('fromDate', sql.Date, fromDate);
      }

      if (toDate) {
        query += ` AND td.NgayThamDinh <= @toDate`;
        request.input('toDate', sql.Date, toDate);
      }

      query += ` 
        ORDER BY td.NgayThamDinh DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      let countQuery = `SELECT COUNT(*) as total FROM ThamDinh td WHERE 1=1`;
      if (mucDoRuiRo) countQuery += ` AND td.MucDoRuiRo = @mucDoRuiRo`;
      if (fromDate) countQuery += ` AND td.NgayThamDinh >= @fromDate`;
      if (toDate) countQuery += ` AND td.NgayThamDinh <= @toDate`;
      
      const countRequest = pool.request();
      if (mucDoRuiRo) countRequest.input('mucDoRuiRo', sql.NVarChar(50), mucDoRuiRo);
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
}

module.exports = new AssessmentController();
