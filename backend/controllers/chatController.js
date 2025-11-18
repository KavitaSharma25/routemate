const Message = require('../models/Message');

/**
 * Send a chat message
 * Creates and saves a message for a specific ride chat
 */
exports.sendMessage = async (req, res) => {
  try {
    const { to, rideId, content } = req.body;
    const msg = new Message({ from: req.user.id, to, ride: rideId, content });
    await msg.save();
    res.json(msg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all messages for a specific ride
 * Returns chat history with sender information
 */
exports.getMessagesForRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const msgs = await Message.find({ ride: rideId }).populate('from', 'name').sort('createdAt');
    res.json(msgs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
