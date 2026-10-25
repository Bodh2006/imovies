const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const { confirmBooking, cancelBooking } = require('../services/bookingService');

// @desc    Confirm booking from locked seats (mock payment)
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body;
  const userId = req.user._id;

  const booking = await confirmBooking({ showId, seats, userId });

  res.status(201).json({
    success: true,
    data: booking,
    message: 'Booking confirmed successfully!',
  });
});

// @desc    Get current user's booking history
// @route   GET /api/bookings/my
// @access  Private (User)
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate({
      path: 'showId',
      populate: [
        { path: 'movieId' },
        {
          path: 'screenId',
          populate: { path: 'theatreId' },
        },
      ],
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Get booking details / e-ticket by ID
// @route   GET /api/bookings/:id
// @access  Private (User)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('userId', 'name email')
    .populate({
      path: 'showId',
      populate: [
        { path: 'movieId' },
        {
          path: 'screenId',
          populate: { path: 'theatreId' },
        },
      ],
    });

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  // Ensure user owns booking or is admin
  if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this booking.',
    });
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Cancel booking (up to 2h before showtime)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
const cancelBookingEndpoint = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';

  const cancelledBooking = await cancelBooking(bookingId, userId, isAdmin);

  res.status(200).json({
    success: true,
    data: cancelledBooking,
    message: 'Booking cancelled successfully. Seats have been released.',
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBookingEndpoint,
};
