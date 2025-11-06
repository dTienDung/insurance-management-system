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

// ============================================
// BÁO CÁO KHÁCH HÀNG
// ============================================

// Thống kê khách hàng theo loại
router.get('/customers/type', reportController.getCustomersByType);

// Khách hàng mới trong kỳ
router.get('/customers/new', reportController.getNewCustomers);

// Top khách hàng theo doanh thu
router.get('/customers/top', reportController.getTopCustomers);

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

// Báo cáo tổng hợp theo kỳ
router.get('/summary', reportController.getSummaryReport);

// ============================================
// EXPORT BÁO CÁO
// ============================================

// Export báo cáo Excel
router.post('/export/excel', reportController.exportToExcel);

// Export báo cáo PDF
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

module.exports = router;