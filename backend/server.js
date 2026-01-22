// Import required dependencies
const path = require('path');
const express = require('express'); // Web framework for Node.js
const http = require('http'); // HTTP server for Socket.io
const cors = require('cors'); // Cross-Origin Resource Sharing
const dotenv = require('dotenv'); // Environment variable management
const connectDB = require('./config/db'); // Database connection utility

// Load environment variables from .env file
dotenv.config();

// Establish MongoDB database connection
connectDB();

// Initialize Express application
const app = express();

// Create HTTP server for both Express and Socket.io
const server = http.createServer(app);

// Import security and Socket.io dependencies
const { Server } = require('socket.io'); // Real-time bidirectional communication
const helmet = require('helmet'); // Secure HTTP headers
const rateLimit = require('express-rate-limit'); // Rate limiting middleware
const mongoSanitize = require('express-mongo-sanitize'); // Prevent MongoDB injection

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow frontend origin (Vite default)
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true
  }
});

// Initialize socket helper so controllers can emit events globally
require('./utils/socket').init(io);

// ========================
// Middleware Configuration
// ========================

// Parse incoming JSON payloads
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing for frontend
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));

// Set secure HTTP headers (XSS protection, clickjacking prevention, etc.)
// Disable CSP in development to allow image loading
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false, // Disable CSP in development
}));

// Configure rate limiter to prevent abuse and DDoS attacks
const limiter = rateLimit({
  windowMs: 60 * 1000, // Time window: 1 minute
  max: 120, // Maximum 120 requests per IP per window
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false // Disable X-RateLimit-* headers
});
app.use(limiter);

// Sanitize user input to prevent MongoDB operator injection attacks
app.use(mongoSanitize());

// Serve static files (profile photos, driver IDs) from uploads directory
const uploadsPath = path.join(__dirname, process.env.UPLOADS_PATH || 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Set proper CORS headers for images
    res.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Set proper content type based on file extension
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
  }
}));

console.log(`📁 Static files served from: ${uploadsPath}`);

// ========================
// API Route Definitions
// ========================

