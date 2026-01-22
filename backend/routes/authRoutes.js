/**
 * Authentication Routes
 * Handles user registration, login, profile management, and driver verification
 */

const express = require('express');
const router = express.Router();
const multer = require('multer'); // File upload middleware
const path = require('path');
const { body } = require('express-validator'); // Input validation
const authController = require('../controllers/authController');
const { protect, optional } = require('../middleware/authMiddleware'); // Auth middleware
const { runValidation } = require('../middleware/validateMiddleware'); // Validation middleware

// ========================
// Multer File Upload Configuration
// ========================
// Configure storage for uploaded files (profile photos, driver IDs)
const uploadsPath = path.join(__dirname, '..', process.env.UPLOADS_PATH || 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath); // Save to uploads directory
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`); // Unique filename with timestamp
  }
});
const upload = multer({ storage });

// ========================
// OTP Routes
// ========================
// POST /api/auth/send-otp - Send OTP to phone number
router.post('/send-otp', authController.sendOTP);

// POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// ========================
// Registration Route
// ========================
// POST /api/auth/register - Register new user with validation
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').custom((val) => {
    if (!val.endsWith('@chitkara.edu.in')) throw new Error('Please use your Chitkara college email');
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
  body('role').isIn(['student', 'faculty']).withMessage('Role must be student or faculty')
], runValidation, authController.register);

// ========================
// Login Route
// ========================
// POST /api/auth/login - Authenticate user and return JWT token
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required')
], runValidation, authController.login);

// ========================
// Profile Management Routes (Protected)
// ========================
// GET /api/auth/profile - Get current user's profile
router.get('/profile', protect, authController.getProfile);

// PUT /api/auth/profile - Update user profile information
router.put('/profile', protect, authController.updateProfile);

// PUT /api/auth/change-password - Change user password
router.put('/change-password', protect, authController.changePassword);

// ========================
// File Upload Routes (Protected)
// ========================
// POST /api/auth/upload-id - Upload driver ID for verification
router.post('/upload-id', protect, upload.single('driverId'), authController.uploadDriverId);

// POST /api/auth/upload-profile-photo - Upload profile photo
router.post('/upload-profile-photo', protect, upload.single('profilePhoto'), authController.uploadProfilePhoto);

// ========================
// Public Profile Routes
// ========================
// GET /api/auth/public-profile/:userId - View any user's public profile
router.get('/public-profile/:userId', authController.getPublicProfile);

// ========================
// Rating Routes (Protected)
// ========================
// POST /api/auth/rate-user - Rate another user
router.post('/rate-user', protect, authController.rateUser);

module.exports = router;
