/**
 * Rating Routes
 * Handles user and ride rating system
 * Allows passengers and providers to rate each other after ride completion
 */

const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware'); // Auth required for submissions

// ========================
// Rating Submission Routes
// ========================

// POST /api/ratings/rides/:rideId - Submit a rating for a completed ride
// Passengers rate drivers, and drivers rate passengers
router.post('/rides/:rideId', protect, ratingController.submitRating);

// ========================
// Rating Retrieval Routes (Public)
// ========================

// GET /api/ratings/users/:userId - Get all ratings for a specific user
// Returns paginated ratings with average calculation
router.get('/users/:userId', ratingController.getUserRatings);

// GET /api/ratings/rides/:rideId - Get all ratings associated with a specific ride
router.get('/rides/:rideId', ratingController.getRideRatings);

module.exports = router;