// Test route to verify uploads (development only)
if (process.env.NODE_ENV === 'development') {
  const fs = require('fs');
  app.get('/api/uploads-test', (req, res) => {
    try {
      const files = fs.readdirSync(uploadsPath);
      res.json({ 
        message: 'Uploads directory accessible',
        path: uploadsPath,
        files: files,
        count: files.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Authentication routes: register, login, profile management
app.use('/api/auth', require('./routes/authRoutes'));

// Ride management routes: create, search, book, cancel rides
app.use('/api/rides', require('./routes/rideRoutes'));

// Chat routes: send and retrieve messages for rides
app.use('/api/chat', require('./routes/chatRoutes'));

// Notification routes: fetch and mark notifications as read
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Payment routes: Razorpay order creation and verification
app.use('/api/payments', require('./routes/paymentRoutes'));

// Admin routes: driver verification, user management, statistics
app.use('/api/admin', require('./routes/adminRoutes'));

// Rating routes: submit and retrieve user/ride ratings
app.use('/api/ratings', require('./routes/ratingRoutes'));

// ========================
// Socket.io Configuration
// ========================
const jwt = require('jsonwebtoken'); // For socket authentication
// Import database models for socket operations
const Message = require('./models/Message'); // Chat messages
const User = require('./models/User'); // User information
const Ride = require('./models/Ride'); // Ride details

/**
 * Socket.io connection handler
 * Handles new WebSocket connections and authenticates users
 */
io.on('connection', async (socket) => {
  console.log('New socket connected:', socket.id);

  // ========================
  // Socket Authentication
  // ========================
  // Verify JWT token before allowing socket operations
  try {
    // Extract token from handshake authentication
    const token = socket.handshake.auth && socket.handshake.auth.token;
    
    // Reject connection if no token provided
    if (!token) {
      console.log('Socket auth token missing, disconnecting', socket.id);
      socket.emit('unauthorized', { message: 'Authentication token required' });
      return socket.disconnect(true);
    }
    
    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user details from database
    const userDoc = await User.findById(decoded.id).select('name');
    
    // Attach user information to socket for future reference
    socket.user = { id: decoded.id, name: userDoc ? userDoc.name : null };
    
    // Join a personal room for direct notifications (e.g., payment alerts)
    try{
      socket.join(`user_${socket.user.id}`)
    }catch(e){/* ignore room join errors */}
  } catch (err) {
    // Handle invalid or expired tokens
    console.log('Socket auth failed:', err.message);
    socket.emit('unauthorized', { message: 'Invalid token' });
    return socket.disconnect(true);
  }

  /**
   * Join Room Event Handler
   * Allows authenticated users to join ride-specific chat rooms
   * Only providers, passengers, or users with bookings can join
   */
  socket.on('joinRoom', async ({ room }) => {
    try {
      // Validate room parameter
      if (!room) return;
      
      // Extract ride ID from room name (handles 'ride_<id>' or plain '<id>' format)
      const rideId = typeof room === 'string' && room.startsWith('ride_') ? room.split('ride_')[1] : room;
      
      // Fetch ride details from database
      const ride = await Ride.findById(rideId);
      if (!ride) {
        socket.emit('room_error', { message: 'Ride/room not found' });
        return;
      }

      // Get current user ID
      const uid = socket.user && socket.user.id;
      
      // Check if user is authorized to join this room
      const isProvider = ride.provider && ride.provider.toString() === uid; // Ride creator
      const isPassenger = ride.passengers && ride.passengers.some(p => p.toString() === uid); // Confirmed passenger
      const hasBooking = ride.bookings && ride.bookings.some(b => (b.user && b.user.toString() === uid)); // Any booking status

      // Allow access if user has any relationship to the ride
      if (isProvider || isPassenger || hasBooking) {
        socket.join(room);
        
        // Log room join for debugging
        const socketsInRoom = await io.in(room).allSockets();
        console.log(`User ${uid} (${socket.user.name}) joined room ${room}. Total sockets in room: ${socketsInRoom.size}`);
        console.log(`  - isProvider: ${isProvider}, isPassenger: ${isPassenger}, hasBooking: ${hasBooking}`);
        
        socket.emit('joinedRoom', { room });
        // notify others in room about presence
        io.to(room).emit('user_joined', { room, userId: uid, name: socket.user.name });
      } else {
        console.log(`User ${uid} (${socket.user.name}) forbidden from joining room ${room}`);
        console.log(`  - isProvider: ${isProvider}, isPassenger: ${isPassenger}, hasBooking: ${hasBooking}`);
        socket.emit('forbidden', { message: 'Not authorized to join this room' });
      }
    } catch (err) {
      console.error('joinRoom error', err);
      socket.emit('room_error', { message: 'Failed to join room' });
    }
  });

  /**
   * Leave Room Event Handler
   * Removes user from ride chat room and notifies others
   */
  socket.on('leaveRoom', ({ room }) => {
    if (room) {
      socket.leave(room); // Remove socket from room
      // Notify remaining users in the room
      io.to(room).emit('user_left', { room, userId: socket.user.id, name: socket.user.name });
    }
  });

  // ========================
  // Chat Message Handler
  // ========================
  
  // Per-socket rate limiting: prevent spam (max 5 messages per 10 seconds)
  const rateWindowMs = 10 * 1000; // 10 second window
  const rateMax = 5; // Maximum 5 messages
  const msgTimestamps = []; // Track message timestamps

  /**
   * Chat Message Event Handler
   * Persists messages to database and broadcasts to room members
   * Implements rate limiting to prevent spam
   */
  socket.on('chatMessage', async (msg) => {
    try {
      // ========================
      // Rate Limiting Logic
      // ========================
      const now = Date.now();
      
      // Remove timestamps older than the rate window
      while (msgTimestamps.length && msgTimestamps[0] <= now - rateWindowMs) msgTimestamps.shift();
      
      // Check if user exceeded rate limit
      if (msgTimestamps.length >= rateMax) {
        socket.emit('rate_limited', { message: 'You are sending messages too quickly. Please slow down.' });
        return;
      }
      
      // Record this message timestamp
      msgTimestamps.push(now);

      // ========================
      // Message Validation
      // ========================
      // Validate message structure: { room, message, to? }
      if (!msg || !msg.room || !msg.message) return;

      const roomName = msg.room;
      
      // Extract ride ID from room name (handles 'ride_<id>' or plain '<id>')
      const rideId = typeof roomName === 'string' && roomName.startsWith('ride_') ? roomName.split('ride_')[1] : roomName;
      
      const content = msg.message; // Message text
      const fromId = socket.user.id; // Sender's user ID

      // ========================
      // Message Persistence
      // ========================
      // Save message to database for history
      const newMsg = new Message({ from: fromId, to: msg.to || null, ride: rideId, content });
      await newMsg.save();

      // Populate sender name from User collection for display
      const populated = await Message.findById(newMsg._id).populate('from', 'name');

      // ========================
      // Prepare Broadcast Payload
      // ========================
      const out = {
        _id: populated._id, // Message ID
        room: roomName, // Chat room name
        message: populated.content, // Message text
        from: populated.from ? (populated.from._id || populated.from) : fromId, // Sender ID
        fromName: populated.from ? populated.from.name : null, // Sender name
        createdAt: populated.createdAt // Timestamp
      };

      // ========================
      // Broadcast to Room
      // ========================
      // Get all connected sockets in this room for debugging
      const socketsInRoom = await io.in(roomName).allSockets();
      console.log(`Broadcasting message to room ${roomName}:`, {
        message: out.message,
        from: out.fromName,
        socketsCount: socketsInRoom.size,
        sockets: Array.from(socketsInRoom)
      });
      
      // Emit message to all users in the room
      io.to(roomName).emit('chatMessage', out);
    } catch (err) {
      console.error('Error handling chatMessage:', err);
      socket.emit('error', { message: 'Message failed to send' });
    }
  });

  /**
   * Location Update Event Handler
   * Allows providers to share real-time GPS location with passengers
   * Only ride providers are authorized to send location updates
   */
  socket.on('location_update', async (payload) => {
    try {
      // Validate payload structure: { rideId, lat, lng }
      if (!payload || !payload.rideId) return
      
      const { rideId, lat, lng } = payload
      
      // Fetch ride from database
      const ride = await Ride.findById(rideId)
      if (!ride) return
      
      // Authorization: Only the ride provider can send location updates
      if (ride.provider && ride.provider.toString() !== socket.user.id) {
        return socket.emit('forbidden', { message: 'Only provider can send location updates' })
      }
      
      // Construct room name and location data
      const roomName = `ride_${rideId}`
      const data = { rideId, lat, lng, ts: Date.now() } // Include timestamp
      
      // Broadcast location to all users in the ride room
      io.to(roomName).emit('location_update', data)
    } catch (err) {
      console.error('Error handling location_update', err)
    }
  })

  /**
   * Disconnect Event Handler
   * Cleanup and notify other users when socket disconnects
   */
  socket.on('disconnect', () => {
    try {
      // Notify all rooms that this user has left
      for (const r of socket.rooms) {
        // Skip the default room (socket's own ID)
        if (r === socket.id) continue;
        
        // Emit user_left event to remaining room members
        io.to(r).emit('user_left', { room: r, userId: socket.user && socket.user.id, name: socket.user && socket.user.name });
      }
    } catch (err) {
      // Ignore errors during disconnect cleanup
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// ========================
// Server Initialization
// ========================

// Get port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start HTTP server (handles both Express and Socket.io)
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export for testing and external use
module.exports = { app, server, io };
