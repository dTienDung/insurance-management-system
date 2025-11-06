const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authMiddleware } = require('../middleware/auth');

// ============================================
// EXPORT ROUTES - ĐÃ SỬA ĐÚNG MIDDLEWARE
// ============================================

// Export giấy yêu cầu bảo hiểm
router.get('/giay-yeu-cau/:maKH/:maXe', authMiddleware, exportController.exportGiayYeuCau);

// Export hợp đồng bảo hiểm
router.get('/hop-dong/:maHD', authMiddleware, exportController.exportHopDong);

// Export biên lai thanh toán
router.get('/bien-lai/:maTT', authMiddleware, exportController.exportBienLai);

module.exports = router;