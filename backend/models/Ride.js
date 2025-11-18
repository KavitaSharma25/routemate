const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  route: { type: Object }, // store polyline or array of coords
  date: { type: Date, required: true },
  seatsAvailable: { type: Number, required: true },
  price: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'confirmed', 'cancelled', 'completed'], default: 'open' },
  // passengers will hold confirmed passenger ids
  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // bookings: holds booking requests and payment metadata
  bookings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'confirmed', 'declined', 'cancelled'], default: 'pending' },
      createdAt: { type: Date, default: Date.now },
      payment: {
        orderId: String,
        paymentId: String,
        signature: String,
        paid: { type: Boolean, default: false }
      },
      completedByUser: { type: Boolean, default: false },
      completedByProvider: { type: Boolean, default: false }
    }
  ],
  reports: [{ reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ride', rideSchema);
