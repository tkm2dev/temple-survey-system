const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const surveyRoutes = require("./routes/surveys");
const masterDataRoutes = require("./routes/master-data");
const uploadRoutes = require("./routes/upload");
const notificationRoutes = require("./routes/notifications");
const auditRoutes = require("./routes/audit");

const { connectDB } = require("./config/database");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com"]
        : [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
          ],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleString("th-TH");

  console.log(`\n🌐 [${timestamp}] ${req.method} ${req.originalUrl}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  }

  if (req.query && Object.keys(req.query).length > 0) {
    console.log("🔍 Query Params:", req.query);
  }

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    console.log(
      `✅ [${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );

    if (res.statusCode >= 400) {
      console.log("❌ Error Response:", data);
    } else if (
      req.originalUrl.includes("/auth/login") &&
      res.statusCode === 200
    ) {
      console.log("🔐 Login Success for user");
    }

    originalSend.call(this, data);
  };

  next();
});

// Static files
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/master-data", masterDataRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log(`🔍 [404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    console.log(
      `🚀 [SERVER] Starting server in ${
        process.env.NODE_ENV || "development"
      } mode...`
    );
    console.log(`🚀 [SERVER] Port: ${PORT}`);

    // Test database connection
    await connectDB();
    logger.info("Database connected successfully");

    // Start server
    app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
      console.log(`\n🎉 [SERVER] Server started successfully!`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`💡 Waiting for requests...\n`);
    });
  } catch (error) {
    console.error(`💥 [SERVER] Failed to start server: ${error.message}`);
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

startServer();

module.exports = app;
