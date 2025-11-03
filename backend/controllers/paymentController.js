const Razorpay = require('razorpay');
const { verifySignature } = require('../utils/razorpayUtils')

exports.createOrder = async (req, res) => {
  try {
    // ensure keys are present
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Razorpay not configured on server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env' });
    }

    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const options = {
      amount: Math.round(parseFloat(amount) * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay createOrder error', error);
    res.status(500).json({ message: 'Payment creation failed' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return res.status(503).json({ message: 'Razorpay secret not configured on server' });

  const ok = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, keySecret)
  if (ok) {
      // Payment verified successfully. Update booking status
      const Ride = require('../models/Ride');
      const User = require('../models/User');
      const Notification = require('../models/Notification');
      const sendEmail = require('../utils/sendEmail');

      const ride = await Ride.findOne({ 'bookings.payment.orderId': razorpay_order_id });
      if (!ride) return res.status(404).json({ success: false, message: 'Associated ride/booking not found' });

      const booking = ride.bookings.find(b => b.payment && b.payment.orderId === razorpay_order_id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      booking.payment.paymentId = razorpay_payment_id;
      booking.payment.signature = razorpay_signature;
      booking.payment.paid = true;
      booking.status = 'confirmed';

      // push confirmed passenger and decrement seat
      ride.passengers.push(booking.user);
      ride.seatsAvailable = Math.max(0, ride.seatsAvailable - 1);
      await ride.save();

      // notify seeker
      try {
        const seeker = await User.findById(booking.user);
        const note = new Notification({ user: seeker._id, type: 'payment_confirmed', message: `Your payment for ride to ${ride.to} is successful and booking confirmed.`, metadata: { ride: ride._id } });
        await note.save();
        if (seeker && seeker.email) {
          await sendEmail({ to: seeker.email, subject: `Payment Success - Booking confirmed for ${ride.to}`, text: `Your payment was successful. Your booking is now confirmed.`, html: `<p>Your payment was successful. Your booking for <strong>${ride.to}</strong> is now confirmed.</p>` });
        }
      } catch (err) {
        console.error('Error notifying seeker after payment', err);
      }

      // notify provider
      try {
        const provider = await User.findById(ride.provider);
        const note = new Notification({ user: provider._id, type: 'passenger_confirmed', message: `A passenger has completed payment for your ride to ${ride.to}.`, metadata: { ride: ride._id } });
        await note.save();
        if (provider && provider.email) {
          await sendEmail({ to: provider.email, subject: `Passenger paid for ride to ${ride.to}`, text: `A passenger has completed payment. Booking confirmed.`, html: `<p>A passenger has completed payment for your ride to <strong>${ride.to}</strong>.</p>` });
        }
      } catch (err) {
        console.error('Error notifying provider after payment', err);
      }

      return res.json({ success: true });
    }

    res.status(400).json({ success: false, message: 'Invalid signature' });
  } catch (error) {
    console.error('verifyPayment error', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};
