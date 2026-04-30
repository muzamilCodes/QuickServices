process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDb = require("./config/connectDb");

const app = express();
const port = process.env.PORT || 4000;

// Connect DB
connectDb();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS with FRONTEND_URL from env
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log("Allowed origins:", allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Static uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/user", require("./routes/userRoutes"));
// Add this with other routes
app.use("/bookings", require("./routes/bookingRoutes"));
app.use("/providers", require("./routes/providerRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
// Public routes (no auth required)
app.use("/public", require("./routes/publicRoutes"));


// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running!" });
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

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);
});
