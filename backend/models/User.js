const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number, min: 1, max: 5 },
  comment: { type: String }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty'], required: true },
  isAdmin: { type: Boolean, default: false },
  isDriver: { type: Boolean, default: false },
  driverVerified: { type: Boolean, default: false },
  driverIdImage: { type: String },
  profilePhoto: { type: String },
  phone: { type: String },
  bio: { type: String },
  vehicleInfo: { type: String },
  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
