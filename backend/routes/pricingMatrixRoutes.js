// ============================================
// PJICO - Pricing Matrix Routes
// Routes cho Ma trận định phí
// ============================================

const express = require('express');
const router = express.Router();
const pricingMatrixController = require('../controllers/pricingMatrixController');
const auth = require('../middleware/auth');

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
router.get('/', auth, pricingMatrixController.getAll);
router.get('/:id', auth, pricingMatrixController.getById);
router.post('/', auth, pricingMatrixController.create);
router.put('/:id', auth, pricingMatrixController.update);
router.delete('/:id', auth, pricingMatrixController.delete);

module.exports = router;
