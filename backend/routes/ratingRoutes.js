/**
 * Rating Routes - Enhanced
 * Comprehensive rating system with detailed criteria, responses, and community feedback
 */

const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// ========================
// Rating Submission Routes (Protected)
// ========================

// POST /api/ratings/rides/:rideId - Submit detailed rating
router.post('/rides/:rideId', protect, ratingController.submitRating);

// POST /api/ratings/:ratingId/respond - Respond to a rating
router.post('/:ratingId/respond', protect, ratingController.respondToRating);

// POST /api/ratings/:ratingId/helpful - Mark rating as helpful
router.post('/:ratingId/helpful', protect, ratingController.markHelpful);

// POST /api/ratings/:ratingId/report - Report inappropriate rating
router.post('/:ratingId/report', protect, ratingController.reportRating);

// ========================
// Rating Retrieval Routes (Public)
// ========================

// GET /api/ratings/users/:userId - Get all ratings for a user
// Query params: page, limit, sortBy (recent|helpful|rating), riderType (driver|passenger)
router.get('/users/:userId', ratingController.getUserRatings);

// GET /api/ratings/rides/:rideId - Get ratings for a ride
router.get('/rides/:rideId', ratingController.getRideRatings);

module.exports = router;