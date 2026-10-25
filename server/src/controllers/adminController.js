const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all bookings with filters for Admin
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAdminBookings = asyncHandler(async (req, res) => {
  const { status, date, movieId, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.createdAt = { $gte: startOfDay, $lte: endOfDay };
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  // If filtered by movie, find show IDs for that movie first
  if (movieId) {
    const shows = await Show.find({ movieId }).select('_id');
    const showIds = shows.map((s) => s._id);
    query.showId = { $in: showIds };
  }

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('userId', 'name email')
    .populate({
      path: 'showId',
      populate: [
        { path: 'movieId', select: 'title posterUrl durationMin' },
        { path: 'screenId', populate: { path: 'theatreId' } },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Get dashboard metrics & stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = asyncHandler(async (req, res) => {
  const totalBookings = await Booking.countDocuments();
  const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
  const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalMovies = await Movie.countDocuments();
  const totalShows = await Show.countDocuments();

  // Calculate total revenue from confirmed bookings
  const revenueAgg = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

  // Top performing movies
  const topMoviesAgg = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    {
      $lookup: {
        from: 'shows',
        localField: 'showId',
        foreignField: '_id',
        as: 'show',
      },
    },
    { $unwind: '$show' },
    {
      $group: {
        _id: '$show.movieId',
        totalBookings: { $sum: 1 },
        totalSeatsSold: { $sum: { $size: '$seats' } },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movie',
      },
    },
    { $unwind: '$movie' },
    {
      $project: {
        movieId: '$_id',
        title: '$movie.title',
        posterUrl: '$movie.posterUrl',
        totalBookings: 1,
        totalSeatsSold: 1,
        totalRevenue: 1,
      },
    },
  ]);

  // Recent 6 bookings
  const recentBookings = await Booking.find()
    .populate('userId', 'name email')
    .populate({
      path: 'showId',
      populate: [{ path: 'movieId', select: 'title' }],
    })
    .sort({ createdAt: -1 })
    .limit(6);

  res.status(200).json({
    success: true,
    data: {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      totalUsers,
      totalMovies,
      totalShows,
      topMovies: topMoviesAgg,
      recentBookings,
    },
  });
});

module.exports = {
  getAdminBookings,
  getAdminStats,
};
