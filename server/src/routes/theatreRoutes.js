const express = require('express');
const router = express.Router();
const {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getScreens,
} = require('../controllers/theatreController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
  .get(getTheatres)
  .post(protect, authorize('admin'), createTheatre);

router.route('/:id')
  .get(getTheatreById)
  .put(protect, authorize('admin'), updateTheatre)
  .delete(protect, authorize('admin'), deleteTheatre);

router.get('/:id/screens', getScreens);

module.exports = router;
