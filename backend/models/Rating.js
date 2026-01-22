const mongoose = require('mongoose');

/**
 * Rating Schema
 * Represents ratings given after ride completion
 * Allows passengers and providers to rate each other
 */
const ratingSchema = new mongoose.Schema({
  // Ride Context
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true // Associated ride for this rating
  },
  
  // Rating Participants
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // User who is giving the rating
  },
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // User being rated
  },
  
  // Rating Value
  rating: {
    type: Number,
    required: true,
    min: 1, // Minimum 1 star
    max: 5  // Maximum 5 stars
  },
  
  // Optional Review Comment
  comment: {
    type: String,
    maxlength: 500 // Limit review length
  }
}, {
  timestamps: true // Auto-add createdAt and updatedAt
});

// Ensure one rating per user per ride
ratingSchema.index({ ride: 1, ratedBy: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);