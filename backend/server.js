import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.js";

// Import routes
import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import personaRoutes from "./routes/personas.js";
import hookRoutes from "./routes/hooks.js";
import analyticsRoutes from "./routes/analytics.js";
import subscriptionRoutes from "./routes/subscription.js";
import waitlistRoutes from "./routes/waitlist.js";
import profileAnalyzerRoutes from "./routes/profileAnalyzer.js";
import profileInsightsRoutes from "./routes/profileInsights.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "LinkedInPulse API is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/hooks", hookRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/profile-analyzer", profileAnalyzerRoutes);
app.use("/api/profile-analyzer", profileInsightsRoutes); // Merged route for insights
app.use("/api/admin", adminRoutes); // Admin-only routes

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(config.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.DB_NAME,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Initialize default hooks
const initializeDefaultHooks = async () => {
  try {
    const defaultHooks = [
      { text: "I made a mistake that cost me...", category: "story" },
      { text: "Here's what nobody tells you about...", category: "insight" },
      { text: "3 years ago, I was...", category: "story" },
      { text: "Stop doing this immediately:", category: "challenge" },
      { text: "The biggest lesson I learned this year:", category: "insight" },
      { text: "Why most people fail at...", category: "statement" },
      { text: "What if I told you that...", category: "question" },
      { text: "I used to think that...", category: "story" },
      { text: "The secret nobody talks about:", category: "insight" },
      { text: "Here's what changed everything:", category: "story" },
    ];

    for (const hook of defaultHooks) {
      await mongoose
        .model("Hook")
        .findOneAndUpdate(
          { text: hook.text },
          { ...hook, isDefault: true, isActive: true },
          { upsert: true }
        );
    }

    console.log("✅ Default hooks initialized");
  } catch (error) {
    console.error("❌ Error initializing default hooks:", error);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await initializeDefaultHooks();

    app.listen(config.PORT, () => {
      console.log(`🚀 LinkedInPulse API server running on port ${config.PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

export default app;
