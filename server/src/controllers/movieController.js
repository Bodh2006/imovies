const Movie = require('../models/Movie');
const Show = require('../models/Show');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all movies with search, filter, and pagination
// @route   GET /api/movies
// @access  Public
const getMovies = asyncHandler(async (req, res) => {
  const { q, genre, language, status, page = 1, limit = 12 } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (language) {
    query.language = new RegExp(`^${language}$`, 'i');
  }

  if (genre) {
    query.genres = { $in: [new RegExp(`^${genre}$`, 'i')] };
  }

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { cast: { $regex: q, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const total = await Movie.countDocuments(query);
  const movies = await Movie.find(query)
    .sort({ releaseDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: movies.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: movies,
  });
});

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return res.status(404).json({ success: false, message: 'Movie not found' });
  }

  res.status(200).json({
    success: true,
    data: movie,
  });
});

// @desc    Get shows for a specific movie with date and city filters
// @route   GET /api/movies/:id/shows
// @access  Public
const getMovieShows = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, city } = req.query;

  const query = { movieId: id };

  // Filter by date (entire day)
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query.startTime = { $gte: startOfDay, $lte: endOfDay };
  } else {
    // Default to future shows from now onwards
    query.startTime = { $gte: new Date() };
  }

  const shows = await Show.find(query)
    .populate({
      path: 'screenId',
      populate: { path: 'theatreId' },
    })
    .sort({ startTime: 1 });

  // Filter by city if requested
  let filteredShows = shows;
  if (city) {
    filteredShows = shows.filter(
      (show) =>
        show.screenId &&
        show.screenId.theatreId &&
        show.screenId.theatreId.city.toLowerCase() === city.toLowerCase()
    );
  }

  res.status(200).json({
    success: true,
    count: filteredShows.length,
    data: filteredShows,
  });
});

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private (Admin)
const createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({
    success: true,
    data: movie,
    message: 'Movie created successfully',
  });
});

// @desc    Update movie details
// @route   PUT /api/movies/:id
// @access  Private (Admin)
const updateMovie = asyncHandler(async (req, res) => {
  let movie = await Movie.findById(req.params.id);
  if (!movie) {
    return res.status(404).json({ success: false, message: 'Movie not found' });
  }

  movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: movie,
    message: 'Movie updated successfully',
  });
});

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private (Admin)
const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return res.status(404).json({ success: false, message: 'Movie not found' });
  }

  await Movie.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Movie deleted successfully',
  });
});

module.exports = {
  getMovies,
  getMovieById,
  getMovieShows,
  createMovie,
  updateMovie,
  deleteMovie,
};
