const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', vehicleController.getAll);
router.get('/:id', vehicleController.getById);
router.get('/:id/history', vehicleController.getHistory);
router.post('/', vehicleController.create);
router.put('/:id', vehicleController.update);
router.delete('/:id', vehicleController.delete);

module.exports = router;
