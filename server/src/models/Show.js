const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['regular', 'premium', 'recliner'],
      default: 'regular',
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Show must be linked to a movie'],
      index: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Show must be assigned to a screen'],
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Please provide start time for the show'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please provide end time for the show'],
    },
    prices: {
      regular: {
        type: Number,
        required: true,
        default: 150,
      },
      premium: {
        type: Number,
        required: true,
        default: 250,
      },
      recliner: {
        type: Number,
        required: true,
        default: 400,
      },
    },
    seats: [seatSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for overlap checks and screen-time queries
showSchema.index({ screenId: 1, startTime: 1 });
showSchema.index({ movieId: 1, startTime: 1 });

const Show = mongoose.model('Show', showSchema);
module.exports = Show;
