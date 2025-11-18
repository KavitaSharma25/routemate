const Notification = require('../models/Notification');

/**
 * Get all notifications for current user
 * Returns user's notifications sorted by creation date
 */
exports.getNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user.id }).sort('-createdAt');
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Mark a notification as read
 * Updates notification read status by ID
 */
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ message: 'Marked read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
