const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const auth = require('../middleware/auth');

router.get('/', auth, contractController.getAllContracts);
router.get('/:id', auth, contractController.getContractById);
router.post('/', auth, contractController.createContract);
router.put('/:id', auth, contractController.updateContract);
router.post('/:id/payment', auth, contractController.updatePaymentStatus); // ← THÊM DÒNG NÀY
router.delete('/:id', auth, contractController.deleteContract);
router.post('/:id/cancel', auth, contractController.cancelContract);
router.post('/:id/renew', auth, contractController.renewContract);

module.exports = router;