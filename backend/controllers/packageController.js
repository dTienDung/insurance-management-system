const { getConnection, sql } = require('../config/database');

class PackageController {
  // Lấy danh sách tất cả gói bảo hiểm
  async getAll(req, res, next) {
    try {
      const { search, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      let query = `
        SELECT MaGoi, TenGoi, MoTa, TyLePhiCoBan, LoaiPhamVi, TrangThai
        FROM GoiBaoHiem
        WHERE 1=1
      `;

      const request = pool.request();

      if (search) {
        query += ' AND (MaGoi LIKE @search OR TenGoi LIKE @search)';
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      query += ` 
        ORDER BY TenGoi ASC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      // Count total
      let countQuery = 'SELECT COUNT(*) as total FROM GoiBaoHiem WHERE 1=1';
      if (search) {countQuery += ' AND (MaGoi LIKE @search OR TenGoi LIKE @search)';}
      
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

  // Lấy chi tiết gói bảo hiểm
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maGoi', sql.VarChar(10), id)
        .query(`
          SELECT MaGoi, TenGoi, MoTa, TyLePhiCoBan, LoaiPhamVi, TrangThai
          FROM GoiBaoHiem
          WHERE MaGoi = @maGoi
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy gói bảo hiểm'
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

  // Tạo gói bảo hiểm mới
  async create(req, res, next) {
    try {
      const { TenGoi, MoTa, TyLePhiCoBan, LoaiPhamVi } = req.body;

      if (!TenGoi || !TyLePhiCoBan) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (Tên gói, Tỷ lệ phí cơ bản)'
        });
      }

      const pool = await getConnection();

      // Insert - MaGoi sẽ tự động tạo bởi trigger
      const result = await pool.request()
        .input('TenGoi', sql.NVarChar(100), TenGoi)
        .input('MoTa', sql.NVarChar(500), MoTa || null)
        .input('TyLePhiCoBan', sql.Decimal(5, 2), TyLePhiCoBan)
        .input('LoaiPhamVi', sql.NVarChar(50), LoaiPhamVi || null)
        .query(`
          INSERT INTO GoiBaoHiem (TenGoi, MoTa, TyLePhiCoBan, LoaiPhamVi, TrangThai)
          OUTPUT INSERTED.MaGoi
          VALUES (@TenGoi, @MoTa, @TyLePhiCoBan, @LoaiPhamVi, N'Hoạt động')
        `);

      res.status(201).json({
        success: true,
        message: 'Tạo gói bảo hiểm thành công',
        data: { MaGoi: result.recordset[0].MaGoi }
      });
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật gói bảo hiểm
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { TenGoi, MoTa, TyLePhiCoBan, LoaiPhamVi, TrangThai } = req.body;

      const pool = await getConnection();

      // Kiểm tra tồn tại
      const checkExist = await pool.request()
        .input('maGoi', sql.VarChar(10), id)
        .query('SELECT MaGoi FROM GoiBaoHiem WHERE MaGoi = @maGoi');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy gói bảo hiểm'
        });
      }

      await pool.request()
        .input('maGoi', sql.VarChar(10), id)
        .input('TenGoi', sql.NVarChar(100), TenGoi)
        .input('MoTa', sql.NVarChar(500), MoTa)
        .input('TyLePhiCoBan', sql.Decimal(5, 2), TyLePhiCoBan)
        .input('LoaiPhamVi', sql.NVarChar(50), LoaiPhamVi)
        .input('TrangThai', sql.NVarChar(20), TrangThai)
        .query(`
          UPDATE GoiBaoHiem
          SET TenGoi = @TenGoi,
              MoTa = @MoTa,
              TyLePhiCoBan = @TyLePhiCoBan,
              LoaiPhamVi = @LoaiPhamVi,
              TrangThai = @TrangThai
          WHERE MaGoi = @maGoi
        `);

      res.json({
        success: true,
        message: 'Cập nhật gói bảo hiểm thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  // Xóa gói bảo hiểm (soft delete - chuyển trạng thái)
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();

      // Kiểm tra xem có hợp đồng nào đang dùng không
      const checkUsage = await pool.request()
        .input('maGoi', sql.VarChar(10), id)
        .query(`
          SELECT COUNT(*) as count 
          FROM HopDong 
          WHERE MaGoi = @maGoi AND TrangThai IN (N'DRAFT', N'ACTIVE')
        `);

      if (checkUsage.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa gói bảo hiểm đang được sử dụng trong hợp đồng'
        });
      }

      // Soft delete - chuyển trạng thái
      await pool.request()
        .input('maGoi', sql.VarChar(10), id)
        .query(`
          UPDATE GoiBaoHiem 
          SET TrangThai = N'Ngừng hoạt động'
          WHERE MaGoi = @maGoi
        `);

      res.json({
        success: true,
        message: 'Xóa gói bảo hiểm thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách gói đang hoạt động (cho autocomplete)
  async getActive(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT MaGoi, TenGoi, MoTa, TyLePhiCoBan
          FROM GoiBaoHiem
          WHERE TrangThai = N'Hoạt động'
          ORDER BY TenGoi ASC
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

module.exports = new PackageController();
