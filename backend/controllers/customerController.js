const { getConnection, sql } = require('../config/database');

class CustomerController {
  async getAll(req, res, next) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let query = `
        SELECT kh.*, COUNT(hd.MaHD) as TongHopDong
        FROM KhachHang kh
        LEFT JOIN HopDong hd ON kh.MaKH = hd.MaKH
        WHERE 1=1
      `;

      const request = pool.request();

      if (search) {
        query += ' AND (kh.HoTen LIKE @search OR kh.CMND_CCCD LIKE @search OR kh.SDT LIKE @search)';
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      query += ` 
        GROUP BY kh.MaKH, kh.HoTen, kh.CMND_CCCD, kh.NgaySinh, kh.DiaChi, kh.SDT, kh.Email
        ORDER BY kh.MaKH DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      const countQuery = `SELECT COUNT(*) as total FROM KhachHang WHERE 1=1
        ${search ? 'AND (HoTen LIKE @search OR CMND_CCCD LIKE @search OR SDT LIKE @search)' : ''}`;
      
      const countRequest = pool.request();
      if (search) {
        countRequest.input('search', sql.NVarChar, `%${search}%`);
      }
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
      
      // Lấy thông tin khách hàng
      const result = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query(`
          SELECT kh.*, 
                 (SELECT COUNT(*) FROM HopDong WHERE MaKH = kh.MaKH AND TrangThai IN (N'ACTIVE', N'PENDING')) as SoHDHieuLuc,
                 (SELECT COUNT(DISTINCT kxe.MaXe) FROM KhachHangXe kxe WHERE kxe.MaKH = kh.MaKH AND kxe.NgayKetThucSoHuu IS NULL) as SoXeSoHuu
          FROM KhachHang kh
          WHERE kh.MaKH = @maKH
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      // Lấy danh sách xe của khách hàng (qua KhachHangXe)
      const vehiclesResult = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query(`
          SELECT 
            xe.MaXe, 
            xe.HangXe, 
            xe.LoaiXe, 
            xe.NamSX,
            xe.GiaTriXe,
            bs.BienSo,
            kxe.NgayBatDauSoHuu,
            kxe.NgayKetThucSoHuu
          FROM KhachHangXe kxe
          INNER JOIN Xe xe ON kxe.MaXe = xe.MaXe
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE kxe.MaKH = @maKH AND kxe.NgayKetThucSoHuu IS NULL
          ORDER BY kxe.NgayBatDauSoHuu DESC
        `);

      // Lấy danh sách hợp đồng của khách hàng
      const contractsResult = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query(`
          SELECT 
            hd.MaHD,
            hd.NgayBatDau,
            hd.NgayKetThuc,
            hd.TrangThai,
            hd.PhiBH,
            xe.HangXe,
            xe.LoaiXe,
            bs.BienSo,
            goi.TenGoi
          FROM HopDong hd
          INNER JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN BienSoXe bs ON hd.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          LEFT JOIN GoiBaoHiem goi ON hd.MaGoi = goi.MaGoi
          WHERE hd.MaKH = @maKH
          ORDER BY hd.NgayBatDau DESC
        `);

      res.json({
        success: true,
        data: {
          ...result.recordset[0],
          Vehicles: vehiclesResult.recordset,
          Contracts: contractsResult.recordset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { hoTen, cccd, ngaySinh, diaChi, sdt, email } = req.body;

      if (!hoTen || !cccd || !sdt) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
        });
      }

      // LUẬT NGHIỆP VỤ 1: CCCD/CMND phải là 9 hoặc 12 số (duy nhất trong hệ thống)
      const cccdRegex = /^\d{9}$|^\d{12}$/;
      if (!cccdRegex.test(cccd)) {
        return res.status(400).json({
          success: false,
          message: 'CMND/CCCD phải có độ dài 9 hoặc 12 số'
        });
      }

      // LUẬT 1.2: Validate CCCD 12 số checksum (số cuối là check digit)
      if (cccd.length === 12) {
        const digits = cccd.split('').map(d => parseInt(d));
        const weights = [2, 7, 9, 1, 3, 7, 9, 1, 3, 7, 9]; // Hệ số theo chuẩn CCCD VN
        let sum = 0;
        for (let i = 0; i < 11; i++) {
          sum += digits[i] * weights[i];
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        
        if (checkDigit !== digits[11]) {
          return res.status(400).json({
            success: false,
            message: 'CCCD không hợp lệ (checksum sai). Vui lòng kiểm tra lại số CCCD.'
          });
        }
      }

      // LUẬT NGHIỆP VỤ: Kiểm tra tuổi pháp lý (>= 18 tuổi)
      if (ngaySinh) {
        const birthDate = new Date(ngaySinh);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          return res.status(400).json({
            success: false,
            message: 'Chủ xe phải đủ 18 tuổi trở lên (tuổi pháp lý)'
          });
        }
      }

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('cccd', sql.VarChar(12), cccd)
        .query('SELECT MaKH FROM KhachHang WHERE CMND_CCCD = @cccd');

      if (checkExist.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'CCCD đã tồn tại trong hệ thống'
        });
      }

      const nextIdResult = await pool.request()
        .query('SELECT ISNULL(MAX(CAST(SUBSTRING(MaKH, 3, 4) AS INT)), 0) + 1 as NextID FROM KhachHang');
      
      if (!nextIdResult.recordset || nextIdResult.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Không thể tạo mã khách hàng'
        });
      }
      
      const nextId = nextIdResult.recordset[0].NextID;
      // LUẬT NGHIỆP VỤ: MaKH = KH + 4 số (VD: KH0026)
      const maKH = 'KH' + String(nextId).padStart(4, '0');

      await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .input('hoTen', sql.NVarChar(60), hoTen)
        .input('cccd', sql.VarChar(12), cccd)
        .input('ngaySinh', sql.Date, ngaySinh || null)
        .input('diaChi', sql.NVarChar(120), diaChi || null)
        .input('sdt', sql.VarChar(12), sdt)
        .input('email', sql.VarChar(80), email || null)
        .query(`
          INSERT INTO KhachHang (MaKH, HoTen, CMND_CCCD, NgaySinh, DiaChi, SDT, Email)
          VALUES (@maKH, @hoTen, @cccd, @ngaySinh, @diaChi, @sdt, @email)
        `);

      res.status(201).json({
        success: true,
        message: 'Thêm khách hàng thành công',
        data: { maKH }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { hoTen, ngaySinh, diaChi, sdt, email } = req.body;

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query('SELECT MaKH, HoTen, NgaySinh, CMND_CCCD FROM KhachHang WHERE MaKH = @maKH');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      const oldData = checkExist.recordset[0];
      const warnings = [];

      // LUẬT NGHIỆP VỤ 6.2 & 6.3: Cảnh báo thay đổi Master Data
      const activeContractsCheck = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query(`
          SELECT COUNT(*) as count 
          FROM HopDong 
          WHERE MaKH = @maKH AND TrangThai = N'ACTIVE'
        `);

      const hasActiveContracts = activeContractsCheck.recordset[0].count > 0;

      if (hasActiveContracts) {
        // Cảnh báo nếu thay đổi thông tin quan trọng
        if (hoTen && hoTen !== oldData.HoTen) {
          const warningMsg = '⚠️ Khách hàng có hợp đồng đang hiệu lực. Thay đổi tên sẽ ảnh hưởng tới tất cả hợp đồng (cũ và mới).';
          warnings.push(warningMsg);
          
          // LUẬT 6.3: Ghi audit log cho risk-sensitive changes
          await pool.request()
            .input('tableName', sql.NVarChar(50), 'KhachHang')
            .input('recordID', sql.VarChar(10), id)
            .input('action', sql.NVarChar(20), 'UPDATE')
            .input('oldValue', sql.NVarChar(sql.MAX), oldData.HoTen)
            .input('newValue', sql.NVarChar(sql.MAX), hoTen)
            .input('userName', sql.NVarChar(50), req.user?.username || 'system')
            .input('reason', sql.NVarChar(255), warningMsg)
            .query(`
              INSERT INTO AuditLog (TableName, RecordID, Action, OldValue, NewValue, ChangedBy, ChangeReason)
              VALUES (@tableName, @recordID, @action, @oldValue, @newValue, @userName, @reason)
            `);
        }
        if (ngaySinh && ngaySinh !== oldData.NgaySinh) {
          const warningMsg = '⚠️ Thay đổi ngày sinh có thể ảnh hưởng đến tính toán rủi ro tái tục.';
          warnings.push(warningMsg);
          
          await pool.request()
            .input('tableName', sql.NVarChar(50), 'KhachHang')
            .input('recordID', sql.VarChar(10), id)
            .input('action', sql.NVarChar(20), 'UPDATE')
            .input('oldValue', sql.NVarChar(sql.MAX), oldData.NgaySinh?.toISOString() || '')
            .input('newValue', sql.NVarChar(sql.MAX), ngaySinh)
            .input('userName', sql.NVarChar(50), req.user?.username || 'system')
            .input('reason', sql.NVarChar(255), warningMsg)
            .query(`
              INSERT INTO AuditLog (TableName, RecordID, Action, OldValue, NewValue, ChangedBy, ChangeReason)
              VALUES (@tableName, @recordID, @action, @oldValue, @newValue, @userName, @reason)
            `);
        }
      }

      await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .input('hoTen', sql.NVarChar(60), hoTen)
        .input('ngaySinh', sql.Date, ngaySinh || null)
        .input('diaChi', sql.NVarChar(120), diaChi || null)
        .input('sdt', sql.VarChar(12), sdt)
        .input('email', sql.VarChar(80), email || null)
        .query(`
          UPDATE KhachHang 
          SET HoTen = @hoTen, NgaySinh = @ngaySinh, DiaChi = @diaChi, 
              SDT = @sdt, Email = @email
          WHERE MaKH = @maKH
        `);

      res.json({
        success: true,
        message: warnings.length > 0 ? 'Đã cập nhật (có cảnh báo)' : 'Cập nhật thông tin khách hàng thành công',
        warnings: warnings.length > 0 ? warnings : undefined
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      
      const checkContracts = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query('SELECT COUNT(*) as count FROM HopDong WHERE MaKH = @maKH');

      if (checkContracts.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa khách hàng đã có hợp đồng'
        });
      }

      const result = await pool.request()
        .input('maKH', sql.VarChar(10), id)
        .query('DELETE FROM KhachHang WHERE MaKH = @maKH');

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      res.json({
        success: true,
        message: 'Xóa khách hàng thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
