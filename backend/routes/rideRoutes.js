const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { runValidation } = require('../middleware/validateMiddleware');

router.post('/', protect, [
	body('from').trim().notEmpty().withMessage('From is required'),
	body('to').trim().notEmpty().withMessage('To is required'),
	body('date').notEmpty().withMessage('Date is required').isISO8601().toDate(),
	body('seatsAvailable').isInt({ min: 1 }).withMessage('Seats must be at least 1')
], runValidation, rideController.createRide);
router.get('/search', rideController.searchRides); // Public endpoint - no auth required
router.get('/my-rides', protect, rideController.getMyRides);
router.get('/my-bookings', protect, rideController.getMyBookings);
router.get('/history', protect, rideController.getRideHistory);
router.get('/:rideId', protect, rideController.getRideById);
router.put('/:rideId', protect, rideController.updateRide);
router.delete('/:rideId', protect, rideController.deleteRide);
router.post('/:rideId/book', protect, rideController.bookRide);
router.post('/:rideId/bookings/:bookingId/confirm', protect, rideController.confirmBooking);
router.post('/:rideId/bookings/:bookingId/decline', protect, rideController.declineBooking);
router.post('/:rideId/bookings/:bookingId/complete', protect, rideController.markRideComplete);
router.post('/:rideId/cancel', protect, rideController.cancelRide);
router.post('/:rideId/report', protect, rideController.reportRide);

module.exports = router;
