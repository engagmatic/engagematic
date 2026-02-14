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

  // Admin JWT (separate secret for admin authentication)
  ADMIN_JWT_SECRET:
    process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "your-super-secret-admin-jwt-key-change-this-in-production",

  // Google AI (from .env only - no hardcoded fallback)
  // Supports multiple comma-separated keys for automatic rotation on quota limits
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || "",
  GOOGLE_AI_API_KEYS: (process.env.GOOGLE_AI_API_KEYS || process.env.GOOGLE_AI_API_KEY || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean),
  _GOOGLE_AI_API_KEY_FROM_ENV: !!process.env.GOOGLE_AI_API_KEY,
  

  // Razorpay - Live Keys
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_live_RYVCzLOdKhLCpg",
  RAZORPAY_KEY_SECRET:
    process.env.RAZORPAY_KEY_SECRET || "LKg9BAH17FipJ1fNK174zMEa",
  RAZORPAY_WEBHOOK_SECRET:
    process.env.RAZORPAY_WEBHOOK_SECRET || "fPq4bgTqmALFUe@",

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8080",

  // Rate Limiting - Increased for development
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 100 to 1000

  // CoreSignal (LinkedIn Data API - EXCELLENT OPTION - Professional LinkedIn data)
  // API Key: rT5M97UDI3FEbLdDY7LHLtkrUUoOwhf0
  // Documentation: https://docs.coresignal.com/
  CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY || "rT5M97UDI3FEbLdDY7LHLtkrUUoOwhf0",
  
  // Proxycurl (LinkedIn API - BEST OPTION - Free tier: 100 requests/month)
  // Sign up at https://nubela.co/proxycurl/ - Get free API key
  PROXYCURL_API_KEY: process.env.PROXYCURL_API_KEY || "",
  
  // RapidAPI (LinkedIn Scraper - Fallback option)
  // Sign up at https://rapidapi.com - Search for "LinkedIn Profile Scraper"
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || "",
  RAPIDAPI_HOST: process.env.RAPIDAPI_HOST || "linkedin-profile-scraper-api.p.rapidapi.com",
  
  // SerpApi (Fallback option - Free tier: 100 searches/month - https://serpapi.com)
  SERPAPI_KEY: process.env.SERPAPI_KEY || "ff7f229f9456cb0d1b2d8c1e64c9c86a998a1127f0a392bdd739b0f371697658",

  // Email Configuration
  EMAIL_FROM: process.env.EMAIL_FROM || "hello@engagematic.com",
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "Engagematic",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
};
