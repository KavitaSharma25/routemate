const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, chatController.sendMessage);
router.get('/ride/:rideId', protect, chatController.getMessagesForRide);

module.exports = router;
