const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');

/**
 * Register a new user with Chitkara college email
 * Validates email domain, hashes password, and creates user account
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, isDriver } = req.body;

    // enforce college email
    if (!email || !email.endsWith('@chitkara.edu.in')) {
      return res.status(400).json({ message: 'Please use your Chitkara college email.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashed, role, isDriver: !!isDriver });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { userId, score, comment } = req.body;
    console.log('Rating request:', { userId, score, comment, raterId: req.user.id });

    if (!userId || !score) {
      return res.status(400).json({ message: 'User ID and score are required' });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }

    // Don't allow rating yourself
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    const userToRate = await User.findById(userId);
    if (!userToRate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already rated this person
    const existingRating = userToRate.ratings.find(
      r => r.rater.toString() === req.user.id.toString()
    );

    if (existingRating) {
      // Update existing rating
      existingRating.score = score;
      existingRating.comment = comment || '';
    } else {
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

    await userToRate.save();

    res.json({ 
      message: 'Rating submitted successfully',
      averageRating: userToRate.averageRating,
      totalRatings: userToRate.totalRatings
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
};
