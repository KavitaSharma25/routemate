/**
 * Notification Routes
 * Manages in-app notifications for users
 * Notifications are created by various events (bookings, payments, cancellations)
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware'); // Authentication required

// ========================
// Notification Management Routes (Protected)
// ========================

// GET /api/notifications - Get all notifications for current user
// Returns notifications sorted by creation date (newest first)
router.get('/', protect, notificationController.getNotifications);

// POST /api/notifications/:id/read - Mark a specific notification as read
router.post('/:id/read', protect, notificationController.markRead);

module.exports = router;
