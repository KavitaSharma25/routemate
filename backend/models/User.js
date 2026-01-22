const mongoose = require('mongoose');

/**
 * Rating Sub-Schema
 * Embedded schema for storing user ratings within User document
 */
const ratingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who gave the rating
  score: { type: Number, min: 1, max: 5 }, // Rating value (1-5 stars)
  comment: { type: String } // Optional review comment
}, { timestamps: true }); // Auto-add createdAt and updatedAt

/**
 * User Schema
 * Represents users in the RouteMate platform (students, faculty, drivers, admins)
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true }, // Full name
  email: { type: String, required: true, unique: true }, // College email (@chitkara.edu.in)
  password: { type: String, required: true }, // Hashed password (bcrypt)
  role: { type: String, enum: ['student', 'faculty'], required: true }, // User role
  
  // Permissions and Status
  isAdmin: { type: Boolean, default: false }, // Admin access flag
  isDriver: { type: Boolean, default: false }, // Driver registration flag
  driverVerified: { type: Boolean, default: false }, // Admin verification status for drivers
  
  // Profile Media
  driverIdImage: { type: String }, // Path to uploaded driver ID image
  profilePhoto: { type: String }, // Path to profile photo
  
  // Contact and Profile Details
  phone: { type: String }, // Contact phone number
  phoneVerified: { type: Boolean, default: false }, // Phone verification status
  phoneOTP: { type: String }, // Temporary OTP storage
  phoneOTPExpiry: { type: Date }, // OTP expiration time
  bio: { type: String }, // User bio/description
  vehicleInfo: { type: String }, // Vehicle details (for drivers)
  upiId: { type: String }, // UPI ID for receiving payments (for drivers)
  
  // Rating System
  ratings: [ratingSchema], // Array of ratings received from other users
  averageRating: { type: Number, default: 0 }, // Calculated average rating
  totalRatings: { type: Number, default: 0 }, // Total number of ratings received
  
  // Metadata
  createdAt: { type: Date, default: Date.now } // Account creation timestamp
});

module.exports = mongoose.model('User', userSchema);
