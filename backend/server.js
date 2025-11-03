const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// initialize socket helper so controllers can emit events
require('./utils/socket').init(io);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(helmet());

// basic rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// prevent mongo operator injection
app.use(mongoSanitize());

// Static uploads
const uploadsPath = path.join(__dirname, process.env.UPLOADS_PATH || 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));

// Socket.io basic wiring with socket auth and message persistence
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');
const Ride = require('./models/Ride');

io.on('connection', async (socket) => {
  console.log('New socket connected:', socket.id);

  // Authenticate socket connection using token from handshake
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      console.log('Socket auth token missing, disconnecting', socket.id);
      socket.emit('unauthorized', { message: 'Authentication token required' });
      return socket.disconnect(true);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user id and name for presence events
    const userDoc = await User.findById(decoded.id).select('name');
    socket.user = { id: decoded.id, name: userDoc ? userDoc.name : null };
    // join a per-user room for direct notifications
    try{
      socket.join(`user_${socket.user.id}`)
    }catch(e){/* ignore */}
  } catch (err) {
    console.log('Socket auth failed:', err.message);
    socket.emit('unauthorized', { message: 'Invalid token' });
    return socket.disconnect(true);
  }

  socket.on('joinRoom', async ({ room }) => {
    try {
      if (!room) return;
      // room may be of form 'ride_<rideId>' or plain rideId
      const rideId = typeof room === 'string' && room.startsWith('ride_') ? room.split('ride_')[1] : room;
      const ride = await Ride.findById(rideId);
      if (!ride) {
        socket.emit('room_error', { message: 'Ride/room not found' });
        return;
      }

      const uid = socket.user && socket.user.id;
      const isProvider = ride.provider && ride.provider.toString() === uid;
      const isPassenger = ride.passengers && ride.passengers.some(p => p.toString() === uid);
  // only allow users with confirmed bookings to join (or provider/passenger)
  const hasBooking = ride.bookings && ride.bookings.some(b => (b.user && b.user.toString() === uid && b.status === 'confirmed'));

      if (isProvider || isPassenger || hasBooking) {
        socket.join(room);
        socket.emit('joinedRoom', { room });
        // notify others in room about presence
        io.to(room).emit('user_joined', { room, userId: uid, name: socket.user.name });
      } else {
        socket.emit('forbidden', { message: 'Not authorized to join this room' });
      }
    } catch (err) {
      console.error('joinRoom error', err);
      socket.emit('room_error', { message: 'Failed to join room' });
    }
  });

  socket.on('leaveRoom', ({ room }) => {
    if (room) {
      socket.leave(room);
      io.to(room).emit('user_left', { room, userId: socket.user.id, name: socket.user.name });
    }
  });

  // Persist chat messages server-side and then broadcast
  // simple per-socket message rate limiter: allow max 5 messages per 10 seconds
  const rateWindowMs = 10 * 1000;
  const rateMax = 5;
  const msgTimestamps = [];

  socket.on('chatMessage', async (msg) => {
    try {
      // rate limiting
      const now = Date.now();
      // remove timestamps older than window
      while (msgTimestamps.length && msgTimestamps[0] <= now - rateWindowMs) msgTimestamps.shift();
      if (msgTimestamps.length >= rateMax) {
        socket.emit('rate_limited', { message: 'You are sending messages too quickly. Please slow down.' });
        return;
      }
      msgTimestamps.push(now);

      // Expect msg: { room, message, to? }
      if (!msg || !msg.room || !msg.message) return;

  const roomName = msg.room;
  // derive rideId from roomName (support 'ride_<id>' or plain id)
  const rideId = typeof roomName === 'string' && roomName.startsWith('ride_') ? roomName.split('ride_')[1] : roomName;
  const content = msg.message;
  const fromId = socket.user.id;

  const newMsg = new Message({ from: fromId, to: msg.to || null, ride: rideId, content });
      await newMsg.save();

      // populate sender name for broadcast
      const populated = await Message.findById(newMsg._id).populate('from', 'name');

      const out = {
        _id: populated._id,
        room: roomName,
        message: populated.content,
        from: populated.from ? (populated.from._id || populated.from) : fromId,
        fromName: populated.from ? populated.from.name : null,
        createdAt: populated.createdAt
      };

      io.to(roomName).emit('chatMessage', out);
    } catch (err) {
      console.error('Error handling chatMessage:', err);
      socket.emit('error', { message: 'Message failed to send' });
    }
  });

  // Provider location updates for live tracking
  socket.on('location_update', async (payload) => {
    try {
      // payload: { rideId, lat, lng }
      if (!payload || !payload.rideId) return
      const { rideId, lat, lng } = payload
      const ride = await Ride.findById(rideId)
      if (!ride) return
      // only provider can send location updates
      if (ride.provider && ride.provider.toString() !== socket.user.id) return socket.emit('forbidden', { message: 'Only provider can send location updates' })
      const roomName = `ride_${rideId}`
      const data = { rideId, lat, lng, ts: Date.now() }
      io.to(roomName).emit('location_update', data)
    } catch (err) {
      console.error('Error handling location_update', err)
    }
  })

  socket.on('disconnect', () => {
    try {
      // emit user_left to rooms the socket was part of (excluding the socket id room)
      for (const r of socket.rooms) {
        if (r === socket.id) continue;
        io.to(r).emit('user_left', { room: r, userId: socket.user && socket.user.id, name: socket.user && socket.user.name });
      }
    } catch (err) {
      // ignore
    }
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server, io };
