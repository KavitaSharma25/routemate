/*
  Seed an initial admin user using environment variables.
  Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in .env before running.
  Usage: node scripts/seedAdmin.js
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Admin';
    if (!email || !password) {
      console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
      process.exit(1);
    }

    let user = await User.findOne({ email });
    if (user) {
      user.isAdmin = true;
      await user.save();
      console.log('Existing user updated to admin:', email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashed, role: 'faculty', isAdmin: true });
    await user.save();
    console.log('Admin user created:', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
