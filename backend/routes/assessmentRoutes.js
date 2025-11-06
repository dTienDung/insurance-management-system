const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authMiddleware, authorize } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/calculate-risk', assessmentController.calculateRiskScore);

router.get('/', assessmentController.getAll);
router.get('/contract/:maHD', assessmentController.getByContract);
router.post('/', authorize('Admin', 'Thẩm định'), assessmentController.createAssessment);

module.exports = router;
