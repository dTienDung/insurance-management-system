const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', authController.login);

router.post('/change-password', authMiddleware, authController.changePassword);

router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
