const Ride = require('../models/Ride');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { generateOTP, getOTPExpiry, verifyOTP } = require('../utils/otpService');
const { sendOTP: sendSMS } = require('../utils/smsService');

/**
 * Helper function to send OTP via Email and/or SMS
 * @param {Object} passenger - Passenger user object
 * @param {string} otp - 6-digit OTP code
 * @param {string} deliveryMethod - 'email', 'sms', or 'both'
 * @param {string} rideTo - Destination for email context
 * @returns {Promise<Object>} - {emailSent: boolean, smsSent: boolean, smsError: string|null}
 */
async function sendOTPNotification(passenger, otp, deliveryMethod = 'email', rideTo = 'destination') {
  const result = { emailSent: false, smsSent: false, smsError: null };

  try {
    // Send Email
    if (deliveryMethod === 'email' || deliveryMethod === 'both') {
      try {
        if (passenger && passenger.email) {
          await sendEmail({
            to: passenger.email,
            subject: `🔐 Your RouteMate OTP for Ride to ${rideTo}`,
            text: `Your OTP for ride verification: ${otp}. Valid for 15 minutes. Do not share.`,
            html: `<h2>🔐 Your Ride OTP</h2><p>Your OTP for ride verification:</p><p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;"><code style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">${otp}</code></p><p><strong>Valid for:</strong> 15 minutes</p><p><em>Do not share this OTP with anyone.</em></p>`
          });
          result.emailSent = true;
        }
      } catch (emailErr) {
        console.error('Error sending OTP email:', emailErr);
      }
    }

    // Send SMS
    if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
      try {
        if (passenger && passenger.phone) {
          const phoneClean = passenger.phone.replace(/\D/g, '').slice(-10);
          const smsSent = await sendSMS(phoneClean, otp);
          result.smsSent = smsSent;
        } else {
          result.smsError = 'Phone number not available';
        }
      } catch (smsErr) {
        result.smsError = smsErr.message;
        console.error('Error sending OTP SMS:', smsErr);
      }
    }

    return result;
  } catch (error) {
    console.error('Error in sendOTPNotification:', error);
    return result;
  }
}

/**
 * Create a new ride offering
 * Provider creates a ride with route, date, seats, and price details
 */
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

/**
 * Search for available rides
 * Filters rides by destination, origin, date, and available seats
 */
