const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Connect to MongoDB database
 * Establishes connection to MongoDB using connection string from environment
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Server will continue running but database operations may fail');
    // Continue running even if DB fails (for development)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
