const mongoose = require('mongoose');

/**
 * Notification Schema
 * Represents in-app notifications for users
 * Types: ride_request, booking_confirmed, booking_declined, payment_required, etc.
 */
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Recipient user ID
  type: { type: String }, // Notification category (e.g., 'ride_request', 'payment_required')
  message: { type: String }, // Human-readable notification message
  metadata: { type: Object }, // Additional data (ride ID, payment info, etc.)
  read: { type: Boolean, default: false }, // Read/unread status
  createdAt: { type: Date, default: Date.now } // Notification timestamp
});

module.exports = mongoose.model('Notification', notificationSchema);
