const express = require('express');
const router = express.Router();
const {
  getAdminBookings,
  getAdminStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/bookings', getAdminBookings);
router.get('/stats', getAdminStats);

module.exports = router;