exports.searchRides = async (req, res) => {
  try {
    // Extract search filters from query parameters
    const { to, from, date, seats } = req.query;
    
    // Build MongoDB query - start with only open rides
    const query = { status: 'open' };
    
    // Add destination filter (case-insensitive regex)
    if (to) query.to = new RegExp(to, 'i');
    
    // Add origin filter (case-insensitive regex)
    if (from) query.from = new RegExp(from, 'i');
    
    // Add date filter (rides on or after specified date)
    if (date) query.date = { $gte: new Date(date) };
    
    // Add seats filter (rides with at least specified seats available)
    if (seats) query.seatsAvailable = { $gte: parseInt(seats, 10) };

    // Execute query and populate provider details including UPI ID
    const rides = await Ride.find(query).populate('provider', 'name email driverVerified upiId phone');
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Book a seat on a ride
 * Handles three payment methods: online (Razorpay), UPI, and cash
 */
exports.bookRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { seats = 1, paymentMethod = 'cash', otpDeliveryMethod = 'email' } = req.body; // Default to email OTP
    
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    
    // Validate seats
    const requestedSeats = parseInt(seats, 10);
    if (isNaN(requestedSeats) || requestedSeats < 1) {
      return res.status(400).json({ message: 'Invalid number of seats' });
    }
    
    if (ride.seatsAvailable < requestedSeats) {
      return res.status(400).json({ 
        message: `Only ${ride.seatsAvailable} seat(s) available, you requested ${requestedSeats}` 
      });
    }

    // Validate OTP delivery method
    if (!['email', 'sms', 'both'].includes(otpDeliveryMethod)) {
      return res.status(400).json({ message: 'Invalid OTP delivery method' });
    }

    const totalAmount = ride.price * requestedSeats;

    // Handle different payment methods
    switch (paymentMethod) {
      case 'online': {
        // Online payment via Razorpay
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
          return res.status(503).json({ 
            message: 'Online payment not available. Razorpay is not configured. Please choose cash or UPI payment.' 
          });
        }

        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({ 
          key_id: process.env.RAZORPAY_KEY_ID, 
          key_secret: process.env.RAZORPAY_KEY_SECRET 
        });

        // Create Razorpay order
        const order = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // Convert to paise
          currency: 'INR',
          receipt: `ride_${rideId}_${Date.now()}`,
          notes: {
            rideId: rideId,
            userId: req.user.id,
            seats: requestedSeats
          }
        });

        // Create booking with payment pending
        const booking = {
          user: req.user.id,
          seats: requestedSeats,
          status: 'pending',
          payment: {
            method: 'online',
            orderId: order.id,
            amount: totalAmount,
            paid: false
          },
          createdAt: new Date()
        };

        ride.bookings.push(booking);
        await ride.save();

        const bookingId = ride.bookings[ride.bookings.length - 1]._id;

        return res.json({
          message: 'Complete payment to confirm booking',
          order: order,
          keyId: process.env.RAZORPAY_KEY_ID,
          bookingId: bookingId,
          rideId: ride._id
        });
      }

      case 'upi': {
        // UPI payment - will be verified manually
        const booking = {
          user: req.user.id,
          seats: requestedSeats,
          status: 'pending_verification',
          payment: {
            method: 'upi',
            amount: totalAmount,
            paid: false,
            verificationPending: true
          },
          createdAt: new Date()
        };

        ride.bookings.push(booking);
        await ride.save();

        // Notify user
        const notification = new Notification({
          user: req.user.id,
          type: 'upi_payment_pending',
          message: `UPI payment submitted for ride to ${ride.to}. Awaiting verification.`,
          metadata: { ride: ride._id }
        });
        await notification.save();

        // Notify provider
        const providerNotification = new Notification({
          user: ride.provider,
          type: 'upi_payment_received',
          message: `UPI payment received for ride to ${ride.to}. Please verify.`,
          metadata: { ride: ride._id }
        });
        await providerNotification.save();

        return res.json({
          message: 'UPI payment proof submitted. Booking will be confirmed after verification.',
          bookingId: ride.bookings[ride.bookings.length - 1]._id,
          rideId: ride._id,
          status: 'pending_verification'
        });
      }

      case 'cash':
      default: {
        // Cash payment - create pending booking for provider confirmation
        const booking = {
          user: req.user.id,
          seats: requestedSeats,
          status: 'pending',
          payment: {
            method: 'cash',
            amount: totalAmount,
            paid: false
          },
          createdAt: new Date()
        };

        ride.bookings.push(booking);
        await ride.save();

        // Notify provider
        const notification = new Notification({
          user: ride.provider,
          type: 'ride_request',
          message: `${req.user.name || 'A user'} requested ${requestedSeats} seat(s) - Cash payment`,
          metadata: { ride: ride._id }
        });
        await notification.save();

        // Email provider (async, don't wait)
        setImmediate(async () => {
          try {
            const provider = await User.findById(ride.provider);
            if (provider && provider.email) {
              await sendEmail({
                to: provider.email,
                subject: `New ride request for your ride to ${ride.to}`,
                text: `${req.user.name || 'A user'} has requested ${requestedSeats} seat(s) on your ride. Payment: Cash`,
                html: `<p><strong>${req.user.name || 'A user'}</strong> has requested <strong>${requestedSeats} seat(s)</strong> on your ride to <strong>${ride.to}</strong>.</p><p>Payment Method: <strong>Cash</strong></p>`
              });
            }
          } catch (err) {
            console.error('Error sending provider email', err);
          }
        });

        return res.json({
          message: 'Ride request submitted (pending provider confirmation)',
          bookingId: ride.bookings[ride.bookings.length - 1]._id,
          rideId: ride._id
        });
      }
    }
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

/**
 * Provider confirms a booking request
 * Creates Razorpay payment order if ride has a price, otherwise confirms immediately
 */
