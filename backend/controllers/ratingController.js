const Rating = require('../models/Rating');
const Ride = require('../models/Ride');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Submit a detailed rating for a completed ride
 */
exports.submitRating = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { ratedUserId, rating, categories, comment, photos, riderType } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate categories if provided
    if (categories) {
      for (const [key, value] of Object.entries(categories)) {
        if (value && (value < 1 || value > 5)) {
          return res.status(400).json({ message: `Category ratings must be between 1 and 5` });
        }
      }
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const isPassenger = ride.passengers?.includes(req.user.id);
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

    // Create rating with all enhancements
    const newRating = new Rating({
      ride: rideId,
      ratedBy: req.user.id,
      ratedUser: ratedUserId,
      rating,
      categories: categories || {},
      comment: comment || '',
      photos: photos || [],
      riderType: riderType || (isProvider ? 'driver' : 'passenger'),
      isPublic: true
    });

    await newRating.save();
    await updateUserAverageRating(ratedUserId);

    res.json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all ratings for a user with pagination and filtering
 */
exports.getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = 'recent', riderType } = req.query;

    const filter = { ratedUser: userId, isPublic: true };
    if (riderType) filter.riderType = riderType;

    let sortOption = { createdAt: -1 };
    if (sortBy === 'helpful') sortOption = { helpfulCount: -1 };
    if (sortBy === 'rating') sortOption = { rating: -1 };

    const ratings = await Rating.find(filter)
      .populate('ratedBy', 'name profilePhoto')
      .populate('response.respondedBy', 'name')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalRatings = await Rating.countDocuments(filter);
    
    const stats = await Rating.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgSafety: { $avg: '$categories.safety' },
          avgCleanliness: { $avg: '$categories.cleanliness' },
          avgDriving: { $avg: '$categories.driving' },
          avgCommunication: { $avg: '$categories.communication' },
          avgValue: { $avg: '$categories.value' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const distribution = stats[0]?.ratingDistribution || [];
    const ratingBreakdown = {
      5: distribution.filter(r => r === 5).length,
      4: distribution.filter(r => r === 4).length,
      3: distribution.filter(r => r === 3).length,
      2: distribution.filter(r => r === 2).length,
      1: distribution.filter(r => r === 1).length
    };

    res.json({
      ratings,
      totalRatings,
      averageRating: stats[0]?.avgRating || 0,
      categoryAverages: {
        safety: stats[0]?.avgSafety || 0,
        cleanliness: stats[0]?.avgCleanliness || 0,
        driving: stats[0]?.avgDriving || 0,
        communication: stats[0]?.avgCommunication || 0,
        value: stats[0]?.avgValue || 0
      },
      ratingBreakdown,
      currentPage: page,
      totalPages: Math.ceil(totalRatings / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get ride ratings
 */
exports.getRideRatings = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ratings = await Rating.find({ ride: rideId })
      .populate('ratedBy', 'name profilePhoto')
      .populate('ratedUser', 'name')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Submit a response to a rating
 */
exports.respondToRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Response text required' });
    }

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Only rated user can respond
    if (rating.ratedUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only respond to ratings for yourself' });
    }

    rating.response = {
      text,
      respondedAt: new Date(),
      respondedBy: req.user.id
    };

    await rating.save();
    res.json({ message: 'Response added successfully', rating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Mark a rating as helpful
 */
exports.markHelpful = async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if already marked helpful
    if (rating.helpfulBy.includes(req.user.id)) {
      // Remove helpful mark
      rating.helpfulBy = rating.helpfulBy.filter(id => id.toString() !== req.user.id);
      rating.helpfulCount = Math.max(0, rating.helpfulCount - 1);
    } else {
      // Add helpful mark
      rating.helpfulBy.push(req.user.id);
      rating.helpfulCount += 1;
    }

    await rating.save();
    res.json({ message: 'Helpful status updated', helpfulCount: rating.helpfulCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Report a rating
 */
exports.reportRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Please provide a reason for reporting' });
    }

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    rating.isReported = true;
    rating.reportReason = reason;
    rating.reportedAt = new Date();

    await rating.save();
    res.json({ message: 'Rating reported successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user's average rating
 */
async function updateUserAverageRating(userId) {
  try {
    const result = await Rating.aggregate([
      { $match: { ratedUser: mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          avgSafety: { $avg: '$categories.safety' },
          avgCleanliness: { $avg: '$categories.cleanliness' },
          avgDriving: { $avg: '$categories.driving' }
        } 
      }
    ]);

    if (result.length > 0) {
      await User.findByIdAndUpdate(userId, {
        rating: Math.round(result[0].avgRating * 10) / 10,
        totalRatings: result[0].totalRatings
      });
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
}