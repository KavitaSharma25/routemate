const mongoose = require('mongoose');

/**
 * Ride Schema
 * Represents a ride offering in the RouteMate platform
 * Includes ride details, bookings, payments, and completion tracking
 */
const rideSchema = new mongoose.Schema({
  // Ride Provider (Driver)
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the ride
  
  // Route Information
  from: { type: String, required: true }, // Starting location/address
  to: { type: String, required: true }, // Destination location/address
  route: { type: Object }, // Optional: polyline or array of GPS coordinates for route visualization
  
  // Scheduling and Capacity
  date: { type: Date, required: true }, // Ride date and time
  seatsAvailable: { type: Number, required: true }, // Number of available seats
  price: { type: Number, default: 0 }, // Price per seat (0 for free rides)
  
  // Ride Status
  status: { 
    type: String, 
    enum: ['open', 'confirmed', 'cancelled', 'completed'], // Lifecycle states
    default: 'open' // Initially accepting bookings
  },
  
  // Confirmed Passengers
  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of confirmed passenger IDs
  
  // Booking Management
  bookings: [ // Array of booking requests with payment and completion tracking
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who requested booking
      seats: { type: Number, default: 1 }, // Number of seats booked
      status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'declined', 'cancelled', 'pending_verification'], // Booking lifecycle
        default: 'pending' // Awaiting provider confirmation
      },
      createdAt: { type: Date, default: Date.now }, // Booking request timestamp
      
      // Payment Details
      payment: {
        method: { 
          type: String, 
          enum: ['online', 'upi', 'cash'], 
          default: 'cash' 
        }, // Payment method chosen
        amount: { type: Number, default: 0 }, // Total amount to pay
        orderId: String, // Razorpay order ID (for online payments)
        paymentId: String, // Razorpay payment ID (after successful payment)
        signature: String, // Razorpay signature for verification
        transactionId: String, // UPI transaction ID / UTR number
        screenshot: String, // Path to UPI payment screenshot
        paid: { type: Boolean, default: false }, // Payment completion status
        verificationPending: { type: Boolean, default: false } // For UPI payments awaiting verification
      },
      
      // Ride Completion Tracking (requires both parties to confirm)
      completedByUser: { type: Boolean, default: false }, // Passenger confirmed completion
      completedByProvider: { type: Boolean, default: false } // Driver confirmed completion
    }
  ],
  
  // Reporting System
  reports: [{ 
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who reported
    reason: String // Report reason/description
  }],
  
  // Metadata
  createdAt: { type: Date, default: Date.now } // Ride creation timestamp
});

module.exports = mongoose.model('Ride', rideSchema);
