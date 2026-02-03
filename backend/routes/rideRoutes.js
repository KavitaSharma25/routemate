/**
 * Ride Management Routes
 * Handles ride creation, search, booking, cancellation, and completion
 */

const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware'); // Authentication middleware
const { body } = require('express-validator'); // Input validation
const { runValidation } = require('../middleware/validateMiddleware');

// ========================
// Ride Creation Route (Protected)
// ========================
// POST /api/rides - Create a new ride offering with validation
router.post('/', protect, [
	body('from').trim().notEmpty().withMessage('From is required'),
	body('to').trim().notEmpty().withMessage('To is required'),
	body('date').notEmpty().withMessage('Date is required').isISO8601().toDate(),
	body('seatsAvailable').isInt({ min: 1 }).withMessage('Seats must be at least 1')
], runValidation, rideController.createRide);

// ========================
// Public Search Route
// ========================
// GET /api/rides/search - Search available rides (no authentication required)
router.get('/search', rideController.searchRides);

// ========================
// User's Ride Management (Protected)
// ========================
// GET /api/rides/my-rides - Get rides created by current user
router.get('/my-rides', protect, rideController.getMyRides);

// GET /api/rides/my-bookings - Get bookings made by current user
router.get('/my-bookings', protect, rideController.getMyBookings);

// GET /api/rides/history - Get complete ride history (as provider or passenger)
router.get('/history', protect, rideController.getRideHistory);

// ========================
// Individual Ride Operations (Protected)
// ========================
// GET /api/rides/:rideId - Get detailed ride information
router.get('/:rideId', protect, rideController.getRideById);

// PUT /api/rides/:rideId - Update ride details (provider only)
router.put('/:rideId', protect, rideController.updateRide);

// DELETE /api/rides/:rideId - Delete a ride (provider only)
router.delete('/:rideId', protect, rideController.deleteRide);

// ========================
// Booking Management (Protected)
// ========================
// POST /api/rides/:rideId/book - Request to book a ride
router.post('/:rideId/book', protect, rideController.bookRide);

// POST /api/rides/:rideId/bookings/:bookingId/confirm - Provider confirms booking
router.post('/:rideId/bookings/:bookingId/confirm', protect, rideController.confirmBooking);

// POST /api/rides/:rideId/bookings/:bookingId/decline - Provider declines booking
router.post('/:rideId/bookings/:bookingId/decline', protect, rideController.declineBooking);

// POST /api/rides/:rideId/bookings/:bookingId/complete - Mark ride as completed
router.post('/:rideId/bookings/:bookingId/complete', protect, rideController.markRideComplete);

// POST /api/rides/:rideId/bookings/:bookingId/verify-otp - Verify OTP for ride boarding
router.post('/:rideId/bookings/:bookingId/verify-otp', protect, rideController.verifyOTP);

// ========================
// Real-time Location Tracking (Protected)
// ========================
// POST /api/rides/:rideId/update-location - Driver updates their location
router.post('/:rideId/update-location', protect, rideController.updateLocation);

// GET /api/rides/:rideId/location - Get current ride location
router.get('/:rideId/location', protect, rideController.getRideLocation);

// POST /api/rides/:rideId/stop-tracking - Stop location tracking
router.post('/:rideId/stop-tracking', protect, rideController.stopTracking);

// ========================
// Cancellation and Reporting (Protected)
// ========================
// POST /api/rides/:rideId/cancel - Cancel ride or booking
router.post('/:rideId/cancel', protect, rideController.cancelRide);

// POST /api/rides/:rideId/report - Report a ride for violations
router.post('/:rideId/report', protect, rideController.reportRide);

module.exports = router;
