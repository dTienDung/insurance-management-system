// ============================================
// PJICO - Report Routes
// API Routes cho Báo cáo
// ============================================

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authentication
router.use(authMiddleware);

// ============================================
// BÁO CÁO DOANH THU
// ============================================

// Báo cáo doanh thu theo tháng
router.get('/revenue/monthly', reportController.getMonthlyRevenue);

// Báo cáo doanh thu theo năm
router.get('/revenue/yearly', reportController.getYearlyRevenue);

// Báo cáo doanh thu theo chi nhánh
router.get('/revenue/branch', reportController.getBranchRevenue);

// ============================================
// BÁO CÁO HỢP ĐỒNG
// ============================================

// Thống kê hợp đồng theo trạng thái
router.get('/contracts/status', reportController.getContractsByStatus);

// Thống kê hợp đồng theo loại bảo hiểm
router.get('/contracts/type', reportController.getContractsByType);

// Hợp đồng sắp hết hạn
router.get('/contracts/expiring', reportController.getExpiringContracts);

// Hợp đồng mới trong kỳ
router.get('/contracts/new', reportController.getNewContracts);

// Danh sách chi tiết hợp đồng theo trạng thái (có phân trang)
router.get('/contracts/detail', reportController.getContractsDetailByStatus);

// ============================================
// BÁO CÁO KHÁCH HÀNG
// ============================================

// Thống kê khách hàng theo loại
router.get('/customers/type', reportController.getCustomersByType);

// Khách hàng mới trong kỳ
router.get('/customers/new', reportController.getNewCustomers);

// Top khách hàng theo doanh thu
router.get('/customers/top', reportController.getTopCustomers);

// Danh sách khách hàng có hợp đồng (có phân trang)
router.get('/customers/contracts', reportController.getCustomersWithContracts);

// ============================================
// BÁO CÁO TÁI TỤC
// ============================================

// Báo cáo tái tục hợp đồng
router.get('/renewal', reportController.getRenewalReport);

// ============================================
// BÁO CÁO THẨM ĐỊNH
// ============================================

// Thống kê thẩm định theo mức độ rủi ro
router.get('/assessments/risk-level', reportController.getAssessmentsByRiskLevel);

// Phân tích rủi ro tổng hợp
router.get('/risk-analysis', reportController.getRiskAnalysis);

// ============================================
// BÁO CÁO BỒI THƯỜNG
// ============================================

// Thống kê bồi thường theo tháng
router.get('/claims/monthly', reportController.getMonthlyClaims);

// Thống kê bồi thường theo trạng thái
router.get('/claims/status', reportController.getClaimsByStatus);

// Tỷ lệ bồi thường
router.get('/claims/ratio', reportController.getClaimsRatio);

// ============================================
// BÁO CÁO TỔNG HỢP
// ============================================

// Dashboard tổng quan
router.get('/dashboard', reportController.getDashboardStats);

// NEW REPORT SYSTEM - 4 TABS
router.get('/operational-dashboard', reportController.getOperationalDashboard);
router.get('/revenue-report', reportController.getRevenueReportData);
router.get('/renewal-report', reportController.getRenewalReportData);
router.get('/assessment-report', reportController.getAssessmentReportData);

// Báo cáo tổng hợp theo kỳ
router.get('/summary', reportController.getSummaryReport);

// ============================================
// EXPORT BÁO CÁO
// ============================================

// Export báo cáo Excel
router.post('/export/excel', reportController.exportToExcel);

// Export báo cáo PDF - CHUẨN VIỆT NAM
router.get('/export/pdf/revenue', reportController.exportRevenuePDF);
router.get('/export/pdf/renewal', reportController.exportRenewalPDF);
router.get('/export/pdf/assessment', reportController.exportAssessmentPDF);
router.get('/export/pdf/business', reportController.exportBusinessPDF);

// Export báo cáo PDF (legacy)
router.post('/export/pdf', reportController.exportToPDF);

// Export báo cáo Word
router.post('/export/word', reportController.exportToWord);

// ============================================
// BÁO CÁO TÙY CHỈNH
// ============================================

// Tạo báo cáo tùy chỉnh
router.post('/custom', reportController.createCustomReport);

// Lấy danh sách báo cáo đã lưu
router.get('/saved', reportController.getSavedReports);

// Lưu báo cáo
router.post('/save', reportController.saveReport);

// Xóa báo cáo đã lưu
router.delete('/saved/:id', reportController.deleteReport);

// ============================================
// NEW REPORT SYSTEM - 4 TABS
// ============================================

// Tab 1: Operational Dashboard
router.get('/operational-dashboard', reportController.getOperationalDashboard);

// Tab 2: Revenue Report Data
router.get('/revenue-report-data', reportController.getRevenueReportData);

// Tab 3: Renewal Report Data
router.get('/renewal-report-data', reportController.getRenewalReportData);

// Tab 4: Assessment Report Data
router.get('/assessment-report-data', reportController.getAssessmentReportData);

module.exports = router;