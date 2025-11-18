const express = require('express');
const router = express.Router();
const licensePlateController = require('../controllers/licensePlateController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

/**
 * ROUTES: BienSoXe (License Plate Management)
 * Base path: /api/license-plates
 */

// Search license plates
router.get('/search', licensePlateController.search);

// Get license plate by ID
router.get('/:id', licensePlateController.getById);

// Update license plate status
router.put('/:id/status', licensePlateController.updateStatus);

// Delete license plate (soft delete by default)
router.delete('/:id', licensePlateController.deleteLicensePlate);

/**
 * Customer-specific routes
 * These will be mounted in customerRoutes.js as:
 * /api/customers/:maKH/license-plates
 */
router.get('/customer/:maKH', licensePlateController.getByCustomer);
router.post('/customer/:maKH', licensePlateController.addLicensePlate);

module.exports = router;
