// ============================================
// PJICO - Pricing Matrix Routes
// Routes cho Ma trận định phí
// ============================================

const express = require('express');
const router = express.Router();
const pricingMatrixController = require('../controllers/pricingMatrixController');
const { authMiddleware } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (nếu cần)
// ============================================

// Tính phí (dùng cho frontend khi tạo hợp đồng)
router.get('/calculate', pricingMatrixController.calculatePremium);

// Lấy ma trận đầy đủ (cho hiển thị)
router.get('/matrix', pricingMatrixController.getFullMatrix);

// ============================================
// PROTECTED ROUTES - Yêu cầu đăng nhập
// ============================================

// CRUD operations
router.get('/', authMiddleware, pricingMatrixController.getAll);
router.get('/:id', authMiddleware, pricingMatrixController.getById);
router.post('/', authMiddleware, pricingMatrixController.create);
router.put('/:id', authMiddleware, pricingMatrixController.update);
router.delete('/:id', authMiddleware, pricingMatrixController.delete);

module.exports = router;
