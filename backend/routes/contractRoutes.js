const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authMiddleware, authorize } = require('../middleware/auth');

// ============================================
// CONTRACT ROUTES - COMPLETE WITH ADVANCED OPERATIONS
// ============================================

// GET all contracts
router.get('/', authMiddleware, contractController.getAll);

// GET expiring contracts (phải đặt TRƯỚC /:id để tránh conflict)
router.get('/expiring', authMiddleware, contractController.getExpiringContracts);

// GET contract by ID
router.get('/:id', authMiddleware, contractController.getById);

// GET contract relations (renewal/transfer history)
router.get('/:id/relations', authMiddleware, contractController.getContractRelations);

// CREATE new contract
router.post('/', authMiddleware, contractController.create);

// UPDATE contract
router.put('/:id', authMiddleware, contractController.update);

// DELETE contract (only draft/pending)
router.delete('/:id', authMiddleware, contractController.delete);

// CANCEL contract (with refund)
router.post('/:id/cancel', authMiddleware, contractController.cancel);

// RENEW contract
router.post('/:id/renew', authMiddleware, contractController.renewContract);

// TRANSFER contract ownership (requires re-assessment)
router.post('/:id/transfer', authMiddleware, contractController.transferContract);

// ============================================
// DOCUMENT DOWNLOADS
// ============================================

// Download insurance certificate
router.get('/:id/certificate', authMiddleware, contractController.downloadCertificate);

// Download contract document
router.get('/:id/document', authMiddleware, contractController.downloadContract);

// Download payment receipt
router.get('/payment/:paymentId/receipt', authMiddleware, contractController.downloadReceipt);

module.exports = router;