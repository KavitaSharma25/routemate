const Ride = require('../models/Ride');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

exports.createRide = async (req, res) => {
  try {
    const { from, to, route, date, seatsAvailable, price } = req.body;
    const ride = new Ride({ provider: req.user.id, from, to, route: route || {}, date, seatsAvailable, price });
    await ride.save();
    res.json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchRides = async (req, res) => {
  try {
    const { to, from, date, seats } = req.query;
    const query = { status: 'open' };
    if (to) query.to = new RegExp(to, 'i');
    if (from) query.from = new RegExp(from, 'i');
    if (date) query.date = { $gte: new Date(date) };
    if (seats) query.seatsAvailable = { $gte: parseInt(seats, 10) };

    const rides = await Ride.find(query).populate('provider', 'name email driverVerified');
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.bookRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.seatsAvailable <= 0) return res.status(400).json({ message: 'No seats available' });

    // create a pending booking entry instead of immediately confirming
    const booking = { user: req.user.id, status: 'pending', createdAt: new Date() };
    ride.bookings.push(booking);
    await ride.save();

    // Notify provider
    const notification = new Notification({ user: ride.provider, type: 'ride_request', message: `${req.user.name || 'A user'} requested a seat`, metadata: { ride: ride._id } });
    await notification.save();

    // email provider
    try {
      const provider = await User.findById(ride.provider);
      if (provider && provider.email) {
        await sendEmail({
          to: provider.email,
          subject: `New ride request for your ride to ${ride.to}`,
          text: `${req.user.name || 'A user'} has requested a seat on your ride scheduled for ${new Date(ride.date).toLocaleString()}.`,
          html: `<p><strong>${req.user.name || 'A user'}</strong> has requested a seat on your ride to <strong>${ride.to}</strong> scheduled for <em>${new Date(ride.date).toLocaleString()}</em>.</p>`
        });
      }
    } catch (err) {
      console.error('Error sending provider email', err);
    }

    res.json({ message: 'Ride request submitted (pending provider confirmation)', bookingId: ride.bookings[ride.bookings.length - 1]._id, rideId: ride._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Provider confirms a booking; returns a Razorpay order if payment required
exports.confirmBooking = async (req, res) => {
  try {
    const { rideId, bookingId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.provider.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Not ride provider' });

    const booking = ride.bookings.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Booking not pending' });

    // If a price is set for the ride, create an order and return to frontend
    if (ride.price && parseFloat(ride.price) > 0) {
      // Check if Razorpay is configured
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('Razorpay not configured, confirming booking without payment');
        // Confirm without payment if Razorpay not configured
        booking.status = 'confirmed';
        ride.passengers.push(booking.user);
        ride.seatsAvailable = Math.max(0, ride.seatsAvailable - 1);
        await ride.save();
        return res.json({ message: 'Booking confirmed (payment gateway not configured)', booking });
      }
      
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
        const options = { amount: Math.round(parseFloat(ride.price) * 100), currency: 'INR', receipt: `ride_${ride._id}_booking_${bookingId}` };
        const order = await razorpay.orders.create(options);
      // store orderId in booking.payment.orderId
      booking.payment = booking.payment || {};
      booking.payment.orderId = order.id;
      await ride.save();
      // create a notification for the seeker with order metadata so they can complete payment
      try {
        const note = new Notification({ user: booking.user, type: 'payment_required', message: `Payment required to confirm your booking for ride to ${ride.to}`, metadata: { ride: ride._id, order: { id: order.id, amount: order.amount }, keyId: process.env.RAZORPAY_KEY_ID, bookingId: booking._id } });
        await note.save();
        // emit a socket notification to the seeker if they're connected
        try {
          const { getIO } = require('../utils/socket')
          const io = getIO()
          io.to(`user_${booking.user}`).emit('notification', note)
        } catch (emitErr) {
          // ignore if socket not initialized
        }
        // attempt to email the seeker with payment info
        try {
          const seeker = await User.findById(booking.user);
          if (seeker && seeker.email) {
            await sendEmail({ to: seeker.email, subject: `Pay to confirm your booking for ${ride.to}`, text: `Please complete payment to confirm your booking. Order ID: ${order.id}`, html: `<p>Please complete payment to confirm your booking for <strong>${ride.to}</strong>. Use Order ID: <code>${order.id}</code></p>` });
          }
        } catch (e) {
          console.error('Error emailing seeker payment link', e);
        }
      } catch (e) {
        console.error('Error creating payment notification for seeker', e);
      }

        return res.json({ order, keyId: process.env.RAZORPAY_KEY_ID, bookingId: booking._id });
      } catch (razorpayError) {
        console.error('Razorpay error:', razorpayError);
        console.warn('Razorpay authentication failed, confirming booking without payment');
        // If Razorpay fails (invalid credentials), confirm without payment
        booking.status = 'confirmed';
        ride.passengers.push(booking.user);
        ride.seatsAvailable = Math.max(0, ride.seatsAvailable - 1);
        await ride.save();
        
        // Notify seeker about confirmation
        try {
          const note = new Notification({ 
            user: booking.user, 
            type: 'booking_confirmed', 
            message: `Your booking for ride from ${ride.from} to ${ride.to} has been confirmed!`, 
            metadata: { ride: ride._id } 
          });
          await note.save();
          
          // Send email notification
          const seeker = await User.findById(booking.user);
          if (seeker && seeker.email) {
            await sendEmail({ 
              to: seeker.email, 
              subject: `✅ Booking Confirmed - Ride to ${ride.to}`, 
              text: `Your booking has been confirmed for ${new Date(ride.date).toLocaleString()}.`,
              html: `<h2>✅ Booking Confirmed!</h2><p>Your booking for the ride from <strong>${ride.from}</strong> to <strong>${ride.to}</strong> has been confirmed.</p><p><strong>Date:</strong> ${new Date(ride.date).toLocaleString()}</p><p><strong>Price:</strong> ₹${ride.price}</p>`
            });
          }
        } catch (notifErr) {
          console.error('Error sending confirmation notification:', notifErr);
        }
        
        return res.json({ message: 'Booking confirmed successfully!', booking, ride });
      }
    }

    // free ride: confirm immediately
    booking.status = 'confirmed';
    ride.passengers.push(booking.user);
    ride.seatsAvailable = Math.max(0, ride.seatsAvailable - 1);
    await ride.save();

    // notify seeker
    const note = new Notification({ 
      user: booking.user, 
      type: 'booking_confirmed', 
      message: `✅ Your booking for ride from ${ride.from} to ${ride.to} has been confirmed!`, 
      metadata: { ride: ride._id } 
    });
    await note.save();

    try {
      const seeker = await User.findById(booking.user);
      if (seeker && seeker.email) {
        await sendEmail({ 
          to: seeker.email, 
          subject: `✅ Booking Confirmed - Ride to ${ride.to}`, 
          text: `Your booking has been confirmed for ${new Date(ride.date).toLocaleString()}.`, 
          html: `<h2>✅ Booking Confirmed!</h2><p>Your booking for the ride from <strong>${ride.from}</strong> to <strong>${ride.to}</strong> has been confirmed.</p><p><strong>Date:</strong> ${new Date(ride.date).toLocaleString()}</p>`
        });
      }
    } catch (err) {
      console.error('Error emailing seeker on confirm', err);
    }

    res.json({ message: 'Booking confirmed successfully!', ride, booking });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ 
      message: 'Server error while confirming booking', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

exports.declineBooking = async (req, res) => {
  try {
    const { rideId, bookingId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.provider.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Not ride provider' });

    const booking = ride.bookings.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'declined';
    await ride.save();

    // notify seeker
    const note = new Notification({ user: booking.user, type: 'booking_declined', message: `Your booking for ride to ${ride.to} was declined by the provider.`, metadata: { ride: ride._id } });
    await note.save();

    try {
      const seeker = await User.findById(booking.user);
      if (seeker && seeker.email) {
        await sendEmail({ to: seeker.email, subject: `Booking declined for ride to ${ride.to}`, text: `Your booking request was declined by the provider.`, html: `<p>Your booking request was declined by the provider.</p>` });
      }
    } catch (err) {
      console.error('Error emailing seeker on decline', err);
    }

    res.json({ message: 'Booking declined' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    // if provider cancels
    const providerId = ride.provider.toString();
    const userId = req.user.id.toString();
    
    console.log('Cancel authorization check:', { providerId, userId, match: providerId === userId });
    
    if (providerId === userId) {
      ride.status = 'cancelled';
      await ride.save();
      // Notify passengers
      try {
        const passengers = await User.find({ _id: { $in: ride.passengers } });
        for (const p of passengers) {
          // create notification for each passenger
          const note = new Notification({ user: p._id, type: 'ride_cancelled', message: `Ride to ${ride.to} was cancelled by provider`, metadata: { ride: ride._id } });
          await note.save();
          // email
          if (p.email) {
            await sendEmail({
              to: p.email,
              subject: `Ride to ${ride.to} cancelled`,
              text: `The ride scheduled on ${new Date(ride.date).toLocaleString()} has been cancelled by the driver.`,
              html: `<p>The ride scheduled on <strong>${new Date(ride.date).toLocaleString()}</strong> has been cancelled by the driver.</p>`
            });
          }
        }
      } catch (err) {
        console.error('Error notifying passengers', err);
      }
      return res.json({ message: 'Ride cancelled' });
    }

    // if passenger cancels booking
    const idx = ride.passengers.findIndex(p => p.toString() === req.user.id);
    if (idx === -1) return res.status(400).json({ message: 'You are not a passenger of this ride' });
    ride.passengers.splice(idx, 1);
    ride.seatsAvailable += 1;
    await ride.save();
    // notify provider that a passenger cancelled
    try {
      const provider = await User.findById(ride.provider);
      if (provider) {
        const note = new Notification({ user: provider._id, type: 'passenger_cancel', message: `${req.user.name || 'A user'} cancelled their booking`, metadata: { ride: ride._id } });
        await note.save();
        if (provider.email) {
          await sendEmail({
            to: provider.email,
            subject: `A passenger cancelled for your ride to ${ride.to}`,
            text: `${req.user.name || 'A user'} cancelled their booking for your ride scheduled on ${new Date(ride.date).toLocaleString()}.`,
            html: `<p><strong>${req.user.name || 'A user'}</strong> cancelled their booking for your ride scheduled on <em>${new Date(ride.date).toLocaleString()}</em>.</p>`
          });
        }
      }
    } catch (err) {
      console.error('Error notifying provider on passenger cancel', err);
    }

    res.json({ message: 'Booking cancelled', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRideHistory = async (req, res) => {
  try {
    const asProvider = await Ride.find({ provider: req.user.id });
    const asPassenger = await Ride.find({ passengers: req.user.id });
    res.json({ asProvider, asPassenger });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const { rideId } = req.params
    const ride = await Ride.findById(rideId).populate('provider', 'name email')
    if (!ride) return res.status(404).json({ message: 'Ride not found' })
    res.json(ride)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.reportRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    ride.reports.push({ reporter: req.user.id, reason });
    await ride.save();
    res.json({ message: 'Report submitted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { from, to, date, seatsAvailable, price, route } = req.body;
    
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    
    // Only provider can update their ride
    if (ride.provider.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }
    
    // Don't allow updates if ride has confirmed bookings
    const hasConfirmedBookings = ride.bookings.some(b => b.status === 'confirmed');
    if (hasConfirmedBookings) {
      return res.status(400).json({ message: 'Cannot update ride with confirmed bookings' });
    }
    
    if (from) ride.from = from;
    if (to) ride.to = to;
    if (date) ride.date = date;
    if (seatsAvailable !== undefined) ride.seatsAvailable = seatsAvailable;
    if (price !== undefined) ride.price = price;
    if (route) ride.route = route;
    
    await ride.save();
    res.json({ message: 'Ride updated successfully', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    
    // Only provider can delete their ride
    const providerId = ride.provider.toString();
    const userId = req.user.id.toString();
    
    console.log('Delete authorization check:', { providerId, userId, match: providerId === userId });
    
    if (providerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this ride' });
    }
    
    // Don't allow deletion if ride has confirmed bookings
    const hasConfirmedBookings = ride.bookings.some(b => b.status === 'confirmed');
    if (hasConfirmedBookings) {
      return res.status(400).json({ message: 'Cannot delete ride with confirmed bookings. Cancel the ride instead.' });
    }
    
    await Ride.findByIdAndDelete(rideId);
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ provider: req.user.id })
      .sort({ date: -1 })
      .populate('bookings.user', 'name email');
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    // Find all rides where user has a booking
    const rides = await Ride.find({ 'bookings.user': req.user.id })
      .sort({ date: -1 })
      .populate('provider', 'name email phone');
    
    // Filter to only include the user's booking info
    const bookingsWithRides = rides.map(ride => {
      const userBooking = ride.bookings.find(b => b.user.toString() === req.user.id.toString());
      return {
        _id: ride._id,
        from: ride.from,
        to: ride.to,
        date: ride.date,
        price: ride.price,
        provider: ride.provider,
        booking: userBooking,
        route: ride.route
      };
    });
    
    res.json(bookingsWithRides);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
