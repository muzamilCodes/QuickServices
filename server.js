process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const connectDb = require("./config/connectDb");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// Connect DB
connectDb();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS with FRONTEND_URL from env
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://quick-services-two.vercel.app',
//  process.env.FRONTEND_URL
// ].filter(Boolean);

// console.log("Allowed origins:", allowedOrigins);

// app.use(cors({
//   origin: function(origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl)
//     if (!origin) return callback(null, true);
    
//     const isAllowed =
//       allowedOrigins.includes(origin) ||
//       /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

//     if (isAllowed) {
//       callback(null, true);
//     } else {
//       console.log('❌ Blocked origin:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
// }));

// ✅ CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://quick-services-two.vercel.app",
  "https://quick-services-kohl.vercel.app",
  "https://quick-services-beta.vercel.app",
  "https://quick-services-indol.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);
console.log("Allowed origins:", allowedOrigins);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true;
  return false;
};

// Handle preflight & CORS headers explicitly
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin) && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked origin:", origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept"
  ]
}));

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  }
});

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Real-time socket events for live location & bookings
io.on("connection", (socket) => {
  console.log("🔌 Socket client connected:", socket.id);

  // Join a specific booking tracking room
  socket.on("join_booking", (bookingId) => {
    if (bookingId) {
      socket.join(`booking_${bookingId}`);
      console.log(`📍 Socket ${socket.id} joined tracking room booking_${bookingId}`);
    }
  });

  socket.on("leave_booking", (bookingId) => {
    if (bookingId) {
      socket.leave(`booking_${bookingId}`);
      console.log(`Socket ${socket.id} left tracking room booking_${bookingId}`);
    }
  });

  // Client or Provider broadcasts live GPS location
  socket.on("update_location", async (data) => {
    try {
      const { bookingId, role, lat, lng, heading, speed } = data || {};
      if (!bookingId || lat === undefined || lng === undefined) return;

      const Booking = require("./models/Booking");
      const booking = await Booking.findById(bookingId);
      if (!booking) return;

      // Only allow live location updates during active service periods
      const activeStatuses = ["accepted", "on-the-way", "in-progress"];
      if (!activeStatuses.includes(booking.status)) {
        return;
      }

      const now = new Date();
      if (role === "provider") {
        booking.providerLiveLocation = {
          lat: Number(lat),
          lng: Number(lng),
          heading: heading ? Number(heading) : 0,
          speed: speed ? Number(speed) : 0,
          updatedAt: now
        };
      } else {
        booking.customerLiveLocation = {
          lat: Number(lat),
          lng: Number(lng),
          updatedAt: now
        };
      }

      await booking.save();

      // Broadcast new coordinates to all parties listening to this booking
      io.to(`booking_${bookingId}`).emit("location_updated", {
        bookingId,
        role,
        lat: Number(lat),
        lng: Number(lng),
        heading: heading ? Number(heading) : 0,
        speed: speed ? Number(speed) : 0,
        updatedAt: now,
        status: booking.status,
        providerLiveLocation: booking.providerLiveLocation,
        customerLiveLocation: booking.customerLiveLocation
      });
    } catch (err) {
      console.error("Socket update_location error:", err);
    }
  });

  socket.on("disconnect", () => {
    // console.log("Socket disconnected:", socket.id);
  });
});

// Static uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/user", require("./routes/userRoutes"));
app.use("/bookings", require("./routes/bookingRoutes"));
app.use("/providers", require("./routes/providerRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/loyalty", require("./routes/loyaltyRoutes"));

// Public routes (no auth required)
app.use("/public", require("./routes/publicRoutes"));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running with Socket.IO live location support!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ success: false, message: err.message || "Something went wrong!" });
});

// Handle port listen errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${port} is already in use by another running process!`);
    console.error(`💡 Tip: Close the terminal running the previous server or run: npx kill-port ${port}\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server with Socket.IO running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);
});
