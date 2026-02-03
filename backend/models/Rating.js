const mongoose = require('mongoose');

/**
 * Rating Schema - Enhanced
 * Comprehensive rating system with detailed criteria, responses, and community feedback
 */
const ratingSchema = new mongoose.Schema({
  // Ride Context
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  
  // Rating Participants
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Overall Rating (1-5)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Detailed Category Ratings (for drivers)
  categories: {
    safety: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    driving: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  
  // Review Comment
  comment: {
    type: String,
    maxlength: 1000
  },
  
  // Review Photos
  photos: [
    {
      url: String,
      caption: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  
  // Response from rated user
  response: {
    text: { type: String, maxlength: 500 },
    respondedAt: Date,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Helpful ratings from community
  helpfulCount: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Review visibility and reporting
  isPublic: { type: Boolean, default: true },
  riderType: { type: String, enum: ['passenger', 'driver'], required: true },
  isReported: { type: Boolean, default: false },
  reportReason: String,
  reportedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient querying
ratingSchema.index({ ride: 1, ratedBy: 1 }, { unique: true });
ratingSchema.index({ ratedUser: 1, createdAt: -1 });
ratingSchema.index({ ratedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Rating', ratingSchema);