const Rating = require('../models/Rating');
const Ride = require('../models/Ride');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Submit a rating for a completed ride
 * Allows passengers or providers to rate each other after ride completion
 */
exports.submitRating = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { ratedUserId, rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if ride exists and user was part of it
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Verify user was involved in the ride (either as passenger or provider)
    const isPassenger = ride.passengers.includes(req.user.id);
    const isProvider = ride.provider.toString() === req.user.id;
    
    if (!isPassenger && !isProvider) {
      return res.status(403).json({ message: 'You were not part of this ride' });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      ride: rideId,
      ratedBy: req.user.id,
      ratedUser: ratedUserId
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this user for this ride' });
    }

    // Create rating
    const newRating = new Rating({
      ride: rideId,
      ratedBy: req.user.id,
      ratedUser: ratedUserId,
      rating,
      comment: comment || ''
    });

    await newRating.save();

    // Update user's average rating
    await updateUserAverageRating(ratedUserId);

    res.json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all ratings for a specific user
 * Returns paginated ratings with average rating calculation
 */
exports.getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ ratedUser: userId })
      .populate('ratedBy', 'name')
      .populate('ride', 'from to date')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalRatings = await Rating.countDocuments({ ratedUser: userId });
    const averageRating = await Rating.aggregate([
      { $match: { ratedUser: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      ratings,
      totalRatings,
      averageRating: averageRating[0]?.avgRating || 0,
      currentPage: page,
      totalPages: Math.ceil(totalRatings / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all ratings for a specific ride
 * Returns ratings with user information for both rater and rated user
 */
exports.getRideRatings = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ratings = await Rating.find({ ride: rideId })
      .populate('ratedBy', 'name')
      .populate('ratedUser', 'name')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Helper function to update user's average rating
 * Recalculates and updates user's average rating based on all ratings
 */
async function updateUserAverageRating(userId) {
  try {
    const result = await Rating.aggregate([
      { $match: { ratedUser: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
    ]);

    if (result.length > 0) {
      await User.findByIdAndUpdate(userId, {
        averageRating: Math.round(result[0].avgRating * 10) / 10, // Round to 1 decimal
        totalRatings: result[0].totalRatings
      });
    }
  } catch (error) {
    console.error('Error updating user average rating:', error);
  }
}

module.exports = { submitRating: exports.submitRating, getUserRatings: exports.getUserRatings, getRideRatings: exports.getRideRatings };