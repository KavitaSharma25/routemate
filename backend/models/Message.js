const mongoose = require('mongoose');

/**
 * Message Schema
 * Represents chat messages exchanged between users in ride-specific chat rooms
 * Messages are persisted for chat history and can be retrieved later
 */
const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Sender user ID
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: recipient for direct messages
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }, // Associated ride for context
  content: { type: String, required: true }, // Message text content
  createdAt: { type: Date, default: Date.now } // Message timestamp
});

module.exports = mongoose.model('Message', messageSchema);