exports.confirmBooking = async (req, res) => {
  try {
    const { rideId, bookingId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.provider.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Not ride provider' });

    const booking = ride.bookings.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Booking not pending' });

    // Get number of seats from booking
    const seatsToBook = booking.seats || 1;
    
    // Check if enough seats are available
    if (ride.seatsAvailable < seatsToBook) {
      return res.status(400).json({ 
        message: `Not enough seats available. Requested: ${seatsToBook}, Available: ${ride.seatsAvailable}` 
      });
    }

    // If a price is set for the ride, create an order and return to frontend
    // Check if this is a paid ride
    if (ride.price && parseFloat(ride.price) > 0) {
      // Verify Razorpay credentials are configured in environment
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('Razorpay not configured, confirming booking without payment');
        
        // Fallback: Confirm booking without payment if gateway not configured
        booking.status = 'confirmed';
        // Generate OTP for ride verification
        booking.otp = generateOTP();
        booking.otpExpiry = getOTPExpiry();
        booking.otpVerified = false;
        ride.passengers.push(booking.user); // Add to confirmed passengers
        ride.seatsAvailable = Math.max(0, ride.seatsAvailable - seatsToBook); // Decrement available seats
        await ride.save();
        return res.json({ message: 'Booking confirmed (payment gateway not configured)', booking, otp: booking.otp });
      }
      
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
        // Calculate total price based on seats
        const totalAmount = Math.round(parseFloat(ride.price) * seatsToBook * 100);
        const options = { 
          amount: totalAmount, 
          currency: 'INR', 
          receipt: `ride_${ride._id}_booking_${bookingId}` 
        };
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
        // Generate OTP for ride verification
        booking.otp = generateOTP();
        booking.otpExpiry = getOTPExpiry();
        booking.otpVerified = false;
        ride.passengers.push(booking.user);
        ride.seatsAvailable = Math.max(0, ride.seatsAvailable - seatsToBook);
        await ride.save();
        
        // Notify seeker about confirmation with OTP
        try {
          const note = new Notification({ 
            user: booking.user, 
            type: 'booking_confirmed', 
            message: `Your booking for ride from ${ride.from} to ${ride.to} has been confirmed!`, 
            metadata: { ride: ride._id, otp: booking.otp } 
          });
          await note.save();
          
          // Send email notification with OTP
          const seeker = await User.findById(booking.user);
          if (seeker && seeker.email) {
            await sendEmail({ 
              to: seeker.email, 
              subject: `✅ Booking Confirmed - Ride to ${ride.to}`, 
              text: `Your booking has been confirmed for ${new Date(ride.date).toLocaleString()}. Your OTP for ride verification: ${booking.otp}`,
              html: `<h2>✅ Booking Confirmed!</h2><p>Your booking for the ride from <strong>${ride.from}</strong> to <strong>${ride.to}</strong> has been confirmed.</p><p><strong>Date:</strong> ${new Date(ride.date).toLocaleString()}</p><p><strong>Price:</strong> ₹${ride.price}</p><p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;"><strong>Your OTP for ride verification:</strong> <code style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">${booking.otp}</code></p><p><em>Share this OTP with your driver to confirm you're boarding the ride. OTP expires in 15 minutes.</em></p>`
            });
          }
        } catch (notifErr) {
          console.error('Error sending confirmation notification:', notifErr);
        }
        
        return res.json({ message: 'Booking confirmed successfully!', booking, otp: booking.otp });
      }
    }

    // free ride: confirm immediately
    booking.status = 'confirmed';
    // Generate OTP for ride verification
    booking.otp = generateOTP();
    booking.otpExpiry = getOTPExpiry();
    booking.otpVerified = false;
    booking.otpDeliveryMethod = req.body.otpDeliveryMethod || 'email';
    ride.passengers.push(booking.user);
    ride.seatsAvailable = Math.max(0, ride.seatsAvailable - seatsToBook); // Decrement seats by booked amount
    await ride.save();

    // Send OTP via Email and/or SMS
    const seeker = await User.findById(booking.user);
    let otpNotificationResult = { emailSent: false, smsSent: false, smsError: null };
    
    try {
      otpNotificationResult = await sendOTPNotification(
        seeker, 
        booking.otp, 
        booking.otpDeliveryMethod, 
        ride.to
      );
      
      // Store SMS delivery status in booking
      booking.smsSent = otpNotificationResult.smsSent;
      booking.smsError = otpNotificationResult.smsError;
      await ride.save();
    } catch (err) {
      console.error('Error sending OTP notification:', err);
    }

    // notify seeker with OTP
    const note = new Notification({ 
      user: booking.user, 
      type: 'booking_confirmed', 
      message: `✅ Your booking for ride from ${ride.from} to ${ride.to} has been confirmed!`, 
      metadata: { ride: ride._id, otp: booking.otp, otpDeliveryMethod: booking.otpDeliveryMethod } 
    });
    await note.save();

    try {
      if (seeker && seeker.email && (booking.otpDeliveryMethod === 'email' || booking.otpDeliveryMethod === 'both')) {
        const smsNote = booking.otpDeliveryMethod === 'both' ? 'and SMS' : '';
        await sendEmail({ 
          to: seeker.email, 
          subject: `✅ Booking Confirmed - Ride to ${ride.to}`, 
          text: `Your booking has been confirmed for ${new Date(ride.date).toLocaleString()}. Your OTP: ${booking.otp}`, 
          html: `<h2>✅ Booking Confirmed!</h2><p>Your booking for the ride from <strong>${ride.from}</strong> to <strong>${ride.to}</strong> has been confirmed.</p><p><strong>Date:</strong> ${new Date(ride.date).toLocaleString()}</p><p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;"><strong>Your OTP:</strong> <code style="font-size: 16px; font-weight: bold; letter-spacing: 2px;">${booking.otp}</code></p><p><em>Valid for 15 minutes.</em></p>`
        });
      }
    } catch (err) {
      console.error('Error emailing seeker on confirm', err);
    }

    res.json({ 
      message: 'Booking confirmed successfully!', 
      ride, 
      booking,
      otpNotification: {
        emailSent: otpNotificationResult.emailSent,
        smsSent: otpNotificationResult.smsSent,
        smsError: otpNotificationResult.smsError,
        deliveryMethod: booking.otpDeliveryMethod
      }
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ 
      message: 'Server error while confirming booking', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

/**
 * Provider declines a booking request
 * Updates booking status and notifies the requester
 */
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

/**
 * Cancel a ride or booking
 * Provider can cancel entire ride, passenger can cancel their booking
 */
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

/**
 * Get user's ride history
 * Returns rides where user was provider or passenger
 */
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

/**
 * Get detailed ride information by ID
 * Returns ride with populated provider details
 */
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

/**
 * Report a ride for violations
 * Adds report with reason to ride's report list
 */
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

/**
 * Update ride details
 * Provider can update ride info if no confirmed bookings exist
 */
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

/**
 * Delete a ride
 * Provider can delete ride if no confirmed bookings exist
 */
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

/**
 * Get all rides created by current user
 * Returns rides with booking information where user is the provider
 */
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

/**
 * Get all bookings made by current user
 * Returns rides where user has made a booking with booking details
 */
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
        providerId: ride.provider._id,
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

/**
 * Mark ride as completed
 * Both provider and passenger must confirm completion for ride to be marked complete
 */
exports.markRideComplete = async (req, res) => {
  try {
    const { rideId, bookingId } = req.params;
    const ride = await Ride.findById(rideId).populate('provider', 'name email').populate('bookings.user', 'name email');
    
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    
    const booking = ride.bookings.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be marked as complete' });
    }
    
    const userId = req.user.id.toString();
    const isProvider = ride.provider._id.toString() === userId;
    const isBookingUser = booking.user._id.toString() === userId;
    
    if (!isProvider && !isBookingUser) {
      return res.status(403).json({ message: 'You are not authorized to mark this ride as complete' });
    }
    
    // Mark completion based on who is confirming
    if (isProvider) {
      booking.completedByProvider = true;
    } else if (isBookingUser) {
      booking.completedByUser = true;
    }
    
    // If both have confirmed completion, mark the ride as completed
    if (booking.completedByProvider && booking.completedByUser) {
      ride.status = 'completed';
      
      // Send notification to both parties
      try {
        const providerNotif = new Notification({
          user: ride.provider._id,
          type: 'ride_completed',
          message: `Ride to ${ride.to} has been completed successfully!`,
          metadata: { ride: ride._id }
        });
        await providerNotif.save();
        
        const userNotif = new Notification({
          user: booking.user._id,
          type: 'ride_completed',
          message: `Ride to ${ride.to} has been completed successfully!`,
          metadata: { ride: ride._id }
        });
        await userNotif.save();
      } catch (err) {
        console.error('Error creating completion notifications:', err);
      }
    }
    
    await ride.save();
    
    const responseMessage = booking.completedByProvider && booking.completedByUser
      ? 'Ride marked as completed by both parties!'
      : isProvider
      ? 'You have marked this ride as complete. Waiting for passenger confirmation.'
      : 'You have marked this ride as complete. Waiting for provider confirmation.';
    
    res.json({ 
      message: responseMessage, 
      booking,
      rideCompleted: ride.status === 'completed',
      completedByProvider: booking.completedByProvider,
      completedByUser: booking.completedByUser
    });
  } catch (error) {
    console.error('Error marking ride complete:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Verify OTP for ride boarding
 * Provider verifies the OTP provided by the passenger before allowing them to board
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { rideId, bookingId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    // Check if user is the ride provider
    if (ride.provider.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only ride provider can verify OTP' });
    }

    const booking = ride.bookings.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify the OTP
    const otpVerification = verifyOTP(otp, booking.otp, booking.otpExpiry);
    
    if (!otpVerification.valid) {
      return res.status(400).json({ message: otpVerification.message });
    }

    // Mark OTP as verified
    booking.otpVerified = true;
    await ride.save();

    // Notify passenger that OTP was verified
    try {
      const note = new Notification({
        user: booking.user,
        type: 'otp_verified',
        message: `Your OTP for ride to ${ride.to} has been verified! You're confirmed on the ride.`,
        metadata: { ride: ride._id, booking: booking._id }
      });
      await note.save();

      // Send email notification
      const passenger = await User.findById(booking.user);
      if (passenger && passenger.email) {
        await sendEmail({
          to: passenger.email,
          subject: `✅ OTP Verified - Ride to ${ride.to}`,
          text: `Your OTP has been verified. You're confirmed on the ride!`,
          html: `<h2>✅ OTP Verified!</h2><p>Your OTP has been verified by the driver. You're confirmed on the ride to <strong>${ride.to}</strong>.</p><p><em>Have a safe journey!</em></p>`
        });
      }
    } catch (err) {
      console.error('Error sending OTP verification notification:', err);
    }

    res.json({
      message: 'OTP verified successfully!',
      otpVerified: true,
      booking: {
        _id: booking._id,
        user: booking.user,
        seats: booking.seats,
        status: booking.status,
        otpVerified: booking.otpVerified
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

/**
 * Update driver's real-time location
 * Called frequently by driver's mobile app/browser
 */
exports.updateLocation = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { latitude, longitude, accuracy } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    // Verify user is the ride provider
    if (ride.provider.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only ride provider can update location' });
    }

    // Only allow location updates for confirmed rides
    if (ride.status !== 'confirmed' && ride.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update location for this ride' });
    }

    // Update ride location
    ride.currentLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      timestamp: new Date()
    };

    // Set tracking as enabled if not already
    if (!ride.trackingEnabled) {
      ride.trackingEnabled = true;
      ride.trackingStartTime = new Date();
    }

    await ride.save();

    // Broadcast location update to all passengers via WebSocket
    try {
      const { getIO } = require('../utils/socket');
      const io = getIO();
      
      // Send to all passengers on this ride
      ride.passengers.forEach(passengerId => {
        io.to(`user_${passengerId}`).emit('location-update', {
          rideId: ride._id,
          currentLocation: ride.currentLocation,
          provider: {
            id: ride.provider,
            name: ride.provider.name || 'Driver'
          }
        });
      });
    } catch (socketErr) {
      console.error('Error broadcasting location:', socketErr);
      // Don't fail the request if socket fails
    }

    res.json({
      message: 'Location updated successfully',
      location: ride.currentLocation
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

/**
 * Get current ride location (for passenger to see driver location)
 */
exports.getRideLocation = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId).populate('provider', 'name phone email');
    
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    // Verify user is either provider or passenger
    const isProvider = ride.provider._id.toString() === req.user.id.toString();
    const isPassenger = ride.passengers.some(p => p.toString() === req.user.id.toString());

    if (!isProvider && !isPassenger) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      rideId: ride._id,
      currentLocation: ride.currentLocation,
      trackingEnabled: ride.trackingEnabled,
      trackingStartTime: ride.trackingStartTime,
      provider: {
        id: ride.provider._id,
        name: ride.provider.name,
        phone: ride.provider.phone,
        rating: ride.provider.rating || 0
      },
      route: {
        from: ride.from,
        to: ride.to,
        date: ride.date,
        distance: ride.distance || null // Add distance calculation if available
      }
    });
  } catch (error) {
    console.error('Error getting ride location:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

/**
 * Stop location tracking for a ride
 */
exports.stopTracking = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    // Verify user is the ride provider
    if (ride.provider.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only ride provider can stop tracking' });
    }

    // Stop tracking
    ride.trackingEnabled = false;
    ride.trackingEndTime = new Date();
    await ride.save();

    // Notify passengers that tracking has stopped
    try {
      const { getIO } = require('../utils/socket');
      const io = getIO();
      
      ride.passengers.forEach(passengerId => {
        io.to(`user_${passengerId}`).emit('tracking-stopped', {
          rideId: ride._id,
          message: 'Driver has stopped sharing location'
        });
      });
    } catch (socketErr) {
      console.error('Error notifying passengers:', socketErr);
    }

    res.json({ message: 'Location tracking stopped', trackingEnabled: false });
  } catch (error) {
    console.error('Error stopping tracking:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
