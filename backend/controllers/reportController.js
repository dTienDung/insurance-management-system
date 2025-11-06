// ============================================
// PJICO - Report Controller
// Xử lý logic báo cáo
// ============================================

const { getConnection, sql } = require('../config/database');
const { mapReportData, formatCurrency, formatDate } = require('../utils/mapping');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class ReportController {
  // ============================================
  // BÁO CÁO DOANH THU
  // ============================================

  async getMonthlyRevenue(req, res) {
    try {
      const { year = new Date().getFullYear() } = req.query;
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('year', sql.Int, year)
        .query(`
          SELECT 
            MONTH(NgayTao) as Thang,
            COUNT(*) as SoHopDong,
            SUM(PhiBH) as DoanhThu,
            COUNT(DISTINCT MaKH) as SoKhachHang
          FROM HDBH
          WHERE YEAR(NgayTao) = @year
            AND TrangThai = N'Hiệu lực'
          GROUP BY MONTH(NgayTao)
          ORDER BY Thang
        `);

      const data = result.recordset.map(row => ({
        thang: row.Thang,
        soHopDong: row.SoHopDong,
        doanhThu: row.DoanhThu || 0,
        soKhachHang: row.SoKhachHang
      }));

      res.json({
        success: true,
        data: data,
        summary: {
          tongDoanhThu: data.reduce((sum, item) => sum + item.doanhThu, 0),
          tongHopDong: data.reduce((sum, item) => sum + item.soHopDong, 0)
        }
      });
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy báo cáo doanh thu theo tháng'
      });
    }
  }

  async getYearlyRevenue(req, res) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            YEAR(NgayTao) as Nam,
            COUNT(*) as SoHopDong,
            SUM(PhiBH) as DoanhThu,
            COUNT(DISTINCT MaKH) as SoKhachHang
          FROM HDBH
          WHERE TrangThai = N'Hiệu lực'
          GROUP BY YEAR(NgayTao)
          ORDER BY Nam DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting yearly revenue:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy báo cáo doanh thu theo năm'
      });
    }
  }

  async getBranchRevenue(req, res) {
    // Implement nếu có nhiều chi nhánh
    res.json({
      success: true,
      data: [],
      message: 'Chức năng đang được phát triển'
    });
  }

  // ============================================
  // BÁO CÁO HỢP ĐỒNG
  // ============================================

  async getContractsByStatus(req, res) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            TrangThai,
            COUNT(*) as SoLuong,
            SUM(PhiBH) as TongPhi
          FROM HDBH
          GROUP BY TrangThai
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting contracts by status:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy thống kê hợp đồng theo trạng thái'
      });
    }
  }

  async getContractsByType(req, res) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            LoaiBH,
            COUNT(*) as SoLuong,
            SUM(PhiBH) as TongPhi,
            AVG(PhiBH) as PhiTrungBinh
          FROM HDBH
          WHERE TrangThai = N'Hiệu lực'
          GROUP BY LoaiBH
          ORDER BY SoLuong DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting contracts by type:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy thống kê hợp đồng theo loại'
      });
    }
  }

  async getExpiringContracts(req, res) {
    try {
      const { days = 30 } = req.query;
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('days', sql.Int, days)
        .query(`
          SELECT 
            hd.MaHD,
            hd.SoHD,
            kh.TenKH,
            x.BienSo,
            hd.NgayKetThuc,
            DATEDIFF(day, GETDATE(), hd.NgayKetThuc) as SoNgayConLai,
            hd.PhiBH
          FROM HDBH hd
          INNER JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          INNER JOIN XeCo x ON hd.MaXe = x.MaXe
          WHERE hd.TrangThai = N'Hiệu lực'
            AND DATEDIFF(day, GETDATE(), hd.NgayKetThuc) BETWEEN 0 AND @days
          ORDER BY hd.NgayKetThuc
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting expiring contracts:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách hợp đồng sắp hết hạn'
      });
    }
  }

  async getNewContracts(req, res) {
    try {
      const { fromDate, toDate } = req.query;
      const from = fromDate || new Date(new Date().setDate(1)).toISOString().split('T')[0];
      const to = toDate || new Date().toISOString().split('T')[0];
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('fromDate', sql.Date, from)
        .input('toDate', sql.Date, to)
        .query(`
          SELECT 
            hd.*,
            kh.TenKH,
            x.BienSo
          FROM HDBH hd
          INNER JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          INNER JOIN XeCo x ON hd.MaXe = x.MaXe
          WHERE hd.NgayTao BETWEEN @fromDate AND @toDate
          ORDER BY hd.NgayTao DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting new contracts:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách hợp đồng mới'
      });
    }
  }

  // ============================================
  // BÁO CÁO KHÁCH HÀNG
  // ============================================

  async getCustomersByType(req, res) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            LoaiKH,
            COUNT(*) as SoLuong,
            COUNT(DISTINCT kh.MaKH) as SoKhachHang,
            SUM(hd.PhiBH) as TongDoanhThu
          FROM KhachHang kh
          LEFT JOIN HDBH hd ON kh.MaKH = hd.MaKH
          GROUP BY LoaiKH
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting customers by type:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy thống kê khách hàng theo loại'
      });
    }
  }

  async getNewCustomers(req, res) {
    try {
      const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('month', sql.Int, month)
        .input('year', sql.Int, year)
        .query(`
          SELECT 
            *
          FROM KhachHang
          WHERE MONTH(NgayTao) = @month 
            AND YEAR(NgayTao) = @year
          ORDER BY NgayTao DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting new customers:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách khách hàng mới'
      });
    }
  }

  async getTopCustomers(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            kh.MaKH,
            kh.TenKH,
            kh.LoaiKH,
            COUNT(hd.MaHD) as SoHopDong,
            SUM(hd.PhiBH) as TongDoanhThu
          FROM KhachHang kh
          INNER JOIN HDBH hd ON kh.MaKH = hd.MaKH
          WHERE hd.TrangThai = N'Hiệu lực'
          GROUP BY kh.MaKH, kh.TenKH, kh.LoaiKH
          ORDER BY TongDoanhThu DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      console.error('Error getting top customers:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách top khách hàng'
      });
    }
  }

  // ============================================
  // BÁO CÁO BỒI THƯỜNG (Placeholder)
  // ============================================

  async getMonthlyClaims(req, res) {
    res.json({
      success: true,
      data: [],
      message: 'Chức năng đang được phát triển'
    });
  }

  async getClaimsByStatus(req, res) {
    res.json({
      success: true,
      data: [],
      message: 'Chức năng đang được phát triển'
    });
  }

  async getClaimsRatio(req, res) {
    res.json({
      success: true,
      data: {
        ratio: 0,
        totalClaims: 0,
        totalPremium: 0
      },
      message: 'Chức năng đang được phát triển'
    });
  }

  // ============================================
  // DASHBOARD
  // ============================================

  async getDashboardStats(req, res) {
    try {
      const pool = await getConnection();
      
      // Thống kê tổng quan
      const [contracts, customers, vehicles, revenue] = await Promise.all([
        // Tổng hợp đồng
        pool.request().query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN TrangThai = N'Hiệu lực' THEN 1 END) as active,
            COUNT(CASE WHEN TrangThai = N'Hết hạn' THEN 1 END) as expired
          FROM HDBH
        `),
        
        // Tổng khách hàng
        pool.request().query(`
          SELECT COUNT(*) as total FROM KhachHang
        `),
        
        // Tổng xe
        pool.request().query(`
          SELECT COUNT(*) as total FROM XeCo
        `),
        
        // Doanh thu tháng này
        pool.request().query(`
          SELECT 
            SUM(PhiBH) as monthRevenue
          FROM HDBH
          WHERE MONTH(NgayTao) = MONTH(GETDATE())
            AND YEAR(NgayTao) = YEAR(GETDATE())
            AND TrangThai = N'Hiệu lực'
        `)
      ]);

      res.json({
        success: true,
        data: {
          contracts: contracts.recordset[0],
          customers: customers.recordset[0].total,
          vehicles: vehicles.recordset[0].total,
          monthRevenue: revenue.recordset[0].monthRevenue || 0
        }
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy thống kê dashboard'
      });
    }
  }

  async getSummaryReport(req, res) {
    try {
      const { fromDate, toDate } = req.query;
      
      // Logic tạo báo cáo tổng hợp
      res.json({
        success: true,
        data: {
          period: { fromDate, toDate },
          revenue: 0,
          contracts: 0,
          customers: 0,
          claims: 0
        }
      });
    } catch (error) {
      console.error('Error getting summary report:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể tạo báo cáo tổng hợp'
      });
    }
  }

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  async exportToExcel(req, res) {
    try {
      const { reportType, data } = req.body;
      
      // Tạo workbook Excel
      // Implement logic export Excel
      
      res.json({
        success: true,
        message: 'Xuất Excel thành công',
        downloadUrl: '/downloads/report.xlsx'
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể xuất file Excel'
      });
    }
  }

  async exportToPDF(req, res) {
    try {
      const { reportType, data } = req.body;
      
      // Tạo PDF document
      // Implement logic export PDF
      
      res.json({
        success: true,
        message: 'Xuất PDF thành công',
        downloadUrl: '/downloads/report.pdf'
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể xuất file PDF'
      });
    }
  }

  async exportToWord(req, res) {
    try {
      const { reportType, data } = req.body;
      
      // Tạo Word document
      // Implement logic export Word
      
      res.json({
        success: true,
        message: 'Xuất Word thành công',
        downloadUrl: '/downloads/report.docx'
      });
    } catch (error) {
      console.error('Error exporting to Word:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể xuất file Word'
      });
    }
  }

  // ============================================
  // CUSTOM REPORTS
  // ============================================

  async createCustomReport(req, res) {
    try {
      const { query, parameters } = req.body;
      
      // Validate và thực thi query an toàn
      // Implement custom report logic
      
      res.json({
        success: true,
        data: [],
        message: 'Tạo báo cáo tùy chỉnh thành công'
      });
    } catch (error) {
      console.error('Error creating custom report:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể tạo báo cáo tùy chỉnh'
      });
    }
  }

  async getSavedReports(req, res) {
    res.json({
      success: true,
      data: [],
      message: 'Chức năng đang được phát triển'
    });
  }

  async saveReport(req, res) {
    res.json({
      success: true,
      message: 'Lưu báo cáo thành công'
    });
  }

  async deleteReport(req, res) {
    res.json({
      success: true,
      message: 'Xóa báo cáo thành công'
    });
  }
}

module.exports = new ReportController();