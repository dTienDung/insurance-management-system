const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authMiddleware } = require('../middleware/auth');  // ← SỬA: authenticate → authMiddleware

router.get('/giay-yeu-cau/:maKH/:maXe', authMiddleware, exportController.exportGiayYeuCau);  // ← SỬA
router.get('/hop-dong/:maHD', authMiddleware, exportController.exportHopDong);  // ← SỬA
router.get('/bien-lai/:maTT', authMiddleware, exportController.exportBienLai);  // ← SỬA
router.get('/giay-chung-nhan/:maHD', authMiddleware, exportController.exportGiayChungNhan);  // ← THÊM MỚI

module.exports = router;