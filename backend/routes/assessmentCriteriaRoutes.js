// ============================================
// PJICO - Assessment Criteria Routes
// Routes cho Ma trận thẩm định
// ============================================

const express = require('express');
const router = express.Router();
const assessmentCriteriaController = require('../controllers/assessmentCriteriaController');
const auth = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (nếu cần)
// ============================================

// Lấy danh sách tiêu chí (cho autocomplete, dropdown)
// router.get('/active', assessmentCriteriaController.getActive);

// ============================================
// PROTECTED ROUTES - Yêu cầu đăng nhập
// ============================================

// Thống kê sử dụng
router.get('/stats', auth, assessmentCriteriaController.getUsageStats);

// CRUD operations
router.get('/', auth, assessmentCriteriaController.getAll);
router.get('/:id', auth, assessmentCriteriaController.getById);
router.post('/', auth, assessmentCriteriaController.create);
router.put('/:id', auth, assessmentCriteriaController.update);
router.delete('/:id', auth, assessmentCriteriaController.delete);

module.exports = router;
