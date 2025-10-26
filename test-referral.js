// Simple test script to test referral functionality
import mongoose from "mongoose";
import User from "./backend/models/User.js";
import referralService from "./backend/services/referralService.js";
import dotenv from "dotenv";

dotenv.config();

const testReferralFunctionality = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("✅ Connected to MongoDB");

    // Find or create a test user
    let testUser = await User.findOne({ email: "test@example.com" });

    if (!testUser) {
      testUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await testUser.save();
      console.log("✅ Created test user");
    } else {
      console.log("✅ Found existing test user");
    }

    console.log(
      `👤 Test user: ${testUser.email}, referralCode: ${testUser.referralCode}`
    );

    // Test getting referral stats
    console.log("🔍 Testing getUserReferralStats...");
    const stats = await referralService.getUserReferralStats(testUser._id);
    console.log("📊 Stats result:", stats);

    if (stats.success) {
      console.log("✅ Referral stats retrieved successfully");
      console.log("🔑 Referral code:", stats.data.referralCode);
      console.log("🔗 Referral link:", stats.data.referralLink);
    } else {
      console.log("❌ Failed to get referral stats:", stats.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
};

testReferralFunctionality();
