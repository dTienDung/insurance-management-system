const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authMiddleware, authorize } = require('../middleware/auth');

// ============================================
// CONTRACT ROUTES - ĐÃ SỬA ĐÚNG TÊN FUNCTION
// ============================================

// GET all contracts
router.get('/', authMiddleware, contractController.getAll);

// GET expiring contracts (phải đặt TRƯỚC /:id để tránh conflict)
router.get('/expiring', authMiddleware, contractController.getExpiringContracts);

// GET contract by ID
router.get('/:id', authMiddleware, contractController.getById);

// CREATE new contract
router.post('/', authMiddleware, contractController.create);

// UPDATE contract
router.put('/:id', authMiddleware, contractController.update);

// CANCEL contract
router.post('/:id/cancel', authMiddleware, contractController.cancel);

// RENEW contract
router.post('/:id/renew', authMiddleware, contractController.renewContract);

module.exports = router;