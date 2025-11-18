// ============================================
// PJICO - Audit Log Routes
// Routes cho Audit Logs
// ============================================

const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const auth = require('../middleware/auth');

// ============================================
// ALL ROUTES PROTECTED - Chỉ admin/manager
// ============================================

// Thống kê
router.get('/stats', auth, auditLogController.getStats);

// Danh sách bảng có audit
router.get('/tables', auth, auditLogController.getTables);

// So sánh versions
router.get('/compare', auth, auditLogController.compareVersions);

// Export to CSV
router.get('/export', auth, auditLogController.exportToCsv);

// Lấy logs theo bảng
router.get('/table/:table', auth, auditLogController.getByTable);

// Lấy lịch sử của 1 record
router.get('/record/:table/:id', auth, auditLogController.getByRecord);

// Lấy tất cả (với filters)
router.get('/', auth, auditLogController.getAll);

module.exports = router;
