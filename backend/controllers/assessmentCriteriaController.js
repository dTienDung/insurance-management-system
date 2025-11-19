// ============================================
// PJICO - Assessment Criteria Controller
// Quản lý Ma trận thẩm định (MaTranThamDinh)
// ============================================

const { getConnection, sql } = require('../config/database');

class AssessmentCriteriaController {
  /**
   * Lấy danh sách tất cả tiêu chí thẩm định
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      const request = pool.request();

      let query = `
        SELECT ID, TieuChi, DieuKien, Diem, GhiChu
        FROM MaTranThamDinh
        WHERE 1=1
      `;

      if (search) {
        query += ' AND (TieuChi LIKE @search OR DieuKien LIKE @search)';
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      query += ` 
        ORDER BY ID
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      // Count total
      let countQuery = 'SELECT COUNT(*) as total FROM MaTranThamDinh WHERE 1=1';
      if (search) {countQuery += ' AND (TieuChi LIKE @search OR DieuKien LIKE @search)';}
      
      const countRequest = pool.request();
      if (search) {countRequest.input('search', sql.NVarChar, `%${search}%`);}
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
   * Lấy chi tiết 1 tiêu chí
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query(`
          SELECT ID, TieuChi, DieuKien, Diem, GhiChu
          FROM MaTranThamDinh
          WHERE ID = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tiêu chí'
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
   * Tạo tiêu chí mới
   */
  async create(req, res, next) {
    try {
      const { TieuChi, DieuKien, Diem, GhiChu } = req.body;

      // Validation
      if (!TieuChi || !DieuKien || Diem === undefined || Diem === null) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (Tiêu chí, Điều kiện, Điểm)'
        });
      }

      // LUẬT NGHIỆP VỤ: Điểm phải từ -100 đến +100
      if (Diem < -100 || Diem > 100) {
        return res.status(400).json({
          success: false,
          message: 'Điểm phải nằm trong khoảng -100 đến +100'
        });
      }

      const pool = await getConnection();

      // Kiểm tra trùng lặp (TieuChi + DieuKien)
      const checkDuplicate = await pool.request()
        .input('tieuChi', sql.NVarChar(80), TieuChi)
        .input('dieuKien', sql.NVarChar(50), DieuKien)
        .query(`
          SELECT ID FROM MaTranThamDinh 
          WHERE TieuChi = @tieuChi AND DieuKien = @dieuKien
        `);

      if (checkDuplicate.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Tiêu chí với điều kiện này đã tồn tại'
        });
      }

      const result = await pool.request()
        .input('tieuChi', sql.NVarChar(80), TieuChi)
        .input('dieuKien', sql.NVarChar(50), DieuKien)
        .input('diem', sql.Int, Diem)
        .input('ghiChu', sql.NVarChar(150), GhiChu || null)
        .query(`
          INSERT INTO MaTranThamDinh (TieuChi, DieuKien, Diem, GhiChu)
          OUTPUT INSERTED.ID
          VALUES (@tieuChi, @dieuKien, @diem, @ghiChu)
        `);

      res.status(201).json({
        success: true,
        message: 'Tạo tiêu chí thành công',
        data: { ID: result.recordset[0].ID }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật tiêu chí
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { TieuChi, DieuKien, Diem, GhiChu } = req.body;

      // Validation
      if (Diem !== undefined && (Diem < -100 || Diem > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Điểm phải nằm trong khoảng -100 đến +100'
        });
      }

      const pool = await getConnection();

      // Kiểm tra tồn tại
      const checkExist = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query('SELECT ID FROM MaTranThamDinh WHERE ID = @id');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tiêu chí'
        });
      }

      // Kiểm tra trùng lặp (ngoại trừ chính nó)
      if (TieuChi && DieuKien) {
        const checkDuplicate = await pool.request()
          .input('id', sql.Int, parseInt(id))
          .input('tieuChi', sql.NVarChar(80), TieuChi)
          .input('dieuKien', sql.NVarChar(50), DieuKien)
          .query(`
            SELECT ID FROM MaTranThamDinh 
            WHERE TieuChi = @tieuChi 
              AND DieuKien = @dieuKien 
              AND ID != @id
          `);

        if (checkDuplicate.recordset.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Tiêu chí với điều kiện này đã tồn tại'
          });
        }
      }

      await pool.request()
        .input('id', sql.Int, parseInt(id))
        .input('tieuChi', sql.NVarChar(80), TieuChi)
        .input('dieuKien', sql.NVarChar(50), DieuKien)
        .input('diem', sql.Int, Diem)
        .input('ghiChu', sql.NVarChar(150), GhiChu || null)
        .query(`
          UPDATE MaTranThamDinh
          SET TieuChi = @tieuChi,
              DieuKien = @dieuKien,
              Diem = @diem,
              GhiChu = @ghiChu
          WHERE ID = @id
        `);

      res.json({
        success: true,
        message: 'Cập nhật tiêu chí thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa tiêu chí
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();

      // Kiểm tra xem có đang được dùng không
      const checkUsage = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query(`
          SELECT COUNT(*) as count 
          FROM HoSoThamDinh_ChiTiet 
          WHERE MaTieuChi = @id
        `);

      if (checkUsage.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa tiêu chí đang được sử dụng trong hồ sơ thẩm định'
        });
      }

      const result = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query('DELETE FROM MaTranThamDinh WHERE ID = @id');

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tiêu chí'
        });
      }

      res.json({
        success: true,
        message: 'Xóa tiêu chí thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thống kê sử dụng tiêu chí
   */
  async getUsageStats(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            mt.ID,
            mt.TieuChi,
            mt.DieuKien,
            mt.Diem,
            COUNT(DISTINCT hsc.MaHS) as SoLuotSuDung,
            AVG(CAST(hsc.DiemDat AS FLOAT)) as DiemTrungBinh
          FROM MaTranThamDinh mt
          LEFT JOIN HoSoThamDinh_ChiTiet hsc ON mt.ID = hsc.MaTieuChi
          GROUP BY mt.ID, mt.TieuChi, mt.DieuKien, mt.Diem
          ORDER BY SoLuotSuDung DESC
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

module.exports = new AssessmentCriteriaController();
