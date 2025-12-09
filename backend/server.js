import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
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
import adminAuthRoutes from "./routes/adminAuth.js";
import testimonialRoutes from "./routes/testimonials.js";
import blogRoutes from "./routes/blog.js";
import emailRoutes from "./routes/email.js";
import paymentRoutes from "./routes/payment.js";
import pricingRoutes from "./routes/pricing.js";
import profileRoutes from "./routes/profile.js";
import trialRoutes from "./routes/trial.js";
import referralRoutes from "./routes/referrals.js";
import affiliateAuthRoutes from "./routes/affiliateAuth.js";
import affiliateDashboardRoutes from "./routes/affiliateDashboard.js";
import adminAffiliatesRoutes from "./routes/adminAffiliates.js";
import linkedinScraperRoutes from "./routes/linkedinScraper.js";
import offerRoutes from "./routes/offers.js";
import extensionRoutes from "./routes/extension.js";
import couponRoutes from "./routes/coupons.js";
import profileCoachRoutes from "./routes/profileCoach.js";

// Import services
import emailScheduler from "./services/emailScheduler.js";
import googleAnalyticsService from "./services/googleAnalyticsService.js";
import affiliateScheduler from "./services/affiliateScheduler.js";

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
  })
);

// Compression middleware for better performance
app.use(
  compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress files > 1KB
  })
);

// CORS configuration
const allowedOrigins = [
  config.FRONTEND_URL,
  "https://engagematic.com",
  "https://www.engagematic.com",
  "https://linkedinpulse.com",
  "https://www.linkedinpulse.com",
  "chrome-extension://eofnebjkdholeglegaillijcbbefgmjm", // your Chrome extension origin
  "http://localhost:5173", // if your frontend runs locally
  "http://localhost:5000", // optional, if your backend talks to itself
  "http://localhost:8080", // frontend dev server
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow localhost on any port
    if (config.NODE_ENV === "development") {
      const isLocalhost =
        origin.includes("localhost") || origin.includes("127.0.0.1");
      if (isLocalhost) return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log("✅ CORS allowed origin:", origin);
      return callback(null, true);
    }

    // Log rejected origins for debugging
    console.warn(`❌ CORS blocked origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Length", "X-Foo"],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Rate limiting - More lenient in development
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.NODE_ENV === "development" ? 10000 : config.RATE_LIMIT_MAX_REQUESTS, // 10k requests in dev, 1k in prod
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (config.NODE_ENV === "development") {
      const ip = req.ip || req.connection.remoteAddress || "";
      return ip.includes("127.0.0.1") || ip.includes("::1") || ip.includes("localhost");
    }
    return false;
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware (optimized for performance)
app.use(express.json({ limit: "5mb" })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: "5mb" })); // Reduced from 10mb

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Engagematic API is running",
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
app.use("/api/testimonials", testimonialRoutes); // Testimonial routes
app.use("/api/blog", blogRoutes); // Blog routes
app.use("/api/email", emailRoutes); // Email preferences and unsubscribe
app.use("/api/payment", paymentRoutes); // Payment processing
app.use("/api/pricing", pricingRoutes); // Pricing and credit management
app.use("/api/profile", profileRoutes); // Profile completion management
app.use("/api/trial", trialRoutes); // Trial management
app.use("/api/referrals", referralRoutes); // Referral system
app.use("/api/affiliate", affiliateAuthRoutes); // Affiliate authentication
app.use("/api/affiliate/dashboard", affiliateDashboardRoutes); // Affiliate dashboard
app.use("/api/linkedin-scraper", linkedinScraperRoutes); // LinkedIn Profile Scraper
app.use("/api/offers", offerRoutes); // Coupons and Offers
app.use("/api/extension", extensionRoutes); // Chrome Extension API
app.use("/api/coupons", couponRoutes); // Coupon management and validation
app.use("/api/profile-coach", profileCoachRoutes); // LinkedInPulse Profile Coach (NEW - Testing)

// Admin routes
app.use("/api/admin/auth", adminAuthRoutes); // Admin authentication
app.use("/api/admin", adminRoutes); // Admin-only dashboard routes
app.use("/api/admin/affiliates", adminAffiliatesRoutes); // Admin affiliate management

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

    // Start email scheduler (graceful failure)
    try {
      await emailScheduler.start();
    } catch (error) {
      console.warn("⚠️  Email scheduler failed to start:", error.message);
    }

    // Initialize Google Analytics service (graceful failure)
    try {
      await googleAnalyticsService.initialize();
    } catch (error) {
      console.warn("⚠️  Google Analytics failed to initialize:", error.message);
    }

    // Start affiliate commission scheduler (graceful failure)
    try {
      affiliateScheduler.start();
    } catch (error) {
      console.warn("⚠️  Affiliate scheduler failed to start:", error.message);
    }

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
  emailScheduler.stop();
  affiliateScheduler.stop();
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  emailScheduler.stop();
  affiliateScheduler.stop();
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

export default app;
