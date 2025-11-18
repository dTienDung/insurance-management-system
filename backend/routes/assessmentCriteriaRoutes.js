// ============================================
// PJICO - Assessment Criteria Routes
// Routes cho Ma trận thẩm định
// ============================================

const express = require('express');
const router = express.Router();
const assessmentCriteriaController = require('../controllers/assessmentCriteriaController');
const { authMiddleware } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (nếu cần)
// ============================================

// Lấy danh sách tiêu chí (cho autocomplete, dropdown)
// router.get('/active', assessmentCriteriaController.getActive);

// ============================================
// PROTECTED ROUTES - Yêu cầu đăng nhập
// ============================================

// Thống kê sử dụng
router.get('/stats', authMiddleware, assessmentCriteriaController.getUsageStats);

// CRUD operations
router.get('/', authMiddleware, assessmentCriteriaController.getAll);
router.get('/:id', authMiddleware, assessmentCriteriaController.getById);
router.post('/', authMiddleware, assessmentCriteriaController.create);
router.put('/:id', authMiddleware, assessmentCriteriaController.update);
router.delete('/:id', authMiddleware, assessmentCriteriaController.delete);

module.exports = router;
