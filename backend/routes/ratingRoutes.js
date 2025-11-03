const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// Submit a rating for a ride
router.post('/rides/:rideId', protect, ratingController.submitRating);

// Get ratings for a user
router.get('/users/:userId', ratingController.getUserRatings);

// Get ratings for a specific ride
router.get('/rides/:rideId', ratingController.getRideRatings);

module.exports = router;