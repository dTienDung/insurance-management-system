// ============================================
// PJICO - Pricing Matrix Controller
// Quản lý Ma trận định phí (MaTranTinhPhi)
// ============================================

const { getConnection, sql } = require('../config/database');

class PricingMatrixController {
  /**
   * Lấy danh sách tất cả hệ số phí
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 50, riskLevel, maGoi } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      const request = pool.request();

      let query = `
        SELECT 
          mt.ID,
          mt.RiskLevel,
          mt.MaGoi,
          gb.TenGoi,
          mt.HeSoPhi,
          mt.GhiChu
        FROM MaTranTinhPhi mt
        LEFT JOIN GoiBaoHiem gb ON mt.MaGoi = gb.MaGoi
        WHERE 1=1
      `;

      if (riskLevel) {
        query += ' AND mt.RiskLevel = @riskLevel';
        request.input('riskLevel', sql.NVarChar(20), riskLevel);
      }

      if (maGoi) {
        query += ' AND mt.MaGoi = @maGoi';
        request.input('maGoi', sql.VarChar(10), maGoi);
      }

      query += ` 
        ORDER BY 
          CASE mt.RiskLevel 
            WHEN 'LOW' THEN 1
            WHEN 'MEDIUM' THEN 2
            WHEN 'HIGH' THEN 3
            ELSE 4
          END,
          gb.TenGoi
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      // Count total
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM MaTranTinhPhi mt
        WHERE 1=1
      `;
      if (riskLevel) {countQuery += ' AND mt.RiskLevel = @riskLevel';}
      if (maGoi) {countQuery += ' AND mt.MaGoi = @maGoi';}

      const countRequest = pool.request();
      if (riskLevel) {countRequest.input('riskLevel', sql.NVarChar(20), riskLevel);}
      if (maGoi) {countRequest.input('maGoi', sql.VarChar(10), maGoi);}
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
   * Lấy chi tiết 1 hệ số
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query(`
          SELECT 
            mt.ID,
            mt.RiskLevel,
            mt.MaGoi,
            gb.TenGoi,
            mt.HeSoPhi,
            mt.GhiChu
          FROM MaTranTinhPhi mt
          LEFT JOIN GoiBaoHiem gb ON mt.MaGoi = gb.MaGoi
          WHERE mt.ID = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hệ số phí'
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

  /**
   * Tạo hệ số phí mới
   */
  async create(req, res, next) {
    try {
      const { RiskLevel, MaGoi, HeSoPhi, GhiChu } = req.body;

      // Validation
      if (!RiskLevel || !MaGoi || HeSoPhi === undefined || HeSoPhi === null) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (RiskLevel, MaGoi, HeSoPhi)'
        });
      }

      // LUẬT NGHIỆP VỤ: RiskLevel phải là LOW, MEDIUM, hoặc HIGH
      const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];
      if (!validRiskLevels.includes(RiskLevel.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'RiskLevel phải là LOW, MEDIUM, hoặc HIGH'
        });
      }

      // LUẬT NGHIỆP VỤ: HeSoPhi phải từ 0.5 đến 5.0
      if (HeSoPhi < 0.5 || HeSoPhi > 5.0) {
        return res.status(400).json({
          success: false,
          message: 'Hệ số phí phải nằm trong khoảng 0.5 đến 5.0'
        });
      }

      const pool = await getConnection();

      // Kiểm tra MaGoi tồn tại
      const checkPackage = await pool.request()
        .input('maGoi', sql.VarChar(10), MaGoi)
        .query('SELECT MaGoi FROM GoiBaoHiem WHERE MaGoi = @maGoi');

      if (checkPackage.recordset.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Gói bảo hiểm không tồn tại'
        });
      }

      // Kiểm tra trùng lặp (RiskLevel + MaGoi)
      const checkDuplicate = await pool.request()
        .input('riskLevel', sql.NVarChar(20), RiskLevel.toUpperCase())
        .input('maGoi', sql.VarChar(10), MaGoi)
        .query(`
          SELECT ID FROM MaTranTinhPhi 
          WHERE RiskLevel = @riskLevel AND MaGoi = @maGoi
        `);

      if (checkDuplicate.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Hệ số phí cho RiskLevel và Gói bảo hiểm này đã tồn tại'
        });
      }

      const result = await pool.request()
        .input('riskLevel', sql.NVarChar(20), RiskLevel.toUpperCase())
        .input('maGoi', sql.VarChar(10), MaGoi)
        .input('heSoPhi', sql.Decimal(5, 2), HeSoPhi)
        .input('ghiChu', sql.NVarChar(255), GhiChu || null)
        .query(`
          INSERT INTO MaTranTinhPhi (RiskLevel, MaGoi, HeSoPhi, GhiChu)
          OUTPUT INSERTED.ID
          VALUES (@riskLevel, @maGoi, @heSoPhi, @ghiChu)
        `);

      res.status(201).json({
        success: true,
        message: 'Tạo hệ số phí thành công',
        data: { ID: result.recordset[0].ID }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật hệ số phí
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { RiskLevel, MaGoi, HeSoPhi, GhiChu } = req.body;

      // Validation
      if (RiskLevel) {
        const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];
        if (!validRiskLevels.includes(RiskLevel.toUpperCase())) {
          return res.status(400).json({
            success: false,
            message: 'RiskLevel phải là LOW, MEDIUM, hoặc HIGH'
          });
        }
      }

      if (HeSoPhi !== undefined && (HeSoPhi < 0.5 || HeSoPhi > 5.0)) {
        return res.status(400).json({
          success: false,
          message: 'Hệ số phí phải nằm trong khoảng 0.5 đến 5.0'
        });
      }

      const pool = await getConnection();

      // Kiểm tra tồn tại
      const checkExist = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query('SELECT ID FROM MaTranTinhPhi WHERE ID = @id');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hệ số phí'
        });
      }

      // Kiểm tra MaGoi tồn tại (nếu đổi)
      if (MaGoi) {
        const checkPackage = await pool.request()
          .input('maGoi', sql.VarChar(10), MaGoi)
          .query('SELECT MaGoi FROM GoiBaoHiem WHERE MaGoi = @maGoi');

        if (checkPackage.recordset.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Gói bảo hiểm không tồn tại'
          });
        }
      }

      // Kiểm tra trùng lặp (ngoại trừ chính nó)
      if (RiskLevel && MaGoi) {
        const checkDuplicate = await pool.request()
          .input('id', sql.Int, parseInt(id))
          .input('riskLevel', sql.NVarChar(20), RiskLevel.toUpperCase())
          .input('maGoi', sql.VarChar(10), MaGoi)
          .query(`
            SELECT ID FROM MaTranTinhPhi 
            WHERE RiskLevel = @riskLevel 
              AND MaGoi = @maGoi 
              AND ID != @id
          `);

        if (checkDuplicate.recordset.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Hệ số phí cho RiskLevel và Gói bảo hiểm này đã tồn tại'
          });
        }
      }

      await pool.request()
        .input('id', sql.Int, parseInt(id))
        .input('riskLevel', sql.NVarChar(20), RiskLevel ? RiskLevel.toUpperCase() : null)
        .input('maGoi', sql.VarChar(10), MaGoi)
        .input('heSoPhi', sql.Decimal(5, 2), HeSoPhi)
        .input('ghiChu', sql.NVarChar(255), GhiChu || null)
        .query(`
          UPDATE MaTranTinhPhi
          SET RiskLevel = COALESCE(@riskLevel, RiskLevel),
              MaGoi = COALESCE(@maGoi, MaGoi),
              HeSoPhi = COALESCE(@heSoPhi, HeSoPhi),
              GhiChu = @ghiChu
          WHERE ID = @id
        `);

      res.json({
        success: true,
        message: 'Cập nhật hệ số phí thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa hệ số phí
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();

      // LUẬT NGHIỆP VỤ: Không cho xóa hệ số đang được dùng trong hợp đồng active
      const checkUsage = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query(`
          SELECT COUNT(*) as count
          FROM HopDong hd
          INNER JOIN HoSoThamDinh hs ON hd.MaHD = hs.MaHD
          INNER JOIN MaTranTinhPhi mt ON hs.RiskLevel = mt.RiskLevel AND hd.MaGoi = mt.MaGoi
          WHERE mt.ID = @id
            AND hd.TrangThai IN (N'ACTIVE', N'Hiệu lực')
        `);

      if (checkUsage.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa hệ số phí đang được sử dụng trong hợp đồng đang hiệu lực'
        });
      }

      const result = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query('DELETE FROM MaTranTinhPhi WHERE ID = @id');

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hệ số phí'
        });
      }

      res.json({
        success: true,
        message: 'Xóa hệ số phí thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tính phí bảo hiểm theo RiskLevel và Gói
   */
  async calculatePremium(req, res, next) {
    try {
      const { riskLevel, maGoi, giaTriXe } = req.query;

      if (!riskLevel || !maGoi || !giaTriXe) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ: riskLevel, maGoi, giaTriXe'
        });
      }

      const pool = await getConnection();

      // Lấy hệ số phí
      const matrixResult = await pool.request()
        .input('riskLevel', sql.NVarChar(20), riskLevel.toUpperCase())
        .input('maGoi', sql.VarChar(10), maGoi)
        .query(`
          SELECT mt.HeSoPhi, gb.TyLePhiCoBan, gb.TenGoi
          FROM MaTranTinhPhi mt
          INNER JOIN GoiBaoHiem gb ON mt.MaGoi = gb.MaGoi
          WHERE mt.RiskLevel = @riskLevel AND mt.MaGoi = @maGoi
        `);

      if (matrixResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hệ số phí cho RiskLevel và Gói bảo hiểm này'
        });
      }

      const { HeSoPhi, TyLePhiCoBan, TenGoi } = matrixResult.recordset[0];

      // CÔNG THỨC TÍNH PHÍ:
      // PhiBaoHiem = GiaTriXe * (TyLePhiCoBan / 100) * HeSoPhi
      const PhiBaoHiem = Math.round(parseFloat(giaTriXe) * (TyLePhiCoBan / 100) * HeSoPhi);

      res.json({
        success: true,
        data: {
          GiaTriXe: parseFloat(giaTriXe),
          RiskLevel: riskLevel.toUpperCase(),
          MaGoi: maGoi,
          TenGoi: TenGoi,
          TyLePhiCoBan: TyLePhiCoBan,
          HeSoPhi: HeSoPhi,
          PhiBaoHiem: PhiBaoHiem,
          CongThuc: `${giaTriXe} x (${TyLePhiCoBan}% / 100) x ${HeSoPhi} = ${PhiBaoHiem} VNĐ`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy ma trận đầy đủ (tất cả RiskLevel x Gói)
   */
  async getFullMatrix(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            gb.MaGoi,
            gb.TenGoi,
            gb.TyLePhiCoBan,
            MAX(CASE WHEN mt.RiskLevel = 'LOW' THEN mt.HeSoPhi END) as HeSo_Low,
            MAX(CASE WHEN mt.RiskLevel = 'MEDIUM' THEN mt.HeSoPhi END) as HeSo_Medium,
            MAX(CASE WHEN mt.RiskLevel = 'HIGH' THEN mt.HeSoPhi END) as HeSo_High
          FROM GoiBaoHiem gb
          LEFT JOIN MaTranTinhPhi mt ON gb.MaGoi = mt.MaGoi
          WHERE gb.TrangThai = N'Hoạt động'
          GROUP BY gb.MaGoi, gb.TenGoi, gb.TyLePhiCoBan
          ORDER BY gb.TenGoi
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

module.exports = new PricingMatrixController();
