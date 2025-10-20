import dotenv from "dotenv";

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  // Database
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://markitzenagency_db_user:Slb9AZ9M4CvW4xlB@cluster0.wabbygn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  DB_NAME: process.env.DB_NAME || "linkedinpulse",

  // JWT
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",

  // Google AI
  GOOGLE_AI_API_KEY:
    process.env.GOOGLE_AI_API_KEY || "AIzaSyB_x5suyfwTsNkJcRy0qmEoEp9viuawxec",

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "your-razorpay-key-id",
  RAZORPAY_KEY_SECRET:
    process.env.RAZORPAY_KEY_SECRET || "your-razorpay-key-secret",
  RAZORPAY_WEBHOOK_SECRET:
    process.env.RAZORPAY_WEBHOOK_SECRET || "your-razorpay-webhook-secret",

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Rate Limiting - Increased for development
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 100 to 1000
};
