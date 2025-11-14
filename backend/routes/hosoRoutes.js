const express = require('express');
const router = express.Router();
const hosoController = require('../controllers/hosoController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Danh sách và tìm kiếm
router.get('/', hosoController.getAll);
router.get('/cho-tham-dinh', hosoController.getHoSoChoThamDinh);

// Thao tác với hồ sơ cụ thể
router.get('/:id', hosoController.getById);
router.post('/', hosoController.create);
router.delete('/:id', hosoController.delete);

// Duyệt/Từ chối hồ sơ
router.put('/:id/approve', hosoController.approve);
router.put('/:id/reject', hosoController.reject);

// Legacy endpoint - deprecated
router.put('/:id/tham-dinh', hosoController.updateThamDinh);

// Chuyển đổi hồ sơ thành hợp đồng
router.post('/lap-hopdong', hosoController.lapHopDongTuHoSo);

module.exports = router;
