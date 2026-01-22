/**
 * Chat Routes
 * Handles HTTP-based chat message operations
 * Real-time messaging is handled via Socket.io in server.js
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware'); // Authentication required

// ========================
// Chat Message Routes (Protected)
// ========================

// POST /api/chat/send - Send a chat message (alternative to Socket.io)
router.post('/send', protect, chatController.sendMessage);

// GET /api/chat/ride/:rideId - Retrieve chat history for a specific ride
router.get('/ride/:rideId', protect, chatController.getMessagesForRide);

module.exports = router;
