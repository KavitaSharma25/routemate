const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
};

router.get('/drivers/pending', protect, adminOnly, adminController.getPendingDrivers);
router.get('/pending-drivers', protect, adminOnly, adminController.getPendingDrivers);
router.post('/drivers/:userId/verify', protect, adminOnly, adminController.verifyDriver);
router.post('/verify-driver/:userId', protect, adminOnly, adminController.verifyDriver);
router.post('/drivers/:userId/reject', protect, adminOnly, adminController.rejectDriver);
router.post('/reject-driver/:userId', protect, adminOnly, adminController.rejectDriver);
router.post('/promote/:userId', protect, adminOnly, adminController.promoteUser);
router.get('/users', protect, adminOnly, adminController.getAllUsers);
router.get('/rides', protect, adminOnly, adminController.getAllRides);
router.get('/stats', protect, adminOnly, adminController.getStats);

module.exports = router;
