const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theatre name'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide theatre address'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

theatreSchema.index({ city: 1, name: 1 });

const Theatre = mongoose.model('Theatre', theatreSchema);
module.exports = Theatre;
