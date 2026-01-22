/**
 * Admin Routes
 * Restricted routes for platform administration
 * Includes driver verification, user management, and platform statistics
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Admin-only middleware
 * Ensures only users with admin privileges can access these routes
 */
const adminOnly = (req, res, next) => {
  // Check if user is authenticated and has admin flag
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
};

// ========================
// Driver Verification Routes (Admin Only)
// ========================
// GET /api/admin/drivers/pending - Get list of drivers pending verification
router.get('/drivers/pending', protect, adminOnly, adminController.getPendingDrivers);
router.get('/pending-drivers', protect, adminOnly, adminController.getPendingDrivers); // Alternate endpoint

// POST /api/admin/drivers/:userId/verify - Approve and verify a driver
router.post('/drivers/:userId/verify', protect, adminOnly, adminController.verifyDriver);
router.post('/verify-driver/:userId', protect, adminOnly, adminController.verifyDriver); // Alternate endpoint

// POST /api/admin/drivers/:userId/reject - Reject driver verification request
router.post('/drivers/:userId/reject', protect, adminOnly, adminController.rejectDriver);
router.post('/reject-driver/:userId', protect, adminOnly, adminController.rejectDriver); // Alternate endpoint

// ========================
// User Management Routes (Admin Only)
// ========================
// POST /api/admin/promote/:userId - Promote user to admin role
router.post('/promote/:userId', protect, adminOnly, adminController.promoteUser);

// GET /api/admin/users - Get all registered users
router.get('/users', protect, adminOnly, adminController.getAllUsers);

// ========================
// Platform Oversight Routes (Admin Only)
// ========================
// GET /api/admin/rides - Get all rides in the system
router.get('/rides', protect, adminOnly, adminController.getAllRides);

// GET /api/admin/stats - Get platform statistics (users, rides, bookings, etc.)
router.get('/stats', protect, adminOnly, adminController.getStats);

module.exports = router;
