// ============================================
// PJICO - Audit Log Routes
// Routes cho Audit Logs
// ============================================

const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authMiddleware } = require('../middleware/auth');

// ============================================
// ALL ROUTES PROTECTED - Chỉ admin/manager
// ============================================

// Thống kê
router.get('/stats', authMiddleware, auditLogController.getStats);

// Danh sách bảng có audit
router.get('/tables', authMiddleware, auditLogController.getTables);

// So sánh versions
router.get('/compare', authMiddleware, auditLogController.compareVersions);

// Export to CSV
router.get('/export', authMiddleware, auditLogController.exportToCsv);

// Lấy logs theo bảng
router.get('/table/:table', authMiddleware, auditLogController.getByTable);

// Lấy lịch sử của 1 record
router.get('/record/:table/:id', authMiddleware, auditLogController.getByRecord);

// Lấy tất cả (với filters)
router.get('/', authMiddleware, auditLogController.getAll);

module.exports = router;
