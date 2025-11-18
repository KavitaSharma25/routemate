const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, optional } = require('../middleware/authMiddleware');
const { runValidation } = require('../middleware/validateMiddleware');

// Multer setup
const uploadsPath = path.join(__dirname, '..', process.env.UPLOADS_PATH || 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').custom((val) => {
    if (!val.endsWith('@chitkara.edu.in')) throw new Error('Please use your Chitkara college email');
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
  body('role').isIn(['student', 'faculty']).withMessage('Role must be student or faculty')
], runValidation, authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required')
], runValidation, authController.login);

router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.post('/upload-id', protect, upload.single('driverId'), authController.uploadDriverId);
router.post('/upload-profile-photo', protect, upload.single('profilePhoto'), authController.uploadProfilePhoto);
router.get('/public-profile/:userId', authController.getPublicProfile);
router.post('/rate-user', protect, authController.rateUser);

module.exports = router;
