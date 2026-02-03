const mongoose = require('mongoose');

/**
 * OTP Schema
 * Stores temporary OTP codes for email verification during registration
 * OTPs expire after 10 minutes
 */
const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  otp: { 
    type: String, 
    required: true 
  },
  // Store registration data temporarily until OTP is verified
  registrationData: {
    name: String,
    email: String,
    password: String, // This will be hashed before storing
    role: String,
    isDriver: Boolean
  },
  // OTP expiry time (10 minutes from creation)
  expiresAt: { 
    type: Date, 
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  // Track verification attempts to prevent brute force
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create TTL index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster email lookups
otpSchema.index({ email: 1 });

module.exports = mongoose.model('OTP', otpSchema);
