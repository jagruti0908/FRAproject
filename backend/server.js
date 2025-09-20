const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

// Debug: Check if env variables are loaded
console.log("Environment variables check:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Loaded" : "NOT LOADED");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);

const app = express();

// Import routes
const claimRoutes = require("./Routes/Claim.js");
const userRoutes = require("./Routes/User.js");
const gisRoutes = require("./Routes/GIS.js");
const dashboardRoutes = require("./Routes/Dashboard.js");
const communityRoutes = require("./Routes/Community.js");
const adminRoutes = require("./Routes/Admin.js");

// Middleware

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// app.use(compression());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Logging
app.use(morgan("combined"));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    console.log(
      "Please check your MongoDB Atlas connection string and network access settings"
    );
    process.exit(1);
  });

// Routes
app.use("/api/claims", claimRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gis", gisRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "FRA Atlas API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to FRA Atlas API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      claims: "/api/claims",
      dashboard: "/api/dashboard",
      gis: "/api/gis",
      community: "/api/community",
      admin: "/api/admin",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      "GET /api/health",
      "POST /api/users/register",
      "POST /api/users/login",
      "GET /api/users",
      "POST /api/claims",
      "GET /api/claims",
      "GET /api/dashboard/overview",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/health`);
});
