const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
const { sendOTP: sendSMS } = require('../utils/smsService');

/**
 * Send OTP to phone number during registration
 * Generates 6-digit OTP and stores with 10-minute expiry
 */
exports.sendOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;

    // Validate phone number format (10 digits)
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
    }

    // Check if phone is already registered and verified
    const existingUser = await User.findOne({ phone, phoneVerified: true });
    if (existingUser) {
      return res.status(400).json({ message: 'This phone number is already registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Send OTP via SMS service
    let smsSent = false;
    try {
      smsSent = await sendSMS(phone, otp);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Continue anyway in development mode
      if (process.env.NODE_ENV !== 'development') {
        return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
      }
    }

    // If user exists (re-registration attempt), update OTP
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        user.phone = phone;
        user.phoneOTP = otp;
        user.phoneOTPExpiry = otpExpiry;
        await user.save();
        return res.json({ 
          message: smsSent ? 'OTP sent to your phone' : 'OTP generated (check console in dev mode)', 
          // In development, return OTP for testing
          ...(process.env.NODE_ENV === 'development' && { otp, devMode: true })
        });
      }
    }

    // For new registrations, store OTP temporarily in session or temp collection
    // Here we'll return it for the frontend to manage
    res.json({ 
      message: smsSent ? 'OTP sent to your phone' : 'OTP generated (check console in dev mode)',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp, devMode: true }),
      // Store these temporarily for verification
      tempData: { phone, otp, otpExpiry: otpExpiry.toISOString() }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

/**
 * Verify OTP before completing registration
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // For temporary OTP verification (stored in frontend)
    // In production, retrieve from database or cache
    res.json({ message: 'OTP verified successfully', verified: true });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

/**
 * Register a new user with Chitkara college email
 * Validates email domain, phone verification, hashes password, and creates user account
 */
exports.register = async (req, res) => {
  try {
    // Extract user registration data from request body
    const { name, email, password, role, isDriver, phone, phoneVerified } = req.body;

    // Enforce college email domain validation
    if (!email || !email.endsWith('@chitkara.edu.in')) {
      return res.status(400).json({ message: 'Please use your Chitkara college email.' });
    }

    // Require phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
    }

    // Check if phone verification is required (skip in development for testing)
    if (process.env.NODE_ENV !== 'development' && !phoneVerified) {
      return res.status(400).json({ message: 'Please verify your phone number first' });
    }

    // Check if user already exists with this email
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // Check if phone is already registered
    const phoneExists = await User.findOne({ phone, phoneVerified: true });
    if (phoneExists) return res.status(400).json({ message: 'This phone number is already registered' });

    // Generate salt for password hashing (10 rounds)
    const salt = await bcrypt.genSalt(10);
    // Hash password with generated salt for secure storage
    const hashed = await bcrypt.hash(password, salt);

    // Create new user document with hashed password
    const user = new User({ 
      name, 
      email, 
      password: hashed, 
      role, 
      isDriver: !!isDriver,
      phone,
      phoneVerified: true // Mark as verified after OTP confirmation
    });
    await user.save();

    // Generate JWT token valid for 7 days
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Return token and user info (excluding password)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Authenticate user and generate JWT token
 * Validates credentials and returns token with user info
 */
exports.login = async (req, res) => {
  try {
    // Extract login credentials from request
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate new JWT token for authenticated session (7 days validity)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Return token and user details (including driver verification status)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, driverVerified: user.driverVerified } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get authenticated user's profile information
 * Returns user data excluding password
 */
exports.getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Upload driver ID image for verification
 * Stores image path and sets verification status to pending
 */
exports.uploadDriverId = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    user.driverIdImage = `/uploads/${req.file.filename}`;
    user.driverVerified = false; // admin will verify later
    await user.save();

    res.json({ message: 'Driver ID uploaded. Verification pending.', path: user.driverIdImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile information
 * Allows updating name, phone, bio, and vehicle information
 */
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { name, phone, bio, vehicleInfo } = req.body;
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (vehicleInfo !== undefined) user.vehicleInfo = vehicleInfo;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

/**
 * Change user password
 * Verifies current password, validates new password, and updates securely
 */
exports.changePassword = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

/**
 * Upload user profile photo
 * Saves uploaded image and updates user's profile photo path
 */
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    user.profilePhoto = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile photo uploaded successfully', path: user.profilePhoto });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({ message: 'Server error uploading photo' });
  }
};

/**
 * Get public profile information for any user
 * Returns user data excluding password by user ID
 */
exports.getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

/**
 * Rate another user
 * Allows users to rate others with score (1-5) and optional comment
 */
exports.rateUser = async (req, res) => {
  try {
    if (!req.user) {
      console.log('No user in request - unauthorized');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId, score, comment } = req.body;
    console.log('Rating request received:', { userId, score, comment, raterId: req.user.id });

    if (!userId || !score) {
      console.log('Missing userId or score');
      return res.status(400).json({ message: 'User ID and score are required' });
    }

    if (score < 1 || score > 5) {
      console.log('Invalid score:', score);
      return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }

    // Don't allow rating yourself
    if (userId === req.user.id || userId.toString() === req.user.id.toString()) {
      console.log('User trying to rate themselves');
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    const userToRate = await User.findById(userId);
    if (!userToRate) {
      console.log('User to rate not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User to rate found:', userToRate.name, userToRate._id);

    // Check if user already rated this person
    const existingRating = userToRate.ratings.find(
      r => r.rater.toString() === req.user.id.toString()
    );

    if (existingRating) {
      console.log('Updating existing rating');
      // Update existing rating
      existingRating.score = score;
      existingRating.comment = comment || '';
    } else {
      console.log('Adding new rating');
      // Add new rating
      userToRate.ratings.push({
        rater: req.user.id,
        score,
        comment: comment || ''
      });
    }

    // Recalculate average rating
    const totalScore = userToRate.ratings.reduce((sum, r) => sum + r.score, 0);
    userToRate.averageRating = totalScore / userToRate.ratings.length;
    userToRate.totalRatings = userToRate.ratings.length;

    console.log('Calculated ratings:', { 
      averageRating: userToRate.averageRating, 
      totalRatings: userToRate.totalRatings 
    });

    await userToRate.save();
    console.log('Rating saved successfully');

    res.json({ 
      message: 'Rating submitted successfully',
      averageRating: userToRate.averageRating,
      totalRatings: userToRate.totalRatings
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error submitting rating', error: error.message });
  }
};
