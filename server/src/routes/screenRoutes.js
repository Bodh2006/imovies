const express = require('express');
const router = express.Router();
const {
  createScreen,
  updateScreen,
  deleteScreen,
} = require('../controllers/theatreController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('admin'), createScreen);
router.put('/:id', protect, authorize('admin'), updateScreen);
router.delete('/:id', protect, authorize('admin'), deleteScreen);

module.exports = router;
