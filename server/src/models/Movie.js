const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a movie title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a movie description'],
    },
    genres: {
      type: [String],
      required: true,
      default: [],
    },
    language: {
      type: String,
      required: [true, 'Please specify the movie language'],
      default: 'English',
    },
    durationMin: {
      type: Number,
      required: [true, 'Please specify duration in minutes'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide a poster image URL'],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Please provide a release date'],
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index(
  { title: 'text', description: 'text' },
  { default_language: 'none', language_override: 'none' }
);
movieSchema.index({ status: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ language: 1 });

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
