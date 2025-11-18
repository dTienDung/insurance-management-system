const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all payments with pagination
router.get('/', paymentController.getAll);

// Get payment by ID
router.get('/:id', paymentController.getById);

// Get payments by contract
router.get('/contract/:maHD', paymentController.getByContract);

// Get payment summary for contract
router.get('/contract/:maHD/summary', paymentController.getPaymentSummary);

// Create new payment
router.post('/', paymentController.createPayment);

// Create refund
router.post('/refund', paymentController.createRefund);

// LUẬT 5.1: KHÔNG CHO PHÉP UPDATE/DELETE
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
