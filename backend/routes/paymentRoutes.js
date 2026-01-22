/**
 * Payment Routes
 * Handles Razorpay payment integration
 * Manages order creation and payment verification
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Authentication required

// ========================
// Razorpay Payment Routes (Protected)
// ========================

// POST /api/payments/create-order - Create Razorpay order for ride payment
// Returns order ID and Razorpay key for frontend checkout
router.post('/create-order', protect, paymentController.createOrder);

// POST /api/payments/verify - Verify Razorpay payment signature
// Confirms payment authenticity and updates booking status
router.post('/verify', protect, paymentController.verifyPayment);

module.exports = router;
