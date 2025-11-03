const User = require('../models/User');
const Ride = require('../models/Ride');

exports.getPendingDrivers = async (req, res) => {
  try {
    const pending = await User.find({ isDriver: true, driverVerified: false }).select('name email driverIdImage role');
    res.json(pending);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyDriver = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.driverVerified = true;
    await user.save();
    res.json({ message: 'Driver verified', user: { id: user._id, name: user.name, email: user.email, driverVerified: user.driverVerified } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectDriver = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.driverVerified = false;
    user.driverIdImage = undefined;
    user.isDriver = false;
    await user.save();
    res.json({ message: 'Driver rejected and data cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.promoteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isAdmin = true;
    await user.save();
    res.json({ message: 'User promoted to admin', user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('provider', 'name email')
      .sort({ date: -1 })
      .limit(100);
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRides = await Ride.countDocuments();
    const verifiedDrivers = await User.countDocuments({ driverVerified: true });
    const pendingVerifications = await User.countDocuments({ isDriver: true, driverVerified: false });
    
    // Count total bookings
    const ridesWithBookings = await Ride.find().select('bookings');
    const totalBookings = ridesWithBookings.reduce((sum, ride) => sum + (ride.bookings?.length || 0), 0);

    res.json({
      totalUsers,
      totalRides,
      totalBookings,
      verifiedDrivers,
      pendingVerifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
