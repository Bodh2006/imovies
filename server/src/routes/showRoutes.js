const express = require('express');
const router = express.Router();
const {
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  lockSeatsEndpoint,
  unlockSeatsEndpoint,
} = require('../controllers/showController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('admin'), createShow);

router.route('/:id')
  .get(getShowById)
  .put(protect, authorize('admin'), updateShow)
  .delete(protect, authorize('admin'), deleteShow);

router.post('/:id/lock', protect, lockSeatsEndpoint);
router.post('/:id/unlock', protect, unlockSeatsEndpoint);

module.exports = router;
