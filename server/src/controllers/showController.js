const Show = require('../models/Show');
const Screen = require('../models/Screen');
const Movie = require('../models/Movie');
const asyncHandler = require('../utils/asyncHandler');
const {
  lockSeats,
  unlockSeats,
  cleanupExpiredLocksForShow,
} = require('../services/seatLockService');

// Helper to check for overlapping shows on the same screen
const checkShowOverlap = async (screenId, startTime, endTime, excludeShowId = null) => {
  const query = {
    screenId,
    $or: [
      // Starts during another show
      { startTime: { $lt: endTime, $gte: startTime } },
      // Ends during another show
      { endTime: { $gt: startTime, $lte: endTime } },
      // Encompasses another show
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
    ],
  };

  if (excludeShowId) {
    query._id = { $ne: excludeShowId };
  }

  const overlap = await Show.findOne(query);
  return overlap;
};

// @desc    Get show details with live seat map
// @route   GET /api/shows/:id
// @access  Public
const getShowById = asyncHandler(async (req, res) => {
  const showId = req.params.id;

  // 1. Release any expired seat locks first
  await cleanupExpiredLocksForShow(showId);

  const show = await Show.findById(showId)
    .populate('movieId')
    .populate({
      path: 'screenId',
      populate: { path: 'theatreId' },
    });

  if (!show) {
    return res.status(404).json({ success: false, message: 'Show not found' });
  }

  res.status(200).json({
    success: true,
    data: show,
  });
});

// @desc    Create a new show (generates seats based on screen layout)
// @route   POST /api/shows
// @access  Private (Admin)
const createShow = asyncHandler(async (req, res) => {
  const { movieId, screenId, startTime, prices } = req.body;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    return res.status(404).json({ success: false, message: 'Movie not found' });
  }

  const screen = await Screen.findById(screenId);
  if (!screen) {
    return res.status(404).json({ success: false, message: 'Screen not found' });
  }

  const start = new Date(startTime);
  // Default end time is start time + movie duration + 20 min interval/cleaning
  const durationMs = (movie.durationMin + 20) * 60 * 1000;
  const end = req.body.endTime ? new Date(req.body.endTime) : new Date(start.getTime() + durationMs);

  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: 'Show end time must be after start time',
    });
  }

  // Validate no overlapping shows on the same screen (FR-24)
  const overlap = await checkShowOverlap(screenId, start, end);
  if (overlap) {
    return res.status(409).json({
      success: false,
      message: 'Show schedule conflicts with an existing show on this screen.',
      conflictShowId: overlap._id,
    });
  }

  // Generate seats array from screen seatLayout
  const seats = [];
  if (screen.seatLayout && screen.seatLayout.rows) {
    for (const row of screen.seatLayout.rows) {
      for (let i = 1; i <= row.seats; i++) {
        seats.push({
          seatId: `${row.label}${i}`,
          category: row.category || 'regular',
          status: 'available',
          lockedBy: null,
          lockExpiresAt: null,
          bookingId: null,
        });
      }
    }
  }

  const show = await Show.create({
    movieId,
    screenId,
    startTime: start,
    endTime: end,
    prices: prices || { regular: 150, premium: 250, recliner: 400 },
    seats,
  });

  const populatedShow = await Show.findById(show._id)
    .populate('movieId')
    .populate({
      path: 'screenId',
      populate: { path: 'theatreId' },
    });

  res.status(201).json({
    success: true,
    data: populatedShow,
    message: 'Show created successfully',
  });
});

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private (Admin)
const updateShow = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id);
  if (!show) {
    return res.status(404).json({ success: false, message: 'Show not found' });
  }

  const screenId = req.body.screenId || show.screenId;
  const startTime = req.body.startTime ? new Date(req.body.startTime) : show.startTime;
  const endTime = req.body.endTime ? new Date(req.body.endTime) : show.endTime;

  if (req.body.startTime || req.body.endTime || req.body.screenId) {
    const overlap = await checkShowOverlap(screenId, startTime, endTime, show._id);
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'Updated time conflicts with an existing show on this screen.',
      });
    }
  }

  const updated = await Show.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('movieId')
    .populate({
      path: 'screenId',
      populate: { path: 'theatreId' },
    });

  res.status(200).json({
    success: true,
    data: updated,
    message: 'Show updated successfully',
  });
});

// @desc    Delete show
// @route   DELETE /api/shows/:id
// @access  Private (Admin)
const deleteShow = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id);
  if (!show) {
    return res.status(404).json({ success: false, message: 'Show not found' });
  }

  await Show.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Show deleted successfully',
  });
});

// @desc    Lock seats for checkout
// @route   POST /api/shows/:id/lock
// @access  Private (User)
const lockSeatsEndpoint = asyncHandler(async (req, res) => {
  const showId = req.params.id;
  const { seats } = req.body;
  const userId = req.user._id;

  const result = await lockSeats(showId, seats, userId);

  return res.status(result.statusCode).json(result);
});

// @desc    Unlock seats
// @route   POST /api/shows/:id/unlock
// @access  Private (User)
const unlockSeatsEndpoint = asyncHandler(async (req, res) => {
  const showId = req.params.id;
  const { seats } = req.body;
  const userId = req.user._id;

  const result = await unlockSeats(showId, seats, userId);

  return res.status(200).json(result);
});

module.exports = {
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  lockSeatsEndpoint,
  unlockSeatsEndpoint,
};
