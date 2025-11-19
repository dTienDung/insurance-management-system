const { getConnection, sql } = require('../config/database');

class DashboardController {
  async getOverviewStats(req, res, next) {
    try {
      const { year, month } = req.query;
      const pool = await getConnection();

      let dateFilter = '';
      const request = pool.request();

      if (year) {
        dateFilter += ' AND YEAR(hd.NgayKy) = @year';
        request.input('year', sql.Int, parseInt(year));
      }
      if (month) {
        dateFilter += ' AND MONTH(hd.NgayKy) = @month';
        request.input('month', sql.Int, parseInt(month));
      }

      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM HopDong WHERE 1=1 ${dateFilter}) as TongHopDong,
          (SELECT COUNT(*) FROM HopDong WHERE TrangThai = N'Hiệu lực' ${dateFilter}) as HopDongHieuLuc,
          (SELECT COUNT(*) FROM KhachHang) as TongKhachHang,
          (SELECT COUNT(*) FROM Xe) as TongXe,
          (SELECT ISNULL(SUM(PhiBaoHiem), 0) FROM HopDong WHERE 1=1 ${dateFilter}) as TongDoanhThu,
          (SELECT COUNT(*) FROM HopDong 
           WHERE TrangThai = N'Hiệu lực' 
           AND NgayHetHan BETWEEN GETDATE() AND DATEADD(day, 30, GETDATE())
           AND DaNhacTaiTuc = 0) as HopDongSapHetHan
      `;

      const result = await request.query(statsQuery);

      if (!result.recordset || result.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi truy vấn thống kê'
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

  async getRevenueByMonth(req, res, next) {
    try {
      const { year = new Date().getFullYear() } = req.query;

      const pool = await getConnection();
      const result = await pool.request()
        .input('year', sql.Int, parseInt(year))
        .query(`
          SELECT 
            MONTH(NgayKy) as Thang,
            COUNT(*) as SoHopDong,
            SUM(PhiBaoHiem) as DoanhThu
          FROM HopDong
          WHERE YEAR(NgayKy) = @year
          GROUP BY MONTH(NgayKy)
          ORDER BY MONTH(NgayKy)
        `);

      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        Thang: i + 1,
        SoHopDong: 0,
        DoanhThu: 0
      }));

      result.recordset.forEach(row => {
        monthlyData[row.Thang - 1] = row;
      });

      res.json({
        success: true,
        data: monthlyData
      });
    } catch (error) {
      next(error);
    }
  }

  async getContractsByStatus(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            TrangThai,
            COUNT(*) as SoLuong,
            SUM(PhiBaoHiem) as TongPhi
          FROM HopDong
          GROUP BY TrangThai
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopInsuranceTypes(req, res, next) {
    try {
      const { limit = 5 } = req.query;

      const pool = await getConnection();
      const result = await pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .query(`
          SELECT TOP (@limit)
            gb.TenGoi,
            COUNT(hd.MaHD) as SoHopDong,
            SUM(hd.PhiBaoHiem) as TongDoanhThu
          FROM GoiBaoHiem gb
          LEFT JOIN HopDong hd ON gb.MaGoi = hd.MaGoi
          GROUP BY gb.TenGoi
          ORDER BY COUNT(hd.MaHD) DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async getRiskDistribution(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            RiskLevel,
            COUNT(*) as SoLuong
          FROM HoSoThamDinh
          GROUP BY RiskLevel
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopVehicleBrands(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const pool = await getConnection();
      const result = await pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .query(`
          SELECT TOP (@limit)
            xe.HangXe,
            xe.LoaiXe,
            COUNT(hd.MaHD) as SoHopDong,
            AVG(xe.GiaTriXe) as GiaTriTrungBinh
          FROM Xe xe
          LEFT JOIN HopDong hd ON xe.MaXe = hd.MaXe
          GROUP BY xe.HangXe, xe.LoaiXe
          ORDER BY COUNT(hd.MaHD) DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async getRenewalRate(req, res, next) {
    try {
      const { year = new Date().getFullYear() } = req.query;

      const pool = await getConnection();
      const result = await pool.request()
        .input('year', sql.Int, parseInt(year))
        .query(`
          SELECT 
            COUNT(CASE WHEN MaHD_Cu IS NOT NULL THEN 1 END) as SoHopDongTaiTuc,
            COUNT(*) as TongSoHopDong,
            CAST(COUNT(CASE WHEN MaHD_Cu IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) as TyLeTaiTuc
          FROM HopDong
          WHERE YEAR(NgayKy) = @year
        `);

      if (!result.recordset || result.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi truy vấn tỉ lệ tái tục'
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

  async getEmployeePerformance(req, res, next) {
    try {
      const { year, month } = req.query;
      const pool = await getConnection();

      let dateFilter = '';
      const request = pool.request();

      if (year) {
        dateFilter += ' AND YEAR(hd.NgayKy) = @year';
        request.input('year', sql.Int, parseInt(year));
      }
      if (month) {
        dateFilter += ' AND MONTH(hd.NgayKy) = @month';
        request.input('month', sql.Int, parseInt(month));
      }

      const result = await request.query(`
        SELECT 
          nv.MaNV,
          nv.HoTen,
          nv.ChucVu,
          COUNT(hd.MaHD) as SoHopDong,
          SUM(hd.PhiBaoHiem) as TongDoanhThu
        FROM NhanVien nv
        LEFT JOIN HopDong hd ON nv.MaNV = hd.MaNV
        WHERE 1=1 ${dateFilter}
        GROUP BY nv.MaNV, nv.HoTen, nv.ChucVu
        ORDER BY SUM(hd.PhiBaoHiem) DESC
      `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivities(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const pool = await getConnection();
      const result = await pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .query(`
          SELECT TOP (@limit)
            hd.MaHD,
            hd.NgayTao,
            hd.TrangThai,
            kh.HoTen as TenKhachHang,
            bs.BienSo,
            nv.HoTen as NhanVienXuLy
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN KhachHangXe khxe ON xe.MaXe = khxe.MaXe AND kh.MaKH = khxe.MaKH
          LEFT JOIN BienSoXe bs ON khxe.MaKH = bs.MaKH AND bs.TrangThai = N'Đang sử dụng'
          LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
          ORDER BY hd.NgayTao DESC
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

module.exports = new DashboardController();
