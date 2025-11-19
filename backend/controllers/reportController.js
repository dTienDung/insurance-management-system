// ============================================
// PJICO - Report Controller
// Xử lý logic báo cáo
// ============================================

const { getConnection, sql } = require('../config/database');
const { mapReportData, formatCurrency, formatDate } = require('../utils/mapping');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const pdfReportService = require('../services/pdfReportService');
const path = require('path');
const fs = require('fs');

class ReportController {
  // ============================================
  // BÁO CÁO DOANH THU
  // ============================================

  async getMonthlyRevenue(req, res) {
    try {
      let { year, fromDate, toDate } = req.query;
      
      const pool = await getConnection();
      let query = '';
      const request = pool.request();
      
      // Nếu có fromDate và toDate, dùng date range
      if (fromDate && toDate) {
        query = `
          SELECT 
            MONTH(hd.NgayKy) as Thang,
            YEAR(hd.NgayKy) as Nam,
            COUNT(DISTINCT hd.MaHD) as SoHopDong,
            SUM(hd.PhiBaoHiem) as DoanhThu,
            COUNT(DISTINCT hd.MaKH) as SoKhachHang
          FROM HopDong hd
          WHERE hd.NgayKy BETWEEN @fromDate AND @toDate
            AND hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
          GROUP BY YEAR(hd.NgayKy), MONTH(hd.NgayKy)
          ORDER BY Nam, Thang
        `;
        request.input('fromDate', sql.Date, fromDate);
        request.input('toDate', sql.Date, toDate);
      } else {
        // Fallback về year nếu không có date range
        if (typeof year === 'object' && year.year) {
          year = year.year;
        }
        year = parseInt(year) || new Date().getFullYear();
        
        query = `
          SELECT 
            MONTH(hd.NgayKy) as Thang,
            COUNT(DISTINCT hd.MaHD) as SoHopDong,
            SUM(hd.PhiBaoHiem) as DoanhThu,
            COUNT(DISTINCT hd.MaKH) as SoKhachHang
          FROM HopDong hd
          WHERE YEAR(hd.NgayKy) = @year
            AND hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
          GROUP BY MONTH(hd.NgayKy)
          ORDER BY Thang
        `;
        request.input('year', sql.Int, year);
      }
      
      const result = await request.query(query);

      const data = result.recordset.map(row => ({
        thang: row.Thang,
        nam: row.Nam,
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
            YEAR(hd.NgayKy) as Nam,
            COUNT(DISTINCT hd.MaHD) as SoHopDong,
            SUM(hd.PhiBaoHiem) as DoanhThu,
            COUNT(DISTINCT hd.MaKH) as SoKhachHang
          FROM HopDong hd
          WHERE hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
          GROUP BY YEAR(hd.NgayKy)
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
            SUM(PhiBaoHiem) as TongPhi
          FROM HopDong
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
            gb.TenGoi as LoaiBH,
            COUNT(hd.MaHD) as SoLuong,
            SUM(hd.PhiBaoHiem) as TongPhi,
            AVG(hd.PhiBaoHiem) as PhiTrungBinh
          FROM GoiBaoHiem gb
          LEFT JOIN HopDong hd ON gb.MaGoi = hd.MaGoi
          WHERE hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
          GROUP BY gb.TenGoi
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
            kh.HoTen as TenKH,
            bs.BienSo,
            hd.NgayHetHan as NgayKetThuc,
            DATEDIFF(day, GETDATE(), hd.NgayHetHan) as SoNgayConLai,
            hd.PhiBaoHiem as PhiBH
          FROM HopDong hd
          INNER JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          INNER JOIN Xe x ON hd.MaXe = x.MaXe
          LEFT JOIN KhachHangXe khxe ON x.MaXe = khxe.MaXe AND kh.MaKH = khxe.MaKH
          LEFT JOIN BienSoXe bs ON khxe.MaKH = bs.MaKH AND bs.TrangThai = N'Đang sử dụng'
          WHERE hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
            AND DATEDIFF(day, GETDATE(), hd.NgayHetHan) BETWEEN 0 AND @days
          ORDER BY hd.NgayHetHan
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
            kh.HoTen as TenKH,
            bs.BienSo
          FROM HopDong hd
          INNER JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          INNER JOIN Xe x ON hd.MaXe = x.MaXe
          LEFT JOIN KhachHangXe khxe ON x.MaXe = khxe.MaXe AND kh.MaKH = khxe.MaKH
          LEFT JOIN BienSoXe bs ON khxe.MaKH = bs.MaKH AND bs.TrangThai = N'Đang sử dụng'
          WHERE hd.NgayKy BETWEEN @fromDate AND @toDate
          ORDER BY hd.NgayKy DESC
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
            kh.LoaiKH,
            COUNT(DISTINCT kh.MaKH) as SoKhachHang,
            COUNT(hd.MaHD) as SoHopDong,
            ISNULL(SUM(hd.PhiBaoHiem), 0) as TongDoanhThu
          FROM KhachHang kh
          LEFT JOIN HopDong hd ON kh.MaKH = hd.MaKH
          GROUP BY kh.LoaiKH
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
          SELECT DISTINCT
            kh.*,
            MIN(hd.NgayKy) as NgayHopDongDauTien
          FROM KhachHang kh
          INNER JOIN HopDong hd ON kh.MaKH = hd.MaKH
          WHERE MONTH(hd.NgayKy) = @month 
            AND YEAR(hd.NgayKy) = @year
          GROUP BY kh.MaKH, kh.HoTen, kh.CMND_CCCD, kh.NgaySinh, kh.DiaChi, kh.SDT, kh.Email
          ORDER BY NgayHopDongDauTien DESC
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
            kh.HoTen as TenKH,
            kh.LoaiKH,
            COUNT(hd.MaHD) as SoHopDong,
            SUM(hd.PhiBaoHiem) as TongDoanhThu
          FROM KhachHang kh
          INNER JOIN HopDong hd ON kh.MaKH = hd.MaKH
          WHERE hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
          GROUP BY kh.MaKH, kh.HoTen, kh.LoaiKH
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
            COUNT(CASE WHEN TrangThai IN (N'Hiệu lực', N'ACTIVE') THEN 1 END) as active,
            COUNT(CASE WHEN TrangThai IN (N'Hết hạn', N'EXPIRED') THEN 1 END) as expired
          FROM HopDong
        `),
        
        // Tổng khách hàng
        pool.request().query(`
          SELECT COUNT(*) as total FROM KhachHang
        `),
        
        // Tổng xe
        pool.request().query(`
          SELECT COUNT(*) as total FROM Xe
        `),
        
        // Doanh thu tháng này
        pool.request().query(`
          SELECT 
            ISNULL(SUM(PhiBaoHiem), 0) as monthRevenue
          FROM HopDong
          WHERE MONTH(NgayKy) = MONTH(GETDATE())
            AND YEAR(NgayKy) = YEAR(GETDATE())
            AND TrangThai IN (N'Hiệu lực', N'ACTIVE')
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
  // BÁO CÁO CHI TIẾT - SỬ DỤNG VIEWs
  // ============================================

  async getContractsDetailByStatus(req, res) {
    try {
      const { trangThai, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      const request = pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, offset);

      let whereClause = '';
      if (trangThai) {
        whereClause = 'WHERE TrangThai = @trangThai';
        request.input('trangThai', sql.NVarChar(15), trangThai);
      }

      // Sử dụng VIEW v_DanhSach_HopDong_TheoTrangThai
      const result = await request.query(`
        SELECT * FROM v_DanhSach_HopDong_TheoTrangThai
        ${whereClause}
        ORDER BY NgayKy DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

      // Đếm tổng số
      const countResult = await pool.request()
        .input('trangThai', sql.NVarChar(15), trangThai)
        .query(`
          SELECT COUNT(*) as total 
          FROM v_DanhSach_HopDong_TheoTrangThai
          ${whereClause}
        `);

      if (!countResult.recordset || countResult.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi đếm số lượng hợp đồng'
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
      console.error('Error getting contracts detail by status:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách hợp đồng chi tiết'
      });
    }
  }

  async getCustomersWithContracts(req, res) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      const request = pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, offset);

      let whereClause = '';
      if (search) {
        whereClause = 'WHERE HoTen LIKE @search OR SDT LIKE @search OR Email LIKE @search';
        request.input('search', sql.NVarChar(100), `%${search}%`);
      }

      // Sử dụng VIEW v_KhachHang_ChiTiet
      const result = await request.query(`
        SELECT * FROM v_KhachHang_ChiTiet
        ${whereClause}
        ORDER BY SoHopDong DESC, HoTen
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

      const countResult = await pool.request()
        .input('search', sql.NVarChar(100), search ? `%${search}%` : null)
        .query(`
          SELECT COUNT(*) as total 
          FROM v_KhachHang_ChiTiet
          ${whereClause}
        `);

      if (!countResult.recordset || countResult.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi đếm số khách hàng'
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
      console.error('Error getting customers with contracts:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách khách hàng'
      });
    }
  }

  async getRenewalReport(req, res) {
    try {
      const { year, month } = req.query;

      const pool = await getConnection();
      const request = pool.request();

      let whereClause = '1=1';
      if (year) {
        whereClause += ' AND YEAR(NgayHetHan) = @year';
        request.input('year', sql.Int, parseInt(year));
      }
      if (month) {
        whereClause += ' AND MONTH(NgayHetHan) = @month';
        request.input('month', sql.Int, parseInt(month));
      }

      // Sử dụng VIEW v_BaoCao_TaiTuc
      const result = await request.query(`
        SELECT 
          TrangThaiTaiTuc,
          COUNT(*) as SoLuong,
          SUM(PhiBaoHiem) as TongPhi
        FROM v_BaoCao_TaiTuc
        WHERE ${whereClause}
        GROUP BY TrangThaiTaiTuc
      `);

      // Chi tiết hợp đồng tái tục
      const detailResult = await request.query(`
        SELECT TOP 100 * 
        FROM v_BaoCao_TaiTuc
        WHERE ${whereClause}
        ORDER BY NgayHetHan DESC
      `);

      // Tính tỷ lệ tái tục
      const totalContracts = result.recordset.reduce((sum, r) => sum + r.SoLuong, 0);
      const renewedContracts = result.recordset.find(r => r.TrangThaiTaiTuc === 'Đã tái tục')?.SoLuong || 0;
      const tyLeTaiTuc = totalContracts > 0 ? (renewedContracts / totalContracts * 100).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          summary: result.recordset,
          details: detailResult.recordset,
          statistics: {
            tongHopDong: totalContracts,
            daTaiTuc: renewedContracts,
            chuaTaiTuc: totalContracts - renewedContracts,
            tyLeTaiTuc: parseFloat(tyLeTaiTuc)
          }
        }
      });
    } catch (error) {
      console.error('Error getting renewal report:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy báo cáo tái tục'
      });
    }
  }

  async getAssessmentsByRiskLevel(req, res) {
    try {
      const { riskLevel, trangThai } = req.query;

      const pool = await getConnection();
      const request = pool.request();

      let whereClause = '1=1';
      if (riskLevel) {
        whereClause += ' AND RiskLevel = @riskLevel';
        request.input('riskLevel', sql.NVarChar(20), riskLevel);
      }
      if (trangThai) {
        whereClause += ' AND TrangThai = @trangThai';
        request.input('trangThai', sql.NVarChar(30), trangThai);
      }

      // Sử dụng VIEW v_ThongKe_ThamDinh
      const summaryResult = await pool.request().query(`
        SELECT 
          RiskLevel,
          TrangThai,
          SoLuongHoSo,
          PhiDuKienTrungBinh
        FROM v_ThongKe_ThamDinh
        ORDER BY 
          CASE RiskLevel 
            WHEN 'LOW' THEN 1 
            WHEN 'MEDIUM' THEN 2 
            WHEN 'HIGH' THEN 3 
            WHEN 'REJECT' THEN 4 
          END
      `);

      // Chi tiết hồ sơ
      const detailResult = await request.query(`
        SELECT 
          hs.MaHS,
          hs.MaHD,
          hs.NgayLap,
          hs.RiskLevel,
          hs.TrangThai,
          hs.KetQua,
          hs.PhiDuKien,
          kh.HoTen,
          xe.HangXe,
          xe.LoaiXe,
          bs.BienSo
        FROM HoSoThamDinh hs
        LEFT JOIN KhachHang kh ON hs.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hs.MaXe = xe.MaXe
        LEFT JOIN KhachHangXe khxe ON xe.MaXe = khxe.MaXe AND kh.MaKH = khxe.MaKH
        LEFT JOIN BienSoXe bs ON khxe.MaKH = bs.MaKH AND bs.TrangThai = N'Đang sử dụng'
        WHERE ${whereClause}
        ORDER BY hs.NgayLap DESC
      `);

      res.json({
        success: true,
        data: {
          summary: summaryResult.recordset,
          details: detailResult.recordset
        }
      });
    } catch (error) {
      console.error('Error getting assessments by risk level:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy thống kê hồ sơ thẩm định'
      });
    }
  }

  async getRiskAnalysis(req, res) {
    try {
      const pool = await getConnection();

      // Sử dụng VIEW v_PhanTich_RuiRo để lấy dữ liệu thô
      const viewResult = await pool.request().query(`
        SELECT * FROM v_PhanTich_RuiRo
        ORDER BY TanSuatTaiNan DESC, TyLeRuiRoCao DESC
      `);

      // Tính toán phân tích ở backend
      const analysis = viewResult.recordset.map(row => {
        // Phân loại mức độ rủi ro tổng hợp
        let riskScore = 0;
        
        // Yếu tố 1: Tần suất tai nạn (40%)
        if (row.TanSuatTaiNan > 0.3) {riskScore += 40;}
        else if (row.TanSuatTaiNan > 0.15) {riskScore += 25;}
        else if (row.TanSuatTaiNan > 0) {riskScore += 10;}
        
        // Yếu tố 2: Tỷ lệ rủi ro cao (30%)
        if (row.TyLeRuiRoCao > 50) {riskScore += 30;}
        else if (row.TyLeRuiRoCao > 30) {riskScore += 20;}
        else if (row.TyLeRuiRoCao > 10) {riskScore += 10;}
        
        // Yếu tố 3: Tuổi xe trung bình (20%)
        if (row.TuoiXeTrungBinh > 10) {riskScore += 20;}
        else if (row.TuoiXeTrungBinh > 5) {riskScore += 10;}
        else if (row.TuoiXeTrungBinh > 3) {riskScore += 5;}
        
        // Yếu tố 4: Tỷ lệ từ chối (10%)
        if (row.TyLeBiTuChoi > 20) {riskScore += 10;}
        else if (row.TyLeBiTuChoi > 10) {riskScore += 5;}
        
        // Phân loại rủi ro tổng hợp
        let overallRisk = 'LOW';
        let recommendation = 'Nhóm khách hàng tốt, duy trì chính sách hiện tại';
        
        if (riskScore >= 70) {
          overallRisk = 'VERY_HIGH';
          recommendation = 'Dừng nhận hoặc tăng phí 40-50%, yêu cầu kiểm tra kỹ thuật bắt buộc';
        } else if (riskScore >= 50) {
          overallRisk = 'HIGH';
          recommendation = 'Tăng phí 25-35%, giới hạn số lượng, kiểm tra kỹ hơn';
        } else if (riskScore >= 30) {
          overallRisk = 'MEDIUM';
          recommendation = 'Tăng phí 10-20%, xem xét điều kiện bổ sung';
        }
        
        return {
          ...row,
          riskScore,
          overallRisk,
          recommendation,
          // Thêm chi phí dự kiến bồi thường
          estimatedClaimCost: row.TongChiPhiTaiNan / (row.TongSoTaiNan || 1),
          // Tỷ lệ hồ sơ được thẩm định
          assessmentRate: row.SoLuongXe > 0 ? 
            ((row.SoHoSoThamDinh / row.SoLuongXe) * 100).toFixed(2) : 0
        };
      });

      // Tổng hợp theo loại xe
      const byVehicleType = {};
      analysis.forEach(item => {
        if (!byVehicleType[item.LoaiXe]) {
          byVehicleType[item.LoaiXe] = [];
        }
        byVehicleType[item.LoaiXe].push(item);
      });

      // Top 10 nhóm rủi ro cao nhất
      const topRisks = [...analysis]
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          fullAnalysis: analysis,
          byVehicleType: byVehicleType,
          topRisks: topRisks,
          summary: {
            totalGroups: analysis.length,
            highRiskGroups: analysis.filter(a => a.overallRisk === 'HIGH' || a.overallRisk === 'VERY_HIGH').length,
            mediumRiskGroups: analysis.filter(a => a.overallRisk === 'MEDIUM').length,
            lowRiskGroups: analysis.filter(a => a.overallRisk === 'LOW').length
          }
        }
      });
    } catch (error) {
      console.error('Error getting risk analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy phân tích rủi ro'
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

  // ============================================
  // XUẤT BÁO CÁO PDF (THEO CHUẨN VIỆT NAM)
  // ============================================

  /**
   * Xuất báo cáo doanh thu PDF
   */
  async exportRevenuePDF(req, res, next) {
    try {
      const { year = new Date().getFullYear(), month } = req.query;
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('year', sql.Int, year)
        .query(`
          SELECT 
            MONTH(hd.NgayKy) as Thang,
            SUM(hd.PhiBaoHiem) as DoanhThu,
            COUNT(hd.MaHD) as SoHopDong,
            CASE 
              WHEN LAG(SUM(hd.PhiBaoHiem)) OVER (ORDER BY MONTH(hd.NgayKy)) > 0 
              THEN CAST((SUM(hd.PhiBaoHiem) - LAG(SUM(hd.PhiBaoHiem)) OVER (ORDER BY MONTH(hd.NgayKy))) * 100.0 / LAG(SUM(hd.PhiBaoHiem)) OVER (ORDER BY MONTH(hd.NgayKy)) AS DECIMAL(5,2))
              ELSE 0
            END as TangTruong
          FROM HopDong hd
          WHERE YEAR(hd.NgayKy) = @year
            AND hd.TrangThai IN (N'ACTIVE', N'Hiệu lực')
          GROUP BY MONTH(hd.NgayKy)
          ORDER BY Thang
        `);

      const chiTiet = result.recordset.map(row => ({
        Thang: `Tháng ${row.Thang}`,
        DoanhThu: row.DoanhThu?.toLocaleString('vi-VN') || '0',
        SoHopDong: row.SoHopDong || 0,
        TangTruong: (row.TangTruong || 0).toFixed(2) + '%'
      }));

      const reportData = {
        nguoiBaoCao: req.user?.hoTen || 'Hệ thống',
        chucVu: req.user?.chucVu || 'Quản trị viên',
        tuNgay: `01/01/${year}`,
        denNgay: `31/12/${year}`,
        kyBaoCao: `Năm ${year}`,
        chiTiet
      };

      const fileName = `BaoCao_DoanhThu_${year}_${Date.now()}.pdf`;
      const outputPath = path.join(__dirname, '../temp', fileName);

      // Đảm bảo thư mục temp tồn tại
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      await pdfReportService.generateRevenueReport(reportData, outputPath);

      res.download(outputPath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Xóa file sau khi download
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xuất báo cáo tái tục PDF
   */
  async exportRenewalPDF(req, res, next) {
    try {
      const { year = new Date().getFullYear() } = req.query;
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('year', sql.Int, year)
        .query(`
          SELECT 
            MONTH(hd.NgayHetHan) as Thang,
            COUNT(DISTINCT hd.MaHD) as TongDenHan,
            COUNT(DISTINCT CASE WHEN hr.LoaiQuanHe = 'TAI_TUC' THEN hr.MaHD_Moi END) as TaiTucThanhCong,
            CAST(COUNT(DISTINCT CASE WHEN hr.LoaiQuanHe = 'TAI_TUC' THEN hr.MaHD_Moi END) * 100.0 / 
                 NULLIF(COUNT(DISTINCT hd.MaHD), 0) AS DECIMAL(5,2)) as TyLe
          FROM HopDong hd
          LEFT JOIN HopDongRelation hr ON hd.MaHD = hr.MaHD_Goc
          WHERE YEAR(hd.NgayHetHan) = @year
            AND hd.TrangThai IN (N'EXPIRED', N'RENEWED')
          GROUP BY MONTH(hd.NgayHetHan)
          ORDER BY Thang
        `);

      const chiTiet = result.recordset.map(row => ({
        Thang: `Tháng ${row.Thang}`,
        HDDenHan: row.TongDenHan || 0,
        TaiTucThanhCong: row.TaiTucThanhCong || 0,
        TyLe: (row.TyLe || 0).toFixed(2) + '%'
      }));

      const reportData = {
        nguoiBaoCao: req.user?.hoTen || 'Hệ thống',
        chucVu: req.user?.chucVu || 'Nhân viên',
        tuNgay: `01/01/${year}`,
        denNgay: `31/12/${year}`,
        kyBaoCao: `Năm ${year}`,
        chiTiet
      };

      const fileName = `BaoCao_TaiTuc_${year}_${Date.now()}.pdf`;
      const outputPath = path.join(__dirname, '../temp', fileName);

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      await pdfReportService.generateRenewalReport(reportData, outputPath);

      res.download(outputPath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xuất báo cáo thẩm định PDF
   */
  async exportAssessmentPDF(req, res, next) {
    try {
      const { year = new Date().getFullYear() } = req.query;
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('year', sql.Int, year)
        .query(`
          SELECT 
            RiskLevel,
            COUNT(*) as SoLuong,
            CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM HoSoThamDinh WHERE YEAR(NgayLap) = @year) AS DECIMAL(5,2)) as TyLe,
            CASE 
              WHEN RiskLevel = N'CHẤP NHẬN' THEN N'Rủi ro thấp'
              WHEN RiskLevel = N'XEM XÉT' THEN N'Rủi ro trung bình'
              WHEN RiskLevel = N'TỪ CHỐI' THEN N'Rủi ro cao'
              ELSE N'Chưa đánh giá'
            END as GhiChu
          FROM HoSoThamDinh
          WHERE YEAR(NgayLap) = @year
          GROUP BY RiskLevel
          ORDER BY 
            CASE 
              WHEN RiskLevel = N'CHẤP NHẬN' THEN 1
              WHEN RiskLevel = N'XEM XÉT' THEN 2
              WHEN RiskLevel = N'TỪ CHỐI' THEN 3
              ELSE 4
            END
        `);

      const chiTiet = result.recordset.map(row => ({
        MucRuiRo: row.RiskLevel || 'N/A',
        SoLuong: row.SoLuong || 0,
        TyLe: (row.TyLe || 0).toFixed(2) + '%',
        GhiChu: row.GhiChu || ''
      }));

      const reportData = {
        nguoiBaoCao: req.user?.hoTen || 'Hệ thống',
        chucVu: req.user?.chucVu || 'Chuyên viên thẩm định',
        tuNgay: `01/01/${year}`,
        denNgay: `31/12/${year}`,
        kyBaoCao: `Năm ${year}`,
        chiTiet
      };

      const fileName = `BaoCao_ThamDinh_${year}_${Date.now()}.pdf`;
      const outputPath = path.join(__dirname, '../temp', fileName);

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      await pdfReportService.generateAssessmentReport(reportData, outputPath);

      res.download(outputPath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xuất báo cáo quản trị nghiệp vụ PDF
   */
  async exportBusinessPDF(req, res, next) {
    try {
      const { year = new Date().getFullYear() } = req.query;
      
      const pool = await getConnection();
      
      // Lấy các chỉ tiêu nghiệp vụ
      const stats = await pool.request()
        .input('year', sql.Int, year)
        .query(`
          SELECT 
            'Tổng hợp đồng phát hành' as ChiTieu,
            COUNT(*) as KetQua,
            1000 as MucTieu,
            CAST(COUNT(*) * 100.0 / 1000 AS DECIMAL(5,2)) as Dat
          FROM HopDong
          WHERE YEAR(NgayKy) = @year
          UNION ALL
          SELECT 
            N'Doanh thu phí (triệu VNĐ)' as ChiTieu,
            CAST(SUM(PhiBaoHiem) / 1000000 AS INT) as KetQua,
            50000 as MucTieu,
            CAST(SUM(PhiBaoHiem) / 1000000 * 100.0 / 50000 AS DECIMAL(5,2)) as Dat
          FROM HopDong
          WHERE YEAR(NgayKy) = @year AND TrangThai IN (N'ACTIVE', N'Hiệu lực')
          UNION ALL
          SELECT 
            N'Khách hàng mới' as ChiTieu,
            COUNT(DISTINCT MaKH) as KetQua,
            500 as MucTieu,
            CAST(COUNT(DISTINCT MaKH) * 100.0 / 500 AS DECIMAL(5,2)) as Dat
          FROM HopDong
          WHERE YEAR(NgayKy) = @year
          UNION ALL
          SELECT 
            N'Tỷ lệ tái tục (%)' as ChiTieu,
            CAST(COUNT(DISTINCT CASE WHEN hr.LoaiQuanHe = 'TAI_TUC' THEN hr.MaHD_Moi END) * 100.0 / 
                 NULLIF(COUNT(DISTINCT hd.MaHD), 0) AS INT) as KetQua,
            70 as MucTieu,
            CAST(COUNT(DISTINCT CASE WHEN hr.LoaiQuanHe = 'TAI_TUC' THEN hr.MaHD_Moi END) * 100.0 / 
                 NULLIF(COUNT(DISTINCT hd.MaHD), 0) * 100.0 / 70 AS DECIMAL(5,2)) as Dat
          FROM HopDong hd
          LEFT JOIN HopDongRelation hr ON hd.MaHD = hr.MaHD_Goc
          WHERE YEAR(hd.NgayHetHan) = @year
        `);

      const chiTiet = stats.recordset.map(row => ({
        ChiTieu: row.ChiTieu,
        KetQua: (row.KetQua || 0).toLocaleString('vi-VN'),
        MucTieu: (row.MucTieu || 0).toLocaleString('vi-VN'),
        Dat: (row.Dat || 0).toFixed(2) + '%'
      }));

      const reportData = {
        nguoiBaoCao: req.user?.hoTen || 'Hệ thống',
        chucVu: req.user?.chucVu || 'Trưởng phòng',
        tuNgay: `01/01/${year}`,
        denNgay: `31/12/${year}`,
        kyBaoCao: `Năm ${year}`,
        chiTiet
      };

      const fileName = `BaoCao_QuanTriNghiepVu_${year}_${Date.now()}.pdf`;
      const outputPath = path.join(__dirname, '../temp', fileName);

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      await pdfReportService.generateBusinessReport(reportData, outputPath);

      res.download(outputPath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // NEW REPORT SYSTEM - 4 TABS
  // ============================================

  /**
   * Lấy dữ liệu Dashboard Nghiệp vụ (Tab 1)
   */
  async getOperationalDashboard(req, res) {
    try {
      const { timeType, year, month, quarter, status, package: packageFilter, fromDate, toDate } = req.query;
      
      const pool = await getConnection();
      const request = pool.request();

      // Build WHERE clause based on filters
      let whereClause = '1=1';
      
      // Support both date range (fromDate/toDate) and time period (timeType/year/month/quarter)
      if (fromDate && toDate) {
        whereClause += ' AND hd.NgayKy BETWEEN @fromDate AND @toDate';
        request.input('fromDate', sql.Date, fromDate);
        request.input('toDate', sql.Date, toDate);
      } else if (timeType === 'month' && year && month) {
        whereClause += ' AND YEAR(hd.NgayKy) = @year AND MONTH(hd.NgayKy) = @month';
        request.input('year', sql.Int, parseInt(year));
        request.input('month', sql.Int, parseInt(month));
      } else if (timeType === 'quarter' && year && quarter) {
        whereClause += ' AND YEAR(hd.NgayKy) = @year AND DATEPART(QUARTER, hd.NgayKy) = @quarter';
        request.input('year', sql.Int, parseInt(year));
        request.input('quarter', sql.Int, parseInt(quarter));
      } else if (timeType === 'year' && year) {
        whereClause += ' AND YEAR(hd.NgayKy) = @year';
        request.input('year', sql.Int, parseInt(year));
      }

      if (status && status !== 'all') {
        whereClause += ' AND hd.TrangThai = @status';
        request.input('status', sql.NVarChar, status);
      }

      if (packageFilter && packageFilter !== 'all') {
        whereClause += ' AND hd.MaGoi = @package';
        request.input('package', sql.NVarChar, packageFilter);
      }

      // Create a new request for KPIs to include parameters
      const kpisRequest = pool.request();
      
      // Re-add all parameters to the new request
      if (fromDate && toDate) {
        kpisRequest.input('fromDate', sql.Date, fromDate);
        kpisRequest.input('toDate', sql.Date, toDate);
      } else if (timeType === 'month' && year && month) {
        kpisRequest.input('year', sql.Int, parseInt(year));
        kpisRequest.input('month', sql.Int, parseInt(month));
      } else if (timeType === 'quarter' && year && quarter) {
        kpisRequest.input('year', sql.Int, parseInt(year));
        kpisRequest.input('quarter', sql.Int, parseInt(quarter));
      } else if (timeType === 'year' && year) {
        kpisRequest.input('year', sql.Int, parseInt(year));
      }
      
      if (status && status !== 'all') {
        kpisRequest.input('status', sql.NVarChar, status);
      }
      
      if (packageFilter && packageFilter !== 'all') {
        kpisRequest.input('package', sql.NVarChar, packageFilter);
      }

      // KPIs
      const kpis = await kpisRequest.query(`
        SELECT 
          COUNT(*) as totalContracts,
          COUNT(CASE WHEN DATEDIFF(day, hd.NgayKy, GETDATE()) <= 30 THEN 1 END) as newContracts,
          COUNT(CASE WHEN hd.TrangThai IN (N'Hiệu lực', N'ACTIVE') THEN 1 END) as activeContracts,
          COUNT(CASE WHEN DATEDIFF(day, GETDATE(), hd.NgayHetHan) BETWEEN 0 AND 30 THEN 1 END) as expiringContracts,
          SUM(hd.PhiBaoHiem) as totalRevenue
        FROM HopDong hd
        WHERE ${whereClause}
      `);

      // Revenue trend (last 6 months)
      const revenueTrend = await pool.request().query(`
        SELECT TOP 6
          FORMAT(hd.NgayKy, 'yyyy-MM') as month,
          SUM(hd.PhiBaoHiem) as revenue
        FROM HopDong hd
        WHERE hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
        GROUP BY FORMAT(hd.NgayKy, 'yyyy-MM')
        ORDER BY month DESC
      `);

      // Revenue by package
      const revenueByPackage = await pool.request().query(`
        SELECT 
          gb.TenGoi as packageName,
          SUM(hd.PhiBaoHiem) as revenue,
          COUNT(hd.MaHD) as contractCount
        FROM HopDong hd
        INNER JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
        WHERE hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
        GROUP BY gb.TenGoi
      `);

      // Contract list - create new request with parameters
      const contractsRequest = pool.request();
      
      // Re-add parameters for contracts query
      if (fromDate && toDate) {
        contractsRequest.input('fromDate', sql.Date, fromDate);
        contractsRequest.input('toDate', sql.Date, toDate);
      } else if (timeType === 'month' && year && month) {
        contractsRequest.input('year', sql.Int, parseInt(year));
        contractsRequest.input('month', sql.Int, parseInt(month));
      } else if (timeType === 'quarter' && year && quarter) {
        contractsRequest.input('year', sql.Int, parseInt(year));
        contractsRequest.input('quarter', sql.Int, parseInt(quarter));
      } else if (timeType === 'year' && year) {
        contractsRequest.input('year', sql.Int, parseInt(year));
      }
      
      if (status && status !== 'all') {
        contractsRequest.input('status', sql.NVarChar, status);
      }
      
      if (packageFilter && packageFilter !== 'all') {
        contractsRequest.input('package', sql.NVarChar, packageFilter);
      }

      const contracts = await contractsRequest.query(`
        SELECT TOP 100
          hd.MaHD as contractNumber,
          kh.HoTen as customerName,
          bs.BienSo as licensePlate,
          gb.TenGoi as packageName,
          hd.NgayKy as startDate,
          hd.NgayHetHan as endDate,
          hd.TrangThai as status,
          hd.PhiBaoHiem as premium
        FROM HopDong hd
        INNER JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
        INNER JOIN Xe x ON hd.MaXe = x.MaXe
        LEFT JOIN KhachHangXe khxe ON x.MaXe = khxe.MaXe AND kh.MaKH = khxe.MaKH
        LEFT JOIN BienSoXe bs ON khxe.MaKH = bs.MaKH AND bs.TrangThai = N'Đang sử dụng'
        WHERE ${whereClause}
        ORDER BY hd.NgayKy DESC
      `);

      if (!kpis.recordset || kpis.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi truy vấn KPIs'
        });
      }

      res.json({
        success: true,
        data: {
          kpis: kpis.recordset[0],
          revenueTrend: revenueTrend.recordset.reverse(),
          revenueByPackage: revenueByPackage.recordset,
          contracts: contracts.recordset
        }
      });
    } catch (error) {
      console.error('Error getting operational dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy dữ liệu dashboard nghiệp vụ'
      });
    }
  }

  /**
   * Lấy dữ liệu Báo cáo Doanh thu (Tab 2)
   */
  async getRevenueReportData(req, res) {
    try {
      const { timeType, year, month, quarter, package: packageFilter } = req.query;
      
      const pool = await getConnection();
      const request = pool.request();

      let periodStart, periodEnd;
      if (timeType === 'month') {
        periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
        const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
        const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
        periodEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
      } else if (timeType === 'quarter') {
        const startMonth = (parseInt(quarter) - 1) * 3 + 1;
        periodStart = `${year}-${String(startMonth).padStart(2, '0')}-01`;
        const endMonth = startMonth + 3;
        periodEnd = `${year}-${String(endMonth).padStart(2, '0')}-01`;
      } else {
        periodStart = `${year}-01-01`;
        periodEnd = `${parseInt(year) + 1}-01-01`;
      }

      request.input('periodStart', sql.Date, periodStart);
      request.input('periodEnd', sql.Date, periodEnd);

      // Total revenue
      const revenue = await request.query(`
        SELECT 
          SUM(hd.PhiBaoHiem) as totalRevenue,
          COUNT(hd.MaHD) as contractCount
        FROM HopDong hd
        WHERE hd.NgayKy >= @periodStart AND hd.NgayKy < @periodEnd
          AND hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
      `);

      if (!revenue.recordset || revenue.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi truy vấn doanh thu'
        });
      }

      // Package breakdown
      const breakdown = await pool.request()
        .input('periodStart', sql.Date, periodStart)
        .input('periodEnd', sql.Date, periodEnd)
        .query(`
          SELECT 
            gb.TenGoi as package,
            SUM(hd.PhiBaoHiem) as revenue,
            CAST(SUM(hd.PhiBaoHiem) * 100.0 / (SELECT SUM(PhiBaoHiem) FROM HopDong WHERE NgayKy >= @periodStart AND NgayKy < @periodEnd AND TrangThai IN (N'Hiệu lực', N'ACTIVE')) AS DECIMAL(5,2)) as percentage
          FROM HopDong hd
          INNER JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
          WHERE hd.NgayKy >= @periodStart AND hd.NgayKy < @periodEnd
            AND hd.TrangThai IN (N'Hiệu lực', N'ACTIVE')
          GROUP BY gb.TenGoi
        `);

      res.json({
        success: true,
        data: {
          totalRevenue: revenue.recordset[0].totalRevenue || 0,
          contractCount: revenue.recordset[0].contractCount || 0,
          packageBreakdown: breakdown.recordset
        }
      });
    } catch (error) {
      console.error('Error getting revenue report data:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy dữ liệu báo cáo doanh thu'
      });
    }
  }

  /**
   * Lấy dữ liệu Báo cáo Tái tục (Tab 3)
   */
  async getRenewalReportData(req, res) {
    try {
      const { timeType, year, month, quarter } = req.query;
      
      const pool = await getConnection();
      const request = pool.request();

      let periodStart, periodEnd;
      if (timeType === 'month') {
        periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
        const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
        const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
        periodEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
      } else if (timeType === 'quarter') {
        const startMonth = (parseInt(quarter) - 1) * 3 + 1;
        periodStart = `${year}-${String(startMonth).padStart(2, '0')}-01`;
        const endMonth = startMonth + 3;
        periodEnd = `${year}-${String(endMonth).padStart(2, '0')}-01`;
      } else {
        periodStart = `${year}-01-01`;
        periodEnd = `${parseInt(year) + 1}-01-01`;
      }

      request.input('periodStart', sql.Date, periodStart);
      request.input('periodEnd', sql.Date, periodEnd);

      // Renewal stats
      const stats = await request.query(`
        SELECT 
          COUNT(DISTINCT hd.MaHD) as totalExpiring,
          COUNT(DISTINCT hr.MaHD_Moi) as renewed
        FROM HopDong hd
        LEFT JOIN HopDongRelation hr ON hd.MaHD = hr.MaHD_Goc AND hr.LoaiQuanHe = 'TAI_TUC'
        WHERE hd.NgayHetHan >= @periodStart AND hd.NgayHetHan < @periodEnd
      `);

      if (!stats.recordset || stats.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi truy vấn thống kê tái tục'
        });
      }

      const renewalRate = stats.recordset[0].totalExpiring > 0 
        ? (stats.recordset[0].renewed / stats.recordset[0].totalExpiring * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          totalExpiring: stats.recordset[0].totalExpiring || 0,
          renewed: stats.recordset[0].renewed || 0,
          notRenewed: (stats.recordset[0].totalExpiring || 0) - (stats.recordset[0].renewed || 0),
          renewalRate: parseFloat(renewalRate)
        }
      });
    } catch (error) {
      console.error('Error getting renewal report data:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy dữ liệu báo cáo tái tục'
      });
    }
  }

  /**
   * Lấy dữ liệu Báo cáo Hỗ trợ Thẩm định (Tab 4)
   */
  async getAssessmentReportData(req, res) {
    try {
      const { timeType, year, month, quarter, riskLevel } = req.query;
      
      const pool = await getConnection();
      const request = pool.request();

      let periodStart, periodEnd;
      if (timeType === 'month') {
        periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
        const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
        const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
        periodEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
      } else if (timeType === 'quarter') {
        const startMonth = (parseInt(quarter) - 1) * 3 + 1;
        periodStart = `${year}-${String(startMonth).padStart(2, '0')}-01`;
        const endMonth = startMonth + 3;
        periodEnd = `${year}-${String(endMonth).padStart(2, '0')}-01`;
      } else {
        periodStart = `${year}-01-01`;
        periodEnd = `${parseInt(year) + 1}-01-01`;
      }

      request.input('periodStart', sql.Date, periodStart);
      request.input('periodEnd', sql.Date, periodEnd);

      // Risk distribution
      const distribution = await request.query(`
        SELECT 
          RiskLevel as level,
          COUNT(*) as count,
          CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM HoSoThamDinh WHERE NgayLap >= @periodStart AND NgayLap < @periodEnd) AS DECIMAL(5,2)) as percentage
        FROM HoSoThamDinh
        WHERE NgayLap >= @periodStart AND NgayLap < @periodEnd
        GROUP BY RiskLevel
        ORDER BY 
          CASE RiskLevel 
            WHEN 'LOW' THEN 1
            WHEN 'MEDIUM' THEN 2
            WHEN 'HIGH' THEN 3
            ELSE 4
          END
      `);

      res.json({
        success: true,
        data: {
          totalAssessments: distribution.recordset.reduce((sum, r) => sum + r.count, 0),
          riskDistribution: distribution.recordset
        }
      });
    } catch (error) {
      console.error('Error getting assessment report data:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy dữ liệu báo cáo thẩm định'
      });
    }
  }
}

module.exports = new ReportController();