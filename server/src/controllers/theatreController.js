const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all theatres with optional city filter
// @route   GET /api/theatres
// @access  Public
const getTheatres = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const query = {};

  if (city) {
    query.city = new RegExp(`^${city}$`, 'i');
  }

  const theatres = await Theatre.find(query).sort({ name: 1 });

  // Attach screens for each theatre
  const populatedTheatres = await Promise.all(
    theatres.map(async (t) => {
      const screens = await Screen.find({ theatreId: t._id });
      return {
        ...t.toObject(),
        screens,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: populatedTheatres.length,
    data: populatedTheatres,
  });
});

// @desc    Get theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = asyncHandler(async (req, res) => {
  const theatre = await Theatre.findById(req.params.id);
  if (!theatre) {
    return res.status(404).json({ success: false, message: 'Theatre not found' });
  }

  const screens = await Screen.find({ theatreId: theatre._id });

  res.status(200).json({
    success: true,
    data: {
      ...theatre.toObject(),
      screens,
    },
  });
});

// @desc    Create theatre
// @route   POST /api/theatres
// @access  Private (Admin)
const createTheatre = asyncHandler(async (req, res) => {
  const theatre = await Theatre.create(req.body);
  res.status(201).json({
    success: true,
    data: theatre,
    message: 'Theatre created successfully',
  });
});

// @desc    Update theatre
// @route   PUT /api/theatres/:id
// @access  Private (Admin)
const updateTheatre = asyncHandler(async (req, res) => {
  const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!theatre) {
    return res.status(404).json({ success: false, message: 'Theatre not found' });
  }

  res.status(200).json({
    success: true,
    data: theatre,
    message: 'Theatre updated successfully',
  });
});

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private (Admin)
const deleteTheatre = asyncHandler(async (req, res) => {
  const theatre = await Theatre.findById(req.params.id);
  if (!theatre) {
    return res.status(404).json({ success: false, message: 'Theatre not found' });
  }

  // Also remove associated screens
  await Screen.deleteMany({ theatreId: theatre._id });
  await Theatre.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Theatre and associated screens deleted successfully',
  });
});

// @desc    Get screens for a theatre
// @route   GET /api/theatres/:id/screens
// @access  Public
const getScreens = asyncHandler(async (req, res) => {
  const screens = await Screen.find({ theatreId: req.params.id });
  res.status(200).json({
    success: true,
    count: screens.length,
    data: screens,
  });
});

// @desc    Create screen for a theatre
// @route   POST /api/screens
// @access  Private (Admin)
const createScreen = asyncHandler(async (req, res) => {
  const { theatreId, name, seatLayout } = req.body;

  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    return res.status(404).json({ success: false, message: 'Theatre not found' });
  }

  const screen = await Screen.create({
    theatreId,
    name,
    seatLayout,
  });

  res.status(201).json({
    success: true,
    data: screen,
    message: 'Screen created successfully',
  });
});

// @desc    Update screen
// @route   PUT /api/screens/:id
// @access  Private (Admin)
const updateScreen = asyncHandler(async (req, res) => {
  const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!screen) {
    return res.status(404).json({ success: false, message: 'Screen not found' });
  }

  res.status(200).json({
    success: true,
    data: screen,
    message: 'Screen updated successfully',
  });
});

// @desc    Delete screen
// @route   DELETE /api/screens/:id
// @access  Private (Admin)
const deleteScreen = asyncHandler(async (req, res) => {
  const screen = await Screen.findById(req.params.id);
  if (!screen) {
    return res.status(404).json({ success: false, message: 'Screen not found' });
  }

  await Screen.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Screen deleted successfully',
  });
});

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getScreens,
  createScreen,
  updateScreen,
  deleteScreen,
};
