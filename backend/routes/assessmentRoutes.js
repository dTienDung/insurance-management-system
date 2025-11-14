const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authMiddleware, authorize } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/calculate-risk', assessmentController.calculateRiskScore);

router.get('/', assessmentController.getAll);
router.get('/hoso/:maHS', assessmentController.getByHoSo);
router.post('/', authorize('Admin', 'Thẩm định'), assessmentController.createAssessment);
router.put('/:id', assessmentController.update);
router.delete('/:id', assessmentController.delete);

module.exports = router;
