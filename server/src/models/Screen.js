const mongoose = require('mongoose');

const screenRowSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    category: {
      type: String,
      enum: ['regular', 'premium', 'recliner'],
      default: 'regular',
    },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Screen must belong to a theatre'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide screen name (e.g. Audi 1, IMAX)'],
      trim: true,
    },
    seatLayout: {
      rows: [screenRowSchema],
    },
  },
  {
    timestamps: true,
  }
);

const Screen = mongoose.model('Screen', screenSchema);
module.exports = Screen;
