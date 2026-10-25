const express = require('express');
const router = express.Router();
const { updateProfile, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

module.exports = router;
