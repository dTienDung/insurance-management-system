const { getConnection } = require('../config/database');
const sql = require('mssql');

/**
 * CONTROLLER: BienSoXe (License Plate Management)
 * 
 * LUẬT NGHIỆP VỤ 1: Data Integrity & Validation
 * - 1.1: Biển số gắn với Khách hàng (không gắn trực tiếp với Xe)
 * - 1.3: Unique constraint: (MaKH + BienSo) phải duy nhất trong trạng thái Hoạt động
 * - 1.4: Biển số format: XX-YYYYY hoặc XX-Y YYYY (X: chữ cái, Y: số)
 */

class LicensePlateController {
  /**
   * Lấy tất cả biển số của 1 khách hàng
   * GET /api/customers/:maKH/license-plates
   */
  async getByCustomer(req, res, next) {
    try {
      const { maKH } = req.params;
      const { trangThai } = req.query; // Filter: Hoạt động | Hết hạn | Tất cả

      const pool = await getConnection();
      
      let query = `
        SELECT 
          bs.*,
          kh.HoTen as TenKhachHang,
          kh.CMND_CCCD,
          kh.SDT
        FROM BienSoXe bs
        JOIN KhachHang kh ON bs.MaKH = kh.MaKH
        WHERE bs.MaKH = @maKH
      `;

      if (trangThai && trangThai !== 'Tất cả') {
        query += ' AND bs.TrangThai = @trangThai';
      }

      query += ' ORDER BY bs.NgayDangKy DESC';

      const request = pool.request()
        .input('maKH', sql.VarChar(10), maKH);

      if (trangThai && trangThai !== 'Tất cả') {
        request.input('trangThai', sql.NVarChar(20), trangThai);
      }

      const result = await request.query(query);

      res.json({
        success: true,
        data: result.recordset
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin 1 biển số
   * GET /api/license-plates/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      
      const result = await pool.request()
        .input('maBienSo', sql.VarChar(10), id)
        .query(`
          SELECT 
            bs.*,
            kh.HoTen as TenKhachHang,
            kh.CMND_CCCD,
            kh.SDT,
            kh.DiaChi
          FROM BienSoXe bs
          JOIN KhachHang kh ON bs.MaKH = kh.MaKH
          WHERE bs.MaBienSo = @maBienSo
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy biển số'
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
   * Thêm biển số mới cho khách hàng
   * POST /api/customers/:maKH/license-plates
   */
  async addLicensePlate(req, res, next) {
    try {
      const { maKH } = req.params;
      const { bienSo, tinhThanh, ngayDangKy, ghiChu } = req.body;

      // Validate
      if (!bienSo) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập biển số xe'
        });
      }

      // LUẬT 1.4: Validate format biển số (cơ bản)
      const bienSoRegex = /^[0-9]{2}[A-Z]-[0-9]{3,5}$/i;
      if (!bienSoRegex.test(bienSo.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Format biển số không hợp lệ. VD: 29A-12345 hoặc 51G-123.45'
        });
      }

      const pool = await getConnection();

      // Kiểm tra khách hàng tồn tại
      const customerCheck = await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .query('SELECT MaKH FROM KhachHang WHERE MaKH = @maKH');

      if (customerCheck.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      // LUẬT 1.3: Kiểm tra unique constraint (MaKH + BienSo) trong trạng thái Hoạt động
      const duplicateCheck = await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .input('bienSo', sql.NVarChar(15), bienSo)
        .query(`
          SELECT MaBienSo 
          FROM BienSoXe 
          WHERE MaKH = @maKH 
            AND BienSo = @bienSo 
            AND TrangThai = N'Hoạt động'
        `);

      if (duplicateCheck.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Biển số ${bienSo} đã được đăng ký cho khách hàng này với trạng thái Hoạt động`
        });
      }

      // Kiểm tra biển số có thuộc khách hàng khác không
      const otherOwnerCheck = await pool.request()
        .input('bienSo', sql.NVarChar(15), bienSo)
        .input('maKH', sql.VarChar(10), maKH)
        .query(`
          SELECT kh.MaKH, kh.HoTen 
          FROM BienSoXe bs
          JOIN KhachHang kh ON bs.MaKH = kh.MaKH
          WHERE bs.BienSo = @bienSo 
            AND bs.TrangThai = N'Hoạt động'
            AND bs.MaKH != @maKH
        `);

      if (otherOwnerCheck.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Biển số ${bienSo} đang được đăng ký bởi khách hàng khác: ${otherOwnerCheck.recordset[0].HoTen}`
        });
      }

      // Tạo biển số mới
      const result = await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .input('bienSo', sql.NVarChar(15), bienSo)
        .input('tinhThanh', sql.NVarChar(50), tinhThanh || null)
        .input('ngayDangKy', sql.Date, ngayDangKy || new Date())
        .input('ghiChu', sql.NVarChar(255), ghiChu || null)
        .query(`
          INSERT INTO BienSoXe (MaKH, BienSo, TinhThanh, NgayDangKy, TrangThai, GhiChu)
          OUTPUT INSERTED.*
          VALUES (@maKH, @bienSo, @tinhThanh, @ngayDangKy, N'Hoạt động', @ghiChu)
        `);

      res.status(201).json({
        success: true,
        message: 'Thêm biển số thành công',
        data: result.recordset[0]
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật trạng thái biển số (Hoạt động <-> Hết hạn)
   * PUT /api/license-plates/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { trangThai, ghiChu } = req.body;

      if (!trangThai) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp trạng thái mới'
        });
      }

      const validStatuses = ['Hoạt động', 'Hết hạn'];
      if (!validStatuses.includes(trangThai)) {
        return res.status(400).json({
          success: false,
          message: `Trạng thái phải là: ${validStatuses.join(' hoặc ')}`
        });
      }

      const pool = await getConnection();

      // Kiểm tra biển số tồn tại
      const checkExist = await pool.request()
        .input('maBienSo', sql.VarChar(10), id)
        .query('SELECT * FROM BienSoXe WHERE MaBienSo = @maBienSo');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy biển số'
        });
      }

      const oldData = checkExist.recordset[0];

      // Nếu thay đổi sang Hoạt động, kiểm tra unique constraint
      if (trangThai === 'Hoạt động' && oldData.TrangThai !== 'Hoạt động') {
        const duplicateCheck = await pool.request()
          .input('maKH', sql.VarChar(10), oldData.MaKH)
          .input('bienSo', sql.NVarChar(15), oldData.BienSo)
          .input('maBienSo', sql.VarChar(10), id)
          .query(`
            SELECT MaBienSo 
            FROM BienSoXe 
            WHERE MaKH = @maKH 
              AND BienSo = @bienSo 
              AND TrangThai = N'Hoạt động'
              AND MaBienSo != @maBienSo
          `);

        if (duplicateCheck.recordset.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Biển số này đã có bản ghi Hoạt động khác của cùng khách hàng'
          });
        }
      }

      // Cập nhật
      await pool.request()
        .input('maBienSo', sql.VarChar(10), id)
        .input('trangThai', sql.NVarChar(20), trangThai)
        .input('ghiChu', sql.NVarChar(255), ghiChu || oldData.GhiChu)
        .query(`
          UPDATE BienSoXe 
          SET TrangThai = @trangThai,
              GhiChu = @ghiChu
          WHERE MaBienSo = @maBienSo
        `);

      res.json({
        success: true,
        message: `Cập nhật trạng thái biển số thành công: ${oldData.TrangThai} → ${trangThai}`
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa biển số (soft delete - chuyển sang Hết hạn)
   * DELETE /api/license-plates/:id
   */
  async deleteLicensePlate(req, res, next) {
    try {
      const { id } = req.params;
      const { forceDelete } = req.query; // true: hard delete, false: soft delete

      const pool = await getConnection();

      // Kiểm tra tồn tại
      const checkExist = await pool.request()
        .input('maBienSo', sql.VarChar(10), id)
        .query('SELECT * FROM BienSoXe WHERE MaBienSo = @maBienSo');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy biển số'
        });
      }

      const plateData = checkExist.recordset[0];

      // Kiểm tra có hợp đồng đang sử dụng không
      const contractCheck = await pool.request()
        .input('maKH', sql.VarChar(10), plateData.MaKH)
        .input('bienSo', sql.NVarChar(15), plateData.BienSo)
        .query(`
          SELECT COUNT(*) as count 
          FROM HopDong hd
          JOIN Xe xe ON hd.MaXe = xe.MaXe
          JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe 
          JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH
          WHERE bs.BienSo = @bienSo 
            AND hd.TrangThai IN ('ACTIVE', 'DRAFT')
        `);

      if (contractCheck.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa biển số đang được sử dụng trong hợp đồng hoạt động'
        });
      }

      if (forceDelete === 'true') {
        // Hard delete
        await pool.request()
          .input('maBienSo', sql.VarChar(10), id)
          .query('DELETE FROM BienSoXe WHERE MaBienSo = @maBienSo');

        res.json({
          success: true,
          message: 'Xóa vĩnh viễn biển số thành công'
        });
      } else {
        // Soft delete - chuyển sang Hết hạn
        await pool.request()
          .input('maBienSo', sql.VarChar(10), id)
          .query(`
            UPDATE BienSoXe 
            SET TrangThai = N'Hết hạn',
                GhiChu = CONCAT(ISNULL(GhiChu, ''), N' [Đã ngừng sử dụng]')
            WHERE MaBienSo = @maBienSo
          `);

        res.json({
          success: true,
          message: 'Đã chuyển biển số sang trạng thái Hết hạn'
        });
      }

    } catch (error) {
      next(error);
    }
  }

  /**
   * Tìm kiếm biển số
   * GET /api/license-plates/search?q=29A-123
   */
  async search(req, res, next) {
    try {
      const { q, trangThai } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm'
        });
      }

      const pool = await getConnection();
      
      let query = `
        SELECT 
          bs.*,
          kh.HoTen as TenKhachHang,
          kh.CMND_CCCD,
          kh.SDT
        FROM BienSoXe bs
        JOIN KhachHang kh ON bs.MaKH = kh.MaKH
        WHERE bs.BienSo LIKE @search
      `;

      if (trangThai) {
        query += ' AND bs.TrangThai = @trangThai';
      }

      query += ' ORDER BY bs.NgayDangKy DESC';

      const request = pool.request()
        .input('search', sql.NVarChar(50), `%${q}%`);

      if (trangThai) {
        request.input('trangThai', sql.NVarChar(20), trangThai);
      }

      const result = await request.query(query);

      res.json({
        success: true,
        data: result.recordset,
        total: result.recordset.length
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LicensePlateController();
