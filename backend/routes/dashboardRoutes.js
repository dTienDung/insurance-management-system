const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/overview', dashboardController.getOverviewStats);
router.get('/revenue-by-month', dashboardController.getRevenueByMonth);
router.get('/contracts-by-status', dashboardController.getContractsByStatus);
router.get('/top-insurance-types', dashboardController.getTopInsuranceTypes);
router.get('/risk-distribution', dashboardController.getRiskDistribution);
router.get('/top-vehicle-brands', dashboardController.getTopVehicleBrands);
router.get('/renewal-rate', dashboardController.getRenewalRate);
router.get('/employee-performance', dashboardController.getEmployeePerformance);
router.get('/recent-activities', dashboardController.getRecentActivities);

module.exports = router;